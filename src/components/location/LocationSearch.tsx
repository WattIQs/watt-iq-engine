import { AlertCircle, Loader2, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

export type LocationSelection = {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
};

type Suggestion = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

type LocationSearchProps = {
  value?: string;
  placeholder?: string;
  className?: string;
  onSelect: (place: LocationSelection) => void;
};

const DEBOUNCE_MS = 300;

function createSessionToken(): string {
  return crypto.randomUUID();
}

export function LocationSearch({
  value = "",
  placeholder = "Digite um endereço, bairro ou cidade",
  className,
  onSelect,
}: LocationSearchProps) {
  const [input, setInput] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const sessionTokenRef = useRef(createSessionToken());
  const requestIdRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const detailsAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    const query = input.trim();
    const requestId = ++requestIdRef.current;

    setError(null);
    setSuggestions([]);

    if (query.length < 3) {
      setLoading(false);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setOpen(true);

      try {
        const response = await fetch("/api/places/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: query,
            sessionToken: sessionTokenRef.current,
          }),
          signal: controller.signal,
        });

        const data = (await response.json().catch(() => ({}))) as {
          success?: boolean;
          suggestions?: Suggestion[];
          message?: string;
        };

        if (requestId !== requestIdRef.current) return;

        if (!response.ok || data.success !== true) {
          setSuggestions([]);
          setError(data.message || "Não foi possível buscar agora, tente novamente.");
          return;
        }

        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
        setError(null);
      } catch (cause) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;
        console.error("Erro na busca de localização:", cause);
        setSuggestions([]);
        setError("Não foi possível buscar agora, tente novamente.");
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [input]);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      detailsAbortRef.current?.abort();
    };
  }, []);

  async function handleSelect(suggestion: Suggestion) {
    detailsAbortRef.current?.abort();
    const controller = new AbortController();
    detailsAbortRef.current = controller;
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);
    setOpen(false);

    try {
      const response = await fetch("/api/places/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: suggestion.placeId,
          sessionToken: sessionTokenRef.current,
        }),
        signal: controller.signal,
      });

      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        place?: LocationSelection;
        message?: string;
      };

      if (requestId !== requestIdRef.current) return;

      if (!response.ok || data.success !== true || !data.place) {
        setError(data.message || "Não foi possível confirmar esse local agora. Tente novamente.");
        setLoading(false);
        setOpen(true);
        return;
      }

      setInput(data.place.formattedAddress || suggestion.description);
      setSuggestions([]);
      setError(null);
      setLoading(false);
      onSelect(data.place);

      // A Places Autocomplete session ends with Place Details. Google requires
      // a fresh token for the next autocomplete session.
      sessionTokenRef.current = createSessionToken();
    } catch (cause) {
      if (controller.signal.aborted || requestId !== requestIdRef.current) return;
      console.error("Erro ao confirmar localização:", cause);
      setError("Não foi possível confirmar esse local agora. Tente novamente.");
      setLoading(false);
      setOpen(true);
    }
  }

  return (
    <div className={className ? `relative ${className}` : "relative"}>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setOpen(event.target.value.trim().length >= 3);
          }}
          onFocus={() => {
            if (input.trim().length >= 3) setOpen(true);
          }}
          onBlur={() => {
            // Allow the click on a suggestion to run before closing the menu.
            window.setTimeout(() => setOpen(false), 120);
          }}
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="location-search-suggestions"
          className="h-11 pl-9 pr-10"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />}
      </div>

      {open && (
        <div
          id="location-search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[100] overflow-hidden rounded-xl border border-border bg-card shadow-xl"
        >
          {error ? (
            <div className="flex items-start gap-2 px-4 py-4 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-1">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.placeId}
                  type="button"
                  role="option"
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void handleSelect(suggestion)}
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">{suggestion.mainText || suggestion.description}</span>
                    {suggestion.secondaryText && <span className="block truncate text-xs text-muted-foreground">{suggestion.secondaryText}</span>}
                  </span>
                </button>
              ))}
            </div>
          ) : !loading ? (
            <div className="px-4 py-4 text-sm text-muted-foreground">
              Nenhum local encontrado.
            </div>
          ) : null}

          <div className="border-t border-border px-4 py-2 text-right text-[10px] font-medium text-muted-foreground">
            Powered by Google
          </div>
        </div>
      )}
    </div>
  );
}
