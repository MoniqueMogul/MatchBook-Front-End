"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import type { ApiTargetLocation } from "@/lib/api/buyerPreferences.types";
import { searchLocations } from "@/lib/api/locations";

import "./AcquisitionPreferencesSection.css";

type TimelineOption =
  | "exploring"
  | "within-1-12"
  | "within-12-24"
  | "within-24-plus";

type DealPreferenceOption =
  | "cash"
  | "financing"
  | "either";

type RealEstatePreferenceOption =
  | "included"
  | "lease"
  | "either";

type CustomerConcentrationOption =
  | ""
  | "yes"
  | "no";

type AcquisitionPreferenceData = {
  industries: string[];
  
  targetLocations: ApiTargetLocation[];

  minimumYearsInOperation?: number;
  minimumARR?: number;
  minimumSDE?: number;

  maximumPurchasePrice?: number;
  preferredARR?: number;
  preferredSDE?: number;
  preferredOwnerHoursPerWeek?: number;

  customerConcentration?: boolean;
  sellerTrainingDays?: number;

  dealPreference?: DealPreferenceOption;
  realEstatePreference?: RealEstatePreferenceOption;

  timeline?: TimelineOption;
};

interface AcquisitionPreferencesSectionProps {
  initialIndustries?: string[];
  initialTargetLocations?: ApiTargetLocation[];
  initialMinimumYearsInOperation?: number | null;
  initialMinimumARR?: number | null;
  initialMinimumSDE?: number | null;

  initialMaximumPurchasePrice?: number | null;
  initialPreferredARR?: number | null;
  initialPreferredSDE?: number | null;
  initialPreferredOwnerHoursPerWeek?: number | null;

  initialCustomerConcentration?: boolean | null;
  initialSellerTrainingDays?: number | null;

  initialDealPreference?: DealPreferenceOption | null;
  initialRealEstatePreference?: RealEstatePreferenceOption | null;

  initialTimeline?: TimelineOption;

  onBack?: () => void;

  onContinue?: (data: AcquisitionPreferenceData) => void;

  disabled?: boolean;
}

/*
 * ------------------------------------------------
 * Options
 * ------------------------------------------------
 */

const INDUSTRY_OPTIONS = [
  "Food & Beverage",
  "Retail",
  "Health & Wellness",
  "Beauty & Personal Care",
  "Home & Professional Services",
  "Automotive",
  "Education & Childcare",
  "Entertainment & Recreation",
  "Technology",
];

const CUSTOMER_CONCENTRATION_OPTIONS = [
  "Yes",
  "No",
];

const SELLER_TRAINING_OPTIONS = [
  "0 days",
  "7 days",
  "14 days",
];

const DEAL_PREFERENCE_OPTIONS: Array<{
  value: DealPreferenceOption;
  label: string;
}> = [
  {
    value: "cash",
    label: "Cash",
  },
  {
    value: "financing",
    label: "Financing",
  },
  {
    value: "either",
    label: "Either",
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
    value: "within-1-12",
    label: "Ready to buy within 1–12 months",
  },
  {
    value: "within-12-24",
    label: "Ready to buy within 12–24 months",
  },
  {
    value: "within-24-plus",
    label: "Ready to buy in 24+ months",
  },
];

