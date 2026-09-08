"use client";

import { Search } from "lucide-react";
import EditablePill from "./EditablePill";
import "./EditableSearchValue.css";

interface EditableSearchValueProps {
  label: string;
  value: string;
  selectedValues: string[];
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  onAdd?: () => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export default function EditableSearchValue({
  label,
  value,
  selectedValues,
  onChange,
  onRemove,
  onAdd,
  placeholder = "Placeholder Text",
  error,
  disabled = false,
}: EditableSearchValueProps) {
  const hasError = Boolean(error);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onAdd?.();
    }
  };

  return (
    <div className="editable-search-value">
      <label className="editable-search-value__label">
        {label}
      </label>

      <div
        className={`editable-search-value__input-wrapper ${
          hasError
            ? "editable-search-value__input-wrapper--error"
            : ""
        }`}
      >
        <Search
          className="editable-search-value__icon"
          size={20}
          strokeWidth={1.5}
          aria-hidden="true"
        />

        <input
          type="text"
          className="editable-search-value__input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={hasError}
        />
      </div>

      {selectedValues.length > 0 && (
        <div className="editable-search-value__selected">
          {selectedValues.map((item) => (
            <EditablePill
              key={item}
              label={item}
              onRemove={() => onRemove(item)}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {hasError && (
        <p className="editable-search-value__helper" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}