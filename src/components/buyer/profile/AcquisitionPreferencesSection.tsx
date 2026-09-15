"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
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

type AcquisitionPreferenceData = {
  acquisitionPreferences: string;
  motivation: string;
  involvement: InvolvementOption;
  timeline: TimelineOption;
  industries?: string[];
  companySizes?: string[];
  minimumYearsInOperation?: string;
  minimumARR?: string;
  minimumSDE?: string;
  customerConcentration?: string;
  sellerTraining?: string;
  zipcode?: string;
  searchRadius?: number;
};

interface AcquisitionPreferencesSectionProps {
  initialAcquisitionPreferences?: string;
  initialMotivation?: string;
  initialInvolvement?: InvolvementOption;
  initialTimeline?: TimelineOption;

  // New fields are optional so existing parent integrations remain valid.
  initialIndustries?: string[];
  initialCompanySizes?: string[];
  initialMinimumYearsInOperation?: string;
  initialMinimumARR?: string;
  initialMinimumSDE?: string;
  initialCustomerConcentration?: string;
  initialSellerTraining?: string;
  initialZipcode?: string;
  initialSearchRadius?: number;

  onBack?: () => void;
  onContinue?: (data: AcquisitionPreferenceData) => void;
  disabled?: boolean;
}

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

const COMPANY_SIZE_OPTIONS = [
  "1–10",
  "11–25",
  "26–50",
  "51+",
];

const CUSTOMER_CONCENTRATION_OPTIONS = [
  "Under 10%",
  "Under 25%",
  "Under 50%",
];

const SELLER_TRAINING_OPTIONS = ["Yes", "No"];

const involvementOptions: Array<{
  value: InvolvementOption;
  label: string;
}> = [
  { value: "operator", label: "Operator" },
  { value: "investor", label: "Investor" },
  {
    value: "owner-management",
    label: "Owner with management team",
  },
  { value: "partner", label: "Partner" },
];

