import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import { useEffect, useRef, useState } from "react";

import {
  ArrowRight,
  Bot,
  Building2,
  Check,
  CircleGauge,
  Clock3,
  Database,
  Factory,
  RotateCcw,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Olá! Sou a WattIQ AI. Posso ajudar a estruturar o planejamento energético da sua empresa. Para começar, me conte um pouco sobre a operação e o que você gostaria de entender melhor.",
};

export const Route = createFileRoute("/planejar")({
  component: PlanejarPage,
});

function PlanejarPage() {
  const navigate = useNavigate();

  /*
   * =========================================================
   * AUTENTICAÇÃO
   * =========================================================
   */

  const [authenticated, setAuthenticated] =
    useState(false);

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const response = await fetch("/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            "Não foi possível verificar a sessão.",
          );
        }

        const data = await response.json();

        if (!mounted) return;

        if (data?.authenticated === true) {
          setAuthenticated(true);
          setCheckingAuth(false);
          return;
        }

        navigate({
          to: "/auth",
          search: {
            redirect: "/planejar",
          },
          replace: true,
        });
      } catch (error) {
        console.error(
          "Erro ao verificar sessão:",
          error,
        );

        if (!mounted) return;

        navigate({
          to: "/auth",
          search: {
            redirect: "/planejar",
          },
          replace: true,
        });
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  /*
   * =========================================================
   * CHAT
   * =========================================================
   */

  const [messages, setMessages] =
    useState<ChatMessage[]>([
      INITIAL_MESSAGE,
    ]);

  const [input, setInput] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [resetting, setResetting] =
    useState(false);

  const chatContainerRef =
    useRef<HTMLDivElement>(null);

  /*
   * =========================================================
   * SCROLL AUTOMÁTICO
   * =========================================================
   */

  useEffect(() => {
    const container =
      chatContainerRef.current;

    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  /*
   * =========================================================
   * ENVIAR MENSAGEM
   * =========================================================
   */

  async function sendMessage() {
    const text = input.trim();

    if (!text || loading || resetting) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: text,
    };

    const nextMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/ai/chat`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: nextMessages,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Erro ${response.status} ao conectar com a IA.`,
        );
      }

      const answer =
        data?.message ||
        data?.response ||
        data?.text ||
        data?.content;

      if (!answer) {
        throw new Error(
          "Resposta vazia da IA.",
        );
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (error) {
      console.error(
        "Erro ao conversar com a WattIQ AI:",
        error,
      );

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Não consegui conectar à inteligência da WattIQ neste momento. Verifique se o servidor está ativo e tente novamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================================================
   * RESETAR CONVERSA
   * =========================================================
   */

  async function resetConversation() {
    if (loading || resetting) return;

    const confirmed = window.confirm(
      "Tem certeza que deseja apagar toda a conversa? Essa ação não pode ser desfeita.",
    );

    if (!confirmed) return;

    setResetting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/ai/reset`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || data?.success !== true) {
        throw new Error(
          data?.message ||
            "Não foi possível resetar a conversa.",
        );
      }

      setMessages([
        INITIAL_MESSAGE,
      ]);

      setInput("");
    } catch (error) {
      console.error(
        "Erro ao resetar conversa:",
        error,
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Não foi possível resetar a conversa.",
      );
    } finally {
      setResetting(false);
    }
  }

  /*
   * =========================================================
   * TECLADO
   * =========================================================
   */

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  }

  /*
   * =========================================================
   * TELA DE VERIFICAÇÃO
   * =========================================================
   */

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
            <Zap className="h-5 w-5 animate-pulse text-primary" />
          </div>

          <p className="text-sm text-muted-foreground">
            Verificando sua sessão...
          </p>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return null;
  }

  /*
   * =========================================================
   * PÁGINA
   * =========================================================
   */

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">

      <div className="pointer-events-none fixed inset-0 -z-10">

        <div className="absolute left-1/2 top-[-280px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />

        <div className="absolute right-[-200px] top-[45%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[130px]" />

        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,hsl(var(--foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground))_1px,transparent_1px)] [background-size:64px_64px]" />

      </div>

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="border-b border-border/60 backdrop-blur-xl">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">

          <a
            href="/"
            className="group flex items-center gap-3"
          >

            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 transition-all duration-500 group-hover:border-primary/60 group-hover:bg-primary/15 group-hover:shadow-[0_0_25px_rgba(180,255,80,0.18)]">

              <Zap className="h-4 w-4 text-primary" />

            </div>

            <span className="text-sm font-semibold tracking-tight">
              WattIQ
            </span>

          </a>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">

            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary shadow-[0_0_10px_rgba(180,255,80,0.8)]" />

            Planejamento

          </div>

        </div>

      </header>

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 pb-20 pt-20">

        <div className="mx-auto max-w-4xl text-center">

          <div className="animate-[fadeUp_0.7s_cubic-bezier(0.16,1,0.3,1)]">

            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-[10px] font-medium tracking-[0.2em] text-primary uppercase">

              <Sparkles className="h-3.5 w-3.5" />

              Planejamento energético

            </span>

          </div>

          <h1 className="mt-7 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl">

            Antes de analisar os dados,

            <br />

            <span className="text-gradient-energy">
              entenda a operação.
            </span>

          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">

            Organize as informações da sua empresa,
            descubra quais dados são importantes e
            converse com a inteligência da WattIQ para
            estruturar os próximos passos.

          </p>

        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-4 md:grid-cols-3">

          <PlanningCard
            icon={<Building2 />}
            number="01"
            title="Conheça a operação"
            description="Entenda o perfil da empresa, seus setores, horários, equipamentos e características operacionais."
            delay="0ms"
          />

          <PlanningCard
            icon={<Database />}
            number="02"
            title="Estruture os dados"
            description="Identifique quais informações de consumo, custos e períodos já estão disponíveis."
            delay="80ms"
          />

          <PlanningCard
            icon={<CircleGauge />}
            number="03"
            title="Defina o próximo passo"
            description="Transforme as informações disponíveis em uma base mais clara para futuras análises."
            delay="160ms"
          />

        </div>

      </section>

      {/* =====================================================
          WATTIQ AI
          ===================================================== */}

      <section
        id="wattiq-ai"
        className="border-y border-border/60 bg-card/20"
      >

        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[0.8fr_1.2fr]">

          <div className="flex flex-col justify-center">

            <span className="text-[10px] font-medium tracking-[0.2em] text-primary uppercase">
              WattIQ AI
            </span>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">

              Planeje com uma

              <span className="text-gradient-energy">
                {" "}
                inteligência especializada.
              </span>

            </h2>

            <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">

              Converse com a assistente virtual da
              WattIQ para organizar informações da sua
              empresa, esclarecer dúvidas e descobrir
              quais dados podem ser importantes para o
              planejamento.

            </p>

            <div className="mt-8 space-y-3">

              <Feature
                icon={<Check />}
                text="Conversa orientada ao contexto da sua empresa"
              />

              <Feature
                icon={<Check />}
                text="Ajuda para identificar informações importantes"
              />

              <Feature
                icon={<Check />}
                text="Sem inventar dados ou resultados"
              />

              <Feature
                icon={<Check />}
                text="Orientação para os próximos passos"
              />

            </div>

          </div>

          {/* CHAT */}

          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20">

            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

            <div className="flex items-center justify-between border-b border-border px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">

                  <Bot className="h-4 w-4 text-primary" />

                </div>

                <div>

                  <p className="text-sm font-medium">
                    WattIQ AI
                  </p>

                  <div className="mt-0.5 flex items-center gap-1.5">

                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />

                    <span className="text-[10px] text-muted-foreground">
                      Assistente de planejamento
                    </span>

                  </div>

                </div>

              </div>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={resetConversation}
                  disabled={loading || resetting}
                  className="group flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-xs text-muted-foreground transition-all duration-300 hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                  title="Apagar conversa e começar novamente"
                >

                  <RotateCcw
                    className={`h-3.5 w-3.5 ${
                      resetting
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  <span>
                    {resetting
                      ? "Resetando..."
                      : "Nova conversa"}
                  </span>

                </button>

                <Sparkles className="h-4 w-4 text-primary/60" />

              </div>

            </div>

            <div className="flex h-[520px] flex-col">

              <div
                ref={chatContainerRef}
                className="flex-1 space-y-5 overflow-y-auto p-5"
              >

                {messages.map(
                  (message, index) => (

                    <div
                      key={`${message.role}-${index}`}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      <div
                        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          message.role === "user"
                            ? "rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md border border-border bg-background/70 text-foreground"
                        }`}
                      >
                        {message.content}
                      </div>

                    </div>

                  ),
                )}

                {loading && (

                  <div className="flex justify-start">

                    <div className="rounded-2xl rounded-bl-md border border-border bg-background/70 px-4 py-3">

                      <div className="flex items-center gap-1.5">

                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />

                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />

                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />

                      </div>

                    </div>

                  </div>

                )}

              </div>

              <div className="border-t border-border p-4">

                <div className="flex items-end gap-2 rounded-xl border border-border bg-background/60 p-2 transition-all duration-500 focus-within:border-primary/40 focus-within:shadow-[0_0_30px_rgba(180,255,80,0.08)]">

                  <textarea
                    value={input}
                    onChange={(event) =>
                      setInput(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Conte sobre sua empresa..."
                    rows={1}
                    disabled={resetting}
                    className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={
                      !input.trim() ||
                      loading ||
                      resetting
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-10px_rgba(180,255,80,0.6)] disabled:pointer-events-none disabled:opacity-40"
                    aria-label="Enviar mensagem"
                  >

                    <Send className="h-4 w-4" />

                  </button>

                </div>

                <p className="mt-2 text-center text-[10px] text-muted-foreground">

                  A WattIQ AI utiliza somente informações
                  disponíveis na conversa e no contexto
                  fornecido pelo sistema.

                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          INFORMAÇÕES
          ===================================================== */}

      <section className="mx-auto max-w-6xl px-5 py-20">

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <InfoCard
            icon={<Factory />}
            title="Operação"
            text="Ramo, porte, setores e características da empresa."
          />

          <InfoCard
            icon={<Clock3 />}
            title="Rotina"
            text="Horários, períodos e comportamento operacional."
          />

          <InfoCard
            icon={<Database />}
            title="Dados"
            text="Consumo, custos e histórico disponíveis."
          />

          <InfoCard
            icon={<CircleGauge />}
            title="Indicadores"
            text="Métricas que ajudam a compreender o cenário."
          />

        </div>

        <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/[0.025] p-8 text-center sm:p-12">

          <span className="text-[10px] font-medium tracking-[0.2em] text-primary uppercase">
            Próxima etapa
          </span>

          <h2 className="mx-auto mt-4 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">

            Quanto melhor entendemos a operação,

            <span className="text-gradient-energy">
              {" "}
              melhor podemos interpretar seus dados.
            </span>

          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">

            O planejamento não precisa começar com
            todos os dados. Comece pelo que você já
            conhece e evolua a partir daí.

          </p>

          <a
            href="#wattiq-ai"
            className="mt-7 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/15 hover:shadow-[0_18px_40px_-18px_rgba(180,255,80,0.4)]"
          >

            Continuar planejamento

            <ArrowRight className="h-4 w-4" />

          </a>

        </div>

      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="border-t border-border/60 py-8">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 text-xs text-muted-foreground sm:flex-row">

          <span>WattIQ</span>

          <span>
            Monitoramento · Análise · Inteligência energética
          </span>

        </div>

      </footer>

    </main>
  );
}

/* =========================================================
   PLANNING CARD
   ========================================================= */

function PlanningCard({
  icon,
  number,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <div
      className="group animate-[fadeUp_0.8s_cubic-bezier(0.16,1,0.3,1)_both] rounded-xl border border-border bg-card p-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_24px_50px_-22px_rgba(180,255,80,0.45)]"
      style={{
        animationDelay: delay,
      }}
    >

      <div className="flex items-start justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary transition-all duration-500 group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:shadow-[0_0_25px_rgba(180,255,80,0.12)]">

          {icon}

        </div>

        <span className="font-mono text-xs text-muted-foreground">
          {number}
        </span>

      </div>

      <h3 className="mt-8 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      <div className="mt-6 h-px w-full overflow-hidden bg-border">

        <div className="h-full w-0 bg-gradient-energy transition-all duration-700 ease-out group-hover:w-full" />

      </div>

    </div>
  );
}

/* =========================================================
   FEATURE
   ========================================================= */

function Feature({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">

      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">

        {icon}

      </span>

      <span>{text}</span>

    </div>
  );
}

/* =========================================================
   INFO CARD
   ========================================================= */

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="group rounded-xl border border-border bg-card p-5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:border-primary/30 hover:shadow-[0_20px_45px_-22px_rgba(180,255,80,0.3)]">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-primary transition-all duration-500 group-hover:border-primary/30">

        {icon}

      </div>

      <h3 className="mt-5 text-sm font-semibold">
        {title}
      </h3>

      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {text}
      </p>

    </div>
  );
}
