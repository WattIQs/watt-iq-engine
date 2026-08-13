import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { initDatabase } from "@/lib/db-init";

export const Route = createFileRoute("/api/ai/reset")({
  server: {
    handlers: {
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

          const body = await request.json().catch(() => ({}));

          const conversationId =
            typeof body?.conversationId === "string"
              ? body.conversationId.trim()
              : "";

          if (!conversationId) {
            return Response.json(
              {
                success: false,
                message: "Conversa não informada.",
              },
              { status: 400 },
            );
          }

          const result = await db.query(
            `
              DELETE FROM ai_conversations
              WHERE id = $1
                AND user_id = $2
              RETURNING id
            `,
            [conversationId, user.sub],
          );

          if (result.rows.length === 0) {
            return Response.json(
              {
                success: false,
                message: "Conversa não encontrada.",
              },
              { status: 404 },
            );
          }

          return Response.json({
            success: true,
            conversationId,
          });
        } catch (error) {
          console.error(
            "ERRO AO RESETAR CONVERSA DA WATTIQ AI:",
            error,
          );

          return Response.json(
            {
              success: false,
              message: "Não foi possível excluir a conversa.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
