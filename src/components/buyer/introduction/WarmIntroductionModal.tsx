"use client";

import { useState } from "react";
import {
  Redo2,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import type { MatchBusinessDetails } from "@/lib/api/matching/matching.types";

import "./WarmIntroductionModal.css";

interface WarmIntroductionModalProps {
  business: MatchBusinessDetails;
  matchPercentage: number | null;
  onClose: () => void;
  onSent: (message: string) => void;
}

function createDemoIntroduction(
  business: MatchBusinessDetails,
): string {
  const location = [business.city, business.state]
    .filter(Boolean)
    .join(", ");

  return [
    `Hi, I'm interested in learning more about ${business.name}.`,
    "",
    `The ${business.industry} opportunity${location ? ` in ${location}` : ""} aligns with the type of business I am exploring.`,
    "",
    "I would appreciate the opportunity to learn more about the company, its operations, and the seller's transition plans. Please let me know if you would be available for an introductory conversation.",
    "",
    "Thank you, and I look forward to connecting.",
  ].join("\n");
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
  const [isGenerated, setIsGenerated] =
    useState(false);
  const [error, setError] = useState("");

  function updateMessage(nextMessage: string) {
    setPreviousMessage(message);
    setMessage(nextMessage);
    setRedoMessage("");
    setError("");
  }

  function generateIntroduction() {
    updateMessage(createDemoIntroduction(business));
    setIsGenerated(true);
  }

  function undoMessage() {
    if (!previousMessage && !message) {
      return;
    }

    setRedoMessage(message);
    setMessage(previousMessage);
    setPreviousMessage("");
    setError("");
  }

  function redoIntroduction() {
    if (!redoMessage) {
      return;
    }

    setPreviousMessage(message);
    setMessage(redoMessage);
    setRedoMessage("");
    setError("");
  }

  function sendIntroduction() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setError(
        "Enter a message or generate an introduction before sending.",
      );
      return;
    }

    onSent(trimmedMessage);
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
                  Uses the confirmed industry and location
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
                Preview only—replace with the approved AI
                generation service when its API is
                available.
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
              disabled={!previousMessage && !message}
              onClick={undoMessage}
            >
              <RotateCcw size={17} />
            </button>

            <button
              type="button"
              className="warm-intro__icon-button"
              aria-label="Redo"
              disabled={!redoMessage}
              onClick={redoIntroduction}
            >
              <Redo2 size={17} />
            </button>

            <button
              type="button"
              className="warm-intro__generate-button"
              onClick={generateIntroduction}
            >
              <Sparkles size={16} />
              {isGenerated
                ? "Re-Generate Introduction"
                : "Generate Introduction"}
            </button>
          </div>

          <button
            type="button"
            className="warm-intro__send-button"
            onClick={sendIntroduction}
          >
            <Send size={17} />
            Send Message
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