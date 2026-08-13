import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

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
                message: "Usuário não autenticado.",
              },
              {
                status: 401,
              },
            );
          }

          await db.query("BEGIN");

          try {
            await db.query(
              `
                DELETE FROM ai_messages
                WHERE conversation_id IN (
                  SELECT id
                  FROM ai_conversations
                  WHERE user_id = $1
                )
              `,
              [user.sub],
            );

            await db.query(
              `
                DELETE FROM ai_conversations
                WHERE user_id = $1
              `,
              [user.sub],
            );

            await db.query("COMMIT");

            console.log(
              `WattIQ AI: histórico resetado para ${user.email}`,
            );

            return Response.json({
              success: true,
              message: "Conversa resetada com sucesso.",
            });
          } catch (error) {
            await db.query("ROLLBACK");
            throw error;
          }
        } catch (error) {
          console.error(
            "Erro ao resetar histórico da WattIQ AI:",
            error,
          );

          return Response.json(
            {
              success: false,
              message:
                "Não foi possível resetar a conversa.",
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