/*
 * ------------------------------------------------
 * Multi Select
 * ------------------------------------------------
 */

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const toggleValue = (value: string) => {
    if (disabled) return;

    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  };

  const removeValue = (value: string) => {
    if (disabled) return;

    onChange(selected.filter((item) => item !== value));
  };

  return (
    <div
      ref={wrapperRef}
      className="acquisition-preferences-section__select-field"
    >
      <label className="acquisition-preferences-section__label">
        {label}
      </label>

      <div className="acquisition-preferences-section__select-wrap">
        <button
          type="button"
          className={`acquisition-preferences-section__select-trigger ${
            open
              ? "acquisition-preferences-section__select-trigger--open"
              : ""
          }`}
          onClick={() => !disabled && setOpen((current) => !current)}
          disabled={disabled}
          aria-expanded={open}
        >
          <span>Select all that apply</span>

          <ChevronDown
            size={14}
            strokeWidth={1.5}
            className={`acquisition-preferences-section__chevron ${
              open
                ? "acquisition-preferences-section__chevron--open"
                : ""
            }`}
          />
        </button>

        {open && (
          <div className="acquisition-preferences-section__dropdown">
            {options.map((option) => {
              const selectedOption = selected.includes(option);

              return (
                <label
                  key={option}
                  className={`acquisition-preferences-section__dropdown-option ${
                    selectedOption
                      ? "acquisition-preferences-section__dropdown-option--selected"
                      : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedOption}
                    onChange={() => toggleValue(option)}
                    disabled={disabled}
                  />

                  <span>{option}</span>

                  <span className="acquisition-preferences-section__check">
                    {selectedOption ? "✓" : ""}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="acquisition-preferences-section__pills">
          {selected.map((value) => (
            <div
              key={value}
              className="acquisition-preferences-section__pill"
            >
              <span>{value}</span>

              <button
                type="button"
                onClick={() => removeValue(value)}
                disabled={disabled}
                aria-label={`Remove ${value}`}
              >
                <X size={11} strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/*
 * ------------------------------------------------
 * Single Select
 * ------------------------------------------------
 */

interface SingleSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

function SingleSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: SingleSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="acquisition-preferences-section__select-field"
    >
      <label className="acquisition-preferences-section__label">
        {label}
      </label>

      <div className="acquisition-preferences-section__select-wrap">
        <button
          type="button"
          className={`acquisition-preferences-section__select-trigger ${
            open
              ? "acquisition-preferences-section__select-trigger--open"
              : ""
          }`}
          onClick={() => !disabled && setOpen((current) => !current)}
          disabled={disabled}
          aria-expanded={open}
        >
          <span>{value || "Select an option"}</span>

          <ChevronDown
            size={14}
            strokeWidth={1.5}
            className={`acquisition-preferences-section__chevron ${
              open
                ? "acquisition-preferences-section__chevron--open"
                : ""
            }`}
          />
        </button>

        {open && (
          <div className="acquisition-preferences-section__dropdown">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                className={`acquisition-preferences-section__dropdown-option acquisition-preferences-section__dropdown-option--button ${
                  value === option
                    ? "acquisition-preferences-section__dropdown-option--selected"
                    : ""
                }`}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                disabled={disabled}
              >
                <span>{option}</span>

                <span className="acquisition-preferences-section__check">
                  {value === option ? "✓" : ""}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/*
 * ------------------------------------------------
 * Main Component
 * ------------------------------------------------
 */

export default function AcquisitionPreferencesSection({
  initialIndustries = [],
  initialTargetLocations = [],
  initialMinimumYearsInOperation = null,
  initialMinimumARR = null,
  initialMinimumSDE = null,

  initialMaximumPurchasePrice = null,
  initialPreferredARR = null,
  initialPreferredSDE = null,
  initialPreferredOwnerHoursPerWeek = null,

  initialCustomerConcentration = null,
  initialSellerTrainingDays = null,

  initialDealPreference = null,
  initialRealEstatePreference = null,

  initialTimeline = "exploring",

  onBack,
  onContinue,
  disabled = false,
}: AcquisitionPreferencesSectionProps) {
  /*
   * ------------------------------------------------
   * State
   * ------------------------------------------------
   */

  const [industries, setIndustries] =
    useState<string[]>(initialIndustries);

  
    /*
   * ------------------------------------------------
   * Preferred Regions
   * ------------------------------------------------
   */

  const [targetLocations, setTargetLocations] =
    useState<ApiTargetLocation[]>(
      initialTargetLocations,
    );

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

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationError, setLocationError] =
    useState<string | null>(null);

  const [
    highlightedLocationIndex,
    setHighlightedLocationIndex,
  ] = useState(-1);

  const locationWrapperRef =
    useRef<HTMLDivElement>(null);

  const [minimumYearsInOperation, setMinimumYearsInOperation] =
    useState(
      initialMinimumYearsInOperation !== null &&
        initialMinimumYearsInOperation !== undefined
        ? String(initialMinimumYearsInOperation)
        : "",
    );

  const [minimumARR, setMinimumARR] =
    useState(
      initialMinimumARR !== null &&
        initialMinimumARR !== undefined
        ? String(initialMinimumARR)
        : "",
    );

  const [minimumSDE, setMinimumSDE] =
    useState(
      initialMinimumSDE !== null &&
        initialMinimumSDE !== undefined
        ? String(initialMinimumSDE)
        : "",
    );

  const [maximumPurchasePrice, setMaximumPurchasePrice] =
    useState(
      initialMaximumPurchasePrice !== null &&
        initialMaximumPurchasePrice !== undefined
        ? String(initialMaximumPurchasePrice)
        : "",
    );

  const [preferredARR, setPreferredARR] =
    useState(
      initialPreferredARR !== null &&
        initialPreferredARR !== undefined
        ? String(initialPreferredARR)
        : "",
    );

  const [preferredSDE, setPreferredSDE] =
    useState(
      initialPreferredSDE !== null &&
        initialPreferredSDE !== undefined
        ? String(initialPreferredSDE)
        : "",
    );

  const [preferredOwnerHoursPerWeek, setPreferredOwnerHoursPerWeek] =
    useState(
      initialPreferredOwnerHoursPerWeek !== null &&
        initialPreferredOwnerHoursPerWeek !== undefined
        ? String(initialPreferredOwnerHoursPerWeek)
        : "",
    );

  const [customerConcentration, setCustomerConcentration] =
    useState<CustomerConcentrationOption>(
      initialCustomerConcentration === true
        ? "yes"
        : initialCustomerConcentration === false
          ? "no"
          : "",
    );

  const [sellerTrainingDays, setSellerTrainingDays] =
    useState(
      initialSellerTrainingDays !== null &&
        initialSellerTrainingDays !== undefined
        ? `${initialSellerTrainingDays} days`
        : "",
    );

  const [dealPreference, setDealPreference] =
    useState<DealPreferenceOption | "">(
      initialDealPreference ?? "",
    );

  const [realEstatePreference, setRealEstatePreference] =
    useState<RealEstatePreferenceOption | "">(
      initialRealEstatePreference ?? "",
    );

  const [timeline, setTimeline] =
    useState<TimelineOption>(initialTimeline);



    /*
   * ------------------------------------------------
   * Preferred Regions Autocomplete
   * ------------------------------------------------
   */

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

          const results = await searchLocations(
            query,
            8,
          );

          setLocationSuggestions(results);
          setLocationError(null);
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


    /*
   * ------------------------------------------------
   * Close Preferred Regions Dropdown
   * ------------------------------------------------
   */

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

  /*
   * ------------------------------------------------
   * Helpers
   * ------------------------------------------------
   */

  const toNumberOrUndefined = (
    value: string,
  ): number | undefined => {
    if (value.trim() === "") {
      return undefined;
    }

    const parsed = Number(value);

    return Number.isNaN(parsed)
      ? undefined
      : parsed;
  };



    /*
   * ------------------------------------------------
   * Preferred Regions Handlers
   * ------------------------------------------------
   */

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
  };

  const handleSelectLocation = (
    suggestion: ApiTargetLocation,
  ) => {
    if (disabled) {
      return;
    }

    const value =
      suggestion.display_name?.trim();

    if (!value) {
      return;
    }

    if (
      !Number.isFinite(suggestion.latitude) ||
      !Number.isFinite(suggestion.longitude)
    ) {
      setLocationError(
        "This location does not contain valid coordinates. Please choose another result.",
      );

      return;
    }

    if (
      !targetLocations.some(
        (location) =>
          location.place_id ===
          suggestion.place_id,
      )
    ) {
      setTargetLocations((current) => [
        ...current,
        suggestion,
      ]);
    }

    setLocationSearch("");
    setLocationSuggestions([]);
    setLocationDropdownOpen(false);
    setHighlightedLocationIndex(-1);
    setLocationError(null);
  };

  const handleRemoveLocation = (
    placeId: string,
  ) => {
    if (disabled) {
      return;
    }

    setTargetLocations((current) =>
      current.filter(
        (location) =>
          location.place_id !== placeId,
      ),
    );
  };

  const handleLocationKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
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

  /*
   * ------------------------------------------------
   * Continue
   * ------------------------------------------------
   */

  const handleContinue = () => {
    const trainingDays =
      sellerTrainingDays === ""
        ? undefined
        : Number.parseInt(
            sellerTrainingDays.replace(" days", ""),
            10,
          );

    const customerConcentrationValue =
      customerConcentration === ""
        ? undefined
        : customerConcentration === "yes";

    onContinue?.({
      industries,
      targetLocations,
      minimumYearsInOperation:
        toNumberOrUndefined(
          minimumYearsInOperation,
        ),

      minimumARR:
        toNumberOrUndefined(minimumARR),

      minimumSDE:
        toNumberOrUndefined(minimumSDE),

      maximumPurchasePrice:
        toNumberOrUndefined(
          maximumPurchasePrice,
        ),

      preferredARR:
        toNumberOrUndefined(preferredARR),

      preferredSDE:
        toNumberOrUndefined(preferredSDE),

      preferredOwnerHoursPerWeek:
        toNumberOrUndefined(
          preferredOwnerHoursPerWeek,
        ),

      customerConcentration:
        customerConcentrationValue,

      sellerTrainingDays:
        trainingDays,

      dealPreference:
        dealPreference === ""
          ? undefined
          : dealPreference,

      realEstatePreference:
        realEstatePreference === ""
          ? undefined
          : realEstatePreference,

      timeline,
    });
  };

  /*
   * ------------------------------------------------
   * Render
   * ------------------------------------------------
   */

  return (
    <section className="acquisition-preferences-section">
      <div className="acquisition-preferences-section__fields">

        {/* Industries */}

        <MultiSelect
          label="Which industries are you interested in?"
          options={INDUSTRY_OPTIONS}
          selected={industries}
          onChange={setIndustries}
          disabled={disabled}
        />

        {/* Preferred Regions */}

        <div
          ref={locationWrapperRef}
          className="acquisition-preferences-section__field acquisition-preferences-section__location-field"
        >
          <label
            htmlFor="preferred-regions"
            className="acquisition-preferences-section__label"
          >
            Preferred Regions
          </label>

          <div className="acquisition-preferences-section__location-input-wrap">
            <input
              id="preferred-regions"
              type="text"
              value={locationSearch}
              onChange={(event) =>
                handleLocationInputChange(
                  event.target.value,
                )
              }
              onKeyDown={handleLocationKeyDown}
              onFocus={() => {
                if (
                  locationSearch.trim().length >= 3
                ) {
                  setLocationDropdownOpen(true);
                }
              }}
              placeholder="Search for a city, state, or county"
              disabled={disabled}
              autoComplete="off"
              className="acquisition-preferences-section__input"
              aria-expanded={locationDropdownOpen}
              aria-autocomplete="list"
            />

            {locationLoading && (
              <span className="acquisition-preferences-section__location-loading">
                Searching...
              </span>
            )}

            {locationDropdownOpen &&
              locationSearch.trim().length >= 3 && (
                <div
                  className="acquisition-preferences-section__location-dropdown"
                  role="listbox"
                >
                  {locationSuggestions.length > 0 ? (
                    locationSuggestions.map(
                      (suggestion, index) => (
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
                          className={`acquisition-preferences-section__location-option ${
                            highlightedLocationIndex ===
                            index
                              ? "acquisition-preferences-section__location-option--highlighted"
                              : ""
                          }`}
                          onMouseDown={(event) =>
                            event.preventDefault()
                          }
                          onClick={() =>
                            handleSelectLocation(
                              suggestion,
                            )
                          }
                        >
                          {suggestion.display_name}
                        </button>
                      ),
                    )
                  ) : !locationLoading ? (
                    <div className="acquisition-preferences-section__location-empty">
                      No locations found.
                    </div>
                  ) : null}
                </div>
              )}
          </div>

          {locationError && (
            <p
              className="acquisition-preferences-section__location-error"
              role="alert"
            >
              {locationError}
            </p>
          )}

          {targetLocations.length > 0 && (
            <div className="acquisition-preferences-section__pills">
              {targetLocations.map(
                (location) => (
                  <div
                    key={location.place_id}
                    className="acquisition-preferences-section__pill"
                  >
                    <span>
                      {location.display_name}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveLocation(
                          location.place_id,
                        )
                      }
                      disabled={disabled}
                      aria-label={`Remove ${location.display_name}`}
                    >
                      <X
                        size={11}
                        strokeWidth={1.5}
                      />
                    </button>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* Minimum Years */}

        <div className="acquisition-preferences-section__field">
          <label
            htmlFor="minimum-years-in-operation"
            className="acquisition-preferences-section__label"
          >
            Minimum Years in Operation
          </label>

          <input
            id="minimum-years-in-operation"
            type="number"
            min="0"
            step="1"
            value={minimumYearsInOperation}
            onChange={(event) =>
              setMinimumYearsInOperation(
                event.target.value,
              )
            }
            placeholder="Years"
            disabled={disabled}
            className="acquisition-preferences-section__input"
          />
        </div>

        {/* Minimum ARR */}

        <div className="acquisition-preferences-section__field">
          <label
            htmlFor="minimum-arr"
            className="acquisition-preferences-section__label"
          >
            Minimum Annual Recurring Revenue (ARR)
          </label>

          <input
            id="minimum-arr"
            type="number"
            min="0"
            value={minimumARR}
            onChange={(event) =>
              setMinimumARR(event.target.value)
            }
            placeholder="Value"
            disabled={disabled}
            className="acquisition-preferences-section__input"
          />
        </div>

        {/* Minimum SDE */}

        <div className="acquisition-preferences-section__field">
          <label
            htmlFor="minimum-sde"
            className="acquisition-preferences-section__label"
          >
            Minimum Seller&apos;s Discretionary Earnings (SDE)
          </label>

          <input
            id="minimum-sde"
            type="number"
            min="0"
            value={minimumSDE}
            onChange={(event) =>
              setMinimumSDE(event.target.value)
            }
            placeholder="Value"
            disabled={disabled}
            className="acquisition-preferences-section__input"
          />
        </div>

        {/* Maximum Purchase Price */}

        <div className="acquisition-preferences-section__field">
          <label
            htmlFor="maximum-purchase-price"
            className="acquisition-preferences-section__label"
          >
            Maximum Purchase Budget
          </label>

          <input
            id="maximum-purchase-price"
            type="number"
            min="0"
            value={maximumPurchasePrice}
            onChange={(event) =>
              setMaximumPurchasePrice(
                event.target.value,
              )
            }
            placeholder="Value"
            disabled={disabled}
            className="acquisition-preferences-section__input"
          />
        </div>

        {/* Preferred ARR */}

        <div className="acquisition-preferences-section__field">
          <label
            htmlFor="preferred-arr"
            className="acquisition-preferences-section__label"
          >
            Preferred Annual Recurring Revenue (ARR)
          </label>

          <input
            id="preferred-arr"
            type="number"
            min="0"
            value={preferredARR}
            onChange={(event) =>
              setPreferredARR(event.target.value)
            }
            placeholder="Value"
            disabled={disabled}
            className="acquisition-preferences-section__input"
          />
        </div>

        {/* Preferred SDE */}

        <div className="acquisition-preferences-section__field">
          <label
            htmlFor="preferred-sde"
            className="acquisition-preferences-section__label"
          >
            Preferred Seller&apos;s Discretionary Earnings (SDE)
          </label>

          <input
            id="preferred-sde"
            type="number"
            min="0"
            value={preferredSDE}
            onChange={(event) =>
              setPreferredSDE(event.target.value)
            }
            placeholder="Value"
            disabled={disabled}
            className="acquisition-preferences-section__input"
          />
        </div>

        {/* Preferred Owner Hours */}

        <div className="acquisition-preferences-section__field">
          <label
            htmlFor="preferred-owner-hours"
            className="acquisition-preferences-section__label"
          >
            Preferred Owner Hours per Week
          </label>

          <input
            id="preferred-owner-hours"
            type="number"
            min="0"
            max="168"
            step="1"
            value={preferredOwnerHoursPerWeek}
            onChange={(event) =>
              setPreferredOwnerHoursPerWeek(
                event.target.value,
              )
            }
            placeholder="Hours"
            disabled={disabled}
            className="acquisition-preferences-section__input"
          />
        </div>

        {/* Customer Concentration */}

        <SingleSelect
          label="Would you consider a business where one customer makes up more than 25% of its revenue?"
          value={
            customerConcentration === "yes"
              ? "Yes"
              : customerConcentration === "no"
                ? "No"
                : ""
          }
          options={CUSTOMER_CONCENTRATION_OPTIONS}
          onChange={(value) =>
            setCustomerConcentration(
              value.toLowerCase() as CustomerConcentrationOption,
            )
          }
          disabled={disabled}
        />

        {/* Seller Training */}

        <SingleSelect
          label="How many days of seller transition training would you require?"
          value={sellerTrainingDays}
          options={SELLER_TRAINING_OPTIONS}
          onChange={setSellerTrainingDays}
          disabled={disabled}
        />

        {/* Deal Preference */}

        <SingleSelect
          label="What is your preferred deal structure?"
          value={
            dealPreference === "cash"
              ? "Cash"
              : dealPreference === "financing"
                ? "Financing"
                : dealPreference === "either"
                  ? "Either"
                  : ""
          }
          options={DEAL_PREFERENCE_OPTIONS.map(
            (option) => option.label,
          )}
          onChange={(value) => {
            const selectedOption =
              DEAL_PREFERENCE_OPTIONS.find(
                (option) =>
                  option.label === value,
              );

            setDealPreference(
              selectedOption?.value ?? "",
            );
          }}
          disabled={disabled}
        />

        {/* Real Estate Preference */}

        <SingleSelect
          label="What is your preference for real estate?"
          value={
            realEstatePreference === "included"
              ? "Included"
              : realEstatePreference === "lease"
                ? "Lease"
                : realEstatePreference === "either"
                  ? "Either"
                  : ""
          }
          options={["Included", "Lease", "Either"]}
          onChange={(value) => {
            const selectedOption =
              value === "Included"
                ? "included"
                : value === "Lease"
                  ? "lease"
                  : value === "Either"
                    ? "either"
                    : "";

            setRealEstatePreference(selectedOption);
          }}
          disabled={disabled}
        />

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

      {/* Navigation */}

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