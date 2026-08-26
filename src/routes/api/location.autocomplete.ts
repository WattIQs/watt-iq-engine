import { createFileRoute } from "@tanstack/react-router";
import { autocompleteLocations } from "@/lib/google-search-location.server";

type Body = { input?: unknown };

function isAbortError(error: unknown): boolean {
  return (error instanceof Error && error.name === "AbortError") ||
    (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError");
}

function statusForError(error: unknown): number {
  const message = error instanceof Error ? error.message : String(error);
  if (message === "GOOGLE_SEARCH_API_KEY_MISSING" || message === "GOOGLE_SEARCH_CX_MISSING") return 500;
  if (message.startsWith("GOOGLE_SEARCH_")) return 502;
  if (isAbortError(error)) return 504;
  return 500;
}

export const Route = createFileRoute("/api/location/autocomplete")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as Body;
          const input = typeof body.input === "string" ? body.input.trim() : "";
          if (input.length < 3) return Response.json({ success: true, suggestions: [] });

          const suggestions = await autocompleteLocations(input, request.signal);
          return Response.json({ success: true, suggestions });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Erro na rota /api/location/autocomplete:", message);
          const status = statusForError(error);
          const userMessage = (message === "GOOGLE_SEARCH_API_KEY_MISSING" || message === "GOOGLE_SEARCH_CX_MISSING")
            ? "A busca de localização não está configurada no servidor."
            : status === 504
              ? "A busca demorou demais. Tente novamente."
              : "Não foi possível buscar locais agora. Tente novamente.";
          return Response.json({ success: false, message: userMessage }, { status });
        }
      },
    },
  },
});
