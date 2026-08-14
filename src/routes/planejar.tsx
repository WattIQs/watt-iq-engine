import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useRef,
  useState,
} from "react";

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
  import.meta.env.VITE_API_URL?.replace(
    /\/$/,
    "",
  ) || "";

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

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [activeConversationId, setActiveConversationId] =
    useState<string | null>(null);

  const [loadingHistory, setLoadingHistory] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [typingMessage, setTypingMessage] =
    useState("");

  const [isTypingResponse, setIsTypingResponse] =
    useState(false);

  const chatContainerRef =
    useRef<HTMLDivElement>(null);

  /*
   * =========================================================
   * AUTENTICAÇÃO
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const response = await fetch(
          "/auth/me",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Não foi possível verificar a sessão.",
          );
        }

        const data = await response.json();

        if (!mounted) return;

        if (
          data?.authenticated === true
        ) {
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
   * NOVA CONVERSA
   * =========================================================
   */

  function createNewConversation() {
    const id =
      `local-${Date.now()}-${Math.random()
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
    setTypingMessage("");
    setIsTypingResponse(false);
    setLoading(false);
  }

  /*
   * =========================================================
   * CARREGAR CONVERSAS
   * =========================================================
   */

  useEffect(() => {
    if (!authenticated) return;

    let mounted = true;

    async function load() {
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

        if (!mounted) return;

        const loaded: Conversation[] =
          Array.isArray(
            data?.conversations,
          )
            ? data.conversations
                .filter(
                  (conversation: any) =>
                    conversation?.id,
                )
                .map(
                  (conversation: any) => ({
                    id: String(
                      conversation.id,
                    ),

                    title:
                      typeof conversation.title ===
                      "string"
                        ? conversation.title
                        : "Conversa",

                    messages: [],
                  }),
                )
            : [];

        if (loaded.length > 0) {
          const firstConversation =
            loaded[0];

          setConversations(loaded);

          setActiveConversationId(
            firstConversation.id,
          );

          await loadConversationMessages(
            firstConversation.id,
          );
        } else {
          createNewConversation();
        }
      } catch (error) {
        console.error(
          "Erro ao carregar conversas:",
          error,
        );

        if (!mounted) return;

        createNewConversation();
      } finally {
        if (mounted) {
          setLoadingHistory(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [authenticated]);

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
                  (
                    message?.role ===
                      "user" ||
                    message?.role ===
                      "assistant"
                  ) &&
                  typeof message?.content ===
                    "string",
              )
              .map(
                (message: any) => ({
                  role: message.role,
                  content:
                    message.content,
                }),
              )
          : [];

      setConversations((current) =>
        current.map(
          (conversation) =>
            conversation.id ===
            conversationId
              ? {
                  ...conversation,

                  messages:
                    messages.length > 0
                      ? messages
                      : [
                          INITIAL_MESSAGE,
                        ],
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
    if (
      loading ||
      isTypingResponse
    ) {
      return;
    }

    setActiveConversationId(
      conversationId,
    );

    setTypingMessage("");
    setIsTypingResponse(false);
    setLoading(false);
    setInput("");

    const conversation =
      conversations.find(
        (item) =>
          item.id === conversationId,
      );

    if (
      conversation &&
      conversation.messages.length === 0 &&
      !conversationId.startsWith(
        "local-",
      )
    ) {
      await loadConversationMessages(
        conversationId,
      );
    }
  }

  /*
   * =========================================================
   * SCROLL AUTOMÁTICO
   * =========================================================
   */

  useEffect(() => {
    const container =
      chatContainerRef.current;

    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [
    activeConversation?.messages,
    loading,
    typingMessage,
  ]);

  /*
   * =========================================================
   * UPDATE CONVERSA
   * =========================================================
   */

  function updateConversation(
    conversationId: string,
    updater: (
      conversation: Conversation,
    ) => Conversation,
  ) {
    setConversations((current) =>
      current.map(
        (conversation) =>
          conversation.id ===
          conversationId
            ? updater(conversation)
            : conversation,
      ),
    );
  }

  /*
   * =========================================================
   * ANIMAÇÃO DE DIGITAÇÃO DA IA
   * =========================================================
   */

  async function typeAssistantMessage(
    conversationId: string,
    text: string,
  ) {
    setLoading(false);
    setIsTypingResponse(true);
    setTypingMessage("");

    let currentText = "";

    for (
      let index = 0;
      index < text.length;
      index++
    ) {
      currentText += text[index];

      setTypingMessage(currentText);

      let delay = 14;

      const character =
        text[index];

      if (
        character === "." ||
        character === "!" ||
        character === "?"
      ) {
        delay = 90;
      } else if (
        character === "," ||
        character === ";" ||
        character === ":"
      ) {
        delay = 45;
      } else if (
        character === "\n"
      ) {
        delay = 80;
      } else if (
        character === " "
      ) {
        delay = 5;
      }

      await new Promise<void>(
        (resolve) =>
          setTimeout(
            resolve,
            delay,
          ),
      );
    }

    updateConversation(
      conversationId,
      (conversation) => ({
        ...conversation,

        messages: [
          ...conversation.messages,
          {
            role: "assistant",
            content: text,
          },
        ],
      }),
    );

    setTypingMessage("");
    setIsTypingResponse(false);
  }

  /*
   * =========================================================
   * ENVIAR MENSAGEM
   * =========================================================
   */

  async function sendMessage() {
    const text =
      input.trim();

    if (
      !text ||
      loading ||
      isTypingResponse ||
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
              ? `${text.slice(
                  0,
                  35,
                )}...`
              : text
            : conversation.title,

        messages: nextMessages,
      }),
    );

    setInput("");
    setLoading(true);
    setTypingMessage("");
    setIsTypingResponse(false);

    try {
      const response = await fetch(
        `${API_URL}/api/ai/chat`,
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

            messages:
              nextMessages,
          }),
        },
      );

      const data =
        await response
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

      if (
        typeof answer !==
          "string" ||
        !answer.trim()
      ) {
        throw new Error(
          "Resposta vazia da IA.",
        );
      }

      const returnedConversationId =
        data?.conversationId;

      if (
        returnedConversationId
      ) {
        const newId =
          String(
            returnedConversationId,
          );

        setConversations(
          (current) =>
            current.map(
              (
                conversation,
              ) =>
                conversation.id ===
                conversationId
                  ? {
                      ...conversation,
                      id: newId,
                    }
                  : conversation,
            ),
        );

        setActiveConversationId(
          newId,
        );

        await typeAssistantMessage(
          newId,
          answer,
        );
      } else {
        await typeAssistantMessage(
          conversationId,
          answer,
        );
      }
    } catch (error) {
      console.error(
        "Erro ao conversar com a WattIQ AI:",
        error,
      );

      setLoading(false);
      setTypingMessage("");
      setIsTypingResponse(false);

      updateConversation(
        conversationId,
        (conversation) => ({
          ...conversation,

          messages: [
            ...conversation.messages,
            {
              role: "assistant",

              content:
                error instanceof
                  Error
                  ? error.message
                  : "Não foi possível conectar à WattIQ AI neste momento.",
            },
          ],
        }),
      );
    }
  }

  /*
   * =========================================================
   * TECLADO DO CHAT
   *
   * ENTER       = enviar
   * SHIFT+ENTER = nova linha
   * =========================================================
   */

  function handleInputKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key !==
      "Enter"
    ) {
      return;
    }

    if (
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();

    if (
      !input.trim() ||
      loading ||
      isTypingResponse ||
      !activeConversation
    ) {
      return;
    }

    sendMessage();
  }

  /*
   * =========================================================
   * EXCLUIR CONVERSA
   * =========================================================
   */

  async function resetConversation() {
    if (!activeConversation)
      return;

    if (
      loading ||
      isTypingResponse
    ) {
      return;
    }

    const conversationId =
      activeConversation.id;

    if (
      conversationId.startsWith(
        "local-",
      )
    ) {
      setConversations(
        (current) =>
          current.filter(
            (conversation) =>
              conversation.id !==
              conversationId,
          ),
      );

      setActiveConversationId(
        null,
      );

      setInput("");
      setTypingMessage("");
      setLoading(false);
      setIsTypingResponse(false);

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

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Não foi possível excluir a conversa.",
        );
      }

      setConversations(
        (current) =>
          current.filter(
            (conversation) =>
              conversation.id !==
              conversationId,
          ),
      );

      setActiveConversationId(
        null,
      );

      setInput("");
      setTypingMessage("");
      setLoading(false);
      setIsTypingResponse(false);
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

  const profileName =
    authUser?.name ||
    authUser?.email ||
    "Usuário";

  const profileInitial =
    profileName
      .trim()
      .charAt(0)
      .toUpperCase() ||
    "U";

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
            disabled={
              loading ||
              isTypingResponse
            }
            className="group flex w-full items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus className="h-4 w-4 text-primary transition-transform duration-300 group-hover:rotate-90" />

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
          ) : conversations.length ===
            0 ? (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground">
              Nenhuma conversa ainda.
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map(
                (
                  conversation,
                ) => (
                  <button
                    key={
                      conversation.id
                    }
                    type="button"
                    onClick={() =>
                      selectConversation(
                        conversation.id,
                      )
                    }
                    disabled={
                      loading ||
                      isTypingResponse
                    }
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-all duration-200 disabled:pointer-events-none ${
                      conversation.id ===
                      activeConversationId
                        ? "bg-primary/10 text-foreground shadow-sm"
                        : "text-muted-foreground hover:translate-x-0.5 hover:bg-background hover:text-foreground"
                    }`}
                  >
                    <MessageSquare
                      className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                        conversation.id ===
                        activeConversationId
                          ? "scale-105 text-primary"
                          : "group-hover:scale-110"
                      }`}
                    />

                    <span className="min-w-0 flex-1 truncate">
                      {
                        conversation.title
                      }
                    </span>
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-3 py-3">
            {authUser?.picture ? (
              <img
                src={
                  authUser.picture
                }
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
                    {
                      authUser.email
                    }
                  </p>
                )}
            </div>

            <span
              className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-primary shadow-[0_0_8px_rgba(180,255,80,0.8)]"
              title="Online"
            />
          </div>
        </div>
      </aside>

      {/* =====================================================
          CHAT
      ===================================================== */}

      <section className="relative flex min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-[-300px] h-[600px] w-[900px] -translate-x-1/2 animate-pulse rounded-full bg-primary/5 blur-[150px]" />

          <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,hsl(var(--foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground))_1px,transparent_1px)] [background-size:64px_64px]" />
        </div>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/70 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(
                  (value) =>
                    !value,
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-foreground active:scale-95"
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
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />

                  <span className="text-[10px] text-muted-foreground">
                    Inteligência energética
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Sparkles className="h-4 w-4 animate-pulse text-primary/50" />
        </header>

        {/* =====================================================
            MENSAGENS
        ===================================================== */}

        <div
          ref={
            chatContainerRef
          }
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
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 active:translate-y-0"
                >
                  <Plus className="h-4 w-4" />

                  Nova conversa
                </button>
              </div>
            ) : (
              <>
                {/* =================================================
                    MENSAGENS EXISTENTES
                ================================================= */}

                {activeConversation.messages.map(
                  (
                    message,
                    index,
                  ) => {
                    const isUser =
                      message.role ===
                      "user";

                    return (
                      <div
                        key={`${activeConversation.id}-${index}`}
                        className={`mb-6 flex animate-in gap-3 duration-300 ${
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
                          className={`max-w-[82%] whitespace-pre-wrap text-sm leading-7 shadow-sm transition-all duration-300 ${
                            isUser
                              ? "rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground shadow-primary/10"
                              : "rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3 text-foreground shadow-black/10"
                          }`}
                        >
                          {
                            message.content
                          }
                        </div>
                      </div>
                    );
                  },
                )}

                {/* =================================================
                    IA PENSANDO
                ================================================= */}

                {loading && (
                  <div className="mb-6 flex animate-in gap-3 duration-300">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>

                    <div className="flex h-[48px] items-center rounded-2xl rounded-bl-md border border-border bg-card px-5 shadow-sm">
                      <div className="flex items-center gap-[5px]">
                        <span
                          className="h-[6px] w-[6px] rounded-full bg-primary"
                          style={{
                            animation:
                              "wattiq-thinking 1.15s ease-in-out infinite",
                            animationDelay:
                              "0ms",
                          }}
                        />

                        <span
                          className="h-[6px] w-[6px] rounded-full bg-primary"
                          style={{
                            animation:
                              "wattiq-thinking 1.15s ease-in-out infinite",
                            animationDelay:
                              "180ms",
                          }}
                        />

                        <span
                          className="h-[6px] w-[6px] rounded-full bg-primary"
                          style={{
                            animation:
                              "wattiq-thinking 1.15s ease-in-out infinite",
                            animationDelay:
                              "360ms",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* =================================================
                    IA DIGITANDO
                ================================================= */}

                {isTypingResponse && (
                  <div className="mb-6 flex animate-in gap-3 duration-300">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>

                    <div className="max-w-[82%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3 text-sm leading-7 text-foreground shadow-sm">
                      {typingMessage}

                      <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-1 animate-pulse bg-primary" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* =====================================================
            INPUT
        ===================================================== */}

        <div className="shrink-0 bg-gradient-to-t from-background via-background to-transparent px-4 pb-5 pt-3 sm:px-6">
          <div className="mx-auto w-full max-w-3xl">
            <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 transition-all duration-300 focus-within:border-primary/40 focus-within:shadow-[0_0_40px_rgba(180,255,80,0.06)]">
              <textarea
                value={input}
                onChange={(
                  event,
                ) =>
                  setInput(
                    event.target
                      .value,
                  )
                }
                onKeyDown={
                  handleInputKeyDown
                }
                placeholder={
                  activeConversation
                    ? "Pergunte à WattIQ AI..."
                    : "Crie uma nova conversa para começar..."
                }
                rows={1}
                disabled={
                  loading ||
                  isTypingResponse ||
                  !activeConversation
                }
                className="max-h-40 min-h-[52px] w-full resize-none bg-transparent px-4 py-4 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />

              <div className="flex items-center justify-between px-3 pb-3">
                <p className="pl-1 text-[10px] text-muted-foreground">
                  Enter para enviar · Shift + Enter para nova linha
                </p>

                <div className="flex items-center gap-2">
                  {activeConversation && (
                    <button
                      type="button"
                      onClick={
                        resetConversation
                      }
                      disabled={
                        loading ||
                        isTypingResponse
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive active:scale-95 disabled:opacity-40"
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
                      isTypingResponse ||
                      !activeConversation
                    }
                    className="group flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 active:translate-y-0 disabled:pointer-events-none disabled:opacity-40"
                    aria-label="Enviar mensagem"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              WattIQ AI
            </p>
          </div>
        </div>
      </section>

      {/* =======================================================
          ANIMAÇÃO DOS 3 PONTOS
      ======================================================= */}

      <style>{`
        @keyframes wattiq-thinking {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.35;
          }

          30% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}
