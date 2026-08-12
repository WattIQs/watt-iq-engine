import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cookie = request.headers.get("cookie") ?? "";

        const match = cookie.match(/wattiq_user=([^;]+)/);

        if (!match?.[1]) {
          return Response.json(
            {
              authenticated: false,
              user: null,
            },
            { status: 200 },
          );
        }

        const email = decodeURIComponent(match[1]);

        return Response.json({
          authenticated: true,
          user: {
            email,
          },
        });
      },
    },
  },
});
