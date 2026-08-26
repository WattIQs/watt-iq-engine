import { createFileRoute } from "@tanstack/react-router";
import { getLocationDetails } from "@/lib/google-search-location.server";

type Body = { placeId?: unknown };

function isAbortError(error: unknown): boolean {
  return (error instanceof Error && error.name === "AbortError") ||
    (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError");
}

function statusForError(error: unknown): number {
  const message = error instanceof Error ? error.message : String(error);
  if (message === "GOOGLE_SEARCH_API_KEY_MISSING" || message === "GOOGLE_SEARCH_CX_MISSING") return 500;
  if (message === "PLACE_ID_INVALID") return 400;
  if (message === "GOOGLE_SEARCH_NO_COORDINATES") return 422;
  if (message.startsWith("GOOGLE_SEARCH_")) return 502;
  if (isAbortError(error)) return 504;
  return 500;
}

export const Route = createFileRoute("/api/location/details")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as Body;
          const placeId = typeof body.placeId === "string" ? body.placeId.trim() : "";
          if (!placeId) {
            return Response.json(
              { success: false, message: "Não foi possível selecionar esse local. Tente novamente." },
              { status: 400 },
            );
          }
          const place = await getLocationDetails(placeId, request.signal);
          return Response.json({ success: true, place });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Erro na rota /api/location/details:", message);
          const status = statusForError(error);
          const userMessage =
            message === "GOOGLE_SEARCH_NO_COORDINATES"
              ? "Encontramos o local, mas a busca web não forneceu coordenadas confiáveis. Tente um endereço mais específico."
              : message === "GOOGLE_SEARCH_API_KEY_MISSING" || message === "GOOGLE_SEARCH_CX_MISSING"
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
