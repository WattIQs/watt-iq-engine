import { createFileRoute } from "@tanstack/react-router";

import { VerifyPage } from "../components/auth/VerifyPage";

import { verifyOtpChallenge } from "../lib/otp-store";

import {
  createSessionCookie,
  type SessionUser,
} from "../lib/session";

import { db } from "../lib/db";

function readCookie(
  request: Request,
  name: string,
): string | null {
  const header =
    request.headers.get("cookie");

  if (!header) {
    return null;
  }

  for (const part of header.split(";")) {
    const separator =
      part.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const cookieName = part
      .slice(0, separator)
      .trim();

    if (cookieName !== name) {
      continue;
    }

    return part
      .slice(separator + 1)
      .trim();
  }

  return null;
}

function decodePendingUser(
  value: string | null,
): Partial<SessionUser> | null {
  if (!value) {
    return null;
  }

  try {
    const decoded =
      JSON.parse(
        Buffer.from(
          value,
          "base64url",
        ).toString("utf8"),
      );

    if (
      !decoded ||
      typeof decoded !==
        "object"
    ) {
      return null;
    }

    return decoded as Partial<SessionUser>;
  } catch (error) {
    console.error(
      "AUTH VERIFY: erro ao decodificar usuário pendente:",
      error,
    );

    return null;
  }
}

export const Route = createFileRoute(
  "/auth/verify",
)({
  component: VerifyPage,

  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body =
            await request.json();

          const code =
            typeof body?.code ===
            "string"
              ? body.code
                  .replace(/\D/g, "")
                  .slice(0, 6)
              : "";

          if (code.length !== 6) {
            return Response.json(
              {
                success: false,
                message:
                  "Digite o código completo de 6 dígitos.",
              },
              {
                status: 400,
              },
            );
          }

          const challengeId =
            readCookie(
              request,
              "wattiq_otp",
            );

          const pendingUserRaw =
            readCookie(
              request,
              "wattiq_pending_user",
            );

          if (!challengeId) {
            return Response.json(
              {
                success: false,
                message:
                  "Sessão de verificação expirada. Solicite um novo código.",
              },
              {
                status: 400,
              },
            );
          }

          const email =
            await verifyOtpChallenge(
              challengeId,
              code,
            );

          if (!email) {
            return Response.json(
              {
                success: false,
                message:
                  "Código inválido ou expirado.",
              },
              {
                status: 400,
              },
            );
          }

          const normalizedEmail =
            email
              .trim()
              .toLowerCase();

          const pendingUser =
            decodePendingUser(
              pendingUserRaw,
            );

          /*
           * =====================================================
           * RECUPERAR PERFIL EXISTENTE
           * =====================================================
           *
           * Aqui acontece a ligação definitiva entre:
           *
           * Google -> e-mail
           * E-mail -> mesmo e-mail
           *
           * Se existir perfil, nome e foto são reaproveitados.
           */

          let existingUser:
            | {
                id: string;
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
                    name,
                    picture
                  FROM users
                  WHERE email = $1
                  LIMIT 1
                `,
                [normalizedEmail],
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
            console.error(
              "AUTH VERIFY: erro ao procurar perfil:",
              lookupError,
            );
          }

          const user: SessionUser = {
            sub:
              existingUser?.id ||
              (typeof pendingUser?.sub ===
                "string" &&
              pendingUser.sub.trim()
                ? pendingUser.sub
                : normalizedEmail),

            email:
              normalizedEmail,

            name:
              existingUser?.name?.trim() ||
              (typeof pendingUser?.name ===
                "string" &&
              pendingUser.name.trim()
                ? pendingUser.name.trim()
                : normalizedEmail.split(
                    "@",
                  )[0]),

            picture:
              existingUser?.picture ||
              (typeof pendingUser?.picture ===
                "string"
                ? pendingUser.picture
                : ""),
          };

          /*
           * Se ainda não existia usuário, criamos o perfil
           * agora. Isso também permite que um usuário que
           * começou pelo e-mail tenha seu perfil salvo.
           */

          try {
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
                ON CONFLICT (email)
                DO UPDATE SET
                  name = CASE
                    WHEN users.name = ''
                      AND EXCLUDED.name <> ''
                    THEN EXCLUDED.name
                    ELSE users.name
                  END,
                  picture = CASE
                    WHEN users.picture = ''
                      AND EXCLUDED.picture <> ''
                    THEN EXCLUDED.picture
                    ELSE users.picture
                  END,
                  updated_at = NOW(),
                  email_verified_at = COALESCE(users.email_verified_at, NOW())
              `,
              [
                user.email,
                user.name,
                user.picture || "",
              ],
            );
          } catch (saveError) {
            console.error(
              "AUTH VERIFY: erro ao salvar perfil:",
              saveError,
            );
          }

          const sessionCookie =
            createSessionCookie(
              user,
            );

          const headers =
            new Headers();

          headers.append(
            "Set-Cookie",
            sessionCookie,
          );

          headers.append(
            "Set-Cookie",
            [
              "wattiq_otp=",
              "Path=/",
              "HttpOnly",
              "Secure",
              "SameSite=Lax",
              "Max-Age=0",
            ].join("; "),
          );

          headers.append(
            "Set-Cookie",
            [
              "wattiq_pending_user=",
              "Path=/",
              "HttpOnly",
              "Secure",
              "SameSite=Lax",
              "Max-Age=0",
            ].join("; "),
          );

          headers.set(
            "Cache-Control",
            "no-store, no-cache, must-revalidate",
          );

          console.log(
            "AUTH VERIFY: login confirmado",
            {
              email:
                user.email,
              sub: user.sub,
              hasPicture:
                Boolean(
                  user.picture,
                ),
            },
          );

          return Response.json(
            {
              success: true,
              authenticated: true,
              user,
            },
            {
              status: 200,
              headers,
            },
          );
        } catch (error) {
          console.error(
            "AUTH VERIFY: erro completo:",
            error,
          );

          return Response.json(
            {
              success: false,
              message:
                "Não foi possível verificar o código. Tente novamente.",
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
