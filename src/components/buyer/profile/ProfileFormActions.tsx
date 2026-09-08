"use client";

import "./ProfileFormActions.css";

interface ProfileFormActionsProps {
  onCancel?: () => void;
  onSave?: () => void;
  saving?: boolean;
}

export default function ProfileFormActions({
  onCancel,
  onSave,
  saving = false,
}: ProfileFormActionsProps) {
  return (
    <div className="profile-form-actions">
      <button
        type="button"
        className="profile-form-actions__button profile-form-actions__button--cancel"
        onClick={onCancel}
        disabled={saving}
      >
        Cancel
      </button>

      <button
        type="button"
        className="profile-form-actions__button profile-form-actions__button--save"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}