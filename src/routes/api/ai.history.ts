import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export const Route = createFileRoute("/api/ai/history")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = getSessionUser(request);

          if (!user) {
            return Response.json(
              {
                message: "Usuário não autenticado.",
              },
              {
                status: 401,
              },
            );
          }

          const conversationResult = await db.query(
            `
              SELECT id
              FROM ai_conversations
              WHERE user_id = $1
              ORDER BY updated_at DESC
              LIMIT 1
            `,
            [user.sub],
          );

          if (conversationResult.rows.length === 0) {
            return Response.json({
              conversationId: null,
              messages: [],
            });
          }

          const conversationId =
            conversationResult.rows[0].id;

          const result = await db.query(
            `
              SELECT
                role,
                content,
                created_at
              FROM ai_messages
              WHERE conversation_id = $1
              ORDER BY created_at ASC, id ASC
            `,
            [conversationId],
          );

          return Response.json({
            conversationId,
            messages: result.rows.map((row) => ({
              role: row.role,
              content: row.content,
              createdAt: row.created_at,
            })),
          });
        } catch (error) {
          console.error(
            "Erro ao carregar histórico da IA:",
            error,
          );

          return Response.json(
            {
              message:
                "Não foi possível carregar sua conversa.",
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
