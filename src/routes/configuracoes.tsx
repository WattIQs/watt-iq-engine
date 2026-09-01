import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Loader2, ShieldCheck, Zap } from "lucide-react";
import { useEffect, useState } from "react";

type Settings = {
  requireEmailVerification: boolean;
};

export const Route = createFileRoute("/configuracoes")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await fetch("/api/settings", {
          credentials: "include",
          cache: "no-store",
        });

        if (response.status === 401) {
          navigate({
            to: "/auth",
            search: { redirect: "/configuracoes" },
            replace: true,
          });
          return;
        }

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message || "Não foi possível carregar as configurações.",
          );
        }

        if (mounted) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error("SETTINGS PAGE:", error);
        if (mounted) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar as configurações.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  async function updateVerification(value: boolean) {
    if (!settings || saving) return;

    const previous = settings.requireEmailVerification;
    setSettings({ ...settings, requireEmailVerification: value });
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requireEmailVerification: value,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Não foi possível salvar a configuração.",
        );
      }

      setSettings(data.settings);
      setMessage("Configuração salva.");
      window.setTimeout(() => setMessage(""), 2200);
    } catch (error) {
      console.error("SETTINGS UPDATE:", error);
      setSettings({
        ...settings,
        requireEmailVerification: previous,
      });
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a configuração.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
        <header className="flex items-center justify-between">
          <Link
            to="/planejar"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-card hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold tracking-tight">WattIQ</span>
          </div>
        </header>

        <section className="mt-12">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                Segurança
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Configurações
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Controle como a WattIQ protege o acesso à sua conta.
              </p>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card/60 shadow-2xl shadow-black/10 backdrop-blur-xl">
            {loading ? (
              <div className="flex items-center gap-3 px-6 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando configurações...
              </div>
            ) : settings ? (
              <div className="flex items-center justify-between gap-6 px-6 py-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-medium">
                      Solicitar código de verificação
                    </h2>
                    {saving && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <p className="mt-1 max-w-lg text-xs leading-5 text-muted-foreground">
                    Quando ativado, a WattIQ envia um código por e-mail
                    antes de concluir novos logins. O primeiro acesso por
                    e-mail sempre exige essa verificação.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.requireEmailVerification}
                  aria-label="Solicitar código de verificação"
                  disabled={saving}
                  onClick={() =>
                    updateVerification(!settings.requireEmailVerification)
                  }
                  className={`relative h-7 w-12 shrink-0 rounded-full border transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
                    settings.requireEmailVerification
                      ? "border-primary/50 bg-primary/20 shadow-[0_0_18px_rgba(180,255,80,0.12)]"
                      : "border-border bg-background"
                  }`}
                >
                  <span
                    className={`absolute top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border transition-all duration-300 ${
                      settings.requireEmailVerification
                        ? "left-6 border-primary bg-primary text-primary-foreground"
                        : "left-1 border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {settings.requireEmailVerification && (
                      <Check className="h-3 w-3" />
                    )}
                  </span>
                </button>
              </div>
            ) : (
              <div className="px-6 py-8 text-sm text-destructive">
                {message || "Não foi possível carregar as configurações."}
              </div>
            )}
          </div>

          {message && settings && (
            <p className="mt-3 text-xs text-muted-foreground" role="status">
              {message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
