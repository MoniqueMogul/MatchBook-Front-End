"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, X } from "lucide-react";

import type { MatchBusinessDetails } from "@/lib/api/matching/matching.types";

import WarmIntroductionModal from "./WarmIntroductionModal";

import "./WarmIntroductionTrigger.css";

interface WarmIntroductionTriggerProps {
  business: MatchBusinessDetails;
  matchPercentage: number | null;
}

export default function WarmIntroductionTrigger({
  business,
  matchPercentage,
}: WarmIntroductionTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] =
    useState(false);

  function handleSent(_message: string) {
    /*
     * Presentation-only behavior until the Warm
     * Introduction backend endpoint is confirmed.
     * The message is intentionally not persisted.
     */
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
                  Your introduction was successfully
                  prepared!
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
        onClick={() => {
          setShowSuccess(false);
          setIsOpen(true);
        }}
      >
        Request Introduction
      </button>

      {overlay}
    </>
  );
}