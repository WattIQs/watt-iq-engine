import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser } from "../lib/session";

export const Route = createFileRoute("/auth/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cookie = request.headers.get("cookie");
        const user = getSessionUser(request);

        console.log("AUTH ME:", {
          hasCookieHeader: !!cookie,
          hasSessionCookie:
            !!cookie?.includes("wattiq_session="),
          authenticated: !!user,
          user: user
            ? {
                email: user.email,
                name: user.name,
              }
            : null,
        });

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