const timelineOptions: Array<{
  value: TimelineOption;
  label: string;
}> = [
  { value: "exploring", label: "Seeing what's out there" },
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

export default function AcquisitionPreferencesSection({
  initialAcquisitionPreferences = "",
  initialMotivation = "",
  initialInvolvement = "operator",
  initialTimeline = "exploring",
  initialIndustries = [],
  initialCompanySizes = [],
  initialMinimumYearsInOperation = "",
  initialMinimumARR = "",
  initialMinimumSDE = "",
  initialCustomerConcentration = "",
  initialSellerTraining = "",
  initialZipcode = "",
  initialSearchRadius = 20,
  onBack,
  onContinue,
  disabled = false,
}: AcquisitionPreferencesSectionProps) {
  const [acquisitionPreferences, setAcquisitionPreferences] =
    useState(initialAcquisitionPreferences);
  const [motivation, setMotivation] = useState(initialMotivation);
  const [involvement, setInvolvement] =
    useState<InvolvementOption>(initialInvolvement);
  const [timeline, setTimeline] =
    useState<TimelineOption>(initialTimeline);

  const [industries, setIndustries] =
    useState<string[]>(initialIndustries);
  const [companySizes, setCompanySizes] =
    useState<string[]>(initialCompanySizes);
  const [minimumYearsInOperation, setMinimumYearsInOperation] =
    useState(initialMinimumYearsInOperation);
  const [minimumARR, setMinimumARR] = useState(initialMinimumARR);
  const [minimumSDE, setMinimumSDE] = useState(initialMinimumSDE);
  const [customerConcentration, setCustomerConcentration] =
    useState(initialCustomerConcentration);
  const [sellerTraining, setSellerTraining] =
    useState(initialSellerTraining);
  const [zipcode, setZipcode] = useState(initialZipcode);
  const [searchRadius, setSearchRadius] =
    useState(initialSearchRadius);

  const handleContinue = () => {
    onContinue?.({
      acquisitionPreferences,
      motivation,
      involvement,
      timeline,
      industries,
      companySizes,
      minimumYearsInOperation,
      minimumARR,
      minimumSDE,
      customerConcentration,
      sellerTraining,
      zipcode,
      searchRadius,
    });
  };

  return (
    <section className="acquisition-preferences-section">
      <div className="acquisition-preferences-section__fields">
        <MultiSelect
          label="Which industries are you interested in?"
          options={INDUSTRY_OPTIONS}
          selected={industries}
          onChange={setIndustries}
          disabled={disabled}
        />

        <MultiSelect
          label="What is your preferred company size by employee count?"
          options={COMPANY_SIZE_OPTIONS}
          selected={companySizes}
          onChange={setCompanySizes}
          disabled={disabled}
        />

        <div className="acquisition-preferences-section__field acquisition-preferences-section__field--compact">
          <label
            htmlFor="minimum-years-in-operation"
            className="acquisition-preferences-section__label"
          >
            Minimum Years in Operation
          </label>
          <div className="acquisition-preferences-section__input-with-suffix">
            <input
              id="minimum-years-in-operation"
              type="number"
              min="0"
              value={minimumYearsInOperation}
              onChange={(event) =>
                setMinimumYearsInOperation(event.target.value)
              }
              placeholder="Years"
              disabled={disabled}
              className="acquisition-preferences-section__input"
            />
          </div>
        </div>

        <div className="acquisition-preferences-section__field acquisition-preferences-section__field--compact">
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
            onChange={(event) => setMinimumARR(event.target.value)}
            placeholder="Value"
            disabled={disabled}
            className="acquisition-preferences-section__input"
          />
        </div>

        <div className="acquisition-preferences-section__field acquisition-preferences-section__field--compact">
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
            onChange={(event) => setMinimumSDE(event.target.value)}
            placeholder="Value"
            disabled={disabled}
            className="acquisition-preferences-section__input"
          />
        </div>

        <SingleSelect
          label="What is your maximum tolerance for customer concentration?"
          value={customerConcentration}
          options={CUSTOMER_CONCENTRATION_OPTIONS}
          onChange={setCustomerConcentration}
          disabled={disabled}
        />

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
            onChange={(event) => setMotivation(event.target.value)}
            placeholder="Placeholder text for a longer response, spanning multiple lines."
            disabled={disabled}
            className="acquisition-preferences-section__textarea"
          />
        </div>

        <SingleSelect
          label="Do you expect the seller to provide training during the handover?"
          value={sellerTraining}
          options={SELLER_TRAINING_OPTIONS}
          onChange={setSellerTraining}
          disabled={disabled}
        />

        <fieldset className="acquisition-preferences-section__group">
          <legend className="acquisition-preferences-section__label">
            Post-Acquisition Involvement
          </legend>

          <div className="acquisition-preferences-section__radio-grid">
            {involvementOptions.map((option) => {
              const selected = involvement === option.value;

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
                    onChange={() => setInvolvement(option.value)}
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

        <fieldset className="acquisition-preferences-section__group acquisition-preferences-section__group--timeline">
          <legend className="acquisition-preferences-section__label">
            Acquisition Timeline
          </legend>

          <div className="acquisition-preferences-section__radio-grid">
            {timelineOptions.map((option) => {
              const selected = timeline === option.value;

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
                    onChange={() => setTimeline(option.value)}
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

        <div className="acquisition-preferences-section__location-row">
          <div className="acquisition-preferences-section__field acquisition-preferences-section__field--zipcode">
            <label
              htmlFor="acquisition-zipcode"
              className="acquisition-preferences-section__label"
            >
              Zipcode
            </label>
            <input
              id="acquisition-zipcode"
              type="text"
              inputMode="numeric"
              value={zipcode}
              onChange={(event) => setZipcode(event.target.value)}
              placeholder="Value"
              disabled={disabled}
              className="acquisition-preferences-section__input"
            />
          </div>

          <div className="acquisition-preferences-section__radius">
            <label
              htmlFor="acquisition-search-radius"
              className="acquisition-preferences-section__label"
            >
              Search Radius
            </label>

            <div className="acquisition-preferences-section__radius-control">
              <input
                id="acquisition-search-radius"
                type="range"
                min="0"
                max="100"
                step="1"
                value={searchRadius}
                onChange={(event) =>
                  setSearchRadius(Number(event.target.value))
                }
                disabled={disabled}
              />
              <span>{searchRadius} Miles</span>
            </div>
          </div>
        </div>

        <div className="acquisition-preferences-section__field">
          <label
            htmlFor="additional-acquisition-preferences"
            className="acquisition-preferences-section__label"
          >
            Additional Acquisition Preferences
          </label>

          <textarea
            id="additional-acquisition-preferences"
            value={acquisitionPreferences}
            onChange={(event) =>
              setAcquisitionPreferences(event.target.value)
            }
            placeholder="Placeholder text for a longer response, spanning multiple lines."
            disabled={disabled}
            className="acquisition-preferences-section__textarea"
          />
        </div>
      </div>

      <div className="acquisition-preferences-section__navigation">
        <button
          type="button"
          className="acquisition-preferences-section__navigation-button"
          onClick={onBack}
          disabled={disabled}
          aria-label="Go back to industry experience"
        >
          <ChevronLeft size={32} strokeWidth={1.5} />
        </button>

        <button
          type="button"
          className="acquisition-preferences-section__navigation-button"
          onClick={handleContinue}
          disabled={disabled}
          aria-label="Continue to finances"
        >
          <ChevronRight size={32} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}
