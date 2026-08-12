import { createFileRoute } from "@tanstack/react-router";
import { VerifyPage } from "../components/auth/VerifyPage";
import {
  verifyOtpChallenge,
} from "../lib/otp-store";
import {
  createSessionCookie,
} from "../lib/session";


function readCookie(
  request: Request,
  name: string,
) {
  const header = request.headers.get("cookie");

  if (!header) {
    return null;
  }

  const cookie = header
    .split(";")
    .map((c) => c.trim())
    .find(
      (c) => c.startsWith(`${name}=`),
    );

  if (!cookie) {
    return null;
  }

  return cookie.substring(
    name.length + 1,
  );
}


export const Route = createFileRoute(
  "/auth/verify",
)({
  component: VerifyPage,

  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();

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
            "Cookies:",
            {
              otp: !!challengeId,
              pendingUser: !!pendingUserRaw,
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


          const email =
            verifyOtpChallenge(
              challengeId,
              code,
            );


          console.log(
            "Resultado OTP:",
            email,
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


          const pendingUser =
            JSON.parse(
              Buffer.from(
                pendingUserRaw,
                "base64url",
              ).toString("utf-8"),
            ) as {
              sub: string;
              email: string;
              name?: string;
              picture?: string;
            };


          const user = {
            sub: pendingUser.sub,
            email: pendingUser.email,
            name:
              pendingUser.name ??
              pendingUser.email.split("@")[0],
            picture:
              pendingUser.picture,
          };


          const headers =
            new Headers();


          headers.append(
            "Set-Cookie",
            createSessionCookie(user),
          );


          headers.append(
            "Set-Cookie",
            "wattiq_otp=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0",
          );


          headers.append(
            "Set-Cookie",
            "wattiq_pending_user=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0",
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
            "Erro verify:",
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
