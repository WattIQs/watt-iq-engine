import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { verifyOtpChallenge } from "../lib/otp-store";

const mark = "/wattiq-logo.png";

export const Route = createFileRoute("/auth/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const code = typeof body.code === "string" ? body.code : "";

          const cookie = request.headers.get("cookie") ?? "";
          const match = cookie.match(/wattiq_otp=([^;]+)/);
          const challengeId = match?.[1];

          if (!challengeId) {
            return Response.json(
              {
                message:
                  "A sessão de confirmação expirou. Faça login novamente.",
              },
              { status: 401 },
            );
          }

          if (!/^\d{6}$/.test(code)) {
            return Response.json(
              { message: "Digite um código válido de 6 dígitos." },
              { status: 400 },
            );
          }

          const email = verifyOtpChallenge(challengeId, code);

          if (!email) {
            return Response.json(
              {
                message:
                  "Código incorreto ou expirado. Verifique o e-mail e tente novamente.",
              },
              { status: 401 },
            );
          }

          return new Response(null, {
            status: 302,
            headers: {
              Location: "/",
              "Set-Cookie": [
                "wattiq_otp=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
                `wattiq_user=${encodeURIComponent(email)}; Path=/; HttpOnly; Secure; SameSite=Lax`,
              ].join(", "),
            },
          });
        } catch (error) {
          console.error("Erro ao verificar OTP:", error);

          return Response.json(
            { message: "Não foi possível verificar o código." },
            { status: 500 },
          );
        }
      },
    },
  },

  component: VerifyPage,
});

function VerifyPage() {
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (code.length !== 6) {
      setMessage("Digite o código completo de 6 dígitos.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (response.redirected) {
        window.location.href = response.url;
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Código inválido ou expirado.");
        return;
      }

      navigate({ to: "/" });
    } catch {
      setMessage("Não foi possível verificar o código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-md animate-rise">
        <Link
          to="/"
          className="mx-auto flex w-fit items-center gap-2.5"
          aria-label="WattIQ — início"
        >
          <img
            src={mark}
            alt=""
            aria-hidden
            className="h-9 w-9 object-contain"
          />

          <span className="text-lg font-semibold tracking-tight">
            Watt<span className="text-primary">IQ</span>
          </span>
        </Link>

        <div className="mt-8 rounded-xl border border-border bg-card p-7 shadow-sm">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Confirme seu login
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Enviamos um código de 6 dígitos para o seu e-mail.
              Digite o código abaixo para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                Código de confirmação
              </span>

              <input
                value={code}
                onChange={(event) =>
                  setCode(
                    event.target.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                className="mt-2 w-full rounded-md border border-input bg-background px-4 py-4 text-center text-2xl font-semibold tracking-[0.5em] outline-none transition-all duration-300 placeholder:text-muted-foreground/40 focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </label>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="lift w-full rounded-md bg-gradient-energy px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:lift-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Confirmar código"}
            </button>
          </form>

          {message ? (
            <p
              role="alert"
              className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive"
            >
              {message}
            </p>
          ) : null}

          <Link
            to="/auth"
            className="mt-6 block text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
