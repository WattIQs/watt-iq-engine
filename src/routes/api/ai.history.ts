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
              messages: [],
            });
          }

          const conversationId =
            conversationResult.rows[0].id;

          const messagesResult = await db.query(
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
            messages: messagesResult.rows.map(
              (row) => ({
                role: row.role,
                content: row.content,
                createdAt: row.created_at,
              }),
            ),
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

      DELETE: async ({ request }) => {
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

          /*
           * Busca todas as conversas do usuário.
           *
           * As mensagens são removidas primeiro para evitar
           * problemas de chave estrangeira caso o banco não
           * esteja configurado com ON DELETE CASCADE.
           */

          const conversationsResult = await db.query(
            `
              SELECT id
              FROM ai_conversations
              WHERE user_id = $1
            `,
            [user.sub],
          );

          for (const conversation of conversationsResult.rows) {
            await db.query(
              `
                DELETE FROM ai_messages
                WHERE conversation_id = $1
              `,
              [conversation.id],
            );
          }

          await db.query(
            `
              DELETE FROM ai_conversations
              WHERE user_id = $1
            `,
            [user.sub],
          );

          console.log(
            `WattIQ AI: conversa resetada para ${user.email}`,
          );

          return Response.json({
            success: true,
            message: "Conversa resetada com sucesso.",
          });
        } catch (error) {
          console.error(
            "Erro ao resetar conversa da IA:",
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
