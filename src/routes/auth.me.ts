import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser } from "../lib/session";

export const Route = createFileRoute("/auth/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = getSessionUser(request);

        if (!user) {
          return Response.json({
            authenticated: false,
            user: null,
          });
        }

        return Response.json({
          authenticated: true,
          user,
        });
      },
    },
  },
});
