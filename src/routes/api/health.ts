import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        let database: "ok" | "unavailable" = "ok";

        try {
          await db.query("SELECT 1");
        } catch {
          database = "unavailable";
        }

        return Response.json(
          {
            status: "ok",
            service: "watt-iq-engine",
            database,
            timestamp: new Date().toISOString(),
          },
          {
            status: 200,
            headers: {
              "cache-control": "no-store",
            },
          },
        );
      },
    },
  },
});