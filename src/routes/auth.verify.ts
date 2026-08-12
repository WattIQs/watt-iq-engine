import { createFileRoute } from "@tanstack/react-router";
import { verifyOtpChallenge } from "../lib/otp-store";
import {
createSessionCookie,
type SessionUser,
} from "../lib/session";
import { VerifyPage } from "../components/auth/VerifyPage";

export const Route = createFileRoute("/auth/verify")({
server: {
handlers: {
POST: async ({ request }) => {
try {
const body = await request.json();

      const code =
        typeof body.code === "string"
          ? body.code
          : "";

      const cookie =
        request.headers.get("cookie") ?? "";

      const otpMatch = cookie.match(
        /wattiq_otp=([^;]+)/,
      );

      const pendingMatch = cookie.match(
        /wattiq_pending_user=([^;]+)/,
      );

      const challengeId = otpMatch?.[1];
      const pendingUser = pendingMatch?.[1];

      if (!challengeId || !pendingUser) {
        return Response.json(
          {
            message:
              "A sessão de confirmação expirou. Faça login novamente.",
          },
          { status: 401 },
        );
      }

      if (!/^\d{6}$/.test(code)) {
        return Response.json(
          {
            message:
              "Digite um código válido de 6 dígitos.",
          },
          { status: 400 },
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
              "Código incorreto ou expirado. Verifique seu e-mail e tente novamente.",
          },
          { status: 401 },
        );
      }

      let user: SessionUser;

      try {
        user = JSON.parse(
          Buffer.from(
            pendingUser,
            "base64url",
          ).toString("utf-8"),
        ) as SessionUser;
      } catch {
        return Response.json(
          {
            message:
              "Não foi possível recuperar os dados da conta.",
          },
          { status: 400 },
        );
      }

      if (!user.sub || !user.email) {
        return Response.json(
          {
            message:
              "Dados da conta inválidos.",
          },
          { status: 400 },
        );
      }

      if (
        user.email.toLowerCase() !==
        email.toLowerCase()
      ) {
        return Response.json(
          {
            message:
              "O código não corresponde à conta que iniciou o login.",
          },
          { status: 401 },
        );
      }

      const headers = new Headers();

      headers.set("Location", "/");

      headers.append(
        "Set-Cookie",
        createSessionCookie(user),
      );

      headers.append(
        "Set-Cookie",
        "wattiq_otp=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
      );

      headers.append(
        "Set-Cookie",
        "wattiq_pending_user=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
      );

      return new Response(null, {
        status: 302,
        headers,
      });
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
        { status: 500 },
      );
    }
  },
},

},

component: VerifyPage,
});
