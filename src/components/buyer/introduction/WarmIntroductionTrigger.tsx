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
  requiresNda: boolean;
  onNdaRequired: () => void;
}

export default function WarmIntroductionTrigger({
  business,
  matchPercentage,
  requiresNda,
  onNdaRequired,
}: WarmIntroductionTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] =
    useState(false);

  function handleRequestIntroduction() {
    setShowSuccess(false);

    if (requiresNda) {
      onNdaRequired();
      return;
    }

    setIsOpen(true);
  }

  function handleSent(_message: string) {
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
                  Your introduction was sent successfully!
                </span>

                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() =>
                    setShowSuccess(false)
                  }
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

      {overlay}
    </>
  );
}