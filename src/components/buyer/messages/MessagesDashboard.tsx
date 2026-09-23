"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  Archive,
  ArrowLeft,
  Check,
  Clock3,
  Inbox,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Send,
  Sparkles,
} from "lucide-react";

import {
  generateConversationAiSuggestion,
  markMessageAsRead,
  sendConversationMessage,
} from "@/lib/api/messages/messages";
import type {
  MessageCategory,
  MessageConversation,
  MessagesViewData,
} from "@/lib/api/messages/messages.types";

import MessageBusinessModal from "./MessageBusinessModal";
import MessageNdaModal from "./MessageNdaModal";

import "./MessagesDashboard.css";

interface MessagesDashboardProps {
  data: MessagesViewData;
}

interface ApiErrorLike {
  response?: {
    status?: number;
  };
}

function getAiSuggestionErrorMessage(
  error: unknown,
): string {
  const status =
    typeof error === "object" && error !== null
      ? (error as ApiErrorLike).response?.status
      : undefined;

  switch (status) {
    case 403:
      return "You do not have access to this conversation.";
    case 404:
      return "The conversation or required matching information could not be found.";
    case 409:
      return "An AI suggestion is already being generated. Please wait.";
    case 429:
      return "You've reached today's AI suggestion limit. Please try again tomorrow.";
    case 503:
      return "AI suggestion is temporarily unavailable. Please try again.";
    default:
      return "Unable to generate an AI suggestion. Please try again.";
  }
}

const categoryOptions: Array<{
  value: MessageCategory;
  label: string;
  icon: typeof Inbox;
}> = [
  {
    value: "new",
    label: "New Introductions",
    icon: Inbox,
  },
  {
    value: "open",
    label: "Open Conversations",
    icon: Mail,
  },
  {
    value: "archived",
    label: "Archived Conversations",
    icon: Archive,
  },
];

export default function MessagesDashboard({
  data,
}: MessagesDashboardProps) {
  const [conversations, setConversations] = useState(
    data.conversations,
  );
  const [activeCategory, setActiveCategory] =
    useState<MessageCategory>(() =>
      data.conversations.some(
        (conversation) =>
          conversation.category === "new",
      )
        ? "new"
        : "open",
    );
  const [
    selectedConversationId,
    setSelectedConversationId,
  ] = useState<string | null>(null);
  const [
    ndaConversationId,
    setNdaConversationId,
  ] = useState<string | null>(null);
  const [
    businessConversationId,
    setBusinessConversationId,
  ] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [isSendingMessage, setIsSendingMessage] =
    useState(false);
  const [
    messageSendError,
    setMessageSendError,
  ] = useState<string | null>(null);
  const [lastAiSuggestion, setLastAiSuggestion] = useState("");
  const [
    isGeneratingSuggestion,
    setIsGeneratingSuggestion,
  ] = useState(false);
  const [
    hasGeneratedSuggestion,
    setHasGeneratedSuggestion,
  ] = useState(false);
  const [
    aiSuggestionError,
    setAiSuggestionError,
  ] = useState<string | null>(null);


  const categoryCounts = useMemo(() => {
    return conversations.reduce(
      (counts, conversation) => {
        counts[conversation.category] += 1;
        return counts;
      },
      {
        new: 0,
        open: 0,
        archived: 0,
      } satisfies Record<
        MessageCategory,
        number
      >,
    );
  }, [conversations]);

  const visibleConversations =
    conversations.filter(
      (conversation) =>
        conversation.category === activeCategory,
    );

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id ===
        selectedConversationId,
    ) ?? null;

  const ndaConversation =
    conversations.find(
      (conversation) =>
        conversation.id === ndaConversationId,
    ) ?? null;

  const businessConversation =
    conversations.find(
      (conversation) =>
        conversation.id ===
        businessConversationId,
    ) ?? null;

  function resetComposer() {
    setDraft("");
    setLastAiSuggestion("");
    setHasGeneratedSuggestion(false);
    setAiSuggestionError(null);
    setMessageSendError(null);
  }

  function selectCategory(
    category: MessageCategory,
  ) {
    setActiveCategory(category);
    setSelectedConversationId(null);
    resetComposer();
  }

  function closeConversation() {
    setSelectedConversationId(null);
    resetComposer();
  }

  function openConversation(
    conversation: MessageConversation,
  ) {
    if (
      conversation.ndaRequired &&
      !conversation.ndaSigned
    ) {
      setNdaConversationId(conversation.id);
      return;
    }

    const unreadMessageIds = conversation.messages
      .filter(
        (message) =>
          message.sender === "participant" &&
          !message.read,
      )
      .map((message) => message.id);

    resetComposer();
    setSelectedConversationId(conversation.id);

    setConversations((current) =>
      current.map((item) =>
        item.id === conversation.id
          ? {
              ...item,
              category:
                item.category === "new"
                  ? "open"
                  : item.category,
              unreadCount: 0,
              messages: item.messages.map(
                (message) => ({
                  ...message,
                  read: true,
                }),
              ),
            }
          : item,
      ),
    );

    if (unreadMessageIds.length > 0) {
      void Promise.allSettled(
        unreadMessageIds.map((messageId) =>
          markMessageAsRead(messageId),
        ),
      );
    }
  }

  function signNdaAndOpen() {
    if (!ndaConversation) {
      return;
    }

    const conversationId = ndaConversation.id;

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              category: "open",
              ndaSigned: true,
              unreadCount: 0,
              messages:
                conversation.messages.map(
                  (message) => ({
                    ...message,
                    read: true,
                  }),
                ),
            }
          : conversation,
      ),
    );

    resetComposer();
    setNdaConversationId(null);
    setActiveCategory("open");
    setSelectedConversationId(conversationId);
  }

  async function generateAiSuggestion() {
    if (
      !selectedConversation ||
      isGeneratingSuggestion
    ) {
      return;
    }

    const hasManuallyEditedDraft =
      Boolean(draft.trim()) &&
      draft !== lastAiSuggestion;

    if (
      hasManuallyEditedDraft &&
      !window.confirm(
        "Generating a new AI suggestion will replace your current draft. Do you want to continue?",
      )
    ) {
      return;
    }

    setIsGeneratingSuggestion(true);
    setAiSuggestionError(null);

    try {
      const response =
        await generateConversationAiSuggestion(
          selectedConversation.id,
          {},
        );

      setDraft(response.suggestion);
      setLastAiSuggestion(response.suggestion);
      setHasGeneratedSuggestion(true);
    } catch (error: unknown) {
      setAiSuggestionError(
        getAiSuggestionErrorMessage(error),
      );
    } finally {
      setIsGeneratingSuggestion(false);
    }
  }

  async function sendMessage() {
    const content = draft.trim();

    if (
      !selectedConversation ||
      !content ||
      isGeneratingSuggestion ||
      isSendingMessage
    ) {
      return;
    }

    setIsSendingMessage(true);
    setMessageSendError(null);

    try {
      const message = await sendConversationMessage(
        selectedConversation.id,
        {
          content,
        },
      );

      const sentAt = new Intl.DateTimeFormat(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit",
        },
      ).format(new Date(message.created_at));

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id ===
          selectedConversation.id
            ? {
                ...conversation,
                preview: message.content,
                relativeTime: "Just now",
                messages: [
                  ...conversation.messages,
                  {
                    id: message.id,
                    sender: "current-user",
                    content: message.content,
                    sentAt,
                    read: message.read_at !== null,
                  },
                ],
              }
            : conversation,
        ),
      );

      setDraft("");
      setLastAiSuggestion("");
      setHasGeneratedSuggestion(false);
      setAiSuggestionError(null);
    } catch {
      setMessageSendError(
        "Unable to send your message. Please try again.",
      );
    } finally {
      setIsSendingMessage(false);
    }
  }

  function archiveConversation() {
    if (!selectedConversation) {
      return;
    }

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id ===
        selectedConversation.id
          ? {
              ...conversation,
              category: "archived",
              unreadCount: 0,
            }
          : conversation,
      ),
    );

    resetComposer();
    setSelectedConversationId(null);
    setActiveCategory("open");
  }

  return (
    <main className="messages-dashboard">
      {selectedConversation ? (
        <section className="messages-dashboard__detail">
          <button
            type="button"
            className="messages-dashboard__back"
            onClick={closeConversation}
          >
            <ArrowLeft size={17} />
            Back to Messages
          </button>

          <header className="messages-dashboard__detail-header">
            <div className="messages-dashboard__identity">
              <div className="messages-dashboard__avatar">
                {
                  selectedConversation.participant
                    .initials
                }
              </div>

              <div>
                <span>
                  {
                    selectedConversation.participant
                      .name
                  }
                </span>

                <strong>
                  {
                    selectedConversation.business
                      .name
                  }
                </strong>

                {selectedConversation.ndaSigned && (
                  <small>NDA Signed</small>
                )}
              </div>
            </div>

            <div className="messages-dashboard__detail-actions">
              <button
                type="button"
                onClick={() =>
                  setBusinessConversationId(
                    selectedConversation.id,
                  )
                }
              >
                Business Details
              </button>

              <button
                type="button"
                onClick={archiveConversation}
              >
                <Archive size={15} />
                Archive
              </button>
            </div>
          </header>

          <div className="messages-dashboard__thread">
            <div className="messages-dashboard__date">
              9/26/26
            </div>

            {selectedConversation.messages.map(
              (message) => (
                <article
                  key={message.id}
                  className={
                    message.sender ===
                    "current-user"
                      ? "messages-dashboard__message messages-dashboard__message--sent"
                      : "messages-dashboard__message messages-dashboard__message--received"
                  }
                >
                  <p>{message.content}</p>

                  <span>
                    {message.sentAt}

                    {message.sender ===
                      "current-user" &&
                      message.read && (
                        <Check size={14} />
                      )}
                  </span>
                </article>
              ),
            )}
          </div>

          <div className="messages-dashboard__composer-area">
            <div className="messages-dashboard__ai-tools">
              <button
                type="button"
                className="messages-dashboard__ai-button"
                disabled={isGeneratingSuggestion}
                aria-busy={isGeneratingSuggestion}
                onClick={generateAiSuggestion}
              >
                {isGeneratingSuggestion ? (
                  <LoaderCircle
                    className="messages-dashboard__ai-spinner"
                    size={16}
                  />
                ) : (
                  <Sparkles size={16} />
                )}

                {isGeneratingSuggestion
                  ? "Generating..."
                  : hasGeneratedSuggestion
                    ? "Regenerate"
                    : "Generate with AI"}
              </button>

              {aiSuggestionError && (
                <p
                  className="messages-dashboard__ai-error"
                  role="alert"
                  aria-live="polite"
                >
                  {aiSuggestionError}
                </p>
              )}
            </div>

            <div className="messages-dashboard__composer">
              <textarea
                aria-label="Message"
                placeholder="Type a message..."
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);

                  if (messageSendError) {
                    setMessageSendError(null);
                  }

                  if (aiSuggestionError) {
                    setAiSuggestionError(null);
                  }
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
              />

              <button
                type="button"
                aria-label="Send message"
                disabled={
                  !draft.trim() ||
                  isGeneratingSuggestion ||
                  isSendingMessage
                }
                onClick={() => {
                  void sendMessage();
                }}
              >
                {isSendingMessage ? (
                  <LoaderCircle
                    className="messages-dashboard__ai-spinner"
                    size={20}
                  />
                ) : (
                  <Send size={23} />
                )}
              </button>
            </div>

            {messageSendError && (
              <p
                className="messages-dashboard__ai-error"
                role="alert"
                aria-live="polite"
              >
                {messageSendError}
              </p>
            )}
          </div>
        </section>
      ) : (
        <>
          <h1>Messages</h1>

          <div className="messages-dashboard__workspace">
            <nav
              className="messages-dashboard__categories"
              aria-label="Message categories"
            >
              {categoryOptions.map(
                ({
                  value,
                  label,
                  icon: Icon,
                }) => (
                  <button
                    key={value}
                    type="button"
                    className={
                      activeCategory === value
                        ? "messages-dashboard__category messages-dashboard__category--active"
                        : "messages-dashboard__category"
                    }
                    onClick={() =>
                      selectCategory(value)
                    }
                  >
                    <span>
                      <Icon size={16} />
                      {label}
                    </span>

                    <strong>
                      {categoryCounts[value]}
                    </strong>
                  </button>
                ),
              )}
            </nav>

            <section className="messages-dashboard__list-panel">
              {activeCategory ===
              "archived" ? (
                <div className="messages-dashboard__coming-soon">
                  <Clock3 size={22} />

                  <div>
                    <strong>
                      Coming Soon...
                    </strong>
                    <span>
                      This feature is currently
                      under development and will be
                      available in the next update.
                    </span>
                  </div>
                </div>
              ) : visibleConversations.length ===
                0 ? (
                <div className="messages-dashboard__empty">
                  <Mail size={35} />
                  <h2>
                    No conversations yet
                  </h2>
                  <p>
                    Messages in this category will
                    appear here.
                  </p>
                </div>
              ) : (
                visibleConversations.map(
                  (conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      className="messages-dashboard__conversation"
                      onClick={() =>
                        openConversation(
                          conversation,
                        )
                      }
                    >
                      <div className="messages-dashboard__avatar">
                        {
                          conversation.participant
                            .initials
                        }
                      </div>

                      <div className="messages-dashboard__conversation-copy">
                        <span>
                          {
                            conversation
                              .participant.name
                          }
                        </span>

                        <strong>
                          {
                            conversation.business
                              .name
                          }
                        </strong>

                        <p>
                          {conversation.preview}
                        </p>
                      </div>

                      <div className="messages-dashboard__conversation-meta">
                        <time>
                          {
                            conversation.relativeTime
                          }
                        </time>

                        {conversation.ndaRequired &&
                          !conversation.ndaSigned && (
                            <LockKeyhole
                              size={17}
                            />
                          )}

                        {conversation.unreadCount >
                          0 && (
                          <strong>
                            {
                              conversation.unreadCount
                            }
                          </strong>
                        )}
                      </div>
                    </button>
                  ),
                )
              )}
            </section>
          </div>
        </>
      )}

      {ndaConversation && (
        <MessageNdaModal
          business={ndaConversation.business}
          currentUserName={
            data.currentUser.name
          }
          onClose={() =>
            setNdaConversationId(null)
          }
          onSigned={signNdaAndOpen}
        />
      )}

      {businessConversation && (
        <MessageBusinessModal
          business={
            businessConversation.business
          }
          onClose={() =>
            setBusinessConversationId(null)
          }
        />
      )}
    </main>
  );
}
