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
    "Olá. Sou a WattIQ AI. Como posso ajudar?",
};

const THINKING_DELAY = 850;

export const Route = createFileRoute(
  "/planejar",
)({
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

  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState<string | null>(null);

  const [loadingHistory, setLoadingHistory] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [input, setInput] =
    useState("");

  /*
   * loading:
   * Aguardando a resposta da API.
   *
   * isTypingResponse:
   * A resposta já chegou e está sendo escrita.
   *
   * initialThinking:
   * Animação inicial da nova conversa.
   */
  const [loading, setLoading] =
    useState(false);

  const [typingMessage, setTypingMessage] =
    useState("");

  const [
    isTypingResponse,
    setIsTypingResponse,
  ] = useState(false);

  const [
    initialThinking,
    setInitialThinking,
  ] = useState(false);

  const chatContainerRef =
    useRef<HTMLDivElement>(null);

  const thinkingTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

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

        const data =
          await response.json();

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

      if (
        thinkingTimerRef.current
      ) {
        clearTimeout(
          thinkingTimerRef.current,
        );
      }
    };
  }, [navigate]);

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
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id ===
        conversationId
          ? updater(conversation)
          : conversation,
      ),
    );
  }

  /*
   * =========================================================
   * ANIMAÇÃO INICIAL
   * =========================================================
   *
   * Ao entrar em uma conversa nova:
   *
   * 1. aparecem as três bolinhas;
   * 2. aguardamos um instante;
   * 3. começa a saudação da WattIQ AI;
   * 4. o texto é digitado normalmente.
   *
   * Isso elimina o balão vazio que aparecia na imagem.
   */

  function startInitialConversationAnimation(
    conversationId: string,
  ) {
    if (
      thinkingTimerRef.current
    ) {
      clearTimeout(
        thinkingTimerRef.current,
      );
    }

    setInitialThinking(true);
    setTypingMessage("");
    setIsTypingResponse(false);

    thinkingTimerRef.current =
      setTimeout(() => {
        setInitialThinking(false);

        void typeAssistantMessage(
          conversationId,
          INITIAL_MESSAGE.content,
          true,
        );
      }, THINKING_DELAY);
  }

  /*
   * =========================================================
   * NOVA CONVERSA
   * =========================================================
   */

  function createNewConversation() {
    if (
      thinkingTimerRef.current
    ) {
      clearTimeout(
        thinkingTimerRef.current,
      );
    }

    const id =
      `local-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

    const conversation: Conversation = {
      id,
      title: "Nova conversa",

      /*
       * Não colocamos INITIAL_MESSAGE aqui.
       *
       * A animação inicial vai criar a mensagem
       * de forma controlada, evitando o balão vazio.
       */
      messages: [],
    };

    setConversations((current) => [
      conversation,
      ...current,
    ]);

    setActiveConversationId(id);

    setInput("");

    setLoading(false);
    setTypingMessage("");
    setIsTypingResponse(false);

    startInitialConversationAnimation(
      id,
    );
  }

  /*
   * =========================================================
   * CARREGAR HISTÓRICO
   * =========================================================
   */

  async function loadConversationMessages(
    conversationId: string,
  ) {
    try {
      const response = await fetch(
        `${API_URL}/api/ai/history?conversationId=${encodeURIComponent(
          conversationId,
        )}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        console.error(
          "Erro ao carregar conversa:",
          response.status,
        );

        return;
      }

      const data =
        await response.json();

      const rawMessages =
        Array.isArray(data?.messages)
          ? data.messages
          : [];

      const messages: ChatMessage[] =
        rawMessages
          .filter(
            (message: any) =>
              (
                message?.role === "user" ||
                message?.role ===
                  "assistant"
              ) &&
              typeof message?.content ===
                "string",
          )
          .map((message: any) => ({
            role: message.role,
            content: message.content,
          }));

      if (messages.length > 0) {
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id ===
            conversationId
              ? {
                  ...conversation,
                  messages,

                  title:
                    messages.find(
                      (message) =>
                        message.role ===
                        "user",
                    )?.content ||
                    conversation.title ||
                    "Nova conversa",
                }
              : conversation,
          ),
        );

        return;
      }

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id ===
          conversationId
            ? {
                ...conversation,
                messages: [],
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

        const data =
          await response.json();

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
                  (
                    conversation: any,
                  ) => ({
                    id: String(
                      conversation.id,
                    ),

                    title:
                      typeof conversation.title ===
                        "string" &&
                      conversation.title.trim()
                        ? conversation.title
                        : "Nova conversa",

                    messages: [],
                  }),
                )
            : [];

        if (loaded.length > 0) {
          setConversations(loaded);

          const first =
            loaded[0];

          setActiveConversationId(
            first.id,
          );

          await loadConversationMessages(
            first.id,
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
      thinkingTimerRef.current
    ) {
      clearTimeout(
        thinkingTimerRef.current,
      );
    }

    setInitialThinking(false);
    setActiveConversationId(
      conversationId,
    );

    setTypingMessage("");
    setIsTypingResponse(false);
    setLoading(false);

    if (
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
   * SCROLL
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
    initialThinking,
  ]);

  /*
   * =========================================================
   * DIGITAÇÃO DA IA
   * =========================================================
   */

  async function typeAssistantMessage(
    conversationId: string,
    text: string,
    isInitial = false,
  ) {
    setLoading(false);
    setIsTypingResponse(true);
    setTypingMessage("");

    const length =
      text.length;

    /*
     * Quanto maior a resposta,
     * maior a duração.
     *
     * Mas existe um limite para não deixar
     * textos enormes demorando demais.
     */
    const targetDuration =
      Math.min(
        4500,
        Math.max(
          700,
          550 +
            Math.sqrt(
              Math.max(
                length,
                1,
              ),
            ) *
              145,
        ),
      );

    const baseDelay =
      Math.max(
        2,
        Math.min(
          18,
          targetDuration /
            Math.max(
              length,
              1,
            ),
        ),
      );

    let currentText =
      "";

    for (
      let index = 0;
      index < text.length;
      index++
    ) {
      currentText +=
        text[index];

      setTypingMessage(
        currentText,
      );

      let delay =
        baseDelay;

      const character =
        text[index];

      if (
        character === "." ||
        character === "!" ||
        character === "?"
      ) {
        delay += Math.min(
          70,
          baseDelay * 3,
        );
      } else if (
        character === "," ||
        character === ";" ||
        character === ":"
      ) {
        delay += Math.min(
          35,
          baseDelay * 1.8,
        );
      } else if (
        character === "\n"
      ) {
        delay += Math.min(
          40,
          baseDelay * 2,
        );
      } else if (
        character === " "
      ) {
        delay *= 0.35;
      }

      await new Promise(
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

    if (isInitial) {
      setLoading(false);
    }
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
      initialThinking ||
      !activeConversation
    ) {
      return;
    }

    const userMessage: ChatMessage =
      {
        role: "user",
        content: text,
      };

    let conversationId =
      activeConversation.id;

    const nextMessages = [
      ...activeConversation.messages,
      userMessage,
    ];

    /*
     * =======================================================
     * CONVERSA LOCAL -> POSTGRESQL
     * =======================================================
     */

    if (
      conversationId.startsWith(
        "local-",
      )
    ) {
      try {
        setLoading(true);

        const createResponse =
          await fetch(
            `${API_URL}/api/conversations`,
            {
              method: "POST",
              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },
            },
          );

        const createData =
          await createResponse
            .json()
            .catch(
              () => ({}),
            );

        if (
          !createResponse.ok
        ) {
          throw new Error(
            createData?.message ||
              "Não foi possível criar a conversa.",
          );
        }

        const createdId =
          createData
            ?.conversation
            ?.id;

        if (!createdId) {
          throw new Error(
            "O servidor não retornou o ID da conversa.",
          );
        }

        const newId =
          String(createdId);

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

                      title:
                        text.length >
                        35
                          ? `${text.slice(
                              0,
                              35,
                            )}...`
                          : text,

                      messages:
                        nextMessages,
                    }
                  : conversation,
            ),
        );

        setActiveConversationId(
          newId,
        );

        conversationId =
          newId;
      } catch (error) {
        console.error(
          "Erro ao criar conversa:",
          error,
        );

        setLoading(false);
        setIsTypingResponse(
          false,
        );
        setTypingMessage("");

        updateConversation(
          activeConversation.id,
          (conversation) => ({
            ...conversation,

            messages: [
              ...conversation.messages,
              {
                role:
                  "assistant",
                content:
                  error instanceof
                  Error
                    ? error.message
                    : "Não foi possível criar a conversa.",
              },
            ],
          }),
        );

        return;
      }
    } else {
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

      setLoading(true);
    }

    setInput("");
    setTypingMessage("");
    setIsTypingResponse(
      false,
    );

    setLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/api/ai/chat`,
          {
            method: "POST",
            credentials:
              "include",

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
          .catch(
            () => ({}),
          );

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
        }),
      );

      await typeAssistantMessage(
        conversationId,
        answer.trim(),
      );
    } catch (error) {
      console.error(
        "Erro ao conversar com a WattIQ AI:",
        error,
      );

      setLoading(false);
      setInitialThinking(
        false,
      );
      setIsTypingResponse(
        false,
      );
      setTypingMessage("");

      updateConversation(
        conversationId,
        (conversation) => ({
          ...conversation,

          messages: [
            ...conversation.messages,
            {
              role:
                "assistant",
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
   * EXCLUIR
   * =========================================================
   */

  async function resetConversation() {
    if (!activeConversation) {
      return;
    }

    if (
      thinkingTimerRef.current
    ) {
      clearTimeout(
        thinkingTimerRef.current,
      );
    }

    setInitialThinking(false);

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
      const response =
        await fetch(
          `${API_URL}/api/ai/reset`,
          {
            method: "POST",
            credentials:
              "include",

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
          .catch(
            () => ({}),
          );

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
   * TECLADO
   * =========================================================
   */

  function handleInputKeyDown(
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
   * LOADING
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
            className="group flex w-full items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5 active:translate-y-0"
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
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-all duration-200 ${
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
                alt={
                  profileName
                }
                className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-border"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
                {
                  profileInitial
                }
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

      <section className="relative flex min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-[-300px] h-[600px] w-[900px] -translate-x-1/2 animate-pulse rounded-full bg-primary/5 blur-[150px]" />

          <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,hsl(var(--foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground))_1px,transparent_1px)] [background-size:64px_64px]" />
        </div>

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
                    ANIMAÇÃO INICIAL DA WATTIQ AI
                ================================================= */}

                {initialThinking && (
                  <div className="mb-6 flex animate-in gap-3 duration-300">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>

                    <div className="wattiq-ai-bubble">
                      <div
                        className="wattiq-thinking-dots"
                        aria-label="WattIQ AI está preparando a conversa"
                      >
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                )}

                {/* =================================================
                    PENSAMENTO DA IA
                ================================================= */}

                {loading && (
                  <div className="mb-6 flex animate-in gap-3 duration-300">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>

                    <div className="wattiq-ai-bubble">
                      <div
                        className="wattiq-thinking-dots"
                        aria-label="WattIQ AI está pensando"
                      >
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                )}

                {/* =================================================
                    RESPOSTA SENDO DIGITADA
                ================================================= */}

                {isTypingResponse &&
                  typingMessage.length >
                    0 && (
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

        {/* =========================================================
            CAMPO DE MENSAGEM
        ========================================================= */}

        <div className="shrink-0 bg-gradient-to-t from-background via-background to-transparent px-4 pb-5 pt-3 sm:px-6">
          <div className="mx-auto w-full max-w-3xl">
            <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 transition-all duration-300 focus-within:border-primary/40 focus-within:shadow-[0_0_40px_rgba(180,255,80,0.06)]">
              <textarea
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target.value,
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
                  initialThinking ||
                  isTypingResponse ||
                  !activeConversation
                }
                className="max-h-40 min-h-[52px] w-full resize-none bg-transparent px-4 py-4 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />

              <div className="flex items-center justify-end px-3 pb-3">
                <div className="flex items-center gap-2">
                  {activeConversation && (
                    <button
                      type="button"
                      onClick={
                        resetConversation
                      }
                      disabled={
                        loading ||
                        initialThinking ||
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
                      initialThinking ||
                      isTypingResponse ||
                      !activeConversation
                    }
                    className={`wattiq-send-button flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 active:scale-95 disabled:pointer-events-none disabled:opacity-40 ${
                      loading
                        ? "wattiq-send-button-loading"
                        : ""
                    }`}
                    aria-label="Enviar mensagem"
                  >
                    {loading ? (
                      <span className="wattiq-send-spinner">
                        <Loader2 className="h-4 w-4" />
                      </span>
                    ) : (
                      <Send className="h-4 w-4" />
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

      <style>{`
        /*
         * =========================================================
         * BOLINHAS DA WATTIQ AI
         * =========================================================
         */

        .wattiq-ai-bubble {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 70px;
          min-height: 48px;
          padding: 0 18px;

          border: 1px solid hsl(var(--border));
          border-radius: 16px 16px 16px 4px;

          background: hsl(var(--card));

          box-shadow:
            0 8px 30px rgba(0, 0, 0, 0.08);

          animation:
            wattiq-bubble-enter
            240ms
            ease-out
            both;
        }

        .wattiq-thinking-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 30px;
          height: 20px;
        }

        .wattiq-thinking-dots span {
          display: block;
          width: 6px;
          height: 6px;
          flex: 0 0 6px;

          border-radius: 9999px;

          background:
            hsl(var(--primary));

          opacity: 0.3;

          animation-name:
            wattiq-thinking-dot;

          animation-duration:
            900ms;

          animation-timing-function:
            cubic-bezier(
              0.4,
              0,
              0.2,
              1
            );

          animation-iteration-count:
            infinite;

          animation-fill-mode:
            both;

          will-change:
            transform,
            opacity;
        }

        .wattiq-thinking-dots span:nth-child(1) {
          animation-delay: 0ms;
        }

        .wattiq-thinking-dots span:nth-child(2) {
          animation-delay: 150ms;
        }

        .wattiq-thinking-dots span:nth-child(3) {
          animation-delay: 300ms;
        }

        @keyframes wattiq-thinking-dot {
          0% {
            opacity: 0.3;
            transform:
              translateY(0)
              scale(0.75);
          }

          25% {
            opacity: 1;
            transform:
              translateY(-5px)
              scale(1);
          }

          50% {
            opacity: 0.55;
            transform:
              translateY(0)
              scale(0.9);
          }

          100% {
            opacity: 0.3;
            transform:
              translateY(0)
              scale(0.75);
          }
        }

        /*
         * =========================================================
         * BOTÃO DE ENVIAR
         * =========================================================
         */

        .wattiq-send-button {
          position: relative;
          overflow: hidden;
        }

        .wattiq-send-button-loading {
          box-shadow:
            0 0 0 0
              rgba(
                180,
                255,
                80,
                0.3
              ),
            0 0 20px
              rgba(
                180,
                255,
                80,
                0.14
              );

          animation:
            wattiq-send-pulse
            1.15s
            ease-in-out
            infinite;
        }

        .wattiq-send-spinner {
          display: flex;
          align-items: center;
          justify-content: center;

          animation:
            wattiq-send-spin
            0.75s
            linear
            infinite;
        }

        @keyframes wattiq-send-spin {
          from {
            transform:
              rotate(0deg);
          }

          to {
            transform:
              rotate(360deg);
          }
        }

        @keyframes wattiq-send-pulse {
          0%,
          100% {
            transform:
              scale(1);
            box-shadow:
              0 0 0 0
                rgba(
                  180,
                  255,
                  80,
                  0.18
                );
          }

          50% {
            transform:
              scale(1.04);
            box-shadow:
              0 0 0 5px
                rgba(
                  180,
                  255,
                  80,
                  0
                );
          }
        }

        @keyframes wattiq-bubble-enter {
          from {
            opacity: 0;
            transform:
              translateY(4px)
              scale(0.96);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        @media (
          prefers-reduced-motion: reduce
        ) {
          .wattiq-thinking-dots span,
          .wattiq-send-spinner,
          .wattiq-send-button-loading {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
