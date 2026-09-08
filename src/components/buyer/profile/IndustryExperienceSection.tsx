"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

import EditablePill from "./EditablePill";

import "./IndustryExperienceSection.css";

interface IndustryExperienceSectionProps {
  initialIndustries?: string[];
  initialYears?: string;
  initialRoles?: string[];
  onBack?: () => void;
  onContinue?: (data: {
    industries: string[];
    years: string;
    roles: string[];
  }) => void;
  disabled?: boolean;
}

export default function IndustryExperienceSection({
  initialIndustries = [
    "Industry 1",
    "Industry 2",
    "Industry 3",
  ],
  initialYears = "",
  initialRoles = [
    "Role 1",
    "Role 2",
    "Role 3",
  ],
  onBack,
  onContinue,
  disabled = false,
}: IndustryExperienceSectionProps) {
  const [industries, setIndustries] =
    useState<string[]>(initialIndustries);

  const [industrySearch, setIndustrySearch] =
    useState("");

  const [years, setYears] =
    useState(initialYears);

  const [roles, setRoles] =
    useState<string[]>(initialRoles);

  const [roleSearch, setRoleSearch] =
    useState("");

  const handleAddIndustry = () => {
    const value = industrySearch.trim();

    if (!value || industries.includes(value)) {
      return;
    }

    setIndustries((current) => [
      ...current,
      value,
    ]);

    setIndustrySearch("");
  };

  const handleRemoveIndustry = (
    value: string,
  ) => {
    setIndustries((current) =>
      current.filter((item) => item !== value),
    );
  };

  const handleAddRole = () => {
    const value = roleSearch.trim();

    if (!value || roles.includes(value)) {
      return;
    }

    setRoles((current) => [
      ...current,
      value,
    ]);

    setRoleSearch("");
  };

  const handleRemoveRole = (
    value: string,
  ) => {
    setRoles((current) =>
      current.filter((item) => item !== value),
    );
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    onAdd: () => void,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onAdd();
    }
  };

  const handleContinue = () => {
    onContinue?.({
      industries,
      years,
      roles,
    });
  };

  return (
    <section className="industry-experience-section">
      <div className="industry-experience-section__fields">
        {/* Industries of Interest */}
        <div className="industry-experience-section__field">
          <label
            htmlFor="industry-experience-industries"
            className="industry-experience-section__label"
          >
            Industries of Interest
          </label>

          <div className="industry-experience-section__search">
            <input
              id="industry-experience-industries"
              type="text"
              value={industrySearch}
              onChange={(event) =>
                setIndustrySearch(event.target.value)
              }
              onKeyDown={(event) =>
                handleKeyDown(
                  event,
                  handleAddIndustry,
                )
              }
              placeholder="Placeholder Text"
              disabled={disabled}
              className="industry-experience-section__input"
            />

            <Search
            size={20}
            strokeWidth={1.5}
            />
          </div>

          <div className="industry-experience-section__pills">
            {industries.map((industry) => (
              <EditablePill
                key={industry}
                label={industry}
                onRemove={() =>
                  handleRemoveIndustry(industry)
                }
                disabled={disabled}
              />
            ))}
          </div>
        </div>

        {/* Years of Experience */}
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
            onChange={(event) =>
              setYears(event.target.value)
            }
            placeholder="Years"
            disabled={disabled}
            className="industry-experience-section__years-input"
          />
        </div>

        {/* Industry Experience Roles */}
        <div className="industry-experience-section__field">
          <label
            htmlFor="industry-experience-roles"
            className="industry-experience-section__label"
          >
            Industry Experience Roles
          </label>

          <div className="industry-experience-section__search">
            <input
              id="industry-experience-roles"
              type="text"
              value={roleSearch}
              onChange={(event) =>
                setRoleSearch(event.target.value)
              }
              onKeyDown={(event) =>
                handleKeyDown(
                  event,
                  handleAddRole,
                )
              }
              placeholder="Placeholder Text"
              disabled={disabled}
              className="industry-experience-section__input"
            />

            <Search
            size={20}
            strokeWidth={1.5}
            />
          </div>

          <div className="industry-experience-section__pills">
            {roles.map((role) => (
              <EditablePill
                key={role}
                label={role}
                onRemove={() =>
                  handleRemoveRole(role)
                }
                disabled={disabled}
              />
            ))}
          </div>
        </div>
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
          <ChevronLeft
            size={32}
            strokeWidth={1.5}
          />
        </button>

        <button
          type="button"
          className="industry-experience-section__navigation-button"
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