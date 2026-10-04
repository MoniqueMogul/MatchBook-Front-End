"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import type {
  ApiTargetLocation,
  TargetIndustryPreference,
} from "@/lib/api/buyerPreferences";
import { searchLocations } from "@/lib/api/locations";
import {
  getBusinessModelOptions,
  getIndustryOptions,
  type BusinessModelOption,
  type IndustryOption,
} from "@/lib/api/taxonomy";

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

export type AcquisitionPreferenceData = {
  targetIndustryPreferences: TargetIndustryPreference[];
  targetBusinessModels: string[];
  targetBusinessTypes: string[];
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

export interface AcquisitionPreferencesSectionHandle {
  submit: () => Promise<boolean>;
}

interface AcquisitionPreferencesSectionProps {
  mode?: "edit" | "onboarding";
  showActions?: boolean;

  initialTargetIndustryPreferences?: TargetIndustryPreference[];
  initialTargetBusinessModels?: string[];
  initialTargetBusinessTypes?: string[];
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
  onContinue?: (data: AcquisitionPreferenceData) => void | Promise<void>;
  onDataChange?: (data: AcquisitionPreferenceData) => void;
  disabled?: boolean;
}

/* ------------------------------------------------
 * Options
 * ------------------------------------------------ */

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

const BUSINESS_TYPE_OPTIONS: MultiSelectOption[] = [
  {
    value: "sole_proprietorship",
    label: "Sole Proprietorship",
  },
  {
    value: "partnership",
    label: "Partnership",
  },
  {
    value: "llc",
    label: "LLC",
  },
  {
    value: "s_corporation",
    label: "S Corporation",
  },
  {
    value: "c_corporation",
    label: "C Corporation",
  },
  {
    value: "nonprofit",
    label: "Nonprofit",
  },
  {
    value: "other",
    label: "Other",
  },
];

/* ------------------------------------------------
 * Multi Select
 * ------------------------------------------------ */

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label: string;
  required?: boolean;
  options: MultiSelectOption[];
  selected: string[];
  error?: string;
  onChange: (values: string[]) => void;
  disabled?: boolean;
}

