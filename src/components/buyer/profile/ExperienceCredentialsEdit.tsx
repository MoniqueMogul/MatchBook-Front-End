"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

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
  mode?: "edit" | "onboarding";
  initialData?: Partial<ExperienceCredentialsData>;
  onBack: () => void;
  onContinue: (data: ExperienceCredentialsData) => void;
  disabled?: boolean;
}

type FieldName = keyof ExperienceCredentialsData;

type ValidationErrors = Partial<Record<FieldName, string>>;

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

const MAX_EXPERIENCE_LENGTH = 2000;

export default function ExperienceCredentialsEdit({
  mode = "edit",
  initialData,
  onBack,
  onContinue,
  disabled = false,
}: ExperienceCredentialsEditProps) {
  const [data, setData] =
    useState<ExperienceCredentialsData>({
      ...DEFAULT_DATA,
      ...initialData,
    });

  const [errors, setErrors] =
    useState<ValidationErrors>({});

  /*
   * Keep the form synchronized with backend data
   * when Edit mode loads the profile.
   */
  useEffect(() => {
    setData({
      ...DEFAULT_DATA,
      ...initialData,
    });

    setErrors({});
  }, [initialData]);

  const updateField = <
    K extends keyof ExperienceCredentialsData
  >(
    field: K,
    value: ExperienceCredentialsData[K],
  ) => {
    setData((current) => ({
      ...current,
      [field]: value,
    }));

    /*
     * Clear the error for this field once
     * the user starts correcting it.
     */
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];

      return next;
    });
  };

  const validate = (): ValidationErrors => {
    const nextErrors: ValidationErrors = {};

    /*
     * Buyer Type
     */
    if (!data.buyerType) {
      nextErrors.buyerType =
        "Please select a buyer type.";
    }

    /*
     * Current Industry
     */
    if (data.currentIndustry.trim().length > 150) {
      nextErrors.currentIndustry =
        "Current industry must be 150 characters or fewer.";
    }

    /*
     * Current Position
     */
    if (data.currentPosition.trim().length > 150) {
      nextErrors.currentPosition =
        "Current position must be 150 characters or fewer.";
    }

    /*
     * Years of Business Experience
     */
    const years = data.businessExperienceYears.trim();

    if (years !== "") {
      const numericYears = Number(years);

      if (
        !Number.isFinite(numericYears) ||
        !Number.isInteger(numericYears) ||
        numericYears < 0 ||
        numericYears > 100
      ) {
        nextErrors.businessExperienceYears =
          "Enter a whole number between 0 and 100.";
      }
    }

    /*
     * Relevant Experience
     */
    if (
      data.relevantExperience.trim().length >
      MAX_EXPERIENCE_LENGTH
    ) {
      nextErrors.relevantExperience =
        "Relevant experience must be 2,000 characters or fewer.";
    }

    /*
     * Available Hours Per Week
     */
    const hours =
      data.availableHoursPerWeek.trim();

    if (hours !== "") {
      const numericHours = Number(hours);

      if (
        !Number.isFinite(numericHours) ||
        !Number.isInteger(numericHours) ||
        numericHours < 0 ||
        numericHours > 168
      ) {
        nextErrors.availableHoursPerWeek =
          "Enter a whole number between 0 and 168.";
      }
    }

    /*
     * City
     */
    if (data.city.trim().length > 100) {
      nextErrors.city =
        "City must be 100 characters or fewer.";
    }

    /*
     * County
     */
    if (data.county.trim().length > 100) {
      nextErrors.county =
        "County must be 100 characters or fewer.";
    }

    /*
     * State
     */
    if (data.state.trim().length > 100) {
      nextErrors.state =
        "State must be 100 characters or fewer.";
    }

    /*
     * ZIP / Postal Code
     *
     * Allows international postal codes:
     * letters, numbers, spaces and hyphens.
     */
    const zip = data.zipCode.trim();

    if (zip !== "") {
      if (zip.length < 3 || zip.length > 20) {
        nextErrors.zipCode =
          "ZIP / Postal Code must be between 3 and 20 characters.";
      } else if (
        !/^[A-Za-z0-9][A-Za-z0-9 -]*$/.test(zip)
      ) {
        nextErrors.zipCode =
          "ZIP / Postal Code can contain only letters, numbers, spaces, and hyphens.";
      }
    }

    return nextErrors;
  };

  const handleContinue = () => {
    if (disabled) {
      return;
    }

    const validationErrors = validate();

    setErrors(validationErrors);

    /*
     * Stop here if validation failed.
     */
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    /*
     * Only send cleaned data to BuyerProfileEdit.
     */
    onContinue({
      ...data,

      currentIndustry:
        data.currentIndustry.trim(),

      currentPosition:
        data.currentPosition.trim(),

      businessExperienceYears:
        data.businessExperienceYears.trim(),

      relevantExperience:
        data.relevantExperience.trim(),

      availableHoursPerWeek:
        data.availableHoursPerWeek.trim(),

      city:
        data.city.trim(),

      county:
        data.county.trim(),

      state:
        data.state.trim(),

      zipCode:
        data.zipCode.trim(),
    });
  };

  return (
    <section className="experience-credentials-section">
      <div className="experience-credentials-section__fields">

        {/* =================================================
            1. Buyer Type
           ================================================= */}

        <fieldset className="experience-credentials-section__group">
          <legend className="experience-credentials-section__label">
            What best describes your buyer type? (Select one)
          </legend>

          <div className="experience-credentials-section__radio-grid">
            {BUYER_TYPE_OPTIONS.map((option) => {
              const selected =
                data.buyerType === option.value;

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
                      updateField(
                        "buyerType",
                        option.value,
                      )
                    }
                    className="experience-credentials-section__radio-input"
                    aria-invalid={Boolean(
                      errors.buyerType,
                    )}
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

          {errors.buyerType && (
            <p className="experience-credentials-section__error">
              {errors.buyerType}
            </p>
          )}
        </fieldset>

        {/* =================================================
            2. Current Industry
           ================================================= */}

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
              updateField(
                "currentIndustry",
                event.target.value,
              )
            }
            className="experience-credentials-section__input"
            aria-invalid={Boolean(
              errors.currentIndustry,
            )}
          />

          {errors.currentIndustry && (
            <p className="experience-credentials-section__error">
              {errors.currentIndustry}
            </p>
          )}
        </div>

        {/* =================================================
            3. Current Position
           ================================================= */}

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
              updateField(
                "currentPosition",
                event.target.value,
              )
            }
            className="experience-credentials-section__input"
            aria-invalid={Boolean(
              errors.currentPosition,
            )}
          />

          {errors.currentPosition && (
            <p className="experience-credentials-section__error">
              {errors.currentPosition}
            </p>
          )}
        </div>

        {/* =================================================
            4. Years of Business Experience
           ================================================= */}

        <div className="experience-credentials-section__field">
          <label
            htmlFor="business-experience-years"
            className="experience-credentials-section__label"
          >
            How many years of business experience do you
            have owning or operating a business? (Enter a
            number)
          </label>

          <input
            id="business-experience-years"
            type="number"
            min={0}
            max={100}
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
            aria-invalid={Boolean(
              errors.businessExperienceYears,
            )}
          />

          {errors.businessExperienceYears && (
            <p className="experience-credentials-section__error">
              {errors.businessExperienceYears}
            </p>
          )}
        </div>

        {/* =================================================
            5. Relevant Experience
           ================================================= */}

        <div className="experience-credentials-section__field">
          <label
            htmlFor="relevant-experience"
            className="experience-credentials-section__label"
          >
            Relevant Experience
          </label>

          <textarea
            id="relevant-experience"
            maxLength={MAX_EXPERIENCE_LENGTH}
            value={data.relevantExperience}
            disabled={disabled}
            onChange={(event) =>
              updateField(
                "relevantExperience",
                event.target.value,
              )
            }
            className="experience-credentials-section__textarea"
            aria-invalid={Boolean(
              errors.relevantExperience,
            )}
          />

          {errors.relevantExperience && (
            <p className="experience-credentials-section__error">
              {errors.relevantExperience}
            </p>
          )}
        </div>

        {/* =================================================
            6. Available Hours Per Week
           ================================================= */}

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
            aria-invalid={Boolean(
              errors.availableHoursPerWeek,
            )}
          />

          {errors.availableHoursPerWeek && (
            <p className="experience-credentials-section__error">
              {errors.availableHoursPerWeek}
            </p>
          )}
        </div>

        {/* =================================================
            7. Current Location
           ================================================= */}

        <fieldset className="experience-credentials-section__group">
          <legend className="experience-credentials-section__label">
            Current Location
          </legend>

          <div className="experience-credentials-section__location-grid">

            {/* City */}
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
                  updateField(
                    "city",
                    event.target.value,
                  )
                }
                className="experience-credentials-section__input"
                aria-invalid={Boolean(errors.city)}
              />

              {errors.city && (
                <p className="experience-credentials-section__error">
                  {errors.city}
                </p>
              )}
            </div>

            {/* County */}
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
                  updateField(
                    "county",
                    event.target.value,
                  )
                }
                className="experience-credentials-section__input"
                aria-invalid={Boolean(
                  errors.county,
                )}
              />

              {errors.county && (
                <p className="experience-credentials-section__error">
                  {errors.county}
                </p>
              )}
            </div>

            {/* State */}
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
                  updateField(
                    "state",
                    event.target.value,
                  )
                }
                className="experience-credentials-section__input"
                aria-invalid={Boolean(
                  errors.state,
                )}
              />

              {errors.state && (
                <p className="experience-credentials-section__error">
                  {errors.state}
                </p>
              )}
            </div>

            {/* ZIP */}
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
                  updateField(
                    "zipCode",
                    event.target.value,
                  )
                }
                className="experience-credentials-section__input"
                aria-invalid={Boolean(
                  errors.zipCode,
                )}
              />

              {errors.zipCode && (
                <p className="experience-credentials-section__error">
                  {errors.zipCode}
                </p>
              )}
            </div>

          </div>
        </fieldset>
      </div>

      {/* =================================================
          Navigation
         ================================================= */}

      <div className="experience-credentials-section__navigation">
        <button
          type="button"
          className="experience-credentials-section__navigation-button"
          onClick={onBack}
          disabled={disabled}
          aria-label="Back to overview"
        >
          <ArrowLeft
            size={20}
            strokeWidth={2}
          />
        </button>
        {mode === "onboarding" ? (
          <button
            type="button"
            className="experience-credentials-section__continue-button"
            onClick={handleContinue}
            disabled={disabled}
          >
            Save & Continue
            <ArrowRight
              size={18}
              strokeWidth={2}
            />
          </button>
        ) : (
          <button
            type="button"
            className="experience-credentials-section__navigation-button"
            onClick={handleContinue}
            disabled={disabled}
            aria-label="Continue to acquisition preferences"
          >
            <ArrowRight
              size={20}
              strokeWidth={2}
            />
          </button>
        )}
      </div>
    </section>
  );
}