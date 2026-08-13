import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { initDatabase } from "@/lib/db-init";

export const Route = createFileRoute("/api/ai/history")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = getSessionUser(request);

          if (!user) {
            return Response.json(
              {
                success: false,
                message: "Usuário não autenticado.",
              },
              { status: 401 },
            );
          }

          await initDatabase();

          const url = new URL(request.url);
          const conversationId =
            url.searchParams.get("conversationId");

          if (!conversationId) {
            return Response.json(
              {
                success: false,
                message: "conversationId não informado.",
              },
              { status: 400 },
            );
          }

          const conversationResult = await db.query(
            `
              SELECT id
              FROM ai_conversations
              WHERE id = $1
                AND user_id = $2
              LIMIT 1
            `,
            [conversationId, user.sub],
          );

          if (conversationResult.rows.length === 0) {
            return Response.json(
              {
                success: false,
                message: "Conversa não encontrada.",
              },
              { status: 404 },
            );
          }

          const result = await db.query(
            `
              SELECT
                id,
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
            success: true,
            conversationId,
            messages: result.rows.map((row) => ({
              id: row.id,
              role: row.role,
              content: row.content,
              createdAt: row.created_at,
            })),
          });
        } catch (error) {
          console.error(
            "ERRO AO CARREGAR HISTÓRICO DA WATTIQ AI:",
            error,
          );

          return Response.json(
            {
              success: false,
              message:
                "Não foi possível carregar o histórico da conversa.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
