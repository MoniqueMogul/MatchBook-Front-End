"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

import "./ExperienceCredentialsEdit.css";

export type BuyerType =
  | "first_time_owner"
  | "existing_business_owner"
  | "investor_group"
  | "family_office"
  | "private_equity";

export interface ExperienceCredentialsData {
  buyerType: BuyerType | null;
  currentIndustry: string;
  currentPosition: string;
  businessExperienceYears: string;
  relevantExperience: string;
  availableHoursPerWeek: string;
  city: string;
  county: string;
  state: string;
  zipCode: string;
}

interface ExperienceCredentialsEditProps {
  initialData?: Partial<ExperienceCredentialsData>;
  onBack: () => void;
  onContinue: (data: ExperienceCredentialsData) => void;
  disabled?: boolean;
}

const DEFAULT_DATA: ExperienceCredentialsData = {
  buyerType: null,
  currentIndustry: "",
  currentPosition: "",
  businessExperienceYears: "",
  relevantExperience: "",
  availableHoursPerWeek: "",
  city: "",
  county: "",
  state: "",
  zipCode: "",
};

const BUYER_TYPE_OPTIONS: Array<{
  value: BuyerType;
  label: string;
}> = [
  {
    value: "first_time_owner",
    label: "First-time Owner",
  },
  {
    value: "existing_business_owner",
    label: "Existing Business Owner",
  },
  {
    value: "investor_group",
    label: "Investor Group",
  },
  {
    value: "family_office",
    label: "Family Office",
  },
  {
    value: "private_equity",
    label: "Private Equity",
  },
];

export default function ExperienceCredentialsEdit({
  initialData,
  onBack,
  onContinue,
  disabled = false,
}: ExperienceCredentialsEditProps) {
  const [data, setData] = useState<ExperienceCredentialsData>({
    ...DEFAULT_DATA,
    ...initialData,
  });

  const updateField = <K extends keyof ExperienceCredentialsData>(
    field: K,
    value: ExperienceCredentialsData[K],
  ) => {
    setData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleContinue = () => {
    onContinue({
      ...data,
      currentIndustry: data.currentIndustry.trim(),
      currentPosition: data.currentPosition.trim(),
      businessExperienceYears:
        data.businessExperienceYears.trim(),
      relevantExperience: data.relevantExperience.trim(),
      availableHoursPerWeek:
        data.availableHoursPerWeek.trim(),
      city: data.city.trim(),
      county: data.county.trim(),
      state: data.state.trim(),
      zipCode: data.zipCode.trim(),
    });
  };

  return (
    <section className="experience-credentials-section">
      <div className="experience-credentials-section__fields">
        {/* 1. Buyer Type */}
        <fieldset className="experience-credentials-section__group">
          <legend className="experience-credentials-section__label">
            What best describes your buyer type? (Select one)
          </legend>

          <div className="experience-credentials-section__radio-grid">
            {BUYER_TYPE_OPTIONS.map((option) => {
              const selected = data.buyerType === option.value;

              return (
                <label
                  key={option.value}
                  className="experience-credentials-section__radio-option"
                >
                  <input
                    type="radio"
                    name="buyer-type"
                    value={option.value}
                    checked={selected}
                    disabled={disabled}
                    onChange={() =>
                      updateField("buyerType", option.value)
                    }
                    className="experience-credentials-section__radio-input"
                  />

                  <span
                    className={`experience-credentials-section__radio ${
                      selected
                        ? "experience-credentials-section__radio--selected"
                        : ""
                    }`}
                    aria-hidden="true"
                  >
                    {selected && (
                      <span className="experience-credentials-section__radio-dot" />
                    )}
                  </span>

                  <span className="experience-credentials-section__radio-label">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* 2. Current Industry */}
        <div className="experience-credentials-section__field">
          <label
            htmlFor="current-industry"
            className="experience-credentials-section__label"
          >
            Current Industry
          </label>

          <input
            id="current-industry"
            type="text"
            maxLength={150}
            value={data.currentIndustry}
            disabled={disabled}
            onChange={(event) =>
              updateField("currentIndustry", event.target.value)
            }
            className="experience-credentials-section__input"
          />
        </div>

        {/* 3. Current Position */}
        <div className="experience-credentials-section__field">
          <label
            htmlFor="current-position"
            className="experience-credentials-section__label"
          >
            Current Position
          </label>

          <input
            id="current-position"
            type="text"
            maxLength={150}
            value={data.currentPosition}
            disabled={disabled}
            onChange={(event) =>
              updateField("currentPosition", event.target.value)
            }
            className="experience-credentials-section__input"
          />
        </div>

        {/* 4. Years of Business Experience */}
        <div className="experience-credentials-section__field">
          <label
            htmlFor="business-experience-years"
            className="experience-credentials-section__label"
          >
            How many years of business experience do you have owning or operating a business? (Enter a number)
          </label>

          <input
            id="business-experience-years"
            type="number"
            min={0}
            step={1}
            value={data.businessExperienceYears}
            disabled={disabled}
            onChange={(event) =>
              updateField(
                "businessExperienceYears",
                event.target.value,
              )
            }
            className="experience-credentials-section__input"
          />
        </div>

        {/* 5. Relevant Experience */}
        <div className="experience-credentials-section__field">
          <label
            htmlFor="relevant-experience"
            className="experience-credentials-section__label"
          >
            Relevant Experience
          </label>

          <textarea
            id="relevant-experience"
            value={data.relevantExperience}
            disabled={disabled}
            onChange={(event) =>
              updateField(
                "relevantExperience",
                event.target.value,
              )
            }
            className="experience-credentials-section__textarea"
          />
        </div>

        {/* 6. Available Hours per Week */}
        <div className="experience-credentials-section__field">
          <label
            htmlFor="available-hours-per-week"
            className="experience-credentials-section__label"
          >
            Available Hours per Week
          </label>

          <input
            id="available-hours-per-week"
            type="number"
            min={0}
            max={168}
            step={1}
            value={data.availableHoursPerWeek}
            disabled={disabled}
            onChange={(event) =>
              updateField(
                "availableHoursPerWeek",
                event.target.value,
              )
            }
            className="experience-credentials-section__input"
          />
        </div>

        {/* 7. Current Location */}
        <fieldset className="experience-credentials-section__group">
          <legend className="experience-credentials-section__label">
            Current Location
          </legend>

          <div className="experience-credentials-section__location-grid">
            <div className="experience-credentials-section__field">
              <label
                htmlFor="current-city"
                className="experience-credentials-section__label"
              >
                City
              </label>

              <input
                id="current-city"
                type="text"
                maxLength={100}
                value={data.city}
                disabled={disabled}
                onChange={(event) =>
                  updateField("city", event.target.value)
                }
                className="experience-credentials-section__input"
              />
            </div>

            <div className="experience-credentials-section__field">
              <label
                htmlFor="current-county"
                className="experience-credentials-section__label"
              >
                County
              </label>

              <input
                id="current-county"
                type="text"
                maxLength={100}
                value={data.county}
                disabled={disabled}
                onChange={(event) =>
                  updateField("county", event.target.value)
                }
                className="experience-credentials-section__input"
              />
            </div>

            <div className="experience-credentials-section__field">
              <label
                htmlFor="current-state"
                className="experience-credentials-section__label"
              >
                State
              </label>

              <input
                id="current-state"
                type="text"
                maxLength={100}
                value={data.state}
                disabled={disabled}
                onChange={(event) =>
                  updateField("state", event.target.value)
                }
                className="experience-credentials-section__input"
              />
            </div>

            <div className="experience-credentials-section__field">
              <label
                htmlFor="current-zip-code"
                className="experience-credentials-section__label"
              >
                ZIP Code
              </label>

              <input
                id="current-zip-code"
                type="text"
                maxLength={20}
                value={data.zipCode}
                disabled={disabled}
                onChange={(event) =>
                  updateField("zipCode", event.target.value)
                }
                className="experience-credentials-section__input"
              />
            </div>
          </div>
        </fieldset>
      </div>

      <div className="experience-credentials-section__navigation">
        <button
          type="button"
          className="experience-credentials-section__navigation-button"
          onClick={onBack}
          disabled={disabled}
          aria-label="Back to overview"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </button>

        <button
          type="button"
          className="experience-credentials-section__navigation-button"
          onClick={handleContinue}
          disabled={disabled}
          aria-label="Continue to acquisition preferences"
        >
          <ArrowRight size={20} strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}