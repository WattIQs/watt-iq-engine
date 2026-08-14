import { createFileRoute } from "@tanstack/react-router";

import {
  createOtpChallenge,
} from "../lib/otp-store";

import {
  generateOtp,
  sendOtpEmail,
} from "../lib/email.otp";

import { db } from "../lib/db";
import { initDatabase } from "../lib/db-init";

function createCookie(
  name: string,
  value: string,
  maxAge: number,
): string {
  return [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ].join("; ");
}

export const Route = createFileRoute(
  "/auth/email",
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body =
            await request.json();

          const email =
            typeof body?.email === "string"
              ? body.email
                  .trim()
                  .toLowerCase()
              : "";

          const name =
            typeof body?.name === "string"
              ? body.name.trim()
              : "";

          if (
            !email ||
            !email.includes("@")
          ) {
            return Response.json(
              {
                success: false,
                message:
                  "Digite um e-mail válido.",
              },
              {
                status: 400,
              },
            );
          }

          /*
           * =====================================================
           * BANCO
           * =====================================================
           */

          await initDatabase();

          /*
           * Procuramos o perfil existente pelo e-mail.
           *
           * Isso permite que um login por e-mail encontre
           * os dados anteriormente cadastrados pelo Google.
           */

          const profileResult =
            await db.query(
              `
                SELECT
                  email,
                  name,
                  picture,
                  google_sub
                FROM user_profiles
                WHERE email = $1
                LIMIT 1
              `,
              [email],
            );

          const existingProfile =
            profileResult.rows[0] ||
            null;

          /*
           * Se já existir um perfil:
           *
           * - preservamos o nome salvo;
           * - preservamos a foto do Google;
           * - só usamos o nome enviado caso não exista
           *   um nome salvo.
           */

          const profileName =
            existingProfile &&
            typeof existingProfile.name ===
              "string" &&
            existingProfile.name.trim()
              ? existingProfile.name.trim()
              : name ||
                email.split("@")[0];

          const profilePicture =
            existingProfile &&
            typeof existingProfile.picture ===
              "string"
              ? existingProfile.picture
              : "";

          /*
           * =====================================================
           * OTP
           * =====================================================
           */

          const code =
            generateOtp();

          const challengeId =
            await createOtpChallenge(
              email,
              code,
            );

          await sendOtpEmail(
            email,
            code,
          );

          /*
           * =====================================================
           * USUÁRIO PENDENTE
           * =====================================================
           */

          const pendingUser = {
            sub:
              existingProfile?.google_sub ||
              email,

            email,

            name: profileName,

            picture:
              profilePicture,
          };

          const pendingUserData =
            Buffer.from(
              JSON.stringify(
                pendingUser,
              ),
              "utf8",
            ).toString(
              "base64url",
            );

          const headers =
            new Headers();

          headers.append(
            "Set-Cookie",
            createCookie(
              "wattiq_otp",
              challengeId,
              600,
            ),
          );

          headers.append(
            "Set-Cookie",
            createCookie(
              "wattiq_pending_user",
              pendingUserData,
              600,
            ),
          );

          headers.set(
            "Cache-Control",
            "no-store",
          );

          console.log(
            "AUTH EMAIL: OTP criado",
            {
              email,
              challengeId,
              existingProfile:
                Boolean(
                  existingProfile,
                ),
            },
          );

          return Response.json(
            {
              success: true,
              message:
                "Código enviado para seu e-mail.",
            },
            {
              status: 200,
              headers,
            },
          );
        } catch (error) {
          console.error(
            "AUTH EMAIL: erro ao iniciar login:",
            error,
          );

          return Response.json(
            {
              success: false,
              message:
                "Não foi possível iniciar o login. Tente novamente.",
            },
            {
              status: 500,
            },
          );
        }
      },
    },
  },
});
