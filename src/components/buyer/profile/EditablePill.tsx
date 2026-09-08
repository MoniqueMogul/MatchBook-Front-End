"use client";

import { X } from "lucide-react";
import "./EditablePill.css";

interface EditablePillProps {
  label: string;
  onRemove: () => void;
  disabled?: boolean;
}

export default function EditablePill({
  label,
  onRemove,
  disabled = false,
}: EditablePillProps) {
  return (
    <div className="editable-pill">
      <span className="editable-pill__label">{label}</span>

      <button
        type="button"
        className="editable-pill__remove"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Remove ${label}`}
      >
        <X size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}