"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import type { ApiTargetLocation } from "@/lib/api/buyerPreferences";
import { searchLocations } from "@/lib/api/locations";

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

export interface ExperienceCredentialsEditHandle {
  submit: () => Promise<boolean>;
}

interface ExperienceCredentialsEditProps {
  mode?: "edit" | "onboarding";
  showActions?: boolean;
  initialData?: Partial<ExperienceCredentialsData>;
  onBack: () => void;
  onContinue: (
    data: ExperienceCredentialsData,
  ) => void | Promise<void>;
  onDataChange?: (
    data: ExperienceCredentialsData,
  ) => void;
  disabled?: boolean;
}

type FieldName = keyof ExperienceCredentialsData;

type ValidationErrors = Partial<
  Record<FieldName, string>
>;

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

const ExperienceCredentialsEdit = forwardRef<
  ExperienceCredentialsEditHandle,
  ExperienceCredentialsEditProps
>(function ExperienceCredentialsEdit(
  {
    mode = "edit",
    showActions = true,
    initialData,
    onBack,
    onContinue,
    onDataChange,
    disabled = false,
  }: ExperienceCredentialsEditProps,
  ref,
) {
  const [data, setData] =
    useState<ExperienceCredentialsData>({
      ...DEFAULT_DATA,
      ...initialData,
    });

  const [errors, setErrors] =
    useState<ValidationErrors>({});

  const [locationSearch, setLocationSearch] =
    useState("");

  const [
    locationSuggestions,
    setLocationSuggestions,
  ] = useState<ApiTargetLocation[]>([]);

  const [
    locationDropdownOpen,
    setLocationDropdownOpen,
  ] = useState(false);

  const [
    locationLoading,
    setLocationLoading,
  ] = useState(false);

  const [locationError, setLocationError] =
    useState<string | null>(null);

  const [
    highlightedLocationIndex,
    setHighlightedLocationIndex,
  ] = useState(-1);

  const locationWrapperRef =
    useRef<HTMLDivElement>(null);

  /*
   * Keep the form synchronized with backend data
   * when Edit mode loads or refreshes the profile.
   *
   * During onboarding, initialData is used when this
   * component first mounts. After that, the form owns
   * its local state until the user submits it.
   *
   * BuyerOnboarding saves About You before Experience
   * & Credentials. That save updates the parent profile
   * and therefore changes initialData.
   *
   * Re-synchronizing here during onboarding would wipe
   * the Experience values the user already entered.
   */
  useEffect(() => {
    if (mode === "onboarding") {
      return;
    }

    setData({
      ...DEFAULT_DATA,
      ...initialData,
    });

    setErrors({});

    const initialLocationLabel = [
      initialData?.city,
      initialData?.county,
      initialData?.state,
      initialData?.zipCode,
    ]
      .filter(Boolean)
      .join(", ");

    setLocationSearch(initialLocationLabel);
    setLocationSuggestions([]);
    setLocationDropdownOpen(false);
    setLocationError(null);
    setHighlightedLocationIndex(-1);
  }, [
    mode,
    initialData?.buyerType,
    initialData?.currentIndustry,
    initialData?.currentPosition,
    initialData?.businessExperienceYears,
    initialData?.relevantExperience,
    initialData?.availableHoursPerWeek,
    initialData?.city,
    initialData?.county,
    initialData?.state,
    initialData?.zipCode,
  ]);

  useEffect(() => {
    onDataChange?.(data);
  }, [data, onDataChange]);

  const updateField = <
    K extends keyof ExperienceCredentialsData,
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

  useEffect(() => {
    const query = locationSearch.trim();

    if (query.length < 3) {
      setLocationSuggestions([]);
      setLocationLoading(false);
      setLocationError(null);
      setLocationDropdownOpen(false);
      setHighlightedLocationIndex(-1);
      return;
    }

    const timeoutId = window.setTimeout(
      async () => {
        try {
          setLocationLoading(true);
          setLocationError(null);
          setLocationDropdownOpen(true);
          setHighlightedLocationIndex(-1);

          const results =
            await searchLocations(query, 8);

          setLocationSuggestions(results);
        } catch (error) {
          console.error(
            "Location search failed:",
            error,
          );

          setLocationSuggestions([]);

          setLocationError(
            error instanceof Error
              ? error.message
              : "Unable to load locations. Please try again.",
          );
        } finally {
          setLocationLoading(false);
        }
      },
      250,
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [locationSearch]);

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent,
    ) => {
      if (
        locationWrapperRef.current &&
        !locationWrapperRef.current.contains(
          event.target as Node,
        )
      ) {
        setLocationDropdownOpen(false);
        setHighlightedLocationIndex(-1);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  const handleLocationInputChange = (
    value: string,
  ) => {
    if (disabled) {
      return;
    }

    setLocationSearch(value);

    setLocationDropdownOpen(
      value.trim().length >= 3,
    );

    setHighlightedLocationIndex(-1);
    setLocationError(null);
  };

  const handleSelectLocation = (
    suggestion: ApiTargetLocation,
  ) => {
    if (disabled) {
      return;
    }

    setData((current) => ({
      ...current,
      city: suggestion.city ?? "",
      county: suggestion.county ?? "",
      state: suggestion.state ?? "",
      zipCode: suggestion.zip_code ?? "",
    }));

    setErrors((current) => {
      const next = { ...current };

      delete next.city;
      delete next.county;
      delete next.state;
      delete next.zipCode;

      return next;
    });

    setLocationSearch(
      suggestion.display_name?.trim() ?? "",
    );

    setLocationSuggestions([]);
    setLocationDropdownOpen(false);
    setHighlightedLocationIndex(-1);
    setLocationError(null);
  };

  const handleLocationKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      !locationDropdownOpen ||
      locationSuggestions.length === 0
    ) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setHighlightedLocationIndex(
        (current) =>
          current <
          locationSuggestions.length - 1
            ? current + 1
            : 0,
      );

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setHighlightedLocationIndex(
        (current) =>
          current > 0
            ? current - 1
            : locationSuggestions.length - 1,
      );

      return;
    }

    if (
      event.key === "Enter" &&
      highlightedLocationIndex >= 0
    ) {
      event.preventDefault();

      const suggestion =
        locationSuggestions[
          highlightedLocationIndex
        ];

      if (suggestion) {
        handleSelectLocation(suggestion);
      }

      return;
    }

    if (event.key === "Escape") {
      setLocationDropdownOpen(false);
      setHighlightedLocationIndex(-1);
    }
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
    if (
      data.currentIndustry.trim().length > 150
    ) {
      nextErrors.currentIndustry =
        "Current industry must be 150 characters or fewer.";
    }

    /*
     * Current Position
     */
    if (
      data.currentPosition.trim().length > 150
    ) {
      nextErrors.currentPosition =
        "Current position must be 150 characters or fewer.";
    }

    /*
     * Years of Business Experience
     */
    const years =
      data.businessExperienceYears.trim();

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
      if (
        zip.length < 3 ||
        zip.length > 20
      ) {
        nextErrors.zipCode =
          "ZIP / Postal Code must be between 3 and 20 characters.";
      } else if (
        !/^[A-Za-z0-9][A-Za-z0-9 -]*$/.test(
          zip,
        )
      ) {
        nextErrors.zipCode =
          "ZIP / Postal Code can contain only letters, numbers, spaces, and hyphens.";
      }
    }

    return nextErrors;
  };

  const handleContinue =
    async (): Promise<boolean> => {
      if (disabled) {
        return false;
      }

      const validationErrors = validate();

      setErrors(validationErrors);

      /*
       * Stop here if validation failed.
       */
      if (
        Object.keys(validationErrors).length >
        0
      ) {
        return false;
      }

      /*
       * Only send cleaned data to BuyerProfileEdit.
       */
      await onContinue({
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

        city: data.city.trim(),

        county: data.county.trim(),

        state: data.state.trim(),

        zipCode: data.zipCode.trim(),
      });

      return true;
    };

  useImperativeHandle(
    ref,
    () => ({
      submit: handleContinue,
    }),
  );

  return (
    <section className="experience-credentials-section">
      <p className="experience-credentials-section__required-note">
        Fields marked{" "}
        <span
          className="experience-credentials-section__required"
          aria-hidden="true"
        >
          *
        </span>{" "}
        are required for matching.
      </p>

      <div className="experience-credentials-section__fields">
        {/* =================================================
            1. Buyer Type
           ================================================= */}

        <fieldset className="experience-credentials-section__group">
          <legend className="experience-credentials-section__label">
            What best describes your buyer type?
            (Select one)
            <span
              className="experience-credentials-section__required"
              aria-hidden="true"
            >
              *
            </span>
          </legend>

          <div className="experience-credentials-section__radio-grid">
            {BUYER_TYPE_OPTIONS.map(
              (option) => {
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
              },
            )}
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
            How many years of business experience
            do you have owning or operating a
            business? (Enter a number)
          </label>

          <input
            id="business-experience-years"
            type="number"
            min={0}
            max={100}
            step={1}
            value={
              data.businessExperienceYears
            }
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
              {
                errors.businessExperienceYears
              }
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
            value={
              data.availableHoursPerWeek
            }
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
              {
                errors.availableHoursPerWeek
              }
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

          <div
            ref={locationWrapperRef}
            className="experience-credentials-section__location-field"
          >
            <div className="experience-credentials-section__location-input-wrap">
              <input
                id="current-location"
                type="text"
                value={locationSearch}
                onChange={(event) =>
                  handleLocationInputChange(
                    event.target.value,
                  )
                }
                onKeyDown={
                  handleLocationKeyDown
                }
                onFocus={() => {
                  if (
                    locationSearch.trim()
                      .length >= 3
                  ) {
                    setLocationDropdownOpen(
                      true,
                    );
                  }
                }}
                placeholder="Search for a city, state, or county"
                disabled={disabled}
                autoComplete="off"
                className="experience-credentials-section__input"
                aria-expanded={
                  locationDropdownOpen
                }
                aria-autocomplete="list"
                aria-controls="current-location-list"
              />

              {locationLoading && (
                <span className="experience-credentials-section__location-loading">
                  Searching...
                </span>
              )}

              {locationDropdownOpen &&
                locationSearch.trim().length >=
                  3 && (
                  <div
                    id="current-location-list"
                    className="experience-credentials-section__location-dropdown"
                    role="listbox"
                  >
                    {locationSuggestions.length >
                    0 ? (
                      locationSuggestions.map(
                        (
                          suggestion,
                          index,
                        ) => (
                          <button
                            key={
                              suggestion.place_id
                            }
                            type="button"
                            role="option"
                            aria-selected={
                              highlightedLocationIndex ===
                              index
                            }
                            className={`experience-credentials-section__location-option ${
                              highlightedLocationIndex ===
                              index
                                ? "experience-credentials-section__location-option--highlighted"
                                : ""
                            }`}
                            onMouseDown={(
                              event,
                            ) =>
                              event.preventDefault()
                            }
                            onClick={() =>
                              handleSelectLocation(
                                suggestion,
                              )
                            }
                          >
                            {
                              suggestion.display_name
                            }
                          </button>
                        ),
                      )
                    ) : !locationLoading ? (
                      <div className="experience-credentials-section__location-empty">
                        No locations found.
                      </div>
                    ) : null}
                  </div>
                )}
            </div>

            {locationError && (
              <p
                className="experience-credentials-section__error"
                role="alert"
              >
                {locationError}
              </p>
            )}

            {(data.city ||
              data.county ||
              data.state ||
              data.zipCode) && (
              <p className="experience-credentials-section__location-selected">
                {[
                  data.city,
                  data.county,
                  data.state,
                  data.zipCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>
        </fieldset>
      </div>

      {/* =================================================
          Navigation
         ================================================= */}

      {showActions && (
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
      )}
    </section>
  );
});

export default ExperienceCredentialsEdit;