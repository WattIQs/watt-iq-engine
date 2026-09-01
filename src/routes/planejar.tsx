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
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Settings,
  Zap
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

/*
 * =========================================================
 * MENSAGEM DA IA COM ANIMAÇÃO DE DIGITAÇÃO
 * =========================================================
 */

function TypingMessage({
  content,
}: {
  content: string;
}) {
  const [displayedText, setDisplayedText] =
    useState("");

  const [finished, setFinished] =
    useState(false);

  useEffect(() => {
    let index = 0;

    let timeout: ReturnType<
      typeof setTimeout
    >;

    setDisplayedText("");
    setFinished(false);

    const typeNextCharacter = () => {
      if (index >= content.length) {
        setFinished(true);
        return;
      }

      const character =
        content[index];

      setDisplayedText(
        (current) =>
          current + character,
      );

      index++;

      /*
       * Digitação mais rápida.
       */

      const delay =
        character === "." ||
        character === "," ||
        character === "!" ||
        character === "?"
          ? 25
          : 8;

      timeout = setTimeout(
        typeNextCharacter,
        delay,
      );
    };

    typeNextCharacter();

    return () => {
      clearTimeout(timeout);
    };
  }, [content]);

  return (
    <div className="relative">
      <span>{displayedText}</span>

      {!finished && (
        <span className="ml-1 inline-block h-4 w-[2px] translate-y-[3px] rounded-full bg-primary animate-pulse" />
      )}
    </div>
  );
}

/*
 * =========================================================
 * 3 PONTOS — SVG NATIVO
 * =========================================================
 */

function ThinkingDots() {
  return (
    <svg
      width="34"
      height="14"
      viewBox="0 0 34 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="WattIQ AI está respondendo"
      role="status"
    >
      <circle
        cx="5"
        cy="7"
        r="2.2"
        fill="currentColor"
        className="text-primary"
      >
        <animate
          attributeName="cy"
          values="7;3.5;7"
          dur="0.9s"
          repeatCount="indefinite"
          begin="0s"
        />

        <animate
          attributeName="opacity"
          values="0.35;1;0.35"
          dur="0.9s"
          repeatCount="indefinite"
          begin="0s"
        />
      </circle>

      <circle
        cx="17"
        cy="7"
        r="2.2"
        fill="currentColor"
        className="text-primary"
      >
        <animate
          attributeName="cy"
          values="7;3.5;7"
          dur="0.9s"
          repeatCount="indefinite"
          begin="0.15s"
        />

        <animate
          attributeName="opacity"
          values="0.35;1;0.35"
          dur="0.9s"
          repeatCount="indefinite"
          begin="0.15s"
        />
      </circle>

      <circle
        cx="29"
        cy="7"
        r="2.2"
        fill="currentColor"
        className="text-primary"
      >
        <animate
          attributeName="cy"
          values="7;3.5;7"
          dur="0.9s"
          repeatCount="indefinite"
          begin="0.3s"
        />

        <animate
          attributeName="opacity"
          values="0.35;1;0.35"
          dur="0.9s"
          repeatCount="indefinite"
          begin="0.3s"
        />
      </circle>
    </svg>
  );
}

/*
 * =========================================================
 * SPINNER — SVG NATIVO
 * =========================================================
 */

function LoadingSpinner() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="9"
        cy="9"
        r="6.5"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />

      <path
        d="M15.5 9C15.5 5.41015 12.5899 2.5 9 2.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0 9 9"
          to="360 9 9"
          dur="0.75s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

export const Route = createFileRoute(
  "/planejar",
)({
  component: PlanejarPage,
});

