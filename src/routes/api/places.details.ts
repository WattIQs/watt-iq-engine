import { createFileRoute } from "@tanstack/react-router";
import { getPlaceDetails } from "@/lib/places.server";

type Body = {
  placeId?: unknown;
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
  if (message === "PLACE_ID_REQUIRED" || message === "SESSION_TOKEN_REQUIRED") return 400;
  if (message.startsWith("GOOGLE_PLACES_DETAILS_")) return 502;
  if (isAbortError(error)) return 504;
  return 500;
}

export const Route = createFileRoute("/api/places/details")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as Body;
          const placeId = typeof body.placeId === "string" ? body.placeId.trim() : "";
          const sessionToken = typeof body.sessionToken === "string" ? body.sessionToken.trim() : "";

          if (!placeId || !sessionToken) {
            return Response.json(
              { success: false, message: "Não foi possível selecionar esse local. Tente novamente." },
              { status: 400 },
            );
          }

          const details = await getPlaceDetails(placeId, sessionToken, request.signal);
          return Response.json({ success: true, place: details });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Erro na rota /api/places/details:", message);
          const status = statusForError(error);
          const userMessage =
            message === "GOOGLE_PLACES_API_KEY_MISSING"
              ? "A busca de localização não está configurada no servidor."
              : status === 504
                ? "A confirmação do local demorou demais. Tente novamente."
                : "Não foi possível confirmar esse local agora. Tente novamente.";

          return Response.json({ success: false, message: userMessage }, { status });
        }
      },
    },
  },
});
