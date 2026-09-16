"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Archive,
  ArrowLeft,
  Check,
  Clock3,
  Inbox,
  LockKeyhole,
  Mail,
  Send,
} from "lucide-react";

import { readWarmIntroductions } from "@/lib/api/messages/messages.demo-storage";
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
    useState<MessageCategory>("new");
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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedIntroductions =
        readWarmIntroductions();

      if (storedIntroductions.length === 0) {
        return;
      }

      setConversations((current) => {
        let next = [...current];

        for (const introduction of storedIntroductions) {
          const conversationId =
            `demo-warm-${introduction.business.id}`;

          const sentAt = new Intl.DateTimeFormat(
            "en-US",
            {
              hour: "numeric",
              minute: "2-digit",
            },
          ).format(
            new Date(introduction.createdAt),
          );

          const storedConversation: MessageConversation = {
            id: conversationId,
            matchId:
              `demo-match-${introduction.business.id}`,
            category: "open",
            participant: {
              id:
                `demo-seller-${introduction.business.id}`,
              name: "Business Owner",
              initials: "BO",
            },
            business: introduction.business,
            preview: introduction.content,
            relativeTime: "Just now",
            unreadCount: 0,
            ndaRequired: true,
            ndaSigned: true,
            messages: [
              {
                id:
                  `demo-warm-message-${introduction.business.id}`,
                sender: "current-user",
                content: introduction.content,
                sentAt,
                read: true,
              },
            ],
          };

          const existingIndex = next.findIndex(
            (conversation) =>
              conversation.id === conversationId,
          );

          if (existingIndex >= 0) {
            next[existingIndex] =
              storedConversation;
          } else {
            next = [
              storedConversation,
              ...next,
            ];
          }
        }

        return next;
      });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

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

  function selectCategory(
    category: MessageCategory,
  ) {
    setActiveCategory(category);
    setSelectedConversationId(null);
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

    setSelectedConversationId(conversation.id);

    setConversations((current) =>
      current.map((item) =>
        item.id === conversation.id
          ? {
              ...item,
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

    setNdaConversationId(null);
    setActiveCategory("open");
    setSelectedConversationId(conversationId);
  }

  function sendMessage() {
    const content = draft.trim();

    if (!selectedConversation || !content) {
      return;
    }

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id ===
        selectedConversation.id
          ? {
              ...conversation,
              preview: content,
              relativeTime: "Just now",
              messages: [
                ...conversation.messages,
                {
                  id:
                    `demo-message-${Date.now()}`,
                  sender: "current-user",
                  content,
                  sentAt:
                    new Intl.DateTimeFormat(
                      "en-US",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                      },
                    ).format(new Date()),
                  read: true,
                },
              ],
            }
          : conversation,
      ),
    );

    setDraft("");
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
            onClick={() =>
              setSelectedConversationId(null)
            }
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

          <div className="messages-dashboard__composer">
            <textarea
              aria-label="Message"
              placeholder="Type a message..."
              value={draft}
              onChange={(event) =>
                setDraft(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button
              type="button"
              aria-label="Send message"
              disabled={!draft.trim()}
              onClick={sendMessage}
            >
              <Send size={23} />
            </button>
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