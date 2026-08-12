import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const mark = "/wattiq-logo.png";

export function VerifyPage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCountdown((current) =>
        current > 0 ? current - 1 : 0,
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [countdown]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (code.length !== 6) {
      setMessage(
        "Digite o código completo de 6 dígitos.",
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/auth/verify", {
        method: "POST",
        credentials: "include",
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
        setMessage(
          data.message ||
            "Código inválido ou expirado.",
        );
        return;
      }

      window.location.href = "/";
    } catch {
      setMessage(
        "Não foi possível verificar o código. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0 || resending) {
      return;
    }

    setResending(true);
    setMessage("");

    try {
      const response = await fetch("/auth/email/resend", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Não foi possível reenviar o código.",
        );
        return;
      }

      setCode("");
      setCountdown(60);
      setMessage(
        "Um novo código foi enviado para seu e-mail.",
      );
    } catch {
      setMessage(
        "Não foi possível reenviar o código. Tente novamente.",
      );
    } finally {
      setResending(false);
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
              Enviamos um código de 6 dígitos para o
              seu e-mail. Digite o código abaixo para
              continuar.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
          >
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                Código de confirmação
              </span>

              <input
                value={code}
                onChange={(event) => {
                  setCode(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6),
                  );
                  setMessage("");
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                className="mt-2 w-full rounded-md border border-input bg-background px-4 py-4 text-center text-2xl font-semibold tracking-[0.5em] outline-none transition-all duration-300 placeholder:text-muted-foreground/40 focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </label>

            <button
              type="submit"
              disabled={
                loading || code.length !== 6
              }
              className="lift w-full rounded-md bg-gradient-energy px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:lift-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Verificando..."
                : "Confirmar código"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs text-muted-foreground">
              Não recebeu o código?
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={
                resending || countdown > 0
              }
              className="mt-2 text-sm font-medium text-primary transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resending
                ? "Enviando..."
                : countdown > 0
                  ? `Reenviar código em ${countdown}s`
                  : "Reenviar código"}
            </button>
          </div>

          {message ? (
            <p
              role="alert"
              className="mt-5 rounded-md border border-border bg-secondary p-4 text-center text-sm text-foreground"
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
