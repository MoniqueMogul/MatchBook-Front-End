"use client";

import { Info } from "lucide-react";
import "./IncompleteWarningModal.css";

interface IncompleteWarningModalProps {
  businessName: string;
  completionPercent: number;
  onPublishAnyway: () => void;
  onComplete: () => void;
  onClose: () => void;
}

export default function IncompleteWarningModal({
  businessName,
  completionPercent,
  onPublishAnyway,
  onComplete,
  onClose,
}: IncompleteWarningModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <Info size={48} strokeWidth={1.5} className="modal-icon-info" />

        <h2 className="modal-title">Your Listing is Incomplete</h2>
        <p className="modal-message">
          {businessName} is only {completionPercent}% complete. Completed listings
          result in stronger matches.
        </p>

        <div className="modal-actions">
          <button className="modal-btn modal-btn--outline" onClick={onPublishAnyway}>
            Publish
          </button>
          <button className="modal-btn modal-btn--primary" onClick={onComplete}>
            Complete Profile
          </button>
        </div>
      </div>
    </div>
  );
}