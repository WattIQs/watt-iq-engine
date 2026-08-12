import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

const mark = "/wattiq-logo.png";

const title = "Entrar na WattIQ — Acesso ao painel energético";

const description =
  "Página de login da WattIQ. Entre para acessar seu painel energético.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1 .7-2.3 1.1-4 1.1a7 7 0 0 1-6.6-4.8h-4v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7h-4a12 12 0 0 0 0 10.8l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 12 0 12 12 0 0 0 1.4 6.7l4 3.1A7 7 0 0 1 12 4.8Z"
      />
    </svg>
  );
}

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setNotice(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setNotice("Digite seu e-mail.");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setNotice("Digite seu nome.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/auth/email", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          name: name.trim(),
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setNotice(
          data.message ||
            "Não foi possível enviar o código.",
        );
        return;
      }

      window.location.href = "/auth/verify";
    } catch (error) {
      console.error("Erro ao iniciar login:", error);

      setNotice(
        "Não foi possível iniciar o login. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen flex-col justify-center px-5 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md animate-rise">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5"
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

          <h1 className="mt-9 text-3xl font-semibold tracking-tight text-balance">
            Este é o ponto de{" "}
            <span className="text-gradient-energy">
              login
            </span>
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Entre na sua conta WattIQ para acessar seu
            painel energético.
          </p>

          <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1 text-sm">
              {(["signin", "signup"] as const).map(
                (m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      setNotice(null);
                    }}
                    className={`rounded-md px-3 py-2 font-medium transition-all duration-300 ${
                      mode === m
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "signin"
                      ? "Entrar"
                      : "Criar conta"}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/auth/google";
              }}
              className="lift mt-5 flex w-full items-center justify-center gap-2.5 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:border-primary/60 hover:lift-hover"
            >
              <GoogleIcon />
              Continuar com Google
            </button>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              ou
              <span className="h-px flex-1 bg-border" />
            </div>

            <form
              className="space-y-4"
              onSubmit={handleEmailLogin}
            >
              {mode === "signup" ? (
                <Field
                  label="Nome"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={setName}
                />
              ) : null}

              <Field
                label="E-mail"
                type="email"
                placeholder="voce@empresa.com.br"
                value={email}
                onChange={setEmail}
              />

              <button
                type="submit"
                disabled={loading}
                className="lift w-full rounded-md bg-gradient-energy animate-gradient px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:lift-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Enviando código..."
                  : mode === "signin"
                    ? "Entrar no painel"
                    : "Criar conta"}
              </button>
            </form>

            {notice ? (
              <p
                role="alert"
                className="mt-5 animate-rise rounded-md border border-accent/40 bg-accent/10 p-4 text-xs leading-relaxed text-foreground"
              >
                {notice}
              </p>
            ) : null}
          </div>

          <Link
            to="/"
            className="mt-6 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">
        {label}
      </span>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}
