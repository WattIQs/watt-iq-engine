import { createFileRoute } from "@tanstack/react-router";
import { createOtpChallenge } from "../lib/otp-store";
import {
  generateOtp,
  sendOtpEmail,
} from "../lib/email.otp";

export const Route = createFileRoute("/auth/email")({
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

          const email =
            typeof body.email === "string"
              ? body.email.trim().toLowerCase()
              : "";

          if (!email) {
            return Response.json(
              {
                message: "Digite um e-mail válido.",
              },
              {
                status: 400,
              },
            );
          }


          const code = generateOtp();


          const challengeId = createOtpChallenge(
            email,
            code,
          );


          await sendOtpEmail(
            email,
            code,
          );


          const pendingUser = encodeURIComponent(
            JSON.stringify({
              sub: email,
              email,
              name: email.split("@")[0],
            }),
          );


          const headers = new Headers();


          headers.append(
            "Set-Cookie",
            `wattiq_otp=${challengeId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
          );


          headers.append(
            "Set-Cookie",
            `wattiq_pending_user=${pendingUser}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
          );


          console.log(
            "Cookies criados:",
            {
              otp: true,
              pendingUser: true,
              email,
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
            "Erro ao iniciar login por e-mail:",
            error,
          );


          return Response.json(
            {
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
