import { createFileRoute } from "@tanstack/react-router";

import { VerifyPage } from "../../components/auth/VerifyPage";

import {
  verifyOtpChallenge,
} from "../../lib/otp-store";

import {
  createSessionCookie,
} from "../../lib/session";

function readCookie(
  request: Request,
  name: string,
): string | null {
  const header =
    request.headers.get("cookie");

  if (!header) {
    return null;
  }

  const cookies = header.split(";");

  for (const cookie of cookies) {
    const trimmed = cookie.trim();

    const separator =
      trimmed.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key =
      trimmed.substring(
        0,
        separator,
      );

    const value =
      trimmed.substring(
        separator + 1,
      );

    if (key === name) {
      return value || null;
    }
  }

  return null;
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
            typeof body?.code === "string"
              ? body.code.trim()
              : "";

          if (!/^\d{6}$/.test(code)) {
            return Response.json(
              {
                message:
                  "Digite o código completo de 6 dígitos.",
              },
              {
                status: 400,
              },
            );
          }

          /*
           * IMPORTANTE:
           * readCookie NÃO é async.
           * Portanto NÃO usamos await aqui.
           */

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

          console.log(
            "VERIFY OTP:",
            {
              hasChallengeId:
                Boolean(challengeId),

              challengeId:
                challengeId
                  ? `${challengeId.substring(0, 8)}...`
                  : null,

              hasPendingUser:
                Boolean(pendingUserRaw),

              codeLength:
                code.length,
            },
          );

          if (!challengeId) {
            return Response.json(
              {
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
                message:
                  "Código inválido ou expirado.",
              },
              {
                status: 400,
              },
            );
          }

          let pendingUser:
            | {
                sub?: string;
                email?: string;
                name?: string;
                picture?: string;
              }
            | null = null;

          if (pendingUserRaw) {
            try {
              pendingUser =
                JSON.parse(
                  Buffer.from(
                    pendingUserRaw,
                    "base64url",
                  ).toString(
                    "utf-8",
                  ),
                );
            } catch (error) {
              console.error(
                "Erro ao ler usuário pendente:",
                error,
              );

              pendingUser = null;
            }
          }

          const user = {
            sub:
              pendingUser?.sub ||
              email,

            email,

            name:
              pendingUser?.name ||
              email.split("@")[0],

            picture:
              pendingUser?.picture ||
              "",
          };

          const headers =
            new Headers();

          headers.append(
            "Set-Cookie",
            createSessionCookie(user),
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

          console.log(
            "SESSÃO CRIADA:",
            {
              email: user.email,
              sub: user.sub,
            },
          );

          return Response.json(
            {
              success: true,
              user,
            },
            {
              status: 200,
              headers,
            },
          );
        } catch (error) {
          console.error(
            "Erro ao verificar OTP:",
            error,
          );

          return Response.json(
            {
              message:
                "Não foi possível verificar o código.",
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