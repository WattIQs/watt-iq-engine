import { createFileRoute } from "@tanstack/react-router";
import { exchangeGoogleCode } from "../lib/google-auth";

export const Route = createFileRoute("/auth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) {
          return new Response(`Google recusou o login: ${error}`, {
            status: 400,
            headers: {
              "content-type": "text/plain; charset=utf-8",
            },
          });
        }

        if (!code) {
          return new Response("Código de autorização não recebido do Google.", {
            status: 400,
            headers: {
              "content-type": "text/plain; charset=utf-8",
            },
          });
        }

        try {
          const tokens = await exchangeGoogleCode(code);

          console.log("Google OAuth concluído:", {
            hasAccessToken: Boolean(tokens.access_token),
            hasIdToken: Boolean(tokens.id_token),
          });

          return new Response(null, {
            status: 302,
            headers: {
              Location: "/",
            },
          });
        } catch (error) {
          console.error("Erro no Google OAuth:", error);

          return new Response(
            "Não foi possível concluir o login com o Google.",
            {
              status: 500,
              headers: {
                "content-type": "text/plain; charset=utf-8",
              },
            },
          );
        }
      },
    },
  },
});
