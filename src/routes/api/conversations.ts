import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { initDatabase } from "@/lib/db-init";

export const Route = createFileRoute("/api/ai/conversations")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = getSessionUser(request);

          if (!user) {
            return Response.json(
              {
                success: false,
                message: "Sessão expirada. Faça login novamente.",
              },
              { status: 401 },
            );
          }

          await initDatabase();

          const result = await db.query(
            `
              SELECT
                c.id,
                c.created_at,
                c.updated_at,
                COALESCE(
                  (
                    SELECT LEFT(m.content, 80)
                    FROM ai_messages m
                    WHERE m.conversation_id = c.id
                      AND m.role = 'user'
                    ORDER BY m.created_at ASC, m.id ASC
                    LIMIT 1
                  ),
                  'Nova conversa'
                ) AS title
              FROM ai_conversations c
              WHERE c.user_id = $1
              ORDER BY c.updated_at DESC, c.id DESC
            `,
            [user.sub],
          );

          return Response.json({
            success: true,
            conversations: result.rows,
          });
        } catch (error) {
          console.error(
            "ERRO AO BUSCAR CONVERSAS DA WATTIQ AI:",
            error,
          );

          return Response.json(
            {
              success: false,
              message: "Não foi possível carregar as conversas.",
            },
            { status: 500 },
          );
        }
      },

      POST: async ({ request }) => {
        try {
          const user = getSessionUser(request);

          if (!user) {
            return Response.json(
              {
                success: false,
                message: "Sessão expirada. Faça login novamente.",
              },
              { status: 401 },
            );
          }

          await initDatabase();

          const result = await db.query(
            `
              INSERT INTO ai_conversations (
                user_id
              )
              VALUES ($1)
              RETURNING
                id,
                created_at,
                updated_at
            `,
            [user.sub],
          );

          return Response.json({
            success: true,
            conversation: {
              ...result.rows[0],
              title: "Nova conversa",
            },
          });
        } catch (error) {
          console.error(
            "ERRO AO CRIAR CONVERSA DA WATTIQ AI:",
            error,
          );

          return Response.json(
            {
              success: false,
              message: "Não foi possível criar uma nova conversa.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
