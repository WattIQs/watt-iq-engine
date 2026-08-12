import { useState } from "react";
import { Link } from "@tanstack/react-router";

const mark = "/wattiq-logo.png";

export function VerifyPage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      const response = await fetch("/auth/verify", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(
          data.message || "Código inválido ou expirado.",
        );
        return;
      }

      window.location.href = "/";
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
          data.message || "Não foi possível reenviar o código.",
        );
        return;
      }

      setMessage("Um novo código foi enviado para seu e-mail.");
    } catch (error) {
      console.error(error);
      setMessage("Não foi possível reenviar o código.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mx-auto flex w-fit items-center gap-2.5"
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

        <div className="mt-8 rounded-xl border border-border bg-card p-7 shadow-sm">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">
              Confirme seu login
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Enviamos um código de 6 dígitos para seu e-mail.
              Digite o código abaixo para continuar.
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
                className="mt-2 w-full rounded-md border border-input bg-background px-4 py-4 text-center text-2xl font-semibold tracking-[0.5em] outline-none focus:border-primary"
              />
            </label>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-md bg-gradient-energy px-4 py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Confirmar código"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="mt-4 w-full text-sm font-medium text-primary hover:underline disabled:opacity-50"
          >
            Reenviar código
          </button>

          {message && (
            <p
              role="status"
              className="mt-5 rounded-md border border-border bg-muted p-4 text-center text-sm"
            >
              {message}
            </p>
          )}

          <Link
            to="/auth"
            className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground"
          >
            ← Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
