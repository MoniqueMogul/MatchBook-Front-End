"use client";

import { useState } from "react";
import {
  Redo2,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import {
  generateConversationAiSuggestion,
  getConversations,
  sendConversationMessage,
} from "@/lib/api/messages/messages";
import type { MatchBusinessDetails } from "@/lib/api/matching/matching.types";

import "./WarmIntroductionModal.css";

interface WarmIntroductionModalProps {
  business: MatchBusinessDetails;
  matchPercentage: number | null;
  onClose: () => void;
  onSent: (message: string) => void;
}

type RequestAction = "generate" | "send";

interface RequestErrorResponse {
  response?: {
    status?: number;
    data?: {
      detail?: unknown;
    };
  };
}

const CONVERSATION_NOT_READY =
  "CONVERSATION_NOT_READY";

function getRequestErrorMessage(
  requestError: unknown,
  action: RequestAction,
): string {
  if (
    requestError instanceof Error &&
    requestError.message === CONVERSATION_NOT_READY
  ) {
    return "A conversation is not available yet. Both parties must complete the NDA before an introduction can be generated or sent.";
  }

  const response =
    typeof requestError === "object" &&
    requestError !== null &&
    "response" in requestError
      ? (requestError as RequestErrorResponse).response
      : undefined;

  const detail =
    typeof response?.data?.detail === "string"
      ? response.data.detail
      : undefined;

  switch (response?.status) {
    case 401:
      return "Your session has expired. Please sign in again.";

    case 403:
      return "You do not have access to this conversation.";

    case 404:
      return "The conversation was not found. Complete the NDA flow and try again.";

    case 409:
      return "An AI introduction is already being generated for this conversation.";

    case 429:
      return (
        detail ??
        "The AI generation limit has been reached. Please try again later."
      );

    case 503:
      return "The AI introduction service is temporarily unavailable. Please try again later.";

    default:
      return action === "generate"
        ? "Unable to generate an introduction right now. Please try again."
        : "Unable to send the introduction right now. Please try again.";
  }
}

export default function WarmIntroductionModal({
  business,
  matchPercentage,
  onClose,
  onSent,
}: WarmIntroductionModalProps) {
  const [message, setMessage] = useState("");
  const [previousMessage, setPreviousMessage] =
    useState("");
  const [redoMessage, setRedoMessage] = useState("");
  const [conversationId, setConversationId] =
    useState<string | null>(null);
  const [isGenerated, setIsGenerated] =
    useState(false);
  const [isGenerating, setIsGenerating] =
    useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const isBusy = isGenerating || isSending;

  function updateMessage(nextMessage: string) {
    setPreviousMessage(message);
    setMessage(nextMessage);
    setRedoMessage("");
    setError("");
  }

  async function resolveConversation(): Promise<string> {
    if (conversationId) {
      return conversationId;
    }

    const conversations = await getConversations();

    const conversation = conversations.find(
      (item) =>
        String(item.business.id) === String(business.id),
    );

    if (!conversation) {
      throw new Error(CONVERSATION_NOT_READY);
    }

    setConversationId(conversation.id);

    return conversation.id;
  }

  async function generateIntroduction() {
    if (isBusy) {
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const resolvedConversationId =
        await resolveConversation();

      const response =
        await generateConversationAiSuggestion(
          resolvedConversationId,
          {},
        );

      updateMessage(response.suggestion);
      setIsGenerated(true);
    } catch (requestError) {
      setError(
        getRequestErrorMessage(
          requestError,
          "generate",
        ),
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function undoMessage() {
    if (isBusy || (!previousMessage && !message)) {
      return;
    }

    setRedoMessage(message);
    setMessage(previousMessage);
    setPreviousMessage("");
    setError("");
  }

  function redoIntroduction() {
    if (isBusy || !redoMessage) {
      return;
    }

    setPreviousMessage(message);
    setMessage(redoMessage);
    setRedoMessage("");
    setIsGenerated(true);
    setError("");
  }

  async function sendIntroduction() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setError(
        "Enter a message or generate an introduction before sending.",
      );
      return;
    }

    if (isBusy) {
      return;
    }

    setIsSending(true);
    setError("");

    try {
      const resolvedConversationId =
        await resolveConversation();

      await sendConversationMessage(
        resolvedConversationId,
        {
          content: trimmedMessage,
        },
      );

      onSent(trimmedMessage);
    } catch (requestError) {
      setError(
        getRequestErrorMessage(requestError, "send"),
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div
      className="warm-intro__backdrop"
      role="presentation"
    >
      <section
        className="warm-intro__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="warm-intro-title"
      >
        <button
          type="button"
          className="warm-intro__close"
          aria-label="Close introduction dialog"
          disabled={isBusy}
          onClick={onClose}
        >
          <X size={22} />
        </button>

        <header className="warm-intro__header">
          <div>
            <p className="warm-intro__eyebrow">
              Send a message to
            </p>

            <h2 id="warm-intro-title">
              {business.name}
            </h2>

            <span>
              {business.city}, {business.state}
            </span>
          </div>

          <div className="warm-intro__match-score">
            <strong>
              {matchPercentage !== null
                ? `${matchPercentage}%`
                : "--"}
            </strong>

            <div>
              <span>Strong Match</span>
              <small>Based on matching criteria</small>
            </div>
          </div>
        </header>

        <section className="warm-intro__business">
          <h3>About the Business</h3>
          <p>{business.description}</p>
        </section>

        <div className="warm-intro__instructions">
          <p>
            Type your introduction message below or
            generate an introduction.
          </p>

          <span>
            Sending an introduction does not reveal
            confidential information before the required
            agreements are completed.
          </span>
        </div>

        <div
          className={
            isGenerated
              ? "warm-intro__content warm-intro__content--generated"
              : "warm-intro__content"
          }
        >
          <div className="warm-intro__editor">
            <textarea
              value={message}
              aria-label="Introduction message"
              placeholder="Write your introduction message..."
              maxLength={5000}
              disabled={isBusy}
              onChange={(event) => {
                setMessage(event.target.value);
                setError("");
              }}
            />

            <span className="warm-intro__character-count">
              {message.length}/5000
            </span>
          </div>

          {isGenerated && (
            <aside className="warm-intro__notes">
              <p>Generation Notes</p>

              <ul>
                <li>
                  References the selected business directly
                </li>
                <li>
                  Uses confirmed MatchBook context
                </li>
                <li>
                  Keeps the request professional and concise
                </li>
              </ul>

              <div>
                <strong>Worth asking about</strong>

                <span>
                  Seller transition plans and current
                  operations
                </span>
              </div>

              <small>
                Review and edit the AI-generated draft before
                sending.
              </small>
            </aside>
          )}
        </div>

        <div className="warm-intro__actions">
          <div className="warm-intro__generation-actions">
            <button
              type="button"
              className="warm-intro__icon-button"
              aria-label="Undo"
              disabled={
                isBusy ||
                (!previousMessage && !message)
              }
              onClick={undoMessage}
            >
              <RotateCcw size={17} />
            </button>

            <button
              type="button"
              className="warm-intro__icon-button"
              aria-label="Redo"
              disabled={isBusy || !redoMessage}
              onClick={redoIntroduction}
            >
              <Redo2 size={17} />
            </button>

            <button
              type="button"
              className="warm-intro__generate-button"
              disabled={isBusy}
              onClick={() =>
                void generateIntroduction()
              }
            >
              <Sparkles size={16} />

              {isGenerating
                ? "Generating..."
                : isGenerated
                  ? "Re-Generate Introduction"
                  : "Generate Introduction"}
            </button>
          </div>

          <button
            type="button"
            className="warm-intro__send-button"
            disabled={isBusy}
            onClick={() => void sendIntroduction()}
          >
            <Send size={17} />

            {isSending ? "Sending..." : "Send Message"}
          </button>
        </div>

        {error && (
          <p className="warm-intro__error" role="alert">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}