import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const mark = "/wattiq-logo.png";

type User = {
  name: string;
  email: string;
  picture?: string;
};

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/auth/me")
      .then(async (response) => {
        if (!response.ok) return null;

        const data = await response.json();

        if (data.authenticated) {
          return data.user;
        }

        return null;
      })
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          aria-label="WattIQ — início"
        >
          <img
            src={mark}
            alt=""
            aria-hidden
            className="h-8 w-8 object-contain"
          />

          <span className="text-lg font-semibold tracking-tight">
            Watt<span className="text-primary">IQ</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a
            href="#problema"
            className="transition-colors hover:text-foreground"
          >
            O problema
          </a>

          <a
            href="#solucao"
            className="transition-colors hover:text-foreground"
          >
            A solução
          </a>

          <a
            href="#indicadores"
            className="transition-colors hover:text-foreground"
          >
            Indicadores
          </a>

          <a
            href="#intelligence"
            className="transition-colors hover:text-foreground"
          >
            Intelligence
          </a>

          <a
            href="#acesso"
            className="transition-colors hover:text-foreground"
          >
            Acesso
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#acesso"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Como acessar
          </a>

          {user ? (
            <div className="flex items-center gap-2">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
              ) : null}

              <span className="hidden text-sm font-medium sm:block">
                {user.name}
              </span>
            </div>
          ) : (
            <Link
              to="/auth"
              className="lift rounded-md bg-gradient-energy animate-gradient px-4 py-2 text-sm font-semibold text-primary-foreground hover:lift-hover"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto max-w-6xl px-5 text-center text-sm text-muted-foreground">
        © 2026 WattIQ. Todos os direitos reservados.
      </div>
    </footer>
  );
}
