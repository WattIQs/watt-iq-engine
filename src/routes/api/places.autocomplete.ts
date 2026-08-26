import { createFileRoute } from "@tanstack/react-router";
import { autocompletePlaces } from "@/lib/places.server";

type Body = {
  input?: unknown;
  sessionToken?: unknown;
};

function isAbortError(error: unknown): boolean {
  return (
    (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

function statusForError(error: unknown): number {
  const message = error instanceof Error ? error.message : String(error);
  if (message === "GOOGLE_PLACES_API_KEY_MISSING") return 500;
  if (message === "SESSION_TOKEN_REQUIRED") return 400;
  if (message.startsWith("GOOGLE_PLACES_AUTOCOMPLETE_")) return 502;
  if (isAbortError(error)) return 504;
  return 500;
}

export const Route = createFileRoute("/api/places/autocomplete")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as Body;
          const input = typeof body.input === "string" ? body.input.trim() : "";
          const sessionToken = typeof body.sessionToken === "string" ? body.sessionToken.trim() : "";

          if (input.length < 3) {
            return Response.json({ success: true, suggestions: [] });
          }

          if (!sessionToken) {
            return Response.json(
              { success: false, message: "Sessão de busca inválida. Tente digitar novamente." },
              { status: 400 },
            );
          }

          const suggestions = await autocompletePlaces(input, sessionToken, request.signal);
          return Response.json({ success: true, suggestions });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Erro na rota /api/places/autocomplete:", message);
          const status = statusForError(error);
          const userMessage =
            message === "GOOGLE_PLACES_API_KEY_MISSING"
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
