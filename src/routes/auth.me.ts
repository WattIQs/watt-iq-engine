import { createFileRoute } from "@tanstack/react-router";

import { getSessionUser } from "../lib/session";

export const Route = createFileRoute(
  "/auth/me",
)({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user =
          getSessionUser(request);

        console.log(
          "AUTH ME:",
          {
            hasCookie:
              !!request.headers.get(
                "cookie",
              ),

            authenticated:
              !!user,

            user: user
              ? {
                  email:
                    user.email,
                  sub:
                    user.sub,
                }
              : null,
          },
        );

        return Response.json(
          {
            authenticated:
              !!user,

            user:
              user ?? null,
          },
          {
            status: 200,
            headers: {
              "Cache-Control":
                "no-store, no-cache, must-revalidate, proxy-revalidate",
            },
          },
        );
      },
    },
  },
});
