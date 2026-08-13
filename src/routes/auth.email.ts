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
          const contentType =
            request.headers.get("content-type") || "";

          if (!contentType.includes("application/json")) {
            return Response.json(
              {
                message:
                  "Requisição inválida.",
              },
              {
                status: 400,
              },
            );
          }

          const rawBody = await request.text();

          if (!rawBody.trim()) {
            return Response.json(
              {
                message:
                  "Dados de login não enviados.",
              },
              {
                status: 400,
              },
            );
          }

          let body: unknown;

          try {
            body = JSON.parse(rawBody);
          } catch {
            return Response.json(
              {
                message:
                  "Dados de login inválidos.",
              },
              {
                status: 400,
              },
            );
          }

          if (
            typeof body !== "object" ||
            body === null
          ) {
            return Response.json(
              {
                message:
                  "Dados de login inválidos.",
              },
              {
                status: 400,
              },
            );
          }

          const data = body as {
            email?: unknown;
            name?: unknown;
          };

          const email =
            typeof data.email === "string"
              ? data.email.trim().toLowerCase()
              : "";

          const name =
            typeof data.name === "string"
              ? data.name.trim()
              : "";

          if (!email) {
            return Response.json(
              {
                message:
                  "Digite um e-mail válido.",
              },
              {
                status: 400,
              },
            );
          }

          const code = generateOtp();

          const challengeId =
            await createOtpChallenge(
              email,
              code,
            );

          if (
            typeof challengeId !== "string" ||
            !challengeId
          ) {
            console.error(
              "createOtpChallenge não retornou um UUID válido.",
            );

            return Response.json(
              {
                message:
                  "Não foi possível criar a verificação.",
              },
              {
                status: 500,
              },
            );
          }

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
            ).toString("base64url");

          const headers =
            new Headers();

          headers.append(
            "Set-Cookie",
            `wattiq_otp=${challengeId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
          );

          headers.append(
            "Set-Cookie",
            `wattiq_pending_user=${pendingUserData}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
          );

          console.log(
            "OTP enviado e desafio criado:",
            {
              challengeId,
              emailDomain:
                email.split("@")[1] || "",
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
            {
              status: 500,
            },
          );
        }
      },
    },
  },
});