function MultiSelect({
  label,
  required = false,
  options,
  error,
  selected,
  onChange,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const wrapperRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (
      event: MouseEvent,
    ) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );
    };
  }, []);

  const toggleValue = (value: string) => {
    if (disabled) {
      return;
    }

    onChange(
      selected.includes(value)
        ? selected.filter(
            (item) => item !== value,
          )
        : [...selected, value],
    );
  };

  const removeValue = (value: string) => {
    if (disabled) {
      return;
    }

    onChange(
      selected.filter(
        (item) => item !== value,
      ),
    );
  };

  return (
    <div
      ref={wrapperRef}
      className="acquisition-preferences-section__select-field"
    >
      {label && (
        <label className="acquisition-preferences-section__label">
          {label}
          {required && (
            <span
              className="acquisition-preferences-section__required"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>
      )}

      <div className="acquisition-preferences-section__select-wrap">
        <button
          type="button"
          className={`acquisition-preferences-section__select-trigger ${
            open
              ? "acquisition-preferences-section__select-trigger--open"
              : ""
          } ${
            error
              ? "acquisition-preferences-section__select-trigger--error"
              : ""
          }`}
          onClick={() =>
            !disabled &&
            setOpen((current) => !current)
          }
          disabled={disabled}
          aria-expanded={open}
          aria-invalid={Boolean(error)}
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
              const selectedOption =
                selected.includes(option.value);

              return (
                <label
                  key={option.value}
                  className={`acquisition-preferences-section__dropdown-option ${
                    selectedOption
                      ? "acquisition-preferences-section__dropdown-option--selected"
                      : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedOption}
                    onChange={() =>
                      toggleValue(option.value)
                    }
                    disabled={disabled}
                  />

                  <span>{option.label}</span>

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
              <span>
                {options.find(
                  (option) =>
                    option.value === value,
                )?.label ?? value}
              </span>

              <button
                type="button"
                onClick={() =>
                  removeValue(value)
                }
                disabled={disabled}
                aria-label={`Remove ${value}`}
              >
                <X
                  size={11}
                  strokeWidth={1.5}
                />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p
          className="acquisition-preferences-section__field-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------
 * Single Select
 * ------------------------------------------------ */

interface SingleSelectProps {
  label: string;
  required?: boolean;
  value: string;
  options: string[];
  error?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function SingleSelect({
  label,
  required = false,
  value,
  options,
  error,
  onChange,
  disabled = false,
}: SingleSelectProps) {
  const [open, setOpen] = useState(false);

  const wrapperRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (
      event: MouseEvent,
    ) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="acquisition-preferences-section__select-field"
    >
      <label className="acquisition-preferences-section__label">
        {label}

        {required && (
          <span
            className="acquisition-preferences-section__required"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      <div className="acquisition-preferences-section__select-wrap">
        <button
          type="button"
          className={`acquisition-preferences-section__select-trigger ${
            open
              ? "acquisition-preferences-section__select-trigger--open"
              : ""
          }`}
          onClick={() =>
            !disabled &&
            setOpen((current) => !current)
          }
          disabled={disabled}
          aria-expanded={open}
          aria-invalid={Boolean(error)}
        >
          <span>
            {value || "Select an option"}
          </span>

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
                  {value === option
                    ? "✓"
                    : ""}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p
          className="acquisition-preferences-section__field-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------
 * Financial amount input
 * ------------------------------------------------
 *
 * The exact number input remains the source value.
 * The slider is only a faster way to move through
 * a very large financial range.
 *
 * Slider position is logarithmic rather than linear,
 * so users can move precisely through smaller values
 * while still reaching $100M quickly.
 */

const FINANCIAL_SLIDER_STEPS = 1000;
const FINANCIAL_SLIDER_MIN_NONZERO = 1_000;
const FINANCIAL_SLIDER_MAX_AMOUNT = 100_000_000;

function financialAmountToSlider(
  value: string,
): number {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  const clampedAmount = Math.min(
    Math.max(
      amount,
      FINANCIAL_SLIDER_MIN_NONZERO,
    ),
    FINANCIAL_SLIDER_MAX_AMOUNT,
  );

  const minLog = Math.log(
    FINANCIAL_SLIDER_MIN_NONZERO,
  );
  const maxLog = Math.log(
    FINANCIAL_SLIDER_MAX_AMOUNT,
  );

  const ratio =
    (Math.log(clampedAmount) - minLog) /
    (maxLog - minLog);

  return Math.max(
    1,
    Math.round(
      ratio *
        (FINANCIAL_SLIDER_STEPS - 1) +
        1,
    ),
  );
}

function sliderToFinancialAmount(
  sliderValue: number,
): number {
  if (sliderValue <= 0) {
    return 0;
  }

  const ratio =
    (sliderValue - 1) /
    (FINANCIAL_SLIDER_STEPS - 1);

  const minLog = Math.log(
    FINANCIAL_SLIDER_MIN_NONZERO,
  );
  const maxLog = Math.log(
    FINANCIAL_SLIDER_MAX_AMOUNT,
  );

  const rawAmount = Math.exp(
    minLog + ratio * (maxLog - minLog),
  );

  let increment = 1_000;

  if (rawAmount >= 50_000_000) {
    increment = 1_000_000;
  } else if (rawAmount >= 10_000_000) {
    increment = 500_000;
  } else if (rawAmount >= 1_000_000) {
    increment = 100_000;
  } else if (rawAmount >= 100_000) {
    increment = 10_000;
  }

  return Math.min(
    FINANCIAL_SLIDER_MAX_AMOUNT,
    Math.round(rawAmount / increment) *
      increment,
  );
}

function formatCompactCurrency(
  value: string | number,
): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "$0";
  }

  if (amount >= 1_000_000_000) {
    return `$${(
      amount / 1_000_000_000
    ).toLocaleString(undefined, {
      maximumFractionDigits: 1,
    })}B`;
  }

  if (amount >= 1_000_000) {
    return `$${(
      amount / 1_000_000
    ).toLocaleString(undefined, {
      maximumFractionDigits: 1,
    })}M`;
  }

  if (amount >= 1_000) {
    return `$${(
      amount / 1_000
    ).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}K`;
  }

  return `$${amount.toLocaleString()}`;
}

interface FinancialAmountFieldProps {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
}

function FinancialAmountField({
  id,
  label,
  value,
  error,
  onChange,
  disabled = false,
  required = false,
  helperText,
}: FinancialAmountFieldProps) {
  const sliderValue =
    financialAmountToSlider(value);

  return (
    <div className="acquisition-preferences-section__field acquisition-preferences-section__financial-field">
      <label
        htmlFor={id}
        className="acquisition-preferences-section__label"
      >
        {label}

        {required && (
          <span
            className="acquisition-preferences-section__required"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      {helperText && (
        <p className="acquisition-preferences-section__financial-helper">
          {helperText}
        </p>
      )}

      <div className="acquisition-preferences-section__financial-input-wrap">
        <span
          className="acquisition-preferences-section__currency-prefix"
          aria-hidden="true"
        >
          $
        </span>

        <input
          id={id}
          type="number"
          min="0"
          step="1"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder="Enter exact amount"
          disabled={disabled}
          className="acquisition-preferences-section__input acquisition-preferences-section__financial-input"
          aria-invalid={Boolean(error)}
        />
      </div>

      <div className="acquisition-preferences-section__slider-wrap">
        <input
          type="range"
          min="0"
          max={FINANCIAL_SLIDER_STEPS}
          step="1"
          value={sliderValue}
          onChange={(event) =>
            onChange(
              String(
                sliderToFinancialAmount(
                  Number(event.target.value),
                ),
              ),
            )
          }
          disabled={disabled}
          className="acquisition-preferences-section__financial-slider"
          aria-label={`${label} quick amount selector`}
        />

        <div
          className="acquisition-preferences-section__slider-labels"
          aria-hidden="true"
        >
          <span>$0</span>
          <span>$100K</span>
          <span>$1M</span>
          <span>$10M</span>
          <span>$100M</span>
        </div>
      </div>

      <div className="acquisition-preferences-section__financial-value">
        {value.trim() === ""
          ? "No amount selected"
          : formatCompactCurrency(value)}
      </div>

      {error && (
        <p
          className="acquisition-preferences-section__field-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------
 * Main Component
 * ------------------------------------------------ */

const EMPTY_INDUSTRIES: TargetIndustryPreference[] = [];
const EMPTY_STRINGS: string[] = [];
const EMPTY_LOCATIONS: ApiTargetLocation[] = [];

const AcquisitionPreferencesSection = forwardRef<
  AcquisitionPreferencesSectionHandle,
  AcquisitionPreferencesSectionProps
>(function AcquisitionPreferencesSection({
  mode = "edit",
  showActions = true,

  initialTargetIndustryPreferences = EMPTY_INDUSTRIES,
  initialTargetBusinessModels = EMPTY_STRINGS,
  initialTargetBusinessTypes = EMPTY_STRINGS,
  initialTargetLocations = EMPTY_LOCATIONS,

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

  initialTimeline,

  onBack,
  onContinue,
  onDataChange,
  disabled = false,
}: AcquisitionPreferencesSectionProps, ref) {
  /* ------------------------------------------------
   * State
   * ------------------------------------------------ */

  const [
    targetIndustryPreferences,
    setTargetIndustryPreferences,
  ] = useState<TargetIndustryPreference[]>(
    initialTargetIndustryPreferences,
  );

  const [
    targetBusinessModels,
    setTargetBusinessModels,
  ] = useState<string[]>(
    initialTargetBusinessModels,
  );

  const [
    targetBusinessTypes,
    setTargetBusinessTypes,
  ] = useState<string[]>(
    initialTargetBusinessTypes,
  );

  const [
    industryOptions,
    setIndustryOptions,
  ] = useState<IndustryOption[]>([]);

  const [
    businessModelOptions,
    setBusinessModelOptions,
  ] = useState<BusinessModelOption[]>(
    [],
  );

  const [
    taxonomyLoading,
    setTaxonomyLoading,
  ] = useState(true);

  const [
    taxonomyError,
    setTaxonomyError,
  ] = useState<string | null>(null);

  type FieldErrorKey =
  | "industries"
  | "businessModels"
  | "businessTypes"
  | "preferredRegions"
  | "minimumARR"
  | "minimumSDE"
  | "maximumPurchasePrice"
  | "preferredARR"
  | "preferredSDE"
  | "preferredOwnerHours"
  | "customerConcentration"
  | "sellerTrainingDays"
  | "dealPreference"
  | "timeline";

  const [fieldErrors, setFieldErrors] =
    useState<Partial<Record<FieldErrorKey, string>>>({});




  /* ------------------------------------------------
   * Preferred Regions
   * ------------------------------------------------ */

  const [
    targetLocations,
    setTargetLocations,
  ] = useState<ApiTargetLocation[]>(
    initialTargetLocations,
  );

  const [
    locationSearch,
    setLocationSearch,
  ] = useState("");

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

  const [
    locationError,
    setLocationError,
  ] = useState<string | null>(null);

  const [
    highlightedLocationIndex,
    setHighlightedLocationIndex,
  ] = useState(-1);

  const locationWrapperRef =
    useRef<HTMLDivElement>(null);

  /* ------------------------------------------------
   * Numeric / select fields
   * ------------------------------------------------ */

  const [
    minimumYearsInOperation,
    setMinimumYearsInOperation,
  ] = useState(
    initialMinimumYearsInOperation !==
      null &&
      initialMinimumYearsInOperation !==
        undefined
      ? String(initialMinimumYearsInOperation)
      : "",
  );

  const [
    minimumARR,
    setMinimumARR,
  ] = useState(
    initialMinimumARR !== null &&
      initialMinimumARR !== undefined
      ? String(initialMinimumARR)
      : "",
  );

  const [
    minimumSDE,
    setMinimumSDE,
  ] = useState(
    initialMinimumSDE !== null &&
      initialMinimumSDE !== undefined
      ? String(initialMinimumSDE)
      : "",
  );

  const [
    maximumPurchasePrice,
    setMaximumPurchasePrice,
  ] = useState(
    initialMaximumPurchasePrice !==
      null &&
      initialMaximumPurchasePrice !==
        undefined
      ? String(initialMaximumPurchasePrice)
      : "",
  );

  const [
    preferredARR,
    setPreferredARR,
  ] = useState(
    initialPreferredARR !== null &&
      initialPreferredARR !== undefined
      ? String(initialPreferredARR)
      : "",
  );

  const [
    preferredSDE,
    setPreferredSDE,
  ] = useState(
    initialPreferredSDE !== null &&
      initialPreferredSDE !== undefined
      ? String(initialPreferredSDE)
      : "",
  );

  const [
    preferredOwnerHoursPerWeek,
    setPreferredOwnerHoursPerWeek,
  ] = useState(
    initialPreferredOwnerHoursPerWeek !==
      null &&
      initialPreferredOwnerHoursPerWeek !==
        undefined
      ? String(
          initialPreferredOwnerHoursPerWeek,
        )
      : "",
  );

  const [
    customerConcentration,
    setCustomerConcentration,
  ] =
    useState<CustomerConcentrationOption>(
      initialCustomerConcentration === true
        ? "yes"
        : initialCustomerConcentration ===
            false
          ? "no"
          : "",
    );

  const [
    sellerTrainingDays,
    setSellerTrainingDays,
  ] = useState(
    initialSellerTrainingDays !== null &&
      initialSellerTrainingDays !==
        undefined
      ? `${initialSellerTrainingDays} days`
      : "",
  );

  const [
    dealPreference,
    setDealPreference,
  ] = useState<
    DealPreferenceOption | ""
  >(initialDealPreference ?? "");

  const [
    realEstatePreference,
    setRealEstatePreference,
  ] = useState<
    RealEstatePreferenceOption | ""
  >(
    initialRealEstatePreference ?? "",
  );

  const [
    timeline,
    setTimeline,
  ] = useState<TimelineOption | "">(
    initialTimeline ?? "",
  );


  /*
 * ------------------------------------------------
 * Synchronize form with parent/backend data
 * ------------------------------------------------
 *
 * This is important when BuyerProfileEdit loads
 * existing onboarding data asynchronously.
 *
 * Example:
 *
 *   component mounts
 *       ↓
 *   initial props are empty
 *       ↓
 *   backend GET finishes
 *       ↓
 *   parent preferences update
 *       ↓
 *   new initial props arrive
 *       ↓
 *   this effect hydrates the form
 */
useEffect(() => {
  if (mode === "onboarding") {
    return;
  }

  setTargetIndustryPreferences(
    initialTargetIndustryPreferences,
  );

  setTargetBusinessModels(
    initialTargetBusinessModels,
  );

  setTargetBusinessTypes(
    initialTargetBusinessTypes,
  );

  setTargetLocations(
    initialTargetLocations,
  );

  setMinimumYearsInOperation(
    initialMinimumYearsInOperation !== null &&
      initialMinimumYearsInOperation !==
        undefined
      ? String(initialMinimumYearsInOperation)
      : "",
  );

  setMinimumARR(
    initialMinimumARR !== null &&
      initialMinimumARR !== undefined
      ? String(initialMinimumARR)
      : "",
  );

  setMinimumSDE(
    initialMinimumSDE !== null &&
      initialMinimumSDE !== undefined
      ? String(initialMinimumSDE)
      : "",
  );

  setMaximumPurchasePrice(
    initialMaximumPurchasePrice !== null &&
      initialMaximumPurchasePrice !==
        undefined
      ? String(initialMaximumPurchasePrice)
      : "",
  );

  setPreferredARR(
    initialPreferredARR !== null &&
      initialPreferredARR !== undefined
      ? String(initialPreferredARR)
      : "",
  );

  setPreferredSDE(
    initialPreferredSDE !== null &&
      initialPreferredSDE !== undefined
      ? String(initialPreferredSDE)
      : "",
  );

  setPreferredOwnerHoursPerWeek(
    initialPreferredOwnerHoursPerWeek !==
        null &&
      initialPreferredOwnerHoursPerWeek !==
        undefined
      ? String(
          initialPreferredOwnerHoursPerWeek,
        )
      : "",
  );

  setCustomerConcentration(
    initialCustomerConcentration === true
      ? "yes"
      : initialCustomerConcentration ===
          false
        ? "no"
        : "",
  );

  setSellerTrainingDays(
    initialSellerTrainingDays !== null &&
      initialSellerTrainingDays !==
        undefined
      ? `${initialSellerTrainingDays} days`
      : "",
  );

  setDealPreference(
    initialDealPreference ?? "",
  );

  setRealEstatePreference(
    initialRealEstatePreference ?? "",
  );

  setTimeline(initialTimeline ?? "");

  setFieldErrors({});
}, [
  mode,
  initialTargetIndustryPreferences,
  initialTargetBusinessModels,
  initialTargetBusinessTypes,
  initialTargetLocations,
  initialMinimumYearsInOperation,
  initialMinimumARR,
  initialMinimumSDE,
  initialMaximumPurchasePrice,
  initialPreferredARR,
  initialPreferredSDE,
  initialPreferredOwnerHoursPerWeek,
  initialCustomerConcentration,
  initialSellerTrainingDays,
  initialDealPreference,
  initialRealEstatePreference,
  initialTimeline,
]);

  /* ------------------------------------------------
   * Load backend taxonomy
   * ------------------------------------------------ */

  useEffect(() => {
    let cancelled = false;

    const loadTaxonomy = async () => {
      try {
        setTaxonomyLoading(true);
        setTaxonomyError(null);

        const [
          industries,
          businessModels,
        ] = await Promise.all([
          getIndustryOptions(),
          getBusinessModelOptions(),
        ]);

        if (!cancelled) {
          setIndustryOptions(industries);
          setBusinessModelOptions(
            businessModels,
          );
        }
      } catch (error) {
        if (!cancelled) {
          setTaxonomyError(
            error instanceof Error
              ? error.message
              : "Unable to load industry and business model options.",
          );
        }
      } finally {
        if (!cancelled) {
          setTaxonomyLoading(false);
        }
      }
    };

    loadTaxonomy();

    return () => {
      cancelled = true;
    };
  }, []);




  /* ------------------------------------------------
   * Industry helpers
   * ------------------------------------------------ */

  const selectedIndustryValues =
    targetIndustryPreferences.map(
      (item) => item.industry,
    );

  const updateIndustrySelection = (
    values: string[],
  ) => {
    setTargetIndustryPreferences(
      (current) => {
        const existing = new Map(
          current.map((item) => [
            item.industry,
            item,
          ]),
        );

        return values.map(
          (industry) =>
            existing.get(industry) ?? {
              industry,
              sub_industries: [],
            },
        );
      },
    );

    clearFieldError("industries");
  };

  const updateSubIndustries = (
    industry: string,
    subIndustries: string[],
  ) => {
    setTargetIndustryPreferences(
      (current) =>
        current.map((item) =>
          item.industry === industry
            ? {
                ...item,
                sub_industries:
                  subIndustries,
              }
            : item,
        ),
    );
  };

  /* ------------------------------------------------
   * Location autocomplete
   * ------------------------------------------------ */

  useEffect(() => {
    const query =
      locationSearch.trim();

    if (query.length < 3) {
      setLocationSuggestions([]);
      setLocationLoading(false);
      setLocationError(null);
      setLocationDropdownOpen(false);
      setHighlightedLocationIndex(-1);

      return;
    }

    const timeoutId =
      window.setTimeout(
        async () => {
          try {
            setLocationLoading(true);
            setLocationError(null);
            setLocationDropdownOpen(true);
            setHighlightedLocationIndex(
              -1,
            );

            const results =
              await searchLocations(
                query,
                8,
              );

            setLocationSuggestions(
              results,
            );
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
      window.clearTimeout(
        timeoutId,
      );
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
        setHighlightedLocationIndex(
          -1,
        );
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

  /* ------------------------------------------------
   * Helpers
   * ------------------------------------------------ */

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

  useEffect(() => {
    const trainingDays =
      sellerTrainingDays.trim() === ""
        ? undefined
        : Number.parseInt(
            sellerTrainingDays.replace(" days", ""),
            10,
          );

    onDataChange?.({
      targetIndustryPreferences,
      targetBusinessModels,
      targetBusinessTypes,
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
        customerConcentration === ""
          ? undefined
          : customerConcentration === "yes",

      sellerTrainingDays:
        Number.isNaN(trainingDays)
          ? undefined
          : trainingDays,

      dealPreference:
        dealPreference === ""
          ? undefined
          : dealPreference,

      realEstatePreference:
        realEstatePreference === ""
          ? undefined
          : realEstatePreference,

      timeline:
        timeline === ""
          ? undefined
          : timeline,
    });
  }, [
    targetIndustryPreferences,
    targetBusinessModels,
    targetBusinessTypes,
    targetLocations,
    minimumYearsInOperation,
    minimumARR,
    minimumSDE,
    maximumPurchasePrice,
    preferredARR,
    preferredSDE,
    preferredOwnerHoursPerWeek,
    customerConcentration,
    sellerTrainingDays,
    dealPreference,
    realEstatePreference,
    timeline,
    onDataChange,
  ]);
  /* ------------------------------------------------
   * Location handlers
   * ------------------------------------------------ */

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

    setHighlightedLocationIndex(
      -1,
    );
    setLocationError(null);
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

    /*
     * Coordinates are provider metadata.
     * They are not required for selecting
     * or persisting a preferred region.
     */

    if (
      !targetLocations.some(
        (location) =>
          location.place_id ===
          suggestion.place_id,
      )
    ) {
      setTargetLocations(
        (current) => [
          ...current,
          suggestion,
        ],
      );
    }

    setLocationSearch("");
    setLocationSuggestions([]);
    setLocationDropdownOpen(false);
    setHighlightedLocationIndex(
      -1,
    );
    setLocationError(null);
    clearFieldError("preferredRegions");
  };

  const handleRemoveLocation = (
    placeId: string,
  ) => {
    if (disabled) {
      return;
    }

    setTargetLocations(
      (current) =>
        current.filter(
          (location) =>
            location.place_id !==
            placeId,
        ),
    );

    clearFieldError("preferredRegions");
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
            : locationSuggestions.length -
              1,
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
        handleSelectLocation(
          suggestion,
        );
      }

      return;
    }

    if (event.key === "Escape") {
      setLocationDropdownOpen(false);
      setHighlightedLocationIndex(
        -1,
      );
    }
  };

  const clearFieldError = (field: FieldErrorKey) => {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const isValidNonNegativeNumber = (
    value: string,
  ): boolean => {
    if (value.trim() === "") {
      return false;
    }

    const number = Number(value);

    return (
      Number.isFinite(number) &&
      number >= 0
    );
  };

  /* ------------------------------------------------
   * Continue validation
   *
   * Required fields are based on the backend
   * readiness requirements.
   *
   * Optional:
   * - minimum years in operation
   * - real estate preference
   * - sub-industries
   * ------------------------------------------------ */

  const handleContinue = async (): Promise<boolean> => {
    const errors: Partial<Record<FieldErrorKey, string>> = {};

    if (targetIndustryPreferences.length === 0) {
      errors.industries =
        "Select at least one industry.";
    }

    if (targetBusinessModels.length === 0) {
      errors.businessModels =
        "Select at least one business model.";
    }

    if (targetBusinessTypes.length === 0) {
      errors.businessTypes =
        "Select at least one business type.";
    }

    if (targetLocations.length === 0) {
      errors.preferredRegions =
        "Select at least one preferred region.";
    }

    if (!isValidNonNegativeNumber(minimumARR)) {
      errors.minimumARR =
        minimumARR.trim() === ""
          ? "Enter your minimum ARR."
          : "Enter a valid minimum ARR.";
    }

    if (!isValidNonNegativeNumber(minimumSDE)) {
      errors.minimumSDE =
        minimumSDE.trim() === ""
          ? "Enter your minimum SDE."
          : "Enter a valid minimum SDE.";
    }

    if (
      !isValidNonNegativeNumber(maximumPurchasePrice) ||
      Number(maximumPurchasePrice) <= 0
    ) {
      errors.maximumPurchasePrice =
        maximumPurchasePrice.trim() === ""
          ? "Enter your maximum purchase budget."
          : "Enter a maximum purchase budget greater than zero.";
    }

    if (!isValidNonNegativeNumber(preferredARR)) {
      errors.preferredARR =
        preferredARR.trim() === ""
          ? "Enter your preferred ARR."
          : "Enter a valid preferred ARR.";
    }

    if (!isValidNonNegativeNumber(preferredSDE)) {
      errors.preferredSDE =
        preferredSDE.trim() === ""
          ? "Enter your preferred SDE."
          : "Enter a valid preferred SDE.";
    }

    const ownerHours = Number(
      preferredOwnerHoursPerWeek,
    );

    if (
      preferredOwnerHoursPerWeek.trim() === ""
    ) {
      errors.preferredOwnerHours =
        "Enter your preferred owner hours per week.";
    } else if (
      !Number.isInteger(ownerHours) ||
      ownerHours < 0 ||
      ownerHours > 168
    ) {
      errors.preferredOwnerHours =
        "Enter a whole number between 0 and 168.";
    }

    if (customerConcentration === "") {
      errors.customerConcentration =
        "Select a customer concentration preference.";
    }

    if (sellerTrainingDays === "") {
      errors.sellerTrainingDays =
        "Select the seller transition training period.";
    }

    if (dealPreference === "") {
      errors.dealPreference =
        "Select your preferred deal structure.";
    }

    if (timeline === "") {
      errors.timeline =
        "Select your acquisition timeline.";
    }

    /*
    * ARR relationship validation
    */
    const minimumARRValue = Number(minimumARR);
    const preferredARRValue = Number(preferredARR);

    if (
      !errors.minimumARR &&
      !errors.preferredARR &&
      minimumARR.trim() !== "" &&
      preferredARR.trim() !== "" &&
      preferredARRValue <= minimumARRValue
    ) {
      errors.preferredARR =
        "Preferred ARR must be greater than Minimum ARR.";
    }

    /*
    * SDE relationship validation
    */
    const minimumSDEValue = Number(minimumSDE);
    const preferredSDEValue = Number(preferredSDE);

    if (
      !errors.minimumSDE &&
      !errors.preferredSDE &&
      minimumSDE.trim() !== "" &&
      preferredSDE.trim() !== "" &&
      preferredSDEValue <= minimumSDEValue
    ) {
      errors.preferredSDE =
        "Preferred SDE must be greater than Minimum SDE.";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return false;
    }

    const trainingDays = Number.parseInt(
      sellerTrainingDays.replace(" days", ""),
      10,
    );

    const customerConcentrationValue =
      customerConcentration === "yes";

    await onContinue?.({
      targetIndustryPreferences,
      targetBusinessModels,
      targetBusinessTypes,
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

      timeline:
        timeline === ""
          ? undefined
          : timeline,
    });

    return true;
  };

  useImperativeHandle(
    ref,
    () => ({
      submit: handleContinue,
    }),
  );

  /* ------------------------------------------------
   * Render
   * ------------------------------------------------ */

  return (
    <section className="acquisition-preferences-section">
      {taxonomyError && (
        <div
          className="acquisition-preferences-section__validation-error"
          role="alert"
        >
          {taxonomyError}
        </div>
      )}

      <p className="acquisition-preferences-section__required-note">
        Fields marked{" "}
        <span
          className="acquisition-preferences-section__required"
          aria-hidden="true"
        >
          *
        </span>{" "}
        are required for matching.
      </p>

      <div className="acquisition-preferences-section__fields">
        {/* ------------------------------------------------
         * Industries
         * ------------------------------------------------ */}

        <MultiSelect
          label="Which industries are you interested in?"
          required
          error={fieldErrors.industries}
          options={industryOptions.map(
            (option) => ({
              value: option.value,
              label: option.label,
            }),
          )}
          selected={
            selectedIndustryValues
          }
          onChange={
            updateIndustrySelection
          }
          disabled={
            disabled ||
            taxonomyLoading
          }
        />

        {/* ------------------------------------------------
         * Optional sub-industries
         * ------------------------------------------------ */}

        {targetIndustryPreferences.map(
          (preference) => {
            const industry =
              industryOptions.find(
                (option) =>
                  option.value ===
                  preference.industry,
              );

            if (!industry) {
              return null;
            }

            return (
              <MultiSelect
                key={
                  preference.industry
                }
                label={`Sub-industries for ${industry.label}`}
                options={industry.sub_industries.map(
                  (option) => ({
                    value: option.value,
                    label: option.label,
                  }),
                )}
                selected={
                  preference.sub_industries
                }
                onChange={(values) =>
                  updateSubIndustries(
                    preference.industry,
                    values,
                  )
                }
                disabled={
                  disabled ||
                  taxonomyLoading
                }
              />
            );
          },
        )}

        {/* ------------------------------------------------
         * Business Models
         * ------------------------------------------------ */}

        <MultiSelect
          label="Preferred Business Models"
          required
          error={fieldErrors.businessModels}
          options={businessModelOptions.map(
            (option) => ({
              value: option.value,
              label: option.label,
            }),
          )}
          selected={
            targetBusinessModels
          }
          onChange={(values) => {
            setTargetBusinessModels(
              values,
            );
            clearFieldError("businessModels");
          }}
          disabled={
            disabled ||
            taxonomyLoading
          }
        />

        {/* ------------------------------------------------
         * Business Types
         * ------------------------------------------------ */}

        <MultiSelect
          label="Preferred Business Types"
          required
          error={fieldErrors.businessTypes}
          options={
            BUSINESS_TYPE_OPTIONS
          }
          selected={
            targetBusinessTypes
          }
          onChange={(values) => {
            setTargetBusinessTypes(
              values,
            );
            clearFieldError("businessTypes");
          }}
          disabled={disabled}
        />

        {/* ------------------------------------------------
         * Preferred Regions
         * ------------------------------------------------ */}

        <div
          ref={locationWrapperRef}
          className="acquisition-preferences-section__field acquisition-preferences-section__location-field"
        >
          <label
            htmlFor="preferred-regions"
            className="acquisition-preferences-section__label"
          >
            Preferred Regions

            <span
              className="acquisition-preferences-section__required"
              aria-hidden="true"
            >
              *
            </span>
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
              onKeyDown={
                handleLocationKeyDown
              }
              onFocus={() => {
                if (
                  locationSearch
                    .trim()
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
              className="acquisition-preferences-section__input"
              aria-expanded={
                locationDropdownOpen
              }
              aria-autocomplete="list"
              aria-controls="preferred-regions-list"
              aria-invalid={Boolean(
                fieldErrors.preferredRegions,
              )}
            />

            {locationLoading && (
              <span className="acquisition-preferences-section__location-loading">
                Searching...
              </span>
            )}

            {locationDropdownOpen &&
              locationSearch
                .trim()
                .length >= 3 && (
                <div
                  id="preferred-regions-list"
                  className="acquisition-preferences-section__location-dropdown"
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
                          className={`acquisition-preferences-section__location-option ${
                            highlightedLocationIndex ===
                            index
                              ? "acquisition-preferences-section__location-option--highlighted"
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
          {fieldErrors.preferredRegions && (
            <p
              className="acquisition-preferences-section__field-error"
              role="alert"
            >
              {fieldErrors.preferredRegions}
            </p>
          )}

          {targetLocations.length >
            0 && (
            <div className="acquisition-preferences-section__pills">
              {targetLocations.map(
                (location) => (
                  <div
                    key={
                      location.place_id
                    }
                    className="acquisition-preferences-section__pill acquisition-preferences-section__location-pill"
                  >
                    <span>
                      {
                        location.display_name
                      }
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

        {/* ------------------------------------------------
         * Optional: Minimum Years
         * ------------------------------------------------ */}

        <div className="acquisition-preferences-section__field">
          <label
            htmlFor="minimum-years-in-operation"
            className="acquisition-preferences-section__label"
          >
            Minimum Years in Business
          </label>

          <input
            id="minimum-years-in-operation"
            type="number"
            min="0"
            step="1"
            value={
              minimumYearsInOperation
            }
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

        {/* ------------------------------------------------
         * Financial targets
         *
         * Ordered as natural pairs:
         * Minimum ARR -> Preferred ARR
         * Minimum SDE -> Preferred SDE
         * Maximum Purchase Budget
         * ------------------------------------------------ */}

        <FinancialAmountField
          id="minimum-arr"
          label="Minimum ARR"
          required
          value={minimumARR}
          error={fieldErrors.minimumARR}
          onChange={(value) => {
            setMinimumARR(value);
            clearFieldError("minimumARR");
            clearFieldError("preferredARR");
          }}
          disabled={disabled}
        />

        <FinancialAmountField
          id="preferred-arr"
          label="Preferred ARR"
          required
          helperText="Must be greater than Minimum ARR"
          value={preferredARR}
          error={fieldErrors.preferredARR}
          onChange={(value) => {
            setPreferredARR(value);
            clearFieldError("preferredARR");
          }}
          disabled={disabled}
        />

        <FinancialAmountField
          id="minimum-sde"
          label="Minimum SDE"
          required
          value={minimumSDE}
          error={fieldErrors.minimumSDE}
          onChange={(value) => {
            setMinimumSDE(value);
            clearFieldError("minimumSDE");
            clearFieldError("preferredSDE");
          }}
          disabled={disabled}
        />

        <FinancialAmountField
          id="preferred-sde"
          label="Preferred SDE"
          required
          helperText="Must be greater than Minimum SDE"
          value={preferredSDE}
          error={fieldErrors.preferredSDE}
          onChange={(value) => {
            setPreferredSDE(value);
            clearFieldError("preferredSDE");
          }}
          disabled={disabled}
        />

        <FinancialAmountField
          id="maximum-purchase-price"
          label="Maximum Purchase Budget"
          required
          value={maximumPurchasePrice}
          error={fieldErrors.maximumPurchasePrice}
          onChange={(value) => {
            setMaximumPurchasePrice(value);
            clearFieldError(
              "maximumPurchasePrice",
            );
          }}
          disabled={disabled}
        />

        {/* ------------------------------------------------
         * Preferred Owner Hours
         * ------------------------------------------------ */}

        <div className="acquisition-preferences-section__field">
          <label
            htmlFor="preferred-owner-hours"
            className="acquisition-preferences-section__label"
          >
            Preferred Owner Hours per Week

            <span
              className="acquisition-preferences-section__required"
              aria-hidden="true"
            >
              *
            </span>
          </label>

          <input
            id="preferred-owner-hours"
            type="number"
            min="0"
            max="168"
            step="1"
            value={preferredOwnerHoursPerWeek}
            onChange={(event) => {
              setPreferredOwnerHoursPerWeek(
                event.target.value,
              );
              clearFieldError("preferredOwnerHours");
            }}
            placeholder="Hours"
            disabled={disabled}
            className="acquisition-preferences-section__input"
            aria-invalid={Boolean(
              fieldErrors.preferredOwnerHours,
            )}
          />

          {fieldErrors.preferredOwnerHours && (
            <p
              className="acquisition-preferences-section__field-error"
              role="alert"
            >
              {fieldErrors.preferredOwnerHours}
            </p>
          )}
        </div>

        {/* ------------------------------------------------
         * Customer Concentration
         * ------------------------------------------------ */}

        <SingleSelect
          label="Customer concentration above 25%?"
          required
          error={fieldErrors.customerConcentration}
          value={
            customerConcentration ===
            "yes"
              ? "Yes"
              : customerConcentration ===
                  "no"
                ? "No"
                : ""
          }
          options={
            CUSTOMER_CONCENTRATION_OPTIONS
          }
          onChange={(value) => {
            setCustomerConcentration(
              value.toLowerCase() as CustomerConcentrationOption,
            );
            clearFieldError("customerConcentration");
          }}
          disabled={disabled}
        />

        {/* ------------------------------------------------
         * Seller Training
         * ------------------------------------------------ */}

        <SingleSelect
          label="Seller transition training"
          required
          error={fieldErrors.sellerTrainingDays}
          value={
            sellerTrainingDays
          }
          options={
            SELLER_TRAINING_OPTIONS
          }
          onChange={(value) => {
            setSellerTrainingDays(value);
            clearFieldError("sellerTrainingDays");
          }}
          disabled={disabled}
        />

        {/* ------------------------------------------------
         * Deal Preference
         * ------------------------------------------------ */}

        <SingleSelect
          label="Preferred deal structure"
          required
          error={fieldErrors.dealPreference}
          value={
            dealPreference ===
            "cash"
              ? "Cash"
              : dealPreference ===
                  "financing"
                ? "Financing"
                : dealPreference ===
                    "either"
                  ? "Either"
                  : ""
          }
          options={DEAL_PREFERENCE_OPTIONS.map(
            (option) =>
              option.label,
          )}
          onChange={(value) => {
            const selectedOption =
              DEAL_PREFERENCE_OPTIONS.find(
                (option) =>
                  option.label ===
                  value,
              );

            setDealPreference(
              selectedOption?.value ??
                "",
            );

            clearFieldError("dealPreference");
          }}
          disabled={disabled}
        />

        {/* ------------------------------------------------
         * Optional Real Estate Preference
         * ------------------------------------------------ */}

        <SingleSelect
          label="Real Estate Preference"
          value={
            realEstatePreference ===
            "included"
              ? "Included"
              : realEstatePreference ===
                  "lease"
                ? "Lease"
                : realEstatePreference ===
                    "either"
                  ? "Either"
                  : ""
          }
          options={[
            "Included",
            "Lease",
            "Either",
          ]}
          onChange={(value) => {
            const selectedOption =
              value === "Included"
                ? "included"
                : value === "Lease"
                  ? "lease"
                  : value ===
                      "Either"
                    ? "either"
                    : "";

            setRealEstatePreference(
              selectedOption,
            );
          }}
          disabled={disabled}
        />

        {/* ------------------------------------------------
         * Acquisition Timeline
         * ------------------------------------------------ */}

        <fieldset className="acquisition-preferences-section__group acquisition-preferences-section__group--timeline">
          <legend className="acquisition-preferences-section__label">
            Acquisition Timeline

            <span
              className="acquisition-preferences-section__required"
              aria-hidden="true"
            >
              *
            </span>
          </legend>

          <div className="acquisition-preferences-section__radio-grid">
            {timelineOptions.map(
              (option) => {
                const selected =
                  timeline ===
                  option.value;

                return (
                  <label
                    key={
                      option.value
                    }
                    className="acquisition-preferences-section__radio-option"
                  >
                    <input
                      type="radio"
                      name="acquisition-timeline"
                      value={
                        option.value
                      }
                      checked={
                        selected
                      }
                      onChange={() => {
                        setTimeline(
                          option.value,
                        );
                        clearFieldError("timeline");
                      }}
                      disabled={
                        disabled
                      }
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
              },
            )}
          </div>
          {fieldErrors.timeline && (
            <p
              className="acquisition-preferences-section__field-error"
              role="alert"
            >
              {fieldErrors.timeline}
            </p>
          )}
        </fieldset>
      </div>

      {/* ------------------------------------------------
       * Navigation
       * ------------------------------------------------ */}

      {showActions && (
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

          {mode ===
          "onboarding" ? (
            <button
              type="button"
              className="acquisition-preferences-section__navigation-button acquisition-preferences-section__navigation-button--save"
              onClick={handleContinue}
              disabled={disabled}
            >
              Save &amp; Continue
            </button>
          ) : (
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
          )}
        </div>
      )}
    </section>
  );
});

export default AcquisitionPreferencesSection;
