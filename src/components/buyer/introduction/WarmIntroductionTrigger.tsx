"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, X } from "lucide-react";

import MessageNdaModal from "@/components/buyer/messages/MessageNdaModal";
import type { MatchBusinessDetails } from "@/lib/api/matching/matching.types";
import { saveWarmIntroduction } from "@/lib/api/messages/messages.demo-storage";

import WarmIntroductionModal from "./WarmIntroductionModal";

import "./WarmIntroductionTrigger.css";

interface WarmIntroductionTriggerProps {
  business: MatchBusinessDetails;
  matchPercentage: number | null;
  requiresNda: boolean;
  onNdaSigned: () => void;
}

export default function WarmIntroductionTrigger({
  business,
  matchPercentage,
  requiresNda,
  onNdaSigned,
}: WarmIntroductionTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNdaOpen, setIsNdaOpen] =
    useState(false);
  const [showSuccess, setShowSuccess] =
    useState(false);

  function handleRequestIntroduction() {
    setShowSuccess(false);

    if (requiresNda) {
      setIsNdaOpen(true);
      return;
    }

    setIsOpen(true);
  }

  function handleNdaSigned() {
    onNdaSigned();
    setIsNdaOpen(false);
    setIsOpen(true);
  }

  function handleSent(message: string) {
    /*
     * Temporary browser persistence for the demo.
     * Replace this with the real Warm Introduction /
     * Chat API after the backend contract is ready.
     */
    saveWarmIntroduction({
      business,
      content: message,
      createdAt: new Date().toISOString(),
    });

    setIsOpen(false);
    setShowSuccess(true);
  }

  const overlay =
    typeof document !== "undefined"
      ? createPortal(
          <>
            {isOpen && (
              <WarmIntroductionModal
                business={business}
                matchPercentage={matchPercentage}
                onClose={() => setIsOpen(false)}
                onSent={handleSent}
              />
            )}

            {showSuccess && (
              <div
                className="warm-intro-toast"
                role="status"
              >
                <CheckCircle2 size={21} />

                <span>
                  Your introduction was added to Messages!
                </span>

                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() => setShowSuccess(false)}
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        className="match-detail__intro-button"
        onClick={handleRequestIntroduction}
      >
        Request Introduction
      </button>

      {isNdaOpen && (
        <MessageNdaModal
          business={business}
          currentUserName="Nicole Harrison"
          startWithAgreement
          onClose={() => setIsNdaOpen(false)}
          onSigned={handleNdaSigned}
        />
      )}

      {overlay}
    </>
  );
}