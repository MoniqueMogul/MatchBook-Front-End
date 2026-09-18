"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

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

type CustomerConcentrationOption =
  | ""
  | "yes"
  | "no";

type AcquisitionPreferenceData = {
  industries: string[];

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

  timeline?: TimelineOption;
};

interface AcquisitionPreferencesSectionProps {
  initialIndustries?: string[];

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

  const [timeline, setTimeline] =
    useState<TimelineOption>(initialTimeline);

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