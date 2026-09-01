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
import { createSessionCookie, type SessionUser } from "../lib/session";

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
          await initDatabase();

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
            "string"
              ? googleUser.name.trim()
              : "";

          const googlePicture =
            typeof googleUser.picture ===
            "string"
              ? googleUser.picture.trim()
              : "";

          const googleSub =
            googleUser.id ||
            email;

          /*
           * =====================================================
           * SALVAR / ATUALIZAR PERFIL
           * =====================================================
           *
           * O e-mail é a chave de ligação entre Google e login
           * por código.
           */

          const existing =
            await db.query(
              `
                SELECT
                  id,
                  name,
                  picture
                FROM users
                WHERE email = $1
                LIMIT 1
              `,
              [email],
            );

          let userId: string;

          if (
            existing.rows.length > 0
          ) {
            const row =
              existing.rows[0];

            userId = String(
              row.id,
            );

            /*
             * O Google fornece os dados mais completos.
             * Só substituímos nome/foto quando realmente
             * recebemos esses valores.
             */

            await db.query(
              `
                UPDATE users
                SET
                  name = CASE
                    WHEN $2 <> '' THEN $2
                    ELSE name
                  END,
                  picture = CASE
                    WHEN $3 <> '' THEN $3
                    ELSE picture
                  END,
                  updated_at = NOW()
                WHERE email = $1
              `,
              [
                email,
                googleName,
                googlePicture,
              ],
            );
          } else {
            const inserted =
              await db.query(
                `
                  INSERT INTO users (
                    email,
                    name,
                    picture
                  )
                  VALUES (
                    $1,
                    $2,
                    $3
                  )
                  RETURNING id
                `,
                [
                  email,
                  googleName ||
                    email.split(
                      "@",
                    )[0],
                  googlePicture,
                ],
              );

            userId = String(
              inserted.rows[0].id,
            );
          }

          const savedUser =
            await db.query(
              `
                SELECT
                  id,
                  email,
                  name,
                  picture,
                  email_verified_at
                FROM users
                WHERE email = $1
                LIMIT 1
              `,
              [email],
            );

          const profile =
            savedUser.rows[0];

          const requireVerificationResult = await db.query(
            `
              SELECT COALESCE(
                us.require_email_verification,
                TRUE
              ) AS require_email_verification
              FROM users u
              LEFT JOIN user_settings us
                ON us.user_id = u.id
              WHERE u.id = $1
              LIMIT 1
            `,
            [userId],
          );

          const isVerified = Boolean(profile?.email_verified_at);
          const requiresCode =
            !isVerified ||
            Boolean(
              requireVerificationResult.rows[0]?.require_email_verification ?? true,
            );

          if (!requiresCode) {
            const user: SessionUser = {
              sub: userId || googleSub,
              email,
              name:
                profile?.name ||
                googleName ||
                email.split("@")[0],
              picture:
                profile?.picture ||
                googlePicture ||
                "",
            };

            return new Response(
              null,
              {
                status: 302,
                headers: new Headers([
                  ["Set-Cookie", createSessionCookie(user)],
                  ["Location", "/planejar"],
                  ["Cache-Control", "no-store, no-cache, must-revalidate"],
                ]),
              },
            );
          }

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
           * O Google continua usando a verificação por código
           * que já existia no fluxo atual.
           *
           * Mas agora o perfil já está salvo antes disso.
           */

          const userData =
            Buffer.from(
              JSON.stringify({
                sub:
                  userId ||
                  googleSub,

                email,

                name:
                  profile?.name ||
                  googleName ||
                  email.split(
                    "@",
                  )[0],

                picture:
                  profile?.picture ||
                  googlePicture ||
                  "",
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
