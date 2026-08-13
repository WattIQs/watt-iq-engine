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
  X,
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

export const Route = createFileRoute(
  "/planejar",
)({
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
        const response =
          await fetch(
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

        const data =
          await response.json();

        if (!mounted) return;

        if (
          data?.authenticated ===
          true
        ) {
          setAuthenticated(true);
          setCheckingAuth(false);
          return;
        }

        navigate({
          to: "/auth",
          search: {
            redirect:
              "/planejar",
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
            redirect:
              "/planejar",
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

  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState<string | null>(
    null,
  );

  const [loadingHistory, setLoadingHistory] =
    useState(false);

  const [creatingConversation, setCreatingConversation] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  /*
   * =========================================================
   * CHAT
   * =========================================================
   */

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    deletingConversationId,
    setDeletingConversationId,
  ] = useState<string | null>(
    null,
  );

  const chatContainerRef =
    useRef<HTMLDivElement>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

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
      const response =
        await fetch(
          `${API_URL}/api/ai/conversations`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Não foi possível carregar as conversas.",
        );
      }

      const loaded: Conversation[] =
        Array.isArray(
          data?.conversations,
        )
          ? data.conversations.map(
              (
                conversation: any,
              ) => ({
                id: String(
                  conversation.id,
                ),

                title:
                  conversation.title ||
                  "Nova conversa",

                messages:
                  Array.isArray(
                    conversation.messages,
                  )
                    ? conversation.messages
                    : [],
              }),
            )
          : [];

      setConversations(loaded);

      if (loaded.length > 0) {
        setActiveConversationId(
          loaded[0].id,
        );
      } else {
        await createNewConversation();
      }
    } catch (error) {
      console.error(
        "Erro ao carregar conversas:",
        error,
      );
    } finally {
      setLoadingHistory(false);
    }
  }

  /*
   * =========================================================
   * NOVA CONVERSA
   * =========================================================
   */

  async function createNewConversation() {
    if (
      creatingConversation ||
      loading
    ) {
      return;
    }

    setCreatingConversation(true);

    try {
      const response =
        await fetch(
          `${API_URL}/api/ai/conversations`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({}),
          },
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Não foi possível criar uma nova conversa.",
        );
      }

      const serverConversation =
        data?.conversation;

      if (
        !serverConversation?.id
      ) {
        throw new Error(
          "O servidor não retornou o ID da conversa.",
        );
      }

      const conversation: Conversation =
        {
          id: String(
            serverConversation.id,
          ),

          title:
            "Nova conversa",

          messages: [
            INITIAL_MESSAGE,
          ],
        };

      setConversations(
        (current) => [
          conversation,
          ...current,
        ],
      );

      setActiveConversationId(
        conversation.id,
      );

      setInput("");

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    } catch (error) {
      console.error(
        "Erro ao criar conversa:",
        error,
      );
    } finally {
      setCreatingConversation(
        false,
      );
    }
  }

  /*
   * =========================================================
   * CONVERSA ATUAL
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
   * SCROLL
   * =========================================================
   */

  useEffect(() => {
    const container =
      chatContainerRef.current;

    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTo({
        top:
          container.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [
    activeConversationId,
    activeConversation?.messages,
    loading,
  ]);

  /*
   * =========================================================
   * ATUALIZAR CONVERSA
   * =========================================================
   */

  function updateConversation(
    conversationId: string,
    updater: (
      conversation: Conversation,
    ) => Conversation,
  ) {
    setConversations(
      (current) =>
        current.map(
          (conversation) =>
            conversation.id ===
            conversationId
              ? updater(
                  conversation,
                )
              : conversation,
        ),
    );
  }

  /*
   * =========================================================
   * ENVIAR
   * =========================================================
   */

  async function sendMessage() {
    const text =
      input.trim();

    if (
      !text ||
      loading ||
      !activeConversation
    ) {
      return;
    }

    const conversationId =
      activeConversation.id;

    const userMessage: ChatMessage =
      {
        role: "user",
        content: text,
      };

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

        messages:
          nextMessages,
      }),
    );

    setInput("");
    setLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/api/ai/chat`,
          {
            method: "POST",
            credentials: "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              conversationId,
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

      if (!answer) {
        throw new Error(
          "Resposta vazia da IA.",
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
              content: answer,
            },
          ],
        }),
      );

      /*
       * Atualiza a lista para pegar
       * título e updated_at do banco.
       */

      await refreshConversations(
        conversationId,
      );
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
                error instanceof
                Error
                  ? error.message
                  : "Não foi possível conectar à WattIQ AI neste momento.",
            },
          ],
        }),
      );
    } finally {
      setLoading(false);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }

  /*
   * =========================================================
   * ATUALIZAR LISTA
   * =========================================================
   */

  async function refreshConversations(
    keepConversationId: string,
  ) {
    try {
      const response =
        await fetch(
          `${API_URL}/api/ai/conversations`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) return;

      const loaded: Conversation[] =
        Array.isArray(
          data?.conversations,
        )
          ? data.conversations.map(
              (
                conversation: any,
              ) => ({
                id: String(
                  conversation.id,
                ),

                title:
                  conversation.title ||
                  "Nova conversa",

                messages:
                  Array.isArray(
                    conversation.messages,
                  )
                    ? conversation.messages
                    : [],
              }),
            )
          : [];

      setConversations(
        (current) => {
          return loaded.map(
            (serverConversation) => {
              const local =
                current.find(
                  (item) =>
                    item.id ===
                    serverConversation.id,
                );

              /*
               * Mantém o conteúdo local imediatamente
               * após o envio enquanto o servidor termina
               * de sincronizar.
               */

              if (
                serverConversation.id ===
                  keepConversationId &&
                local &&
                local.messages.length >
                  serverConversation
                    .messages.length
              ) {
                return {
                  ...serverConversation,
                  messages:
                    local.messages,
                };
              }

              return serverConversation;
            },
          );
        },
      );

      setActiveConversationId(
        keepConversationId,
      );
    } catch (error) {
      console.error(
        "Erro ao atualizar conversas:",
        error,
      );
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
   * ABRIR CONVERSA
   * =========================================================
   */

  function selectConversation(
    conversationId: string,
  ) {
    if (loading) return;

    setActiveConversationId(
      conversationId,
    );

    setInput("");

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  }

  /*
   * =========================================================
   * PEDIR EXCLUSÃO
   * =========================================================
   */

  function requestDeleteConversation(
    conversationId: string,
  ) {
    if (loading) return;

    setDeletingConversationId(
      conversationId,
    );
  }

  /*
   * =========================================================
   * CONFIRMAR EXCLUSÃO
   * =========================================================
   */

  async function confirmDeleteConversation() {
    if (
      !deletingConversationId
    ) {
      return;
    }

    const conversationId =
      deletingConversationId;

    setDeletingConversationId(
      null,
    );

    try {
      const response =
        await fetch(
          `${API_URL}/api/ai/reset`,
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

      if (
        activeConversationId ===
        conversationId
      ) {
        await createNewConversation();
      }
    } catch (error) {
      console.error(
        "Erro ao excluir conversa:",
        error,
      );
    }
  }

  /*
   * =========================================================
   * CANCELAR EXCLUSÃO
   * =========================================================
   */

  function cancelDeleteConversation() {
    setDeletingConversationId(
      null,
    );
  }

  /*
   * =========================================================
   * VERIFICAÇÃO
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

  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* FUNDO */}

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/5 blur-[150px]" />

        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,hsl(var(--foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground))_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside
        className={`relative z-20 flex h-full shrink-0 flex-col border-r border-border bg-card/95 backdrop-blur-xl transition-all duration-300 ${
          sidebarOpen
            ? "w-[280px]"
            : "w-0 overflow-hidden border-r-0"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center border-b border-border px-4">
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

        {/* NOVA CONVERSA */}

        <div className="shrink-0 p-3">
          <button
            type="button"
            onClick={
              createNewConversation
            }
            disabled={
              creatingConversation ||
              loading
            }
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition-all hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creatingConversation ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Plus className="h-4 w-4 text-primary" />
            )}

            Nova conversa
          </button>
        </div>

        <div className="px-4 pb-2 pt-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Conversas
          </p>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-2">
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
                (conversation) => {
                  const active =
                    conversation.id ===
                    activeConversationId;

                  return (
                    <div
                      key={
                        conversation.id
                      }
                      className={`group flex w-full items-center rounded-lg transition ${
                        active
                          ? "bg-primary/10"
                          : "hover:bg-background"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          selectConversation(
                            conversation.id,
                          )
                        }
                        className={`flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-3 py-3 text-left text-sm ${
                          active
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <MessageSquare
                          className={`h-4 w-4 shrink-0 ${
                            active
                              ? "text-primary"
                              : ""
                          }`}
                        />

                        <span className="min-w-0 flex-1 truncate">
                          {
                            conversation.title
                          }
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          requestDeleteConversation(
                            conversation.id,
                          )
                        }
                        disabled={
                          loading
                        }
                        className="mr-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 disabled:cursor-not-allowed"
                        title="Excluir conversa"
                        aria-label="Excluir conversa"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border p-3">
          <div className="rounded-lg border border-border bg-background/60 px-3 py-3">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(180,255,80,0.8)]" />

              <span className="text-xs text-muted-foreground">
                WattIQ AI online
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* =====================================================
          CHAT
          ===================================================== */}

      <section className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* HEADER */}

        <header className="relative z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(
                  (value) => !value,
                )
              }
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
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
          className="relative z-10 min-h-0 flex-1 overflow-y-auto"
        >
          <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
            {activeConversation ? (
              <>
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
                          {
                            message.content
                          }
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
            ) : (
              <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                  <Bot className="mx-auto h-8 w-8 text-primary/50" />

                  <p className="mt-4 text-sm text-muted-foreground">
                    Criando conversa...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* INPUT */}

        <div className="relative z-50 shrink-0 bg-gradient-to-t from-background via-background to-transparent px-4 pb-5 pt-3 sm:px-6">
          <div className="mx-auto w-full max-w-3xl">
            <div className="relative z-50 rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 transition-all focus-within:border-primary/40 focus-within:shadow-[0_0_40px_rgba(180,255,80,0.06)]">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target.value,
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder="Pergunte à WattIQ AI..."
                rows={1}
                className="relative z-50 block min-h-[52px] w-full cursor-text resize-none bg-transparent px-4 py-4 text-sm outline-none placeholder:text-muted-foreground"
              />

              <div className="relative z-50 flex items-center justify-between px-3 pb-3">
                <div className="hidden items-center gap-2 text-[10px] text-muted-foreground sm:flex">
                  <span>
                    Enter para enviar
                  </span>

                  <span className="text-border">
                    ·
                  </span>

                  <span>
                    Shift + Enter para
                    nova linha
                  </span>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  {activeConversation &&
                    activeConversation.messages
                      .length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          requestDeleteConversation(
                            activeConversation.id,
                          )
                        }
                        disabled={
                          loading
                        }
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
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
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
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
              A WattIQ AI pode cometer
              erros. Verifique informações
              importantes.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          MODAL DE EXCLUSÃO
          ===================================================== */}

      {deletingConversationId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-conversation-title"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </div>

                <div>
                  <h2
                    id="delete-conversation-title"
                    className="text-sm font-semibold"
                  >
                    Excluir conversa
                  </h2>

                  <p className="text-[11px] text-muted-foreground">
                    Esta ação não pode ser
                    desfeita.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  cancelDeleteConversation
                }
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition hover:bg-background hover:text-foreground"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 py-6">
              <p className="text-sm leading-6 text-muted-foreground">
                Tem certeza de que deseja
                excluir esta conversa?
              </p>

              <p className="mt-2 text-xs leading-5 text-muted-foreground/70">
                Todas as mensagens desta
                conversa serão removidas
                permanentemente.
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-border bg-background/30 px-5 py-4">
              <button
                type="button"
                onClick={
                  cancelDeleteConversation
                }
                className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition hover:bg-background hover:text-foreground"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  confirmDeleteConversation
                }
                className="cursor-pointer rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:opacity-90"
              >
                Excluir conversa
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
