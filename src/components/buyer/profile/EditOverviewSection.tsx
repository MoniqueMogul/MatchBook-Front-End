"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

import "./EditOverviewSection.css";

interface EditOverviewSectionProps {
  initialAbout?: string;
  onContinue?: (data: {
    about: string;
  }) => void;
  disabled?: boolean;
}

export default function EditOverviewSection({
  initialAbout = "",
  onContinue,
  disabled = false,
}: EditOverviewSectionProps) {
  const [about, setAbout] = useState(initialAbout);

  const handleContinue = () => {
    onContinue?.({
      about: about.trim(),
    });
  };

  return (
    <section className="edit-overview-section">
      <div className="edit-overview-section__fields">

        {/* About */}
        <div className="edit-overview-section__field">
          <label
            htmlFor="about"
            className="edit-overview-section__label"
          >
            About
          </label>

          <textarea
            id="about"
            value={about}
            onChange={(event) => setAbout(event.target.value)}
            placeholder="Tell sellers a little about yourself..."
            disabled={disabled}
            className="edit-overview-section__textarea"
            rows={6}
          />
        </div>

      </div>

      {/* Continue */}
      <div className="edit-overview-section__continue">
        <button
          type="button"
          className="edit-overview-section__continue-button"
          onClick={handleContinue}
          disabled={disabled}
          aria-label="Continue to next profile section"
        >
          <ChevronRight
            size={32}
            strokeWidth={1.5}
          />
        </button>
      </div>
    </section>
  );
}