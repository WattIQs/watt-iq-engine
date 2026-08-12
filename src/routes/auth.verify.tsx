import { createFileRoute } from "@tanstack/react-router";
import { VerifyPage } from "../components/auth/VerifyPage";
import { verifyOtpChallenge } from "../lib/otp-store";
import { createSessionCookie } from "../lib/session";

function readCookie(
  request: Request,
  name: string,
): string | null {
  const header = request.headers.get("cookie");

  if (!header) return null;

  const cookies = header
    .split(";")
    .map((cookie) => cookie.trim());

  const found = cookies.find((cookie) =>
    cookie.startsWith(`${name}=`),
  );

  if (!found) return null;

  return found.slice(name.length + 1);
}


export const Route = createFileRoute("/auth/verify")({
  component: VerifyPage,

  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => null);

          if (!body) {
            return Response.json(
              {
                message: "Dados inválidos.",
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


          if (code.length !== 6) {
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


          const challengeId = readCookie(
            request,
            "wattiq_otp",
          );

          const pendingUserRaw = readCookie(
            request,
            "wattiq_pending_user",
          );


          console.log(
            "Cookies de verificação:",
            {
              challengeId: !!challengeId,
              pendingUserRaw: !!pendingUserRaw,
            },
          );


          if (!challengeId || !pendingUserRaw) {
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


          const email = verifyOtpChallenge(
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


          const pendingUser = JSON.parse(
            decodeURIComponent(
              pendingUserRaw,
            ),
          ) as {
            sub: string;
            email: string;
            name: string;
            picture?: string;
          };


          const headers = new Headers();


          headers.append(
            "Set-Cookie",
            createSessionCookie(
              pendingUser,
            ),
          );


          headers.append(
            "Set-Cookie",
            "wattiq_otp=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
          );


          headers.append(
            "Set-Cookie",
            "wattiq_pending_user=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
          );


          return Response.json(
            {
              success: true,
            },
            {
              status: 200,
              headers,
            },
          );


        } catch (error) {
          console.error(
            "Erro ao verificar código:",
            error,
          );


          return Response.json(
            {
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
