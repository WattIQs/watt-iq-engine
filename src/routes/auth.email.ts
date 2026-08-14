import { createFileRoute } from "@tanstack/react-router";

import { db } from "../lib/db";

import {
  createOtpChallenge,
} from "../lib/otp-store";

import {
  generateOtp,
  sendOtpEmail,
} from "../lib/email.otp";

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
            typeof body?.email ===
            "string"
              ? body.email
                  .trim()
                  .toLowerCase()
              : "";

          const name =
            typeof body?.name ===
            "string"
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
           * PROCURAR USUÁRIO EXISTENTE
           * =====================================================
           *
           * Se o usuário já entrou pelo Google anteriormente,
           * recuperamos nome e foto daquele perfil.
           */

          let existingUser:
            | {
                id: string;
                email: string;
                name: string;
                picture: string;
              }
            | null = null;

          try {
            const result =
              await db.query(
                `
                  SELECT
                    id,
                    email,
                    name,
                    picture
                  FROM users
                  WHERE email = $1
                  LIMIT 1
                `,
                [email],
              );

            if (
              result.rows.length > 0
            ) {
              const row =
                result.rows[0];

              existingUser = {
                id: String(
                  row.id,
                ),
                email: String(
                  row.email,
                ),
                name:
                  typeof row.name ===
                    "string"
                    ? row.name
                    : "",
                picture:
                  typeof row.picture ===
                    "string"
                    ? row.picture
                    : "",
              };
            }
          } catch (lookupError) {
            /*
             * Caso a tabela ainda não tenha sido criada,
             * não impedimos o login.
             */
            console.error(
              "AUTH EMAIL: erro ao procurar usuário existente:",
              lookupError,
            );
          }

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
           * Se já existe perfil, ele ganha prioridade.
           *
           * Assim o login por e-mail não apaga:
           * - nome do Google
           * - foto do Google
           */

          const resolvedName =
            existingUser?.name?.trim() ||
            name ||
            email.split("@")[0];

          const resolvedPicture =
            existingUser?.picture ||
            "";

          const resolvedSub =
            existingUser?.id ||
            email;

          const pendingUser = {
            sub: resolvedSub,
            email,
            name: resolvedName,
            picture: resolvedPicture,
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
              existingUser:
                Boolean(
                  existingUser,
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
