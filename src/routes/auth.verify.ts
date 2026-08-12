import { createFileRoute } from "@tanstack/react-router";
import { VerifyPage } from "../components/auth/VerifyPage";

export const Route = createFileRoute("/auth/verify")({
  component: VerifyPage,
});