function PlanejarPage() {
  const navigate = useNavigate();

  const [
    authenticated,
    setAuthenticated,
  ] = useState(false);

  const [
    checkingAuth,
    setCheckingAuth,
  ] = useState(true);

  const [
    authUser,
    setAuthUser,
  ] =
    useState<AuthUser | null>(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);


  /*
   * =========================================================
   * AUTENTICAÇÃO
   * =========================================================
   */

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

          setAuthUser(
            data?.user
              ? {
                  name:
                    typeof data.user
                      .name ===
                    "string"
                      ? data.user.name
                      : undefined,

                  email:
                    typeof data.user
                      .email ===
                    "string"
                      ? data.user.email
                      : undefined,

                  picture:
                    typeof data.user
                      .picture ===
                    "string"
                      ? data.user
                          .picture
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
   * ESTADOS
   * =========================================================
   */

  const [
    conversations,
    setConversations,
  ] =
    useState<Conversation[]>([]);

  const [
    activeConversationId,
    setActiveConversationId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    loadingHistory,
    setLoadingHistory,
  ] =
    useState(false);



  const [
    input,
    setInput,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const chatContainerRef =
    useRef<HTMLDivElement>(
      null,
    );

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
      id,
    );

    setInput("");
    setLoading(false);
  }

  /*
   * =========================================================
   * CARREGAR HISTÓRICO
   * =========================================================
   */

  async function loadConversationMessages(
    conversationId: string,
  ) {
    if (
      conversationId.startsWith(
        "local-",
      )
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/api/ai/history?conversationId=${encodeURIComponent(
            conversationId,
          )}`,
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
            "Não foi possível carregar as mensagens da conversa.",
        );
      }

      const messages: ChatMessage[] =
        Array.isArray(
          data?.messages,
        )
          ? data.messages
              .filter(
                (
                  message: any,
                ) =>
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
                (
                  message: any,
                ) => ({
                  role:
                    message.role,

                  content:
                    message.content,
                }),
              )
              .filter(
                (
                  message: ChatMessage,
                ) =>
                  message.content
                    .trim()
                    .length > 0,
              )
          : [];

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
                    messages:
                      messages.length >
                      0
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
        "Erro ao carregar histórico:",
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
    if (!authenticated) {
      return;
    }

    let mounted = true;

    async function load() {
      setLoadingHistory(true);

      try {
        const response =
          await fetch(
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
                  (
                    conversation: any,
                  ) =>
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
                        : "Conversa",

                    messages: [],
                  }),
                )
            : [];

        if (
          loaded.length > 0
        ) {
          setConversations(
            loaded,
          );

          const firstId =
            loaded[0].id;

          setActiveConversationId(
            firstId,
          );

          await loadConversationMessages(
            firstId,
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
          setLoadingHistory(
            false,
          );
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
      (
        conversation,
      ) =>
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

    setLoading(false);
    setInput("");

    const conversation =
      conversations.find(
        (item) =>
          item.id ===
          conversationId,
      );

    if (
      conversation &&
      conversation.messages
        .length === 0 &&
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

    if (!container) {
      return;
    }

    const timeout =
      setTimeout(() => {
        container.scrollTo({
          top:
            container.scrollHeight,
          behavior:
            "smooth",
        });
      }, 50);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    activeConversation?.messages,
    loading,
  ]);

  /*
   * =========================================================
   * UPDATE
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
          (
            conversation,
          ) =>
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

    const userMessage:
      ChatMessage = {
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
      (
        conversation,
      ) => ({
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
            method:
              "POST",

            credentials:
              "include",

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

      if (!answer) {
        throw new Error(
          "Resposta vazia da IA.",
        );
      }

      const returnedConversationId =
        data?.conversationId;

      if (
        returnedConversationId
      ) {
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

                      id: String(
                        returnedConversationId,
                      ),

                      messages: [
                        ...conversation.messages,

                        {
                          role:
                            "assistant",

                          content:
                            answer,
                        },
                      ],
                    }
                  : conversation,
            ),
        );

        setActiveConversationId(
          String(
            returnedConversationId,
          ),
        );
      } else {
        updateConversation(
          conversationId,
          (
            conversation,
          ) => ({
            ...conversation,

            messages: [
              ...conversation.messages,

              {
                role:
                  "assistant",

                content:
                  answer,
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
        (
          conversation,
        ) => ({
          ...conversation,

          messages: [
            ...conversation.messages,

            {
              role:
                "assistant",

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
   * RESET
   * =========================================================
   */

  async function resetConversation() {
    if (!activeConversation) {
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
            (
              conversation,
            ) =>
              conversation.id !==
              conversationId,
          ),
      );

      setActiveConversationId(
        null,
      );

      setInput("");
      setLoading(false);

      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/api/ai/reset`,
          {
            method:
              "POST",

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
            (
              conversation,
            ) =>
              conversation.id !==
              conversationId,
          ),
      );

      setActiveConversationId(
        null,
      );

      setInput("");
      setLoading(false);
    } catch (error) {
      console.error(
        "Erro ao excluir conversa:",
        error,
      );
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
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
            <div className="absolute inset-0 animate-ping rounded-xl bg-primary/10" />

            <Zap className="relative h-5 w-5 animate-pulse text-primary" />
          </div>

          <p className="animate-pulse text-sm text-muted-foreground">
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

      <div className="group fixed inset-y-0 left-0 z-50 w-3">
        <aside
          className="absolute inset-y-0 left-0 flex w-[280px] shrink-0 -translate-x-[calc(100%-12px)] flex-col border-r border-border bg-card/40 shadow-2xl shadow-black/20 backdrop-blur-xl transition-transform duration-500 ease-out group-hover:translate-x-0"
        >
        <div className="flex h-16 items-center border-b border-border px-4">
          <a
            href="/"
            className="group flex items-center gap-2.5"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 transition-all duration-300 group-hover:scale-105 group-hover:border-primary/60 group-hover:shadow-[0_0_20px_rgba(180,255,80,0.15)]">
              <Zap className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" />
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
            className="group flex w-full items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] active:translate-y-0"
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
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-all duration-300 ${
                      conversation.id ===
                      activeConversationId
                        ? "translate-x-1 bg-primary/10 text-foreground shadow-[inset_2px_0_0_hsl(var(--primary))]"
                        : "text-muted-foreground hover:translate-x-1 hover:bg-background hover:text-foreground"
                    }`}
                  >
                    <MessageSquare
                      className={`h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                        conversation.id ===
                        activeConversationId
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
                ),
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={async () => {
              setSettingsOpen(true);
              setSettingsLoading(true);
              setSettingsMessage("");
              try {
                const response = await fetch("/api/settings", {
                  credentials: "include",
                  cache: "no-store",
                });
                const data = await response.json();
                if (!response.ok || !data?.success) throw new Error(data?.message || "Não foi possível carregar.");
                setRequireEmailVerification(Boolean(data.settings.requireEmailVerification));
              } catch (error) {
                setSettingsMessage(error instanceof Error ? error.message : "Não foi possível carregar.");
              } finally {
                setSettingsLoading(false);
              }
            }}
            className="mb-3 flex w-full items-center gap-3 rounded-xl border border-border bg-background/40 px-3 py-2.5 text-left transition-all duration-300 hover:border-primary/30 hover:bg-card"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Configurações</span>
          </button>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-3 py-3 transition-all duration-300 hover:border-primary/20">
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

              {authUser?.email && authUser.name && (
                <p className="truncate text-[10px] text-muted-foreground">
                  {authUser.email}
                </p>
              )}
            </div>

            <span
              className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-primary shadow-[0_0_8px_rgba(180,255,80,0.8)]"
              title="Online"
            />
          </div>
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

        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/70 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                <div className="absolute inset-0 animate-ping rounded-lg bg-primary/5" />

                <Bot className="relative h-4 w-4 text-primary" />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  WattIQ AI
                </p>

                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary shadow-[0_0_8px_rgba(180,255,80,0.8)]" />

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
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <div className="absolute inset-0 animate-ping rounded-2xl bg-primary/5" />

                  <Bot className="relative h-6 w-6 text-primary" />
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
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_35px_rgba(180,255,80,0.2)] active:translate-y-0"
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

                    const isInitialMessage =
                      message.role ===
                        "assistant" &&
                      message.content ===
                        INITIAL_MESSAGE.content;

                    return (
                      <div
                        key={`${activeConversation.id}-${index}`}
                        className={`mb-7 flex animate-in gap-3 duration-500 ${
                          isUser
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {!isUser && (
                          <div className="mt-1 flex h-8 w-8 shrink-0 animate-in items-center justify-center rounded-lg border border-primary/20 bg-primary/10 shadow-[0_0_20px_rgba(180,255,80,0.04)] duration-500">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}

                        <div
                          className={`max-w-[82%] text-sm leading-7 transition-all duration-300 ${
                            isUser
                              ? "rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground shadow-lg shadow-black/10"
                              : "rounded-2xl rounded-tl-md border border-border bg-card/70 px-4 py-3 text-foreground shadow-lg shadow-black/10 backdrop-blur-sm"
                          }`}
                        >
                          {isUser ? (
                            message.content
                          ) : isInitialMessage ? (
                            message.content
                          ) : (
                            <TypingMessage
                              content={
                                message.content
                              }
                            />
                          )}
                        </div>
                      </div>
                    );
                  },
                )}

                {loading && (
                  <div className="mb-8 flex animate-in gap-3 duration-300">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>

                    <div className="rounded-2xl rounded-tl-md border border-border bg-card/70 px-4 py-4 shadow-lg shadow-black/10 backdrop-blur-sm">
                      <ThinkingDots />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="shrink-0 bg-gradient-to-t from-background via-background to-transparent px-4 pb-5 pt-3 sm:px-6">
          <div className="mx-auto w-full max-w-3xl">

            <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 transition-all duration-300 focus-within:-translate-y-0.5 focus-within:border-primary/40 focus-within:shadow-[0_0_40px_rgba(180,255,80,0.06)]">

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

              <div className="flex items-center justify-end px-3 pb-3">

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
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-300 hover:scale-105 hover:bg-destructive/10 hover:text-destructive active:scale-95 disabled:opacity-40"
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
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_5px_20px_rgba(180,255,80,0.2)] active:translate-y-0 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                    aria-label="Enviar mensagem"
                  >
                    {loading ? (
                      <LoadingSpinner />
                    ) : (
                      <Send className="h-4 w-4 transition-transform duration-300" />
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

      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200"
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
              <button type="button" onClick={() => setSettingsOpen(false)} className="rounded-lg px-2 py-1 text-xl text-muted-foreground transition hover:bg-background hover:text-foreground" aria-label="Fechar">×</button>
            </div>
            <div className="p-6">
              {settingsLoading ? (
                <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Carregando...</div>
              ) : (
                <div className="rounded-2xl border border-border bg-background/40 p-4">
                  <div className="flex items-center justify-between gap-5">
                    <div>
                      <h3 className="text-sm font-medium">Verificação em duas etapas</h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">Exige um código enviado por e-mail em novos logins. O primeiro acesso sempre exige verificação.</p>
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
      )}
    </main>
  );
}
