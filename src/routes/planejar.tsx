import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import { useEffect, useRef, useState } from "react";

import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
};

type AuthUser = {
  name?: string;
  email?: string;
  picture?: string;
};

const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Olá. Sou a WattIQ AI, sua inteligência especializada em análise e planejamento energético. Como posso ajudar?",
};

export const Route = createFileRoute("/planejar")({
  component: PlanejarPage,
});

function PlanejarPage() {
  const navigate = useNavigate();

  const [authenticated, setAuthenticated] =
    useState(false);

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const [authUser, setAuthUser] =
    useState<AuthUser | null>(null);

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

          setAuthUser(
            data?.user
              ? {
                  name:
                    typeof data.user.name ===
                    "string"
                      ? data.user.name
                      : undefined,

                  email:
                    typeof data.user.email ===
                    "string"
                      ? data.user.email
                      : undefined,

                  picture:
                    typeof data.user.picture ===
                    "string"
                      ? data.user.picture
                      : undefined,
                }
              : null,
          );

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
   * CONVERSAS
   * =========================================================
   */

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [activeConversationId, setActiveConversationId] =
    useState<string | null>(null);

  const [loadingHistory, setLoadingHistory] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  /*
   * =========================================================
   * CARREGAR CONVERSAS
   * =========================================================
   */

  useEffect(() => {
    if (!authenticated) return;

    loadConversations();
  }, [authenticated]);

  async function loadConversations() {
    setLoadingHistory(true);

    try {
      const response = await fetch(
        `${API_URL}/api/conversations`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          "Não foi possível carregar as conversas.",
        );
      }

      const data = await response.json();

      const loaded: Conversation[] =
        Array.isArray(data?.conversations)
          ? data.conversations
              .filter(
                (conversation: any) =>
                  conversation?.id,
              )
              .map(
                (conversation: any) => ({
                  id: String(conversation.id),
                  title:
                    conversation.title ||
                    "Conversa",
                  messages: [],
                }),
              )
          : [];

      setConversations(loaded);

      if (loaded.length > 0) {
        setActiveConversationId(
          loaded[0].id,
        );
      } else {
        setActiveConversationId(null);
      }
    } catch (error) {
      console.error(
        "Erro ao carregar conversas:",
        error,
      );

      setConversations([]);
      setActiveConversationId(null);
    } finally {
      setLoadingHistory(false);
    }
  }

  /*
   * =========================================================
   * CARREGAR MENSAGENS
   * =========================================================
   */

  async function loadConversationMessages(
    conversationId: string,
  ) {
    try {
      const response = await fetch(
        `${API_URL}/api/conversations/${conversationId}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      const messages: ChatMessage[] =
        Array.isArray(data?.messages)
          ? data.messages
              .filter(
                (message: any) =>
                  (message?.role === "user" ||
                    message?.role ===
                      "assistant") &&
                  typeof message?.content ===
                    "string",
              )
              .map(
                (message: any) => ({
                  role: message.role,
                  content: message.content,
                }),
              )
          : [];

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id ===
          conversationId
            ? {
                ...conversation,
                messages,
              }
            : conversation,
        ),
      );
    } catch (error) {
      console.error(
        "Erro ao carregar mensagens:",
        error,
      );
    }
  }

  /*
   * =========================================================
   * NOVA CONVERSA
   * =========================================================
   */

  function createNewConversation() {
    const id = `local-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;

    const conversation: Conversation = {
      id,
      title: "Nova conversa",
      messages: [INITIAL_MESSAGE],
    };

    setConversations((current) => [
      conversation,
      ...current,
    ]);

    setActiveConversationId(id);
    setInput("");
  }

  /*
   * =========================================================
   * CONVERSA ATIVA
   * =========================================================
   */

  const activeConversation =
    conversations.find(
      (conversation) =>
        conversation.id ===
        activeConversationId,
    ) || null;

  /*
   * =========================================================
   * SELECIONAR CONVERSA
   * =========================================================
   */

  async function selectConversation(
    conversationId: string,
  ) {
    setActiveConversationId(
      conversationId,
    );

    const conversation =
      conversations.find(
        (item) =>
          item.id === conversationId,
      );

    if (
      conversation &&
      conversation.messages.length === 0
    ) {
      await loadConversationMessages(
        conversationId,
      );
    }
  }

  /*
   * =========================================================
   * CHAT
   * =========================================================
   */

  const [input, setInput] = useState("");

  const [loading, setLoading] =
    useState(false);

  const chatContainerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container =
      chatContainerRef.current;

    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [
    activeConversation?.messages,
    loading,
  ]);

  function updateConversation(
    conversationId: string,
    updater: (
      conversation: Conversation,
    ) => Conversation,
  ) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id ===
        conversationId
          ? updater(conversation)
          : conversation,
      ),
    );
  }

  async function sendMessage() {
    const text = input.trim();

    if (
      !text ||
      loading ||
      !activeConversation
    ) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: text,
    };

    const conversationId =
      activeConversation.id;

    const nextMessages = [
      ...activeConversation.messages,
      userMessage,
    ];

    updateConversation(
      conversationId,
      (conversation) => ({
        ...conversation,

        title:
          conversation.title ===
          "Nova conversa"
            ? text.length > 35
              ? `${text.slice(0, 35)}...`
              : text
            : conversation.title,

        messages: nextMessages,
      }),
    );

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/ai.chat`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            conversationId:
              conversationId.startsWith(
                "local-",
              )
                ? null
                : conversationId,

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

      const returnedConversationId =
        data?.conversationId;

      if (returnedConversationId) {
        setConversations((current) =>
          current.map(
            (conversation) =>
              conversation.id ===
              conversationId
                ? {
                    ...conversation,
                    id: returnedConversationId,
                    messages: [
                      ...conversation.messages,
                      {
                        role: "assistant",
                        content: answer,
                      },
                    ],
                  }
                : conversation,
          ),
        );

        setActiveConversationId(
          returnedConversationId,
        );
      } else {
        updateConversation(
          conversationId,
          (conversation) => ({
            ...conversation,
            messages: [
              ...conversation.messages,
              {
                role: "assistant",
                content: answer,
              },
            ],
          }),
        );
      }
    } catch (error) {
      console.error(
        "Erro ao conversar com a WattIQ AI:",
        error,
      );

      updateConversation(
        conversationId,
        (conversation) => ({
          ...conversation,
          messages: [
            ...conversation.messages,
            {
              role: "assistant",
              content:
                error instanceof Error
                  ? error.message
                  : "Não foi possível conectar à WattIQ AI neste momento.",
            },
          ],
        }),
      );
    } finally {
      setLoading(false);
    }
  }

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
   * EXCLUIR CONVERSA
   * =========================================================
   */

  async function resetConversation() {
    if (!activeConversation) return;

    const conversationId =
      activeConversation.id;

    if (
      conversationId.startsWith(
        "local-",
      )
    ) {
      setConversations((current) =>
        current.filter(
          (conversation) =>
            conversation.id !==
            conversationId,
        ),
      );

      setActiveConversationId(null);
      setInput("");

      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/ai.reset`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            conversationId,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Não foi possível excluir a conversa.",
        );
      }

      setConversations((current) =>
        current.filter(
          (conversation) =>
            conversation.id !==
            conversationId,
        ),
      );

      setActiveConversationId(null);
      setInput("");
    } catch (error) {
      console.error(
        "Erro ao excluir conversa:",
        error,
      );
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
   * INTERFACE
   * =========================================================
   */

  const profileName =
    authUser?.name ||
    authUser?.email ||
    "Usuário";

  const profileInitial =
    profileName
      .trim()
      .charAt(0)
      .toUpperCase() || "U";

  return (
    <main className="flex h-screen overflow-hidden bg-background text-foreground">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside
        className={`relative flex shrink-0 flex-col border-r border-border bg-card/40 backdrop-blur-xl transition-all duration-300 ${
          sidebarOpen
            ? "w-[280px]"
            : "w-0 overflow-hidden border-r-0"
        }`}
      >

        <div className="flex h-16 items-center border-b border-border px-4">

          <a
            href="/"
            className="flex items-center gap-2.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>

            <span className="font-semibold tracking-tight">
              WattIQ
            </span>
          </a>

        </div>

        <div className="p-3">

          <button
            type="button"
            onClick={
              createNewConversation
            }
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3 text-sm font-medium transition-all hover:border-primary/40 hover:bg-primary/5"
          >
            <Plus className="h-4 w-4 text-primary" />

            Nova conversa
          </button>

        </div>

        <div className="px-4 pb-2 pt-3">

          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Conversas
          </p>

        </div>

        <div className="flex-1 overflow-y-auto px-2">

          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground">
              Nenhuma conversa ainda.
            </div>
          ) : (
            <div className="space-y-1">

              {conversations.map(
                (conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() =>
                      selectConversation(
                        conversation.id,
                      )
                    }
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-all ${
                      conversation.id ===
                      activeConversationId
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-background hover:text-foreground"
                    }`}
                  >

                    <MessageSquare
                      className={`h-4 w-4 shrink-0 ${
                        conversation.id ===
                        activeConversationId
                          ? "text-primary"
                          : ""
                      }`}
                    />

                    <span className="min-w-0 flex-1 truncate">
                      {conversation.title}
                    </span>

                  </button>
                ),
              )}

            </div>
          )}

        </div>

        {/* ===================================================
            PERFIL DO USUÁRIO
            =================================================== */}

        <div className="border-t border-border p-3">

          <div className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-3 py-3">

            {authUser?.picture ? (
              <img
                src={authUser.picture}
                alt={profileName}
                className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-border"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
                {profileInitial}
              </div>
            )}

            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-medium text-foreground">
                {profileName}
              </p>

              {authUser?.email &&
                authUser.name && (
                  <p className="truncate text-[10px] text-muted-foreground">
                    {authUser.email}
                  </p>
                )}

            </div>

            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(180,255,80,0.8)]"
              title="Online"
            />

          </div>

        </div>

      </aside>

      {/* =====================================================
          ÁREA PRINCIPAL
          ===================================================== */}

      <section className="relative flex min-w-0 flex-1 flex-col">

        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

          <div className="absolute left-1/2 top-[-300px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/5 blur-[150px]" />

          <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,hsl(var(--foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground))_1px,transparent_1px)] [background-size:64px_64px]" />

        </div>

        {/* HEADER */}

        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/70 px-4 backdrop-blur-xl sm:px-6">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(
                  (value) => !value,
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
              aria-label="Abrir ou fechar menu"
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>

              <div>

                <p className="text-sm font-semibold">
                  WattIQ AI
                </p>

                <div className="flex items-center gap-1.5">

                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />

                  <span className="text-[10px] text-muted-foreground">
                    Inteligência energética
                  </span>

                </div>

              </div>

            </div>

          </div>

          <Sparkles className="h-4 w-4 text-primary/50" />

        </header>

        {/* MENSAGENS */}

        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto"
        >

          <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">

            {!activeConversation ? (
              <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">

                  <Bot className="h-6 w-6 text-primary" />

                </div>

                <h2 className="mt-5 text-xl font-semibold">
                  Comece uma nova conversa
                </h2>

                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Clique em{" "}
                  <span className="font-medium text-foreground">
                    Nova conversa
                  </span>{" "}
                  para iniciar uma conversa com a WattIQ AI.
                </p>

                <button
                  type="button"
                  onClick={
                    createNewConversation
                  }
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />

                  Nova conversa
                </button>

              </div>
            ) : (
              <>
                {activeConversation.messages.map(
                  (message, index) => {
                    const isUser =
                      message.role ===
                      "user";

                    return (
                      <div
                        key={`${activeConversation.id}-${index}`}
                        className={`mb-8 flex gap-4 ${
                          isUser
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        {!isUser && (
                          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">

                            <Bot className="h-4 w-4 text-primary" />

                          </div>
                        )}

                        <div
                          className={`max-w-[80%] whitespace-pre-wrap text-sm leading-7 ${
                            isUser
                              ? "rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground"
                              : "pt-0.5 text-foreground"
                          }`}
                        >
                          {message.content}
                        </div>

                      </div>
                    );
                  },
                )}

                {loading && (
                  <div className="mb-8 flex gap-4">

                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">

                      <Bot className="h-4 w-4 text-primary" />

                    </div>

                    <div className="flex items-center gap-1 pt-3">

                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />

                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />

                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />

                    </div>

                  </div>
                )}

              </>
            )}

          </div>

        </div>

        {/* INPUT */}

        <div className="shrink-0 bg-gradient-to-t from-background via-background to-transparent px-4 pb-5 pt-3 sm:px-6">

          <div className="mx-auto w-full max-w-3xl">

            <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 transition-all focus-within:border-primary/40 focus-within:shadow-[0_0_40px_rgba(180,255,80,0.06)]">

              <textarea
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target.value,
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder={
                  activeConversation
                    ? "Pergunte à WattIQ AI..."
                    : "Crie uma nova conversa para começar..."
                }
                rows={1}
                disabled={
                  loading ||
                  !activeConversation
                }
                className="max-h-40 min-h-[52px] w-full resize-none bg-transparent px-4 py-4 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />

              <div className="flex items-center justify-between px-3 pb-3">

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">

                  <span>
                    Enter para enviar
                  </span>

                  <span className="text-border">
                    ·
                  </span>

                  <span>
                    Shift + Enter para nova linha
                  </span>

                </div>

                <div className="flex items-center gap-2">

                  {activeConversation && (
                    <button
                      type="button"
                      onClick={
                        resetConversation
                      }
                      disabled={
                        loading
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                      title="Excluir conversa"
                      aria-label="Excluir conversa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={
                      sendMessage
                    }
                    disabled={
                      !input.trim() ||
                      loading ||
                      !activeConversation
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-lg disabled:pointer-events-none disabled:opacity-40"
                    aria-label="Enviar mensagem"
                  >

                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}

                  </button>

                </div>

              </div>

            </div>

            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              A WattIQ AI pode cometer erros. Verifique informações importantes.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}
