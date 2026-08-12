import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser } from "../lib/session";

export const Route = createFileRoute("/auth/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = getSessionUser(request);

        if (!user) {
          return Response.json(
            { authenticated: false },
            { status: 401 },
          );
        }

        return Response.json({
          authenticated: true,
          user,
        });
      },
    },
  },
});
