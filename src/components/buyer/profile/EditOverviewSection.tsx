"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

import ProfileAboutField from "./ProfileAboutField";
import EditableSearchValue from "./EditableSearchValue";

import "./EditOverviewSection.css";

interface EditOverviewSectionProps {
  initialAbout?: string;
  initialRegions?: string[];
  initialIndustries?: string[];
  onContinue?: (data: {
    about: string;
    regions: string[];
    industries: string[];
  }) => void;
  disabled?: boolean;
}

export default function EditOverviewSection({
  initialAbout = "Placeholder text for a longer response, spanning multiple lines.",
  initialRegions = [
    "Location 1",
    "Location 2",
    "Location 3",
  ],
  initialIndustries = [
    "Industry 1",
    "Industry 2",
    "Industry 3",
  ],
  onContinue,
  disabled = false,
}: EditOverviewSectionProps) {
  const [about, setAbout] = useState(initialAbout);

  const [regions, setRegions] =
    useState<string[]>(initialRegions);
  const [regionSearch, setRegionSearch] = useState("");

  const [industries, setIndustries] =
    useState<string[]>(initialIndustries);
  const [industrySearch, setIndustrySearch] = useState("");

  const handleAddRegion = () => {
    const value = regionSearch.trim();

    if (!value || regions.includes(value)) {
      return;
    }

    setRegions((current) => [...current, value]);
    setRegionSearch("");
  };

  const handleRemoveRegion = (value: string) => {
    setRegions((current) =>
      current.filter((item) => item !== value),
    );
  };

  const handleAddIndustry = () => {
    const value = industrySearch.trim();

    if (!value || industries.includes(value)) {
      return;
    }

    setIndustries((current) => [...current, value]);
    setIndustrySearch("");
  };

  const handleRemoveIndustry = (value: string) => {
    setIndustries((current) =>
      current.filter((item) => item !== value),
    );
  };

  const handleContinue = () => {
    onContinue?.({
      about,
      regions,
      industries,
    });
  };

  return (
    <section className="edit-overview-section">
      <div className="edit-overview-section__fields">
        <ProfileAboutField
          value={about}
          onChange={setAbout}
          disabled={disabled}
        />

        <EditableSearchValue
          label="Preferred Regions"
          value={regionSearch}
          selectedValues={regions}
          onChange={setRegionSearch}
          onRemove={handleRemoveRegion}
          onAdd={handleAddRegion}
          disabled={disabled}
        />

        <EditableSearchValue
          label="Industries of Interest"
          value={industrySearch}
          selectedValues={industries}
          onChange={setIndustrySearch}
          onRemove={handleRemoveIndustry}
          onAdd={handleAddIndustry}
          disabled={disabled}
        />
      </div>

      <div className="edit-overview-section__continue">
        <button
          type="button"
          className="edit-overview-section__continue-button"
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