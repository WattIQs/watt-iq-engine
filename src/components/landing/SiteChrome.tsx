import { Link } from "@tanstack/react-router";
import { ArrowRight, Settings, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const mark = "/wattiq-logo.png";

type User = {
  name: string;
  email: string;
  picture?: string;
};

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);

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

          <Link
            to="/planejar"
            className="group relative inline-flex items-center gap-1.5 text-foreground transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
          >
            <span>Planejar</span>

            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
            />

            <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-500 ease-out group-hover:w-full" />
          </Link>
        </nav>

        <div className="flex items-center gap-2">

          <Link
            to="/planejar"
            className="group hidden items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-2 text-sm font-medium text-primary transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/15 hover:shadow-[0_16px_35px_-18px_rgba(180,255,80,0.5)] sm:inline-flex md:hidden"
          >
            Planejar

            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
            />
          </Link>

          {user ? (

            <div
              className="relative"
              ref={menuRef}
            >

              <button
                type="button"
                onClick={() =>
                  setMenuOpen((open) => !open)
                }
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary"
              >

                {user.picture ? (

                  <img
                    src={user.picture}
                    alt=""
                    className="h-8 w-8 rounded-full"
                  />

                ) : (

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {user.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                )}

                <span className="hidden max-w-48 truncate text-sm font-medium sm:block">
                  Olá, {user.name}
                </span>

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

                  <button
                    type="button"
                    role="menuitem"
                    onClick={async () => {
                      setMenuOpen(false);
                      setSettingsOpen(true);
                      setSettingsLoading(true);
                      setSettingsMessage("");
                      try {
                        const response = await fetch("/api/settings", { credentials: "include", cache: "no-store" });
                        const data = await response.json();
                        if (!response.ok || !data?.success) throw new Error(data?.message || "Não foi possível carregar.");
                        setRequireEmailVerification(Boolean(data.settings.requireEmailVerification));
                      } catch (error) {
                        setSettingsMessage(error instanceof Error ? error.message : "Não foi possível carregar.");
                      } finally {
                        setSettingsLoading(false);
                      }
                    }}
                    className="group mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-300 hover:bg-secondary"
                  >
                    <span className="flex items-center gap-2 font-medium"><Settings className="h-4 w-4 text-muted-foreground" />Configurações</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                  </button>

                  <a
                    href="/auth/google"
                    role="menuitem"
                    className="block rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
                  >
                    <span className="font-medium">
                      Trocar conta
                    </span>

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


          {settingsOpen ? (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setSettingsOpen(false);
              }}
            >
              <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-black/50 animate-in zoom-in-95 slide-in-from-bottom-3 duration-300">
                <div className="flex items-start justify-between border-b border-border px-6 py-5">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary">Segurança</p>
                    <h2 className="mt-1 text-xl font-semibold">Configurações</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Controle a segurança da sua conta.</p>
                  </div>
                  <button type="button" onClick={() => setSettingsOpen(false)} className="rounded-lg px-2 py-1 text-xl text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Fechar">×</button>
                </div>
                <div className="p-6">
                  {settingsLoading ? (
                    <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Carregando...</div>
                  ) : (
                    <div className="rounded-2xl border border-border bg-background/40 p-4">
                      <div className="flex items-center justify-between gap-5">
                        <div>
                          <h3 className="text-sm font-medium">Verificação em duas etapas</h3>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">Exige um código enviado por e-mail em novos logins.</p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={requireEmailVerification}
                          disabled={settingsSaving}
                          onClick={async () => {
                            const next = !requireEmailVerification;
                            setRequireEmailVerification(next);
                            setSettingsSaving(true);
                            setSettingsMessage("");
                            try {
                              const response = await fetch("/api/settings", {
                                method: "PATCH",
                                credentials: "include",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ requireEmailVerification: next }),
                              });
                              const data = await response.json();
                              if (!response.ok || !data?.success) throw new Error(data?.message || "Não foi possível salvar.");
                              setRequireEmailVerification(Boolean(data.settings.requireEmailVerification));
                              setSettingsMessage("Configuração salva.");
                            } catch (error) {
                              setRequireEmailVerification(!next);
                              setSettingsMessage(error instanceof Error ? error.message : "Não foi possível salvar.");
                            } finally {
                              setSettingsSaving(false);
                            }
                          }}
                          className={`relative h-7 w-12 shrink-0 rounded-full border transition-all duration-300 ${requireEmailVerification ? "border-primary/50 bg-primary/20" : "border-border bg-background"}`}
                        >
                          <span className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border transition-all duration-300 ${requireEmailVerification ? "left-6 border-primary bg-primary" : "left-1 border-border bg-card"}`} />
                        </button>
                      </div>
                      {settingsMessage && <p className="mt-3 text-xs text-muted-foreground">{settingsMessage}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}

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
