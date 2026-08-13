import { createFileRoute } from "@tanstack/react-router";
import { initDatabase } from "@/lib/db-init";

export const Route = createFileRoute("/api/db-init")({
  server: {
    handlers: {
      GET: async () => {
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
