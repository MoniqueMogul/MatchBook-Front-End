"use client";

import "./ProfileFormActions.css";

interface ProfileFormActionsProps {
  onCancel: () => void;
  onSave: () => void;
  saving?: boolean;
  disabled?: boolean;
}

export default function ProfileFormActions({
  onCancel,
  onSave,
  saving = false,
  disabled = false,
}: ProfileFormActionsProps) {
  return (
    <div className="profile-form-actions">
      <button
        type="button"
        className="profile-form-actions__cancel"
        onClick={onCancel}
        disabled={disabled || saving}
      >
        Cancel
      </button>

      <button
        type="button"
        className="profile-form-actions__save"
        onClick={onSave}
        disabled={disabled || saving}
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}