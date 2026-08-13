import { createFileRoute } from "@tanstack/react-router";

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
            typeof body?.email === "string"
              ? body.email
                  .trim()
                  .toLowerCase()
              : "";

          const name =
            typeof body?.name === "string"
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

          const pendingUser = {
            sub: email,
            email,
            name:
              name ||
              email.split("@")[0],
            picture: "",
          };

          const pendingUserData =
            Buffer.from(
              JSON.stringify(
                pendingUser,
              ),
              "utf8",
            ).toString("base64url");

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
