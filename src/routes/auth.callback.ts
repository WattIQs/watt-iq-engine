import { createFileRoute } from "@tanstack/react-router";

import { exchangeGoogleCode } from "../lib/google-auth";

import {
  generateOtp,
  sendOtpEmail,
} from "../lib/email.otp";

import {
  createOtpChallenge,
} from "../lib/otp-store";

import { db } from "../lib/db";
import { initDatabase } from "../lib/db-init";

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
          /*
           * =====================================================
           * GOOGLE
           * =====================================================
           */

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

          const googleName =
            typeof googleUser.name ===
              "string" &&
            googleUser.name.trim()
              ? googleUser.name.trim()
              : email.split("@")[0];

          const googlePicture =
            typeof googleUser.picture ===
              "string"
              ? googleUser.picture
              : "";

          /*
           * =====================================================
           * BANCO
           * =====================================================
           */

          await initDatabase();

          /*
           * Salvamos os dados do Google associados
           * ao e-mail.
           *
           * Se o usuário já existir, atualizamos os dados.
           */

          await db.query(
            `
              INSERT INTO user_profiles (
                email,
                name,
                picture,
                google_sub
              )
              VALUES ($1, $2, $3, $4)
              ON CONFLICT (email)
              DO UPDATE SET
                name = EXCLUDED.name,
                picture = EXCLUDED.picture,
                google_sub = EXCLUDED.google_sub,
                updated_at = NOW()
            `,
            [
              email,
              googleName,
              googlePicture,
              googleUser.id
                ? String(
                    googleUser.id,
                  )
                : null,
            ],
          );

          /*
           * =====================================================
           * OTP
           * =====================================================
           */

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

          /*
           * =====================================================
           * USUÁRIO PENDENTE
           * =====================================================
           */

          const userData =
            Buffer.from(
              JSON.stringify({
                sub:
                  googleUser.id ||
                  email,

                email,

                name: googleName,

                picture:
                  googlePicture,
              }),
              "utf8",
            ).toString(
              "base64url",
            );

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
