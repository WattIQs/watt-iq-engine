import { createFileRoute } from "@tanstack/react-router";

import { exchangeGoogleCode } from "../lib/google-auth";

import {
  generateOtp,
  sendOtpEmail,
} from "../lib/email.otp";

import {
  createOtpChallenge,
} from "../lib/otp-store";

export const Route = createFileRoute(
  "/auth/callback",
)({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url =
          new URL(request.url);

        const code =
          url.searchParams.get(
            "code",
          );

        const error =
          url.searchParams.get(
            "error",
          );

        if (error) {
          return new Response(
            `Google recusou o login: ${error}`,
            {
              status: 400,
            },
          );
        }

        if (!code) {
          return new Response(
            "Código não recebido.",
            {
              status: 400,
            },
          );
        }

        try {
          const tokens =
            await exchangeGoogleCode(
              code,
            );

          if (
            !tokens.access_token
          ) {
            throw new Error(
              "Google não retornou access token.",
            );
          }

          const userResponse =
            await fetch(
              "https://www.googleapis.com/oauth2/v2/userinfo",
              {
                headers: {
                  Authorization:
                    `Bearer ${tokens.access_token}`,
                },
              },
            );

          if (
            !userResponse.ok
          ) {
            throw new Error(
              "Não foi possível obter os dados do Google.",
            );
          }

          const googleUser =
            await userResponse.json();

          if (!googleUser.email) {
            throw new Error(
              "Google não retornou e-mail.",
            );
          }

          const email =
            String(
              googleUser.email,
            )
              .trim()
              .toLowerCase();

          const otp =
            generateOtp();

          const challengeId =
            await createOtpChallenge(
              email,
              otp,
            );

          await sendOtpEmail(
            email,
            otp,
          );

          const userData =
            Buffer.from(
              JSON.stringify({
                sub:
                  googleUser.id ||
                  email,

                email,

                name:
                  googleUser.name ||
                  email.split("@")[0],

                picture:
                  googleUser.picture ||
                  "",
              }),
              "utf8",
            ).toString("base64url");

          const headers =
            new Headers();

          headers.append(
            "Set-Cookie",
            [
              `wattiq_otp=${challengeId}`,
              "Path=/",
              "Max-Age=600",
              "HttpOnly",
              "Secure",
              "SameSite=Lax",
            ].join("; "),
          );

          headers.append(
            "Set-Cookie",
            [
              `wattiq_pending_user=${userData}`,
              "Path=/",
              "Max-Age=600",
              "HttpOnly",
              "Secure",
              "SameSite=Lax",
            ].join("; "),
          );

          headers.set(
            "Location",
            "/auth/verify",
          );

          return new Response(
            null,
            {
              status: 302,
              headers,
            },
          );
        } catch (error) {
          console.error(
            "AUTH GOOGLE CALLBACK:",
            error,
          );

          return new Response(
            "Erro ao iniciar login com Google.",
            {
              status: 500,
            },
          );
        }
      },
    },
  },
});
