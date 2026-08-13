import { createFileRoute } from "@tanstack/react-router";
import { VerifyPage } from "../components/auth/VerifyPage";
import { verifyOtpChallenge } from "../lib/otp-store";
import { createSessionCookie } from "../lib/session";

function readCookie(
  request: Request,
  name: string,
): string | null {
  const header = request.headers.get("cookie");

  if (!header) {
    return null;
  }

  for (const item of header.split(";")) {
    const separatorIndex = item.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = item
      .slice(0, separatorIndex)
      .trim();

    if (key !== name) {
      continue;
    }

    const value = item
      .slice(separatorIndex + 1)
      .trim();

    if (!value) {
      return null;
    }

    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return null;
}

function isValidUuid(
  value: string,
): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export const Route = createFileRoute("/auth/verify")({
  component: VerifyPage,

  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const rawBody = await request.text();

          if (!rawBody.trim()) {
            return Response.json(
              {
                success: false,
                message:
                  "Código não informado.",
              },
              {
                status: 400,
              },
            );
          }

          let body: {
            code?: unknown;
          };

          try {
            body = JSON.parse(rawBody);
          } catch {
            return Response.json(
              {
                success: false,
                message:
                  "Dados de verificação inválidos.",
              },
              {
                status: 400,
              },
            );
          }

          const code =
            typeof body.code === "string"
              ? body.code.trim()
              : "";

          if (!/^\d{6}$/.test(code)) {
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

          /*
           * IMPORTANTE:
           * readCookie é síncrona.
           * Não usar await aqui.
           */
          const challengeId = readCookie(
            request,
            "wattiq_otp",
          );

          const pendingUserRaw = readCookie(
            request,
            "wattiq_pending_user",
          );

          console.log("VERIFY OTP:", {
            hasChallengeId:
              Boolean(challengeId),
            challengeId,
            challengeIdType:
              typeof challengeId,
            hasPendingUser:
              Boolean(pendingUserRaw),
            codeLength: code.length,
          });

          /*
           * Nunca enviar Promise para o PostgreSQL.
           */
          if (!challengeId) {
            return Response.json(
              {
                success: false,
                message:
                  "Sessão de verificação inválida ou expirada. Solicite um novo código.",
              },
              {
                status: 400,
              },
            );
          }

          if (!isValidUuid(challengeId)) {
            console.error(
              "Challenge ID inválido:",
              challengeId,
            );

            return Response.json(
              {
                success: false,
                message:
                  "Sessão de verificação inválida ou expirada. Solicite um novo código.",
              },
              {
                status: 400,
              },
            );
          }

          /*
           * Aqui challengeId é definitivamente
           * uma string UUID.
           */
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

          let pendingUser: {
            sub?: string;
            email?: string;
            name?: string;
            picture?: string;
          } | null = null;

          if (pendingUserRaw) {
            try {
              const decodedUser =
                Buffer.from(
                  pendingUserRaw,
                  "base64url",
                ).toString("utf8");

              const parsedUser =
                JSON.parse(decodedUser);

              if (
                parsedUser &&
                typeof parsedUser ===
                  "object"
              ) {
                pendingUser = parsedUser;
              }
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

          const headers = new Headers();

          /*
           * Cria a sessão definitiva.
           */
          headers.append(
            "Set-Cookie",
            createSessionCookie(user),
          );

          /*
           * Remove o desafio OTP usado.
           */
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

          /*
           * Remove o usuário pendente.
           */
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
            "OTP VERIFICADO COM SUCESSO:",
            {
              email,
              user: {
                sub: user.sub,
                email: user.email,
              },
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
              success: false,
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