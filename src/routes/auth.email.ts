import { createFileRoute } from "@tanstack/react-router";

import { db } from "../lib/db";
import { initDatabase } from "../lib/db-init";
import { createOtpChallenge } from "../lib/otp-store";
import { generateOtp, sendOtpEmail } from "../lib/email.otp";
import {
  createSessionCookie,
  type SessionUser,
} from "../lib/session";

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

function buildPendingCookie(
  user: SessionUser,
): string {
  const data = Buffer.from(
    JSON.stringify(user),
    "utf8",
  ).toString("base64url");

  return createCookie(
    "wattiq_pending_user",
    data,
    600,
  );
}

export const Route = createFileRoute(
  "/auth/email",
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();

          const email =
            typeof body?.email === "string"
              ? body.email.trim().toLowerCase()
              : "";

          const name =
            typeof body?.name === "string"
              ? body.name.trim()
              : "";

          if (!email || !email.includes("@")) {
            return Response.json(
              {
                success: false,
                message: "Digite um e-mail válido.",
              },
              { status: 400 },
            );
          }

          await initDatabase();

          const result = await db.query(
            `
              SELECT
                u.id,
                u.email,
                u.name,
                u.picture,
                u.email_verified_at,
                COALESCE(
                  us.require_email_verification,
                  TRUE
                ) AS require_email_verification
              FROM users u
              LEFT JOIN user_settings us
                ON us.user_id = u.id
              WHERE u.email = $1
              LIMIT 1
            `,
            [email],
          );

          const row = result.rows[0];

          const user: SessionUser = {
            sub: row?.id ? String(row.id) : email,
            email,
            name:
              typeof row?.name === "string" && row.name.trim()
                ? row.name.trim()
                : name || email.split("@")[0],
            picture:
              typeof row?.picture === "string"
                ? row.picture
                : "",
          };

          const isVerified = Boolean(row?.email_verified_at);
          const requiresCode =
            !row ||
            !isVerified ||
            Boolean(row.require_email_verification);

          /*
           * O primeiro login por e-mail sempre passa pela
           * verificação. Depois disso, a preferência persistida
           * no PostgreSQL decide se novos códigos serão enviados.
           */
          if (!requiresCode) {
            const headers = new Headers();

            headers.append(
              "Set-Cookie",
              createSessionCookie(user),
            );

            headers.set(
              "Cache-Control",
              "no-store, no-cache, must-revalidate",
            );

            return Response.json(
              {
                success: true,
                authenticated: true,
                verificationRequired: false,
                user,
              },
              {
                status: 200,
                headers,
              },
            );
          }

          const code = generateOtp();
          const challengeId = await createOtpChallenge(
            email,
            code,
          );

          await sendOtpEmail(email, code);

          const headers = new Headers();

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
            buildPendingCookie(user),
          );

          headers.set("Cache-Control", "no-store");

          return Response.json(
            {
              success: true,
              authenticated: false,
              verificationRequired: true,
              message: "Código enviado para seu e-mail.",
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
            { status: 500 },
          );
        }
      },
    },
  },
});
