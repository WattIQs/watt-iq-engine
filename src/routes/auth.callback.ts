import { createFileRoute } from "@tanstack/react-router";
import { exchangeGoogleCode } from "../lib/google-auth";
import { generateOtp, sendOtpEmail } from "../lib/email-otp";
import { createOtpChallenge } from "../lib/otp-store";

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

          if (!tokens.access_token) {
            throw new Error("Google não retornou access_token");
          }

          const userResponse = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
              },
            },
          );

          if (!userResponse.ok) {
            throw new Error(
              `Não foi possível obter os dados do Google: ${await userResponse.text()}`,
            );
          }

          const googleUser = (await userResponse.json()) as {
            email?: string;
            name?: string;
            picture?: string;
          };

          if (!googleUser.email) {
            throw new Error("Google não retornou o e-mail do usuário");
          }

          const otp = generateOtp();

          const challengeId = createOtpChallenge(
            googleUser.email,
            otp,
          );

          await sendOtpEmail(googleUser.email, otp);

          return new Response(null, {
            status: 302,
            headers: {
              Location: "/auth/verify",
              "Set-Cookie": `wattiq_otp=${challengeId}; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
            },
          });
        } catch (error) {
          console.error("Erro no Google OAuth:", error);

          return new Response(
            "Não foi possível iniciar a confirmação do login. Tente novamente.",
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
