"use client";

import { useState } from "react";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import "./DeleteConfirmationModal.css";

interface DeleteConfirmationModalProps {
  title?: string;
  message: string;
  onCancel: () => void;
  onConfirm: (password: string) => Promise<void> | void;
}

export default function DeleteConfirmationModal({
  title = "Are you sure?",
  message,
  onCancel,
  onConfirm,
}: DeleteConfirmationModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(password);
    } catch (err) {
      setError("Could not delete. Please check your password and try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <AlertTriangle size={48} strokeWidth={1.5} className="modal-icon" />

        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>

        <div className="modal-field">
          <label className="modal-label">Confirm Password</label>
          <div className="modal-input-wrap">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Placeholder text"
              className="modal-input"
              disabled={submitting}
            />
            <button
              type="button"
              className="modal-input-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide" : "Show"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className="modal-error">{error}</p>}
        </div>

        <div className="modal-actions">
          <button className="modal-btn modal-btn--outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button className="modal-btn modal-btn--danger" onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}