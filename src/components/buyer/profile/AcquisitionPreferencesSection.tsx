"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "./AcquisitionPreferencesSection.css";

type InvolvementOption =
  | "operator"
  | "investor"
  | "owner-management"
  | "partner";

type TimelineOption =
  | "exploring"
  | "within-1-12"
  | "within-12-24"
  | "within-24-plus";

interface AcquisitionPreferencesSectionProps {
  initialAcquisitionPreferences?: string;
  initialMotivation?: string;
  initialInvolvement?: InvolvementOption;
  initialTimeline?: TimelineOption;
  onBack?: () => void;
  onContinue?: (data: {
    acquisitionPreferences: string;
    motivation: string;
    involvement: InvolvementOption;
    timeline: TimelineOption;
  }) => void;
  disabled?: boolean;
}

const involvementOptions: Array<{
  value: InvolvementOption;
  label: string;
}> = [
  {
    value: "operator",
    label: "Operator",
  },
  {
    value: "investor",
    label: "Investor",
  },
  {
    value: "owner-management",
    label: "Owner with management team",
  },
  {
    value: "partner",
    label: "Partner",
  },
];

const timelineOptions: Array<{
  value: TimelineOption;
  label: string;
}> = [
  {
    value: "exploring",
    label: "Seeing what's out there",
  },
  {
    value: "within-12-24",
    label: "Ready to buy within 12–24 months",
  },
  {
    value: "within-1-12",
    label: "Ready to buy within 1–12 months",
  },
  {
    value: "within-24-plus",
    label: "Ready to buy in 24+ months",
  },
];

export default function AcquisitionPreferencesSection({
  initialAcquisitionPreferences = "",
  initialMotivation = "",
  initialInvolvement = "operator",
  initialTimeline = "exploring",
  onBack,
  onContinue,
  disabled = false,
}: AcquisitionPreferencesSectionProps) {
  const [acquisitionPreferences, setAcquisitionPreferences] =
    useState(initialAcquisitionPreferences);

  const [motivation, setMotivation] =
    useState(initialMotivation);

  const [involvement, setInvolvement] =
    useState<InvolvementOption>(initialInvolvement);

  const [timeline, setTimeline] =
    useState<TimelineOption>(initialTimeline);

  const handleContinue = () => {
    onContinue?.({
      acquisitionPreferences,
      motivation,
      involvement,
      timeline,
    });
  };

  return (
    <section className="acquisition-preferences-section">
      <div className="acquisition-preferences-section__fields">
        {/* Acquisition Preferences */}
        <div className="acquisition-preferences-section__field">
          <label
            htmlFor="acquisition-preferences"
            className="acquisition-preferences-section__label"
          >
            Acquisition Preferences
          </label>

          <textarea
            id="acquisition-preferences"
            value={acquisitionPreferences}
            onChange={(event) =>
              setAcquisitionPreferences(event.target.value)
            }
            placeholder="Placeholder text for a longer response, spanning multiple lines."
            disabled={disabled}
            className="acquisition-preferences-section__textarea"
          />
        </div>

        {/* Motivation */}
        <div className="acquisition-preferences-section__field">
          <label
            htmlFor="motivation-for-buying"
            className="acquisition-preferences-section__label"
          >
            Motivation for Buying
          </label>

          <textarea
            id="motivation-for-buying"
            value={motivation}
            onChange={(event) =>
              setMotivation(event.target.value)
            }
            placeholder="Placeholder text for a longer response, spanning multiple lines."
            disabled={disabled}
            className="acquisition-preferences-section__textarea"
          />
        </div>

        {/* Post-Acquisition Involvement */}
        <fieldset className="acquisition-preferences-section__group">
          <legend className="acquisition-preferences-section__label">
            Post-Acquisition Involvement
          </legend>

          <div className="acquisition-preferences-section__radio-grid">
            {involvementOptions.map((option) => {
              const selected =
                involvement === option.value;

              return (
                <label
                  key={option.value}
                  className="acquisition-preferences-section__radio-option"
                >
                  <input
                    type="radio"
                    name="post-acquisition-involvement"
                    value={option.value}
                    checked={selected}
                    onChange={() =>
                      setInvolvement(option.value)
                    }
                    disabled={disabled}
                    className="acquisition-preferences-section__radio-input"
                  />

                  <span
                    className={`acquisition-preferences-section__radio ${
                      selected
                        ? "acquisition-preferences-section__radio--selected"
                        : ""
                    }`}
                    aria-hidden="true"
                  >
                    {selected && (
                      <span className="acquisition-preferences-section__radio-dot" />
                    )}
                  </span>

                  <span className="acquisition-preferences-section__radio-label">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Acquisition Timeline */}
        <fieldset className="acquisition-preferences-section__group acquisition-preferences-section__group--timeline">
          <legend className="acquisition-preferences-section__label">
            Acquisition Timeline
          </legend>

          <div className="acquisition-preferences-section__radio-grid">
            {timelineOptions.map((option) => {
              const selected =
                timeline === option.value;

              return (
                <label
                  key={option.value}
                  className="acquisition-preferences-section__radio-option"
                >
                  <input
                    type="radio"
                    name="acquisition-timeline"
                    value={option.value}
                    checked={selected}
                    onChange={() =>
                      setTimeline(option.value)
                    }
                    disabled={disabled}
                    className="acquisition-preferences-section__radio-input"
                  />

                  <span
                    className={`acquisition-preferences-section__radio ${
                      selected
                        ? "acquisition-preferences-section__radio--selected"
                        : ""
                    }`}
                    aria-hidden="true"
                  >
                    {selected && (
                      <span className="acquisition-preferences-section__radio-dot" />
                    )}
                  </span>

                  <span className="acquisition-preferences-section__radio-label">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* Section navigation */}
      <div className="acquisition-preferences-section__navigation">
        <button
          type="button"
          className="acquisition-preferences-section__navigation-button"
          onClick={onBack}
          disabled={disabled}
          aria-label="Go back to industry experience"
        >
          <ChevronLeft
            size={32}
            strokeWidth={1.5}
          />
        </button>

        <button
          type="button"
          className="acquisition-preferences-section__navigation-button"
          onClick={handleContinue}
          disabled={disabled}
          aria-label="Continue to finances"
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