import { createFileRoute } from "@tanstack/react-router";
import { getGoogleLoginUrl } from "../lib/google-auth";

export const Route = createFileRoute("/auth/google")({
  server: {
    handlers: {
      GET: async () => {
        const url = getGoogleLoginUrl();

        return new Response(null, {
          status: 302,
          headers: {
            Location: url,
          },
        });
      },
    },
  },
});
