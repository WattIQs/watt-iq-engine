const GOOGLE_PLACES_AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const GOOGLE_PLACES_DETAILS_URL = "https://places.googleapis.com/v1/places";
const CACHE_TTL_MS = 60_000;
const CACHE_MAX_ENTRIES = 250;
const REQUEST_TIMEOUT_MS = 5_000;

type AutocompleteSuggestion = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

type AutocompleteCacheEntry = {
  expiresAt: number;
  suggestions: AutocompleteSuggestion[];
};

const autocompleteCache = new Map<string, AutocompleteCacheEntry>();

function getPlacesApiKey(): string | null {
  const key = process.env["GOOGLE_PLACES_API_KEY"]?.trim();
  if (!key) {
    console.error(
      "GOOGLE_PLACES_API_KEY não configurada. Configure uma chave de servidor no Render/Google Cloud com Places API (New) e Geocoding API habilitadas.",
    );
    return null;
  }
  return key;
}

function normalizeInput(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

function cacheKey(input: string): string {
  return normalizeInput(input).toLocaleLowerCase("pt-BR");
}

function pruneCache(now = Date.now()): void {
  for (const [key, entry] of autocompleteCache) {
    if (entry.expiresAt <= now) autocompleteCache.delete(key);
  }

  while (autocompleteCache.size > CACHE_MAX_ENTRIES) {
    const oldestKey = autocompleteCache.keys().next().value;
    if (!oldestKey) break;
    autocompleteCache.delete(oldestKey);
  }
}

async function fetchGoogle(
  url: string,
  init: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const requestSignal = init.signal;

  if (requestSignal) {
    if (requestSignal.aborted) controller.abort();
    else requestSignal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function readGoogleError(response: Response): Promise<string> {
  const raw = await response.text().catch(() => "");
  if (!raw) return response.statusText || `HTTP ${response.status}`;

  try {
    const parsed = JSON.parse(raw) as {
      error?: { message?: string; status?: string };
    };
    return [parsed.error?.status, parsed.error?.message]
      .filter(Boolean)
      .join(": ") || raw.slice(0, 300);
  } catch {
    return raw.slice(0, 300);
  }
}

export async function autocompletePlaces(
  input: string,
  sessionToken: string,
  requestSignal?: AbortSignal,
): Promise<AutocompleteSuggestion[]> {
  const normalized = normalizeInput(input);
  if (normalized.length < 3) return [];
  if (!sessionToken.trim()) throw new Error("SESSION_TOKEN_REQUIRED");

  const key = getPlacesApiKey();
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY_MISSING");

  pruneCache();
  const cached = autocompleteCache.get(cacheKey(normalized));
  if (cached && cached.expiresAt > Date.now()) return cached.suggestions;

  const response = await fetchGoogle(
    GOOGLE_PLACES_AUTOCOMPLETE_URL,
    {
      method: "POST",
      signal: requestSignal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text",
      },
      body: JSON.stringify({
        input: normalized,
        sessionToken: sessionToken.trim(),
        includedRegionCodes: ["br"],
        languageCode: "pt-BR",
        regionCode: "BR",
        includeQueryPredictions: false,
        includePureServiceAreaBusinesses: false,
      }),
    },
  );

  if (!response.ok) {
    const detail = await readGoogleError(response);
    console.error(
      "Google Places Autocomplete falhou",
      JSON.stringify({ input: normalized, status: response.status, detail }),
    );
    throw new Error(`GOOGLE_PLACES_AUTOCOMPLETE_${response.status}`);
  }

  const data = (await response.json()) as {
    suggestions?: Array<{
      placePrediction?: {
        placeId?: string;
        text?: { text?: string };
        structuredFormat?: {
          mainText?: { text?: string };
          secondaryText?: { text?: string };
        };
      };
    }>;
  };

  const suggestions = (data.suggestions ?? [])
    .map((item) => item.placePrediction)
    .filter((prediction): prediction is NonNullable<typeof prediction> => Boolean(prediction?.placeId))
    .map((prediction) => ({
      placeId: prediction.placeId as string,
      description: prediction.text?.text ?? "",
      mainText: prediction.structuredFormat?.mainText?.text ?? prediction.text?.text ?? "",
      secondaryText: prediction.structuredFormat?.secondaryText?.text ?? "",
    }))
    .filter((item) => item.description.length > 0)
    .slice(0, 5);

  autocompleteCache.set(cacheKey(normalized), {
    expiresAt: Date.now() + CACHE_TTL_MS,
    suggestions,
  });
  pruneCache();

  return suggestions;
}

export type PlaceDetails = {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
};

export async function getPlaceDetails(
  placeId: string,
  sessionToken: string,
  requestSignal?: AbortSignal,
): Promise<PlaceDetails> {
  const normalizedPlaceId = placeId.trim();
  if (!normalizedPlaceId) throw new Error("PLACE_ID_REQUIRED");
  if (!sessionToken.trim()) throw new Error("SESSION_TOKEN_REQUIRED");

  const key = getPlacesApiKey();
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY_MISSING");

  const url = new URL(`${GOOGLE_PLACES_DETAILS_URL}/${encodeURIComponent(normalizedPlaceId)}`);
  url.searchParams.set("sessionToken", sessionToken.trim());
  url.searchParams.set("languageCode", "pt-BR");
  url.searchParams.set("regionCode", "BR");

  const response = await fetchGoogle(
    url.toString(),
    {
      signal: requestSignal,
      headers: {
        Accept: "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "id,displayName,formattedAddress,location",
      },
    },
  );

  if (!response.ok) {
    const detail = await readGoogleError(response);
    console.error(
      "Google Places Details falhou",
      JSON.stringify({ placeId: normalizedPlaceId, status: response.status, detail }),
    );
    throw new Error(`GOOGLE_PLACES_DETAILS_${response.status}`);
  }

  const data = (await response.json()) as {
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    location?: { latitude?: number; longitude?: number };
  };

  const latitude = data.location?.latitude;
  const longitude = data.location?.longitude;
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    console.error(
      "Google Places Details retornou localização inválida",
      JSON.stringify({ placeId: normalizedPlaceId, data }),
    );
    throw new Error("GOOGLE_PLACES_DETAILS_INVALID_LOCATION");
  }

  return {
    placeId: data.id ?? normalizedPlaceId,
    name: data.displayName?.text ?? "",
    formattedAddress: data.formattedAddress ?? "",
    latitude,
    longitude,
  };
}
