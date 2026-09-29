"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Download,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";

import type { MatchBusinessDetails } from "@/lib/api/matching/matching.types";

import "./MessageNdaModal.css";

interface MessageNdaModalProps {
  business: MatchBusinessDetails;
  currentUserName: string;
  startWithAgreement?: boolean;
  onClose: () => void;
  onSigned: () => void;
}

export default function MessageNdaModal({
  business,
  currentUserName,
  startWithAgreement = false,
  onClose,
  onSigned,
}: MessageNdaModalProps) {
  const [stage, setStage] = useState<
  "prompt" | "agreement"
>(
  startWithAgreement
    ? "agreement"
    : "prompt",
);
  const [accepted, setAccepted] = useState(false);
  const [legalName, setLegalName] =
    useState(currentUserName);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [onClose]);

  function handleSign() {
    if (!accepted || !legalName.trim()) {
      setError(
        "Confirm the agreement and enter your full legal name before signing.",
      );
      return;
    }

    onSigned();
  }

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="message-nda__backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {stage === "prompt" ? (
        <section
          className="message-nda__prompt"
          role="dialog"
          aria-modal="true"
          aria-labelledby="message-nda-prompt-title"
        >
          <LockKeyhole
            className="message-nda__prompt-icon"
            size={58}
            strokeWidth={1.5}
          />

          <h2 id="message-nda-prompt-title">
            Sign the NDA to continue
          </h2>

          <p>
            The business owner has shared confidential
            information about their business. Please review
            and sign the NDA to view their message.
          </p>

          <button
            type="button"
            className="message-nda__primary-button"
            onClick={() => setStage("agreement")}
          >
            Sign NDA &amp; View Message
          </button>

          <button
            type="button"
            className="message-nda__secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>
        </section>
      ) : (
        <section
          className="message-nda__agreement"
          role="dialog"
          aria-modal="true"
          aria-labelledby="message-nda-title"
        >
          <header className="message-nda__header">
            <div>
              <div className="message-nda__title-row">
                <h2 id="message-nda-title">
                  MatchBook Platform Agreement
                </h2>

                <span>Legally Binding</span>
              </div>

              <p>
                {business.name} (Listing #{business.id}) •{" "}
                {business.city}, {business.state}
              </p>
            </div>

            <button
              type="button"
              aria-label="Close NDA"
              onClick={onClose}
            >
              <X size={21} />
            </button>
          </header>

          <div className="message-nda__document">
            <p>
              This Agreement is dated and effective as of
              the latest date set forth below and is between
              MatchBook, an undisclosed business owner (the
              “Seller”), and the individual identified below
              (the “Buyer”).
            </p>

            <div className="message-nda__profile-grid">
              <div>
                <strong>Buyer Name:</strong>
                <span>{currentUserName}</span>
              </div>
              <div>
                <strong>Address:</strong>
                <span>Text pulled from profile</span>
              </div>
              <div>
                <strong>City / State / Zip:</strong>
                <span>Text pulled from profile</span>
              </div>
              <div>
                <strong>Country:</strong>
                <span>Text pulled from profile</span>
              </div>
              <div>
                <strong>Email:</strong>
                <span>Text pulled from profile</span>
              </div>
              <div>
                <strong>Phone / Cell:</strong>
                <span>Text pulled from profile</span>
              </div>
              <div>
                <strong>
                  Target Business Reference ID:
                </strong>
                <span>{business.id}</span>
              </div>
              <div>
                <strong>Reference No.:</strong>
                <span>{business.id}</span>
              </div>
              <div>
                <strong>Business Category:</strong>
                <span>{business.industry}</span>
              </div>
            </div>

            <p>
              This document contains a Success Fee
              Acknowledgement and a Non-Disclosure and
              Non-Circumvention Agreement protecting
              confidential information about the target
              business.
            </p>

            <h3>
              Part I — Assistance Fee Acknowledgement
            </h3>

            <ol>
              <li>
                <strong>Success Fee.</strong> The Buyer
                acknowledges MatchBook’s role in introducing
                qualifying business opportunities.
              </li>
              <li>
                <strong>Qualifying Transaction.</strong> This
                includes a purchase, merger, acquisition,
                lease, licensing arrangement, or related
                transaction involving the target business.
              </li>
              <li>
                <strong>Prior Relationship Carve-Out.</strong>{" "}
                No fee is owed when the Buyer can demonstrate
                a documented prior relationship.
              </li>
            </ol>

            <h3>
              Part II — Non-Disclosure and
              Non-Circumvention Agreement
            </h3>

            <ol start={4}>
              <li>
                <strong>Confidential Information.</strong>{" "}
                The Buyer will protect financial,
                operational, customer, vendor, pricing, and
                employee information disclosed through
                MatchBook.
              </li>
              <li>
                <strong>Permitted Use.</strong> Confidential
                information may only be used to evaluate a
                potential acquisition of the target business.
              </li>
              <li>
                <strong>Non-Circumvention.</strong> All
                communications regarding the target business
                must be conducted through MatchBook unless
                written consent is provided.
              </li>
              <li>
                <strong>Independent Advice.</strong> Each
                party should obtain independent legal,
                financial, tax, and accounting advice.
              </li>
              <li>
                <strong>Term.</strong> Confidentiality
                obligations continue for twenty-four months
                from the effective date.
              </li>
              <li>
                <strong>Electronic Signature.</strong> The
                electronic acceptance of this agreement has
                the same effect as a handwritten signature.
              </li>
            </ol>
          </div>

          <footer className="message-nda__footer">
            <label className="message-nda__acceptance">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => {
                  setAccepted(event.target.checked);
                  setError("");
                }}
              />

              <span>
                I confirm that I have fully read, understood,
                and agree to be bound by this Success Fee and
                Non-Disclosure Agreement.
              </span>
            </label>

            <div className="message-nda__signing-row">
              <div className="message-nda__name-field">
                <label htmlFor="message-nda-legal-name">
                  Full Legal Name
                  <span>*</span>
                </label>

                <input
                  id="message-nda-legal-name"
                  value={legalName}
                  onChange={(event) => {
                    setLegalName(event.target.value);
                    setError("");
                  }}
                />

                <small>
                  Signature Preview
                  <em>{legalName || "Your signature"}</em>
                </small>
              </div>

              <div className="message-nda__security">
                <ShieldCheck size={19} />
                <div>
                  <strong>Security Log</strong>
                  <span>
                    Electronic signature • Demo presentation
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <p className="message-nda__error" role="alert">
                {error}
              </p>
            )}

            <div className="message-nda__actions">
              <button
                type="button"
                className="message-nda__download-button"
                onClick={() => window.print()}
              >
                <Download size={17} />
                Download Draft NDA
              </button>

              <button
                type="button"
                className="message-nda__sign-button"
                onClick={handleSign}
              >
                Sign NDA
              </button>
            </div>
          </footer>
        </section>
      )}
    </div>,
    document.body,
  );
}