import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

const mark = "/wattiq-logo.png";

type User = {
  name: string;
  email: string;
  picture?: string;
};

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

const mark = "/wattiq-logo.png";

type User = {
  email: string;
};

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/auth/me", {
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) return null;

        const data = await response.json();

        return data.authenticated ? data.user : null;
      })
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    try {
      await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      setMenuOpen(false);
      window.location.href = "/";
    }
  }

  function handleSwitchAccount() {
    window.location.href = "/auth/google?prompt=select_account";
  }

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
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-1.5 transition-all duration-200 hover:border-primary/40 hover:bg-secondary"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {user.email.charAt(0).toUpperCase()}
                </div>

                <span className="hidden max-w-48 truncate text-sm font-medium sm:block">
                  {user.email}
                </span>

                <svg
                  viewBox="0 0 20 20"
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  <path
                    d="M5 7.5 10 12.5 15 7.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {menuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl animate-rise"
                >
                  <div className="border-b border-border px-3 py-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Conta conectada
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold">
                      {user.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSwitchAccount}
                    className="mt-1 block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary"
                  >
                    <span className="font-medium">Trocar conta</span>

                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Entrar com outro Google
                    </span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    Sair
                  </button>
                </div>
              ) : null}
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/auth/me")
      .then(async (response) => {
        if (!response.ok) return null;

        const data = await response.json();

        return data.authenticated ? data.user : null;
      })
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt=""
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <span className="hidden max-w-48 truncate text-sm font-medium sm:block">
                  {user.email}
                </span>

                <svg
                  viewBox="0 0 20 20"
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  <path
                    d="M5 7.5 10 12.5 15 7.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {menuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl animate-rise"
                >
                  <div className="border-b border-border px-3 py-3">
                    <p className="text-sm font-semibold">
                      {user.name}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>

                  <a
                    href="/auth/google"
                    role="menuitem"
                    className="mt-1 block rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
                  >
                    <span className="font-medium">Trocar conta</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Entrar com outro Google
                    </span>
                  </a>

                  <a
                    href="/auth/logout"
                    role="menuitem"
                    className="block rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    Sair
                  </a>
                </div>
              ) : null}
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
