import { createFileRoute } from "@tanstack/react-router";
import { initDatabase } from "@/lib/db-init";

const DB_INIT_SECRET = process.env.DB_INIT_SECRET;

export const Route = createFileRoute("/api/db-init")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const authorization = request.headers.get("authorization");

        if (
          !DB_INIT_SECRET ||
          authorization !== `Bearer ${DB_INIT_SECRET}`
        ) {
          return Response.json(
            {
              success: false,
              message: "Não autorizado.",
            },
            {
              status: 401,
            },
          );
        }

        try {
          await initDatabase();

          return Response.json({
            success: true,
            message: "Banco inicializado com sucesso.",
          });
        } catch (error) {
          console.error("Erro no db-init:", error);

          return Response.json(
            {
              success: false,
              message: "Erro ao inicializar banco.",
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