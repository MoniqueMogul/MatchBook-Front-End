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
  disabled?: boolean;
  placeholder?: string;
}

export default function EditableSearchValue({
  label,
  value,
  selectedValues,
  onChange,
  onRemove,
  onAdd,
  disabled = false,
  placeholder = "Placeholder Text",
}: EditableSearchValueProps) {
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

      <div className="editable-search-value__search">
        <input
          type="text"
          className="editable-search-value__input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
        />

        <span
          className="editable-search-value__search-icon"
          aria-hidden="true"
        >
          <Search
            size={20}
            strokeWidth={1.5}
          />
        </span>
      </div>

      <div className="editable-search-value__selected">
        {selectedValues.map((selectedValue) => (
          <EditablePill
            key={selectedValue}
            label={selectedValue}
            onRemove={() => onRemove(selectedValue)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}