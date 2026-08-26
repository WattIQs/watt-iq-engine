const GEOAPIFY_AUTOCOMPLETE_URL = "https://api.geoapify.com/v1/geocode/autocomplete";
const GEOAPIFY_DETAILS_URL = "https://api.geoapify.com/v2/place-details";
const CACHE_TTL_MS = 60_000;
const CACHE_MAX_ENTRIES = 250;
const REQUEST_TIMEOUT_MS = 5_000;

type GeoapifyFeature = {
  properties?: {
    place_id?: string;
    name?: string;
    formatted?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    country?: string;
    country_code?: string;
    postcode?: string;
    street?: string;
    housenumber?: string;
    result_type?: string;
    rank?: { confidence?: number };
    lat?: number;
    lon?: number;
  };
  geometry?: { coordinates?: [number, number] };
};

type GeoapifyResponse = { features?: GeoapifyFeature[] };

export type LocationSuggestion = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

export type LocationDetails = {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
};

type CacheEntry = { expiresAt: number; suggestions: LocationSuggestion[] };
const autocompleteCache = new Map<string, CacheEntry>();

function getGeoapifyKey(): string | null {
  const key = process.env["GEOAPIFY_API_KEY"]?.trim();
  if (!key) {
    console.error(
      "GEOAPIFY_API_KEY não configurada. Crie uma chave no Geoapify e configure-a no Render.",
    );
    return null;
  }
  return key;
}

function normalizeInput(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function cacheKey(value: string): string {
  return normalizeInput(value).toLocaleLowerCase("pt-BR");
}

function pruneCache(now = Date.now()): void {
  for (const [key, entry] of autocompleteCache) {
    if (entry.expiresAt <= now) autocompleteCache.delete(key);
  }
  while (autocompleteCache.size > CACHE_MAX_ENTRIES) {
    const oldest = autocompleteCache.keys().next().value;
    if (!oldest) break;
    autocompleteCache.delete(oldest);
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  requestSignal?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const abortFromCaller = () => controller.abort();
  if (requestSignal) {
    if (requestSignal.aborted) controller.abort();
    else requestSignal.addEventListener("abort", abortFromCaller, { once: true });
  }

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
    requestSignal?.removeEventListener("abort", abortFromCaller);
  }
}

async function readProviderError(response: Response): Promise<string> {
  const raw = await response.text().catch(() => "");
  if (!raw) return response.statusText || `HTTP ${response.status}`;
  return raw.slice(0, 400);
}

export async function autocompleteLocations(
  input: string,
  requestSignal?: AbortSignal,
): Promise<LocationSuggestion[]> {
  const normalized = normalizeInput(input);
  if (normalized.length < 3) return [];

  const key = getGeoapifyKey();
  if (!key) throw new Error("GEOAPIFY_API_KEY_MISSING");

  pruneCache();
  const cached = autocompleteCache.get(cacheKey(normalized));
  if (cached && cached.expiresAt > Date.now()) return cached.suggestions;

  const url = new URL(GEOAPIFY_AUTOCOMPLETE_URL);
  url.searchParams.set("text", normalized);
  url.searchParams.set("format", "json");
  url.searchParams.set("lang", "pt");
  url.searchParams.set("filter", "countrycode:br");
  url.searchParams.set("limit", "6");
  url.searchParams.set("apiKey", key);

  const response = await fetchWithTimeout(
    url.toString(),
    { headers: { Accept: "application/json" } },
    requestSignal,
  );

  if (!response.ok) {
    const detail = await readProviderError(response);
    console.error(
      "Geoapify autocomplete falhou",
      JSON.stringify({ input: normalized, status: response.status, detail }),
    );
    throw new Error(`GEOAPIFY_AUTOCOMPLETE_${response.status}`);
  }

  const data = (await response.json()) as GeoapifyResponse;
  const suggestions = (data.features ?? [])
    .map((feature) => feature.properties)
    .filter((properties): properties is NonNullable<typeof properties> => Boolean(properties?.place_id))
    .map((properties) => ({
      placeId: properties.place_id as string,
      description: properties.formatted ?? properties.name ?? "",
      mainText: properties.name ?? properties.address_line1 ?? properties.formatted ?? "",
      secondaryText: properties.address_line2 ?? properties.city ?? properties.state ?? "",
    }))
    .filter((item) => item.description.length > 0)
    .slice(0, 6);

  autocompleteCache.set(cacheKey(normalized), {
    expiresAt: Date.now() + CACHE_TTL_MS,
    suggestions,
  });
  pruneCache();
  return suggestions;
}

export async function getLocationDetails(
  placeId: string,
  requestSignal?: AbortSignal,
): Promise<LocationDetails> {
  const normalized = placeId.trim();
  if (!normalized) throw new Error("PLACE_ID_REQUIRED");

  const key = getGeoapifyKey();
  if (!key) throw new Error("GEOAPIFY_API_KEY_MISSING");

  const url = new URL(GEOAPIFY_DETAILS_URL);
  url.searchParams.set("id", normalized);
  url.searchParams.set("features", "details");
  url.searchParams.set("lang", "pt");
  url.searchParams.set("apiKey", key);

  const response = await fetchWithTimeout(
    url.toString(),
    { headers: { Accept: "application/json" } },
    requestSignal,
  );

  if (!response.ok) {
    const detail = await readProviderError(response);
    console.error(
      "Geoapify place details falhou",
      JSON.stringify({ placeId: normalized, status: response.status, detail }),
    );
    throw new Error(`GEOAPIFY_DETAILS_${response.status}`);
  }

  const data = (await response.json()) as GeoapifyResponse;
  const feature = (data.features ?? []).find((item) => item.properties?.feature_type === "details") ?? data.features?.[0];
  const properties = feature?.properties;
  const coordinates = feature?.geometry?.coordinates;
  const latitude = properties?.lat ?? (Array.isArray(coordinates) ? coordinates[1] : undefined);
  const longitude = properties?.lon ?? (Array.isArray(coordinates) ? coordinates[0] : undefined);

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    console.error(
      "Geoapify retornou localização inválida",
      JSON.stringify({ placeId: normalized }),
    );
    throw new Error("GEOAPIFY_DETAILS_INVALID_LOCATION");
  }

  return {
    placeId: properties?.place_id ?? normalized,
    name: properties?.name ?? properties?.address_line1 ?? "",
    formattedAddress: properties?.formatted ?? [properties?.address_line1, properties?.address_line2].filter(Boolean).join(", "),
    latitude,
    longitude,
  };
}
