import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
const mark = "/wattiq-logo.png";

const title = "Entrar na WattIQ — Acesso ao painel energético";
const description =
  "Página de login da WattIQ. Depois de configurar as variáveis de ambiente no Render, o acesso ao painel acontece aqui.";

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
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1A7 7 0 0 1 12 4.8Z"
      />
    </svg>
  );
}

const envVars = [
  { name: "GEMINI_API_KEY", note: "chave do Gemini — usada só no backend" },
  { name: "GOOGLE_CLIENT_ID", note: "login com Google" },
  { name: "GOOGLE_CLIENT_SECRET", note: "login com Google" },
  { name: "AUTH_REDIRECT_URL", note: "https://seu-app.onrender.com/auth/callback" },
];

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [notice, setNotice] = useState<string | null>(null);

  const pending = () =>
    setNotice(
      "Login ainda inativo: falta configurar GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e AUTH_REDIRECT_URL no Render. Assim que as variáveis estiverem salvas e o serviço reiniciado, este mesmo botão passa a autenticar e leva ao painel.",
    );

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Coluna do formulário */}
      <div className="flex flex-col justify-center px-5 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md animate-rise">
          <Link to="/" className="inline-flex items-center gap-2.5" aria-label="WattIQ — início">
            <img src={mark} alt="" aria-hidden className="h-9 w-9 object-contain" />
            <span className="text-lg font-semibold tracking-tight">
              Watt<span className="text-primary">IQ</span>
            </span>
          </Link>

          <h1 className="mt-9 text-3xl font-semibold tracking-tight text-balance">
            Este é o ponto de <span className="text-gradient-energy">login</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Toda a autenticação da WattIQ acontece nesta página (<code>/auth</code>). A chave do
            Gemini nunca é pedida aqui — ela fica apenas no Render, no backend.
          </p>

          <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1 text-sm">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-md px-3 py-2 font-medium transition-all duration-300 ${
                    mode === m
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "signin" ? "Entrar" : "Criar conta"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={pending}
              className="lift mt-5 flex w-full items-center justify-center gap-2.5 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium hover:border-primary/60 hover:lift-hover"
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
              onSubmit={(e) => {
                e.preventDefault();
                pending();
              }}
            >
              {mode === "signup" ? (
                <Field label="Nome" type="text" placeholder="Seu nome" />
              ) : null}
              <Field label="E-mail" type="email" placeholder="voce@empresa.com.br" />
              <Field label="Senha" type="password" placeholder="••••••••" />
              <button
                type="submit"
                className="lift w-full rounded-md bg-gradient-energy animate-gradient px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:lift-hover"
              >
                {mode === "signin" ? "Entrar no painel" : "Criar conta"}
              </button>
            </form>

            {notice ? (
              <p
                role="status"
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

      {/* Coluna explicativa: Render → login */}
      <aside className="relative hidden overflow-hidden border-l border-border bg-card/40 lg:block">
        <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div
          className="pointer-events-none absolute -top-20 -right-24 h-80 w-80 rounded-full opacity-20 blur-3xl animate-float"
          style={{ background: "var(--gradient-energy)" }}
          aria-hidden
        />
        <div className="relative flex h-full flex-col justify-center px-14">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium tracking-widest text-primary uppercase">
            Ordem de ativação
          </span>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight">
            Onde entra a chave e onde entra o login
          </h2>
          <ol className="mt-8 space-y-6">
            {[
              {
                t: "1. No Render (uma vez)",
                d: "Service → Environment → Add Environment Variable. As chaves ficam só no servidor; nenhuma delas aparece no navegador.",
              },
              {
                t: "2. Reinicie o serviço",
                d: "O Render aplica as variáveis no próximo deploy/restart. Só depois disso o login e o WattIQ Intelligence respondem.",
              },
              {
                t: "3. Volte para /auth",
                d: "Este endereço é o único ponto de entrada. Você entra com Google ou e-mail e cai direto no painel da sua empresa.",
              },
            ].map((s, i) => (
              <li
                key={s.t}
                className="animate-rise border-l-2 border-primary/40 pl-5"
                style={{ animationDelay: `${120 + i * 120}ms` }}
              >
                <p className="text-sm font-semibold">{s.t}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 rounded-xl border border-border bg-background/60 p-5">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Variáveis esperadas no Render
            </p>
            <ul className="mt-4 space-y-2.5 font-mono text-xs">
              {envVars.map((v) => (
                <li key={v.name} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-primary">{v.name}</span>
                  <span className="font-sans text-muted-foreground">{v.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  type,
  placeholder,
}: {
  label: string;
  type: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}
