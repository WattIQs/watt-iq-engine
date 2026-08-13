import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const mark = "/wattiq-logo.png";

export function VerifyPage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState("/");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryRedirect = params.get("redirect");

    if (
      queryRedirect &&
      queryRedirect.startsWith("/") &&
      !queryRedirect.startsWith("//")
    ) {
      setRedirect(queryRedirect);
      sessionStorage.setItem(
        "wattiq_auth_redirect",
        queryRedirect,
      );
      return;
    }

    const savedRedirect = sessionStorage.getItem(
      "wattiq_auth_redirect",
    );

    if (
      savedRedirect &&
      savedRedirect.startsWith("/") &&
      !savedRedirect.startsWith("//")
    ) {
      setRedirect(savedRedirect);
    }
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (code.length !== 6) {
      setMessage("Digite o código completo de 6 dígitos.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/auth/verify?redirect=${encodeURIComponent(redirect)}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(
          data.message || "Código inválido ou expirado.",
        );
        return;
      }

      sessionStorage.removeItem(
        "wattiq_auth_redirect",
      );

      window.location.href = redirect;
    } catch (error) {
      console.error(error);

      setMessage(
        "Não foi possível verificar o código. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/auth/email", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(
          data.message ||
            "Não foi possível reenviar o código.",
        );
        return;
      }

      setMessage(
        "Um novo código foi enviado para seu e-mail.",
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "Não foi possível reenviar o código.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5">

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-3xl"
        style={{
          background: "var(--gradient-energy)",
        }}
        aria-hidden
      />

      <div className="relative w-full max-w-md animate-rise">

        <Link
          to="/"
          className="mx-auto flex w-fit items-center gap-2.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1"
        >
          <img
            src={mark}
            alt=""
            className="h-9 w-9 object-contain"
          />

          <span className="text-lg font-semibold tracking-tight">
            Watt<span className="text-primary">IQ</span>
          </span>
        </Link>

        <div className="mt-8 rounded-xl border border-border bg-card p-7 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_24px_50px_-25px_rgba(180,255,80,0.35)]">

          <div className="text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
              <span className="text-lg text-primary">
                ✓
              </span>
            </div>

            <h1 className="mt-5 text-2xl font-semibold">
              Confirme seu login
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Enviamos um código de 6 dígitos para seu
              e-mail. Digite o código abaixo para continuar.
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
                className="mt-2 w-full rounded-md border border-input bg-background px-4 py-4 text-center text-2xl font-semibold tracking-[0.5em] outline-none transition-all duration-300 placeholder:text-muted-foreground/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

            </label>

            <button
              type="submit"
              disabled={
                loading ||
                code.length !== 6
              }
              className="group relative w-full overflow-hidden rounded-md bg-gradient-energy px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(180,255,80,0.55)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <span className="relative z-10">
                {loading
                  ? "Verificando..."
                  : "Confirmar código"}
              </span>
            </button>

          </form>

          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="mt-4 w-full text-sm font-medium text-primary transition-all duration-300 hover:-translate-y-0.5 hover:underline disabled:opacity-50"
          >
            Reenviar código
          </button>

          {message && (
            <p
              role="status"
              className="mt-5 animate-rise rounded-md border border-border bg-muted p-4 text-center text-sm"
            >
              {message}
            </p>
          )}

          <Link
            to="/auth"
            className="mt-6 block text-center text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
          >
            ← Voltar para o login
          </Link>

        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground/60">
          Acesso seguro à plataforma WattIQ.
        </p>

      </div>
    </div>
  );
}
