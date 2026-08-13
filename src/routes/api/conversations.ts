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
                message:
                  "Sessão expirada. Faça login novamente.",
              },
              { status: 401 },
            );
          }

          await initDatabase();

          const conversationsResult =
            await db.query(
              `
                SELECT
                  c.id,
                  c.created_at,
                  c.updated_at,
                  (
                    SELECT m.content
                    FROM ai_messages m
                    WHERE m.conversation_id = c.id
                      AND m.role = 'user'
                    ORDER BY m.created_at ASC, m.id ASC
                    LIMIT 1
                  ) AS title
                FROM ai_conversations c
                WHERE c.user_id = $1
                ORDER BY c.updated_at DESC
              `,
              [user.sub],
            );

          const conversations =
            [];

          for (const conversation of
            conversationsResult.rows) {
            const messagesResult =
              await db.query(
                `
                  SELECT
                    role,
                    content,
                    created_at
                  FROM ai_messages
                  WHERE conversation_id = $1
                  ORDER BY created_at ASC, id ASC
                `,
                [conversation.id],
              );

            conversations.push({
              id: String(conversation.id),

              title:
                conversation.title ||
                "Nova conversa",

              createdAt:
                conversation.created_at,

              updatedAt:
                conversation.updated_at,

              messages:
                messagesResult.rows.map(
                  (message) => ({
                    role:
                      message.role ===
                      "assistant"
                        ? "assistant"
                        : "user",

                    content:
                      message.content,

                    createdAt:
                      message.created_at,
                  }),
                ),
            });
          }

          return Response.json({
            success: true,
            conversations,
          });
        } catch (error) {
          console.error(
            "ERRO AO BUSCAR CONVERSAS DA WATTIQ AI:",
            error,
          );

          return Response.json(
            {
              success: false,
              message:
                "Não foi possível carregar as conversas.",
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
                message:
                  "Sessão expirada. Faça login novamente.",
              },
              { status: 401 },
            );
          }

          await initDatabase();

          const result =
            await db.query(
              `
                INSERT INTO ai_conversations (
                  user_id
                )
                VALUES ($1)
                RETURNING id, created_at, updated_at
              `,
              [user.sub],
            );

          const conversation =
            result.rows[0];

          return Response.json({
            success: true,

            conversation: {
              id: String(
                conversation.id,
              ),

              title: "Nova conversa",

              createdAt:
                conversation.created_at,

              updatedAt:
                conversation.updated_at,

              messages: [],
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
              message:
                "Não foi possível criar uma nova conversa.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
