import { createFileRoute } from "@tanstack/react-router";
import {
  createOtpChallenge,
} from "../lib/otp-store";
import {
  generateOtp,
  sendOtpEmail,
} from "../lib/email.otp";

export const Route = createFileRoute("/auth/email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();

          const email =
            typeof body.email === "string"
              ? body.email.trim().toLowerCase()
              : "";

          if (!email) {
            return Response.json(
              {
                message: "Digite um e-mail válido.",
              },
              { status: 400 },
            );
          }

          const code = generateOtp();

          const challengeId =
            await createOtpChallenge(
              email,
              code,
            );

          await sendOtpEmail(
            email,
            code,
          );

          const pendingUser = {
            sub: email,
            email,
            name: email.split("@")[0],
            picture: "",
          };

          const pendingUserData =
            Buffer.from(
              JSON.stringify(pendingUser),
            ).toString("base64url");

          const headers = new Headers();

          headers.append(
            "Set-Cookie",
            [
              `wattiq_otp=${challengeId}`,
              "Path=/",
              "HttpOnly",
              "Secure",
              "SameSite=Lax",
              "Max-Age=600",
            ].join("; "),
          );

          headers.append(
            "Set-Cookie",
            [
              `wattiq_pending_user=${pendingUserData}`,
              "Path=/",
              "HttpOnly",
              "Secure",
              "SameSite=Lax",
              "Max-Age=600",
            ].join("; "),
          );

          console.log(
            "OTP CHALLENGE CRIADO:",
            {
              challengeId,
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
            "Erro ao iniciar login:",
            error,
          );

          return Response.json(
            {
              message:
                "Não foi possível iniciar o login. Tente novamente.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});