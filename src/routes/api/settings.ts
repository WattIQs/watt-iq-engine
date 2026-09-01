import { createFileRoute } from "@tanstack/react-router";

import { db } from "../../lib/db";
import { getSessionUser } from "../../lib/session";
import { initDatabase } from "../../lib/db-init";

export const Route = createFileRoute("/api/settings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = getSessionUser(request);

        if (!user?.email) {
          return Response.json(
            { success: false, message: "Não autenticado." },
            { status: 401 },
          );
        }

        try {
          await initDatabase();

          const result = await db.query(
            `
              SELECT
                us.require_email_verification
              FROM users u
              LEFT JOIN user_settings us
                ON us.user_id = u.id
              WHERE u.email = $1
              LIMIT 1
            `,
            [user.email.trim().toLowerCase()],
          );

          if (result.rows.length === 0) {
            return Response.json(
              { success: false, message: "Usuário não encontrado." },
              { status: 404 },
            );
          }

          const value = result.rows[0]?.require_email_verification;

          return Response.json({
            success: true,
            settings: {
              requireEmailVerification:
                value === null || value === undefined
                  ? true
                  : Boolean(value),
            },
          });
        } catch (error) {
          console.error("SETTINGS GET:", error);

          return Response.json(
            {
              success: false,
              message: "Não foi possível carregar as configurações.",
            },
            { status: 500 },
          );
        }
      },

      PATCH: async ({ request }) => {
        const user = getSessionUser(request);

        if (!user?.email) {
          return Response.json(
            { success: false, message: "Não autenticado." },
            { status: 401 },
          );
        }

        try {
          const body = await request.json();
          const requireEmailVerification =
            body?.requireEmailVerification;

          if (typeof requireEmailVerification !== "boolean") {
            return Response.json(
              {
                success: false,
                message: "Valor de configuração inválido.",
              },
              { status: 400 },
            );
          }

          await initDatabase();

          const normalizedEmail = user.email.trim().toLowerCase();

          const result = await db.query(
            `
              INSERT INTO user_settings (
                user_id,
                require_email_verification
              )
              SELECT
                id,
                $2
              FROM users
              WHERE email = $1
              ON CONFLICT (user_id)
              DO UPDATE SET
                require_email_verification = EXCLUDED.require_email_verification,
                updated_at = NOW()
              RETURNING require_email_verification
            `,
            [normalizedEmail, requireEmailVerification],
          );

          if (result.rows.length === 0) {
            return Response.json(
              { success: false, message: "Usuário não encontrado." },
              { status: 404 },
            );
          }

          return Response.json({
            success: true,
            settings: {
              requireEmailVerification: Boolean(
                result.rows[0].require_email_verification,
              ),
            },
          });
        } catch (error) {
          console.error("SETTINGS PATCH:", error);

          return Response.json(
            {
              success: false,
              message: "Não foi possível salvar a configuração.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
