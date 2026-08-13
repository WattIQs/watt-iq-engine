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
            conversation: result.rows[0],
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

      DELETE: async ({ request }) => {
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
              ? body.conversationId
              : null;

          if (!conversationId) {
            return Response.json(
              {
                success: false,
                message: "Conversa não informada.",
              },
              { status: 400 },
            );
          }

          const conversation = await db.query(
            `
              SELECT id
              FROM ai_conversations
              WHERE id = $1
                AND user_id = $2
              LIMIT 1
            `,
            [conversationId, user.sub],
          );

          if (conversation.rows.length === 0) {
            return Response.json(
              {
                success: false,
                message: "Conversa não encontrada.",
              },
              { status: 404 },
            );
          }

          await db.query(
            `
              DELETE FROM ai_messages
              WHERE conversation_id = $1
            `,
            [conversationId],
          );

          await db.query(
            `
              DELETE FROM ai_conversations
              WHERE id = $1
                AND user_id = $2
            `,
            [conversationId, user.sub],
          );

          return Response.json({
            success: true,
          });
        } catch (error) {
          console.error(
            "ERRO AO EXCLUIR CONVERSA DA WATTIQ AI:",
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
