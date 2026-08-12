import { createFileRoute } from "@tanstack/react-router";
import { exchangeGoogleCode } from "../lib/google-auth";
import { createSessionCookie } from "../lib/session";

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
          return new Response(
            "Código de autorização não recebido do Google.",
            {
              status: 400,
              headers: {
                "content-type": "text/plain; charset=utf-8",
              },
            },
          );
        }

        try {
          const tokens = await exchangeGoogleCode(code);

          if (!tokens.id_token) {
            throw new Error("Google não retornou um id_token.");
          }

          // O id_token do Google é um JWT.
          const payload = JSON.parse(
            Buffer.from(tokens.id_token.split(".")[1], "base64url").toString(
              "utf-8",
            ),
          );

          const user = {
            sub: payload.sub,
            email: payload.email,
            name: payload.name ?? payload.email,
            picture: payload.picture,
          };

          if (!user.sub || !user.email) {
            throw new Error("Dados do usuário não retornados pelo Google.");
          }

          const sessionCookie = createSessionCookie(user);

          return new Response(null, {
            status: 302,
            headers: {
              Location: "/",
              "Set-Cookie": sessionCookie,
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
