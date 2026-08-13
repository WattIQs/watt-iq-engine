import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { initDatabase } from "@/lib/db-init";

export const Route = createFileRoute(
  "/api/ai/conversations",
)({
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
              {
                status: 401,
              },
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
            conversationsResult.rows.map(
              (conversation) => ({
                id: conversation.id,
                title:
                  conversation.title ||
                  "Conversa",
                createdAt:
                  conversation.created_at,
                updatedAt:
                  conversation.updated_at,
                messages: [],
              }),
            );

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
            {
              status: 500,
            },
          );
        }
      },
    },
  },
});
