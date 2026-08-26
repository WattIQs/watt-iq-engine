const GOOGLE_SEARCH_URL = "https://www.googleapis.com/customsearch/v1";
const CACHE_TTL_MS = 60_000;
const CACHE_MAX_ENTRIES = 250;
const REQUEST_TIMEOUT_MS = 5_000;

type SearchItem = {
  title?: string;
  link?: string;
  snippet?: string;
  pagemap?: {
    metatags?: Array<Record<string, string>>;
    localbusiness?: Array<Record<string, string>>;
    place?: Array<Record<string, string>>;
  };
};

type SearchResponse = { items?: SearchItem[]; searchInformation?: { formattedTotalResults?: string } };

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
const cache = new Map<string, CacheEntry>();

function getCredentials(): { key: string; cx: string } {
  const key = process.env["GOOGLE_SEARCH_API_KEY"]?.trim();
  const cx = process.env["GOOGLE_SEARCH_CX"]?.trim();
  if (!key) {
    console.error("GOOGLE_SEARCH_API_KEY não configurada no servidor.");
    throw new Error("GOOGLE_SEARCH_API_KEY_MISSING");
  }
  if (!cx) {
    console.error("GOOGLE_SEARCH_CX não configurada no servidor.");
    throw new Error("GOOGLE_SEARCH_CX_MISSING");
  }
  return { key, cx };
}

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function cacheKey(value: string): string {
  return normalize(value).toLocaleLowerCase("pt-BR");
}

function pruneCache(now = Date.now()): void {
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
  while (cache.size > CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (!oldest) break;
    cache.delete(oldest);
  }
}

async function googleSearch(query: string, signal?: AbortSignal, start = 1): Promise<SearchItem[]> {
  const { key, cx } = getCredentials();
  const url = new URL(GOOGLE_SEARCH_URL);
  url.searchParams.set("key", key);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", query);
  url.searchParams.set("gl", "br");
  url.searchParams.set("hl", "pt-BR");
  url.searchParams.set("num", "10");
  url.searchParams.set("start", String(start));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", abort, { once: true });
  }

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(
        "Google Custom Search location lookup falhou",
        JSON.stringify({ query, status: response.status, detail: detail.slice(0, 300) }),
      );
      throw new Error(`GOOGLE_SEARCH_${response.status}`);
    }
    const data = (await response.json()) as SearchResponse;
    return data.items ?? [];
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}

function encodePlaceId(query: string, link: string): string {
  return Buffer.from(JSON.stringify({ query, link }), "utf8").toString("base64url");
}

function decodePlaceId(placeId: string): { query: string; link: string } {
  try {
    const parsed = JSON.parse(Buffer.from(placeId, "base64url").toString("utf8")) as { query?: string; link?: string };
    if (!parsed.query) throw new Error("PLACE_ID_INVALID");
    return { query: parsed.query, link: parsed.link ?? "" };
  } catch {
    throw new Error("PLACE_ID_INVALID");
  }
}

function buildSuggestions(query: string, items: SearchItem[]): LocationSuggestion[] {
  const seen = new Set<string>();
  const suggestions: LocationSuggestion[] = [];

  for (const item of items) {
    if (!item.link || !item.title) continue;
    const description = [item.title, item.snippet].filter(Boolean).join(" — ").trim();
    const key = `${item.title}|${item.link}`;
    if (!description || seen.has(key)) continue;
    seen.add(key);

    const parts = item.title.split(" - ");
    suggestions.push({
      placeId: encodePlaceId(query, item.link),
      description,
      mainText: parts[0]?.trim() || item.title,
      secondaryText: parts.slice(1).join(" - ").trim() || item.snippet?.slice(0, 120) || "Brasil",
    });
    if (suggestions.length >= 6) break;
  }

  return suggestions;
}

export async function autocompleteLocations(input: string, signal?: AbortSignal): Promise<LocationSuggestion[]> {
  const query = normalize(input);
  if (query.length < 3) return [];

  pruneCache();
  const cached = cache.get(cacheKey(query));
  if (cached && cached.expiresAt > Date.now()) return cached.suggestions;

  const queries = [
    `${query} Brasil endereço`,
    `${query} cidade bairro Brasil`,
  ];

  const responses = await Promise.all(queries.map((searchQuery) => googleSearch(searchQuery, signal).catch((error) => {
    if (signal?.aborted) throw error;
    console.error("Google location secondary query failed", JSON.stringify({ query: searchQuery, error: String(error) }));
    return [];
  })));

  const suggestions = buildSuggestions(query, responses.flat());
  cache.set(cacheKey(query), { expiresAt: Date.now() + CACHE_TTL_MS, suggestions });
  pruneCache();
  return suggestions;
}

function numberFromText(value: string | undefined): number | null {
  if (!value) return null;
  const normalized = value.replace(/,/g, ".");
  const match = normalized.match(/-?\d{1,3}\.\d{3,}|-?\d{1,3}\.\d{4,}|-?\d{1,2}\.\d{4,}/);
  if (!match) return null;
  const number = Number(match[0]);
  return Number.isFinite(number) ? number : null;
}

function extractCoordinates(item: SearchItem): { latitude: number; longitude: number } | null {
  const maps = [
    ...(item.pagemap?.localbusiness ?? []),
    ...(item.pagemap?.place ?? []),
    ...(item.pagemap?.metatags ?? []),
  ];

  for (const map of maps) {
    const latitude = numberFromText(map["latitude"] ?? map["place:location:latitude"] ?? map["geo.latitude"] ?? map["geo.position"]?.split(/[;, ]/)[0]);
    const longitude = numberFromText(map["longitude"] ?? map["place:location:longitude"] ?? map["geo.longitude"] ?? map["geo.position"]?.split(/[;, ]/)[1]);
    if (latitude !== null && longitude !== null && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) {
      return { latitude, longitude };
    }
  }

  const combined = `${item.title ?? ""} ${item.snippet ?? ""}`;
  const coordinateMatches = combined.match(/(-?\d{1,2}\.\d{4,})\s*[,; ]\s*(-?\d{1,3}\.\d{4,})/);
  if (coordinateMatches) {
    const latitude = Number(coordinateMatches[1]);
    const longitude = Number(coordinateMatches[2]);
    if (Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) {
      return { latitude, longitude };
    }
  }

  return null;
}

export async function getLocationDetails(placeId: string, signal?: AbortSignal): Promise<LocationDetails> {
  const decoded = decodePlaceId(placeId);
  const items = await googleSearch(`"${decoded.query}" ${decoded.link ? decoded.link : ""} Brasil`, signal);
  const best = items.find((item) => item.link === decoded.link) ?? items[0];
  if (!best) throw new Error("GOOGLE_SEARCH_NO_LOCATION_RESULT");

  const coordinates = extractCoordinates(best);
  if (!coordinates) {
    throw new Error("GOOGLE_SEARCH_NO_COORDINATES");
  }

  return {
    placeId,
    name: best.title ?? decoded.query,
    formattedAddress: [best.title, best.snippet].filter(Boolean).join(" — "),
    ...coordinates,
  };
}
