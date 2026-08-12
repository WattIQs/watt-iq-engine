import { createFileRoute } from "@tanstack/react-router";
import { clearSessionCookie } from "../lib/session";

export const Route = createFileRoute("/auth/logout")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/",
            "Set-Cookie": clearSessionCookie(),
          },
        });
      },
    },
  },
});
