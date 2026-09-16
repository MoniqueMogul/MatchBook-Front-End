"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import "./IndustryExperienceSection.css";

/* =====================================================
   Types
   ===================================================== */

type BuyerType =
  | "first-time-buyer"
  | "experienced-business-owner"
  | "corporate-strategic-buyer"
  | "investor";

type WorkSituation =
  | "employed-full-time"
  | "employed-part-time"
  | "self-employed"
  | "business-owner"
  | "between-roles"
  | "retired";

interface IndustryExperienceData {
  buyerType: BuyerType;
  workSituation: WorkSituation;
  years: string;
  industries: string[];
  roles: string[];
}

interface IndustryExperienceSectionProps {
  initialBuyerType?: BuyerType;
  initialWorkSituation?: WorkSituation;
  initialIndustries?: string[];
  initialYears?: string;
  initialRoles?: string[];
  onBack?: () => void;
  onContinue?: (data: IndustryExperienceData) => void;
  disabled?: boolean;
}

/* =====================================================
   Preset option lists
   NOTE: hardcoded for now — swap with API data later.
   ===================================================== */

const BUYER_TYPE_OPTIONS: Array<{ value: BuyerType; label: string }> = [
  { value: "first-time-buyer", label: "First-time buyer" },
  { value: "experienced-business-owner", label: "Experienced Business Owner" },
  { value: "corporate-strategic-buyer", label: "Corporate/Strategic Buyer" },
  { value: "investor", label: "Investor" },
];

const WORK_SITUATION_OPTIONS: Array<{ value: WorkSituation; label: string }> = [
  { value: "employed-full-time", label: "Employed Full-Time" },
  { value: "employed-part-time", label: "Employed Part-Time" },
  { value: "self-employed", label: "Self-Employed" },
  { value: "business-owner", label: "Business Owner" },
  { value: "between-roles", label: "Between Roles" },
  { value: "retired", label: "Retired" },
];

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

const ROLE_OPTIONS = [
  "Owner/Founder",
  "General Manager",
  "Operations Manager",
  "Sale & Marketing",
  "Finance & Accounting",
  "Sales/Business Development",
  "Customer Service",
  "Human Resources/Staffing",
  "Other",
];

/* =====================================================
   Local component: RadioGroup
   ===================================================== */

interface RadioGroupProps<T extends string> {
  name: string;
  legend: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

function RadioGroup<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  disabled = false,
}: RadioGroupProps<T>) {
  return (
    <fieldset className="industry-experience-section__group">
      <legend className="industry-experience-section__label">{legend}</legend>

      <div className="industry-experience-section__radio-grid">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className="industry-experience-section__radio-option"
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                disabled={disabled}
                className="industry-experience-section__radio-input"
              />
              <span
                className={`industry-experience-section__radio ${
                  selected
                    ? "industry-experience-section__radio--selected"
                    : ""
                }`}
                aria-hidden="true"
              >
                {selected && (
                  <span className="industry-experience-section__radio-dot" />
                )}
              </span>
              <span className="industry-experience-section__radio-label">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* =====================================================
   Local component: MultiSelect
   ===================================================== */

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
    return () =>
      document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const toggleValue = (value: string) => {
    if (disabled) return;
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  };

  const removeValue = (value: string) => {
    if (disabled) return;
    onChange(selected.filter((item) => item !== value));
  };

  return (
    <div
      ref={wrapperRef}
      className="industry-experience-section__select-field"
    >
      <label className="industry-experience-section__label">{label}</label>

      <div className="industry-experience-section__select-wrap">
        <button
          type="button"
          className={`industry-experience-section__select-trigger ${
            open
              ? "industry-experience-section__select-trigger--open"
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
            className={`industry-experience-section__chevron ${
              open ? "industry-experience-section__chevron--open" : ""
            }`}
          />
        </button>

        {open && (
          <div className="industry-experience-section__dropdown">
            {options.map((option) => {
              const selectedOption = selected.includes(option);
              return (
                <label
                  key={option}
                  className={`industry-experience-section__dropdown-option ${
                    selectedOption
                      ? "industry-experience-section__dropdown-option--selected"
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
                  <span className="industry-experience-section__check">
                    {selectedOption ? "✓" : ""}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="industry-experience-section__pills">
          {selected.map((value) => (
            <div key={value} className="industry-experience-section__pill">
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

/* =====================================================
   Main section
   ===================================================== */

export default function IndustryExperienceSection({
  initialBuyerType = "first-time-buyer",
  initialWorkSituation = "employed-full-time",
  initialIndustries = [],
  initialYears = "",
  initialRoles = [],
  onBack,
  onContinue,
  disabled = false,
}: IndustryExperienceSectionProps) {
  const [buyerType, setBuyerType] = useState<BuyerType>(initialBuyerType);
  const [workSituation, setWorkSituation] =
    useState<WorkSituation>(initialWorkSituation);
  const [years, setYears] = useState(initialYears);
  const [industries, setIndustries] = useState<string[]>(initialIndustries);
  const [roles, setRoles] = useState<string[]>(initialRoles);

  const handleContinue = () => {
    onContinue?.({
      buyerType,
      workSituation,
      years,
      industries,
      roles,
    });
  };

  return (
    <section className="industry-experience-section">
      <div className="industry-experience-section__fields">
        {/* Buyer type */}
        <RadioGroup<BuyerType>
          name="buyer-type"
          legend="What best describes you as a buyer?"
          options={BUYER_TYPE_OPTIONS}
          value={buyerType}
          onChange={setBuyerType}
          disabled={disabled}
        />

        {/* Years of experience */}
        <div className="industry-experience-section__field industry-experience-section__field--years">
          <label
            htmlFor="industry-experience-years"
            className="industry-experience-section__label"
          >
            Years of Experience as Business Owner
          </label>
          <input
            id="industry-experience-years"
            type="text"
            value={years}
            onChange={(event) => setYears(event.target.value)}
            placeholder="Years"
            disabled={disabled}
            className="industry-experience-section__years-input"
          />
        </div>

        {/* Work situation */}
        <RadioGroup<WorkSituation>
          name="work-situation"
          legend="What best describes your current work situation?"
          options={WORK_SITUATION_OPTIONS}
          value={workSituation}
          onChange={setWorkSituation}
          disabled={disabled}
        />

        {/* Industries */}
        <MultiSelect
          label="Which industries do you have experience in?"
          options={INDUSTRY_OPTIONS}
          selected={industries}
          onChange={setIndustries}
          disabled={disabled}
        />

        {/* Roles */}
        <MultiSelect
          label="What roles do you have experience with?"
          options={ROLE_OPTIONS}
          selected={roles}
          onChange={setRoles}
          disabled={disabled}
        />
      </div>

      {/* Navigation */}
      <div className="industry-experience-section__navigation">
        <button
          type="button"
          className="industry-experience-section__navigation-button"
          onClick={onBack}
          disabled={disabled}
          aria-label="Go back to overview"
        >
          <ChevronLeft size={32} strokeWidth={1.5} />
        </button>

        <button
          type="button"
          className="industry-experience-section__navigation-button"
          onClick={handleContinue}
          disabled={disabled}
          aria-label="Continue to next profile section"
        >
          <ChevronRight size={32} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}