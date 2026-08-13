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

          const result = await db.query(
            `
            SELECT
              role,
              content,
              created_at
            FROM ai_conversations
            WHERE user_email = $1
            ORDER BY created_at ASC
            `,
            [user.email],
          );

          return Response.json({
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
