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

  const cookies = header.split(";");

  for (const item of cookies) {
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

    return item
      .slice(separatorIndex + 1)
      .trim();
  }

  return null;
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
                message: "Código não informado.",
              },
              { status: 400 },
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
                message:
                  "Dados de verificação inválidos.",
              },
              { status: 400 },
            );
          }

          const code =
            typeof body.code === "string"
              ? body.code.trim()
              : "";

          if (!/^\d{6}$/.test(code)) {
            return Response.json(
              {
                message:
                  "Digite o código completo de 6 dígitos.",
              },
              { status: 400 },
            );
          }

          const challengeId = readCookie(
            request,
            "wattiq_otp",
          );

          const pendingUserRaw = readCookie(
            request,
            "wattiq_pending_user",
          );

          console.log("VERIFY OTP:", {
            hasChallengeId: Boolean(challengeId),
            challengeId,
            hasPendingUser: Boolean(
              pendingUserRaw,
            ),
            codeLength: code.length,
          });

          if (
            !challengeId ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
              challengeId,
            )
          ) {
            return Response.json(
              {
                message:
                  "Sessão de verificação inválida ou expirada. Solicite um novo código.",
              },
              { status: 400 },
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
              { status: 400 },
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
              pendingUser = JSON.parse(
                Buffer.from(
                  pendingUserRaw,
                  "base64url",
                ).toString("utf8"),
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
              pendingUser?.picture || "",
          };

          const headers = new Headers();

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
            "OTP VERIFICADO COM SUCESSO:",
            email,
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