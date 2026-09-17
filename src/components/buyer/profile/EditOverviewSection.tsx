"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Search,
  X,
} from "lucide-react";

import ProfileAboutField from "./ProfileAboutField";
import type { ApiTargetLocation } from "@/lib/api/buyerPreferences.types";
import { searchLocations } from "@/lib/api/locations";

import "./EditOverviewSection.css";

interface EditOverviewSectionProps {
  initialAbout?: string;
  initialRegions?: ApiTargetLocation[];
  initialIndustries?: string[];
  onContinue?: (data: {
    about: string;
    regions: ApiTargetLocation[];
    industries: string[];
  }) => void;
  disabled?: boolean;
}

/*
 * =========================================
 * Industry Options
 * =========================================
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

/*
 * =========================================
 * Location Types
 * =========================================
 */

const LOCATION_RESULT_LIMIT = 8;

type LocationErrorMessage = string | null;


/*
 * =========================================
 * Normalize LocationIQ Result
 * =========================================
 */


/*
 * =========================================
 * Location Type
 * =========================================
 */

function getLocationType(
  suggestion: ApiTargetLocation,
): string {
  if (suggestion.city) {
    return "City";
  }

  if (suggestion.state) {
    return "State";
  }

  if (suggestion.county) {
    return "County";
  }

  return "Location";
}

/*
 * =========================================
 * Component
 * =========================================
 */

export default function EditOverviewSection({
  initialAbout =
    "Placeholder text for a longer response, spanning multiple lines.",

  initialRegions = [],

  initialIndustries = [],

  onContinue,

  disabled = false,
}: EditOverviewSectionProps) {
  /*
   * =========================================
   * About
   * =========================================
   */

  const [about, setAbout] =
    useState(initialAbout);

  /*
   * =========================================
   * Preferred Regions
   * =========================================
   */

  const [regions, setRegions] =
    useState<ApiTargetLocation[]>(initialRegions);

  const [regionSearch, setRegionSearch] =
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

  const [
    locationError,
    setLocationError,
  ] = useState<LocationErrorMessage>(null);

  const [
    highlightedLocationIndex,
    setHighlightedLocationIndex,
  ] = useState(-1);

  /*
   * =========================================
   * Industries
   * =========================================
   */

  const [industries, setIndustries] =
    useState<string[]>(initialIndustries);

  const [
    industryDropdownOpen,
    setIndustryDropdownOpen,
  ] = useState(false);

  /*
   * =========================================
   * Refs
   * =========================================
   */

  const locationWrapperRef =
    useRef<HTMLDivElement>(null);

  const industryWrapperRef =
    useRef<HTMLDivElement>(null);

  /*
   * =========================================
   * Close Location Dropdown Outside
   * =========================================
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
   * =========================================
   * Close Industry Dropdown Outside
   * =========================================
   */

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent,
    ) => {
      if (
        industryWrapperRef.current &&
        !industryWrapperRef.current.contains(
          event.target as Node,
        )
      ) {
        setIndustryDropdownOpen(false);
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
   * =========================================
   * LocationIQ Autocomplete
   * =========================================
   */

  useEffect(() => {
    const query = regionSearch.trim();

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
          LOCATION_RESULT_LIMIT,
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
}, [regionSearch]);

  /*
   * =========================================
   * Location Input Change
   * =========================================
   */

  const handleLocationInputChange = (
    value: string,
  ) => {
    if (disabled) {
      return;
    }

    setRegionSearch(value);

    setLocationDropdownOpen(
      value.trim().length >= 3,
    );

    setHighlightedLocationIndex(
      -1,
    );
  };

  /*
   * =========================================
   * Select Location
   * =========================================
   */

  const handleSelectLocation = (
    suggestion: ApiTargetLocation,
  ) => {
    if (disabled) {
      return;
    }

    const value =
      suggestion.display_name.trim();

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
      !regions.some(
        (region) =>
          region.place_id ===
          suggestion.place_id,
      )
    ) {
      setRegions((current) => [
        ...current,
        suggestion,
      ]);
    }

    setRegionSearch("");
    setLocationSuggestions([]);
    setLocationDropdownOpen(false);
    setHighlightedLocationIndex(-1);
  };
  /*
   * =========================================
   * Remove Region
   * =========================================
   */

  const handleRemoveRegion = (
    placeId: string,
  ) => {
    if (disabled) {
      return;
    }

    setRegions((current) =>
      current.filter(
        (item) => item.place_id !== placeId,
      ),
    );
  };

  /*
   * =========================================
   * Location Keyboard Navigation
   * =========================================
   */

  const handleLocationKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (disabled) {
      return;
    }

    /*
     * Arrow Down
     */

    if (
      event.key === "ArrowDown"
    ) {
      event.preventDefault();

      if (
        locationSuggestions.length ===
        0
      ) {
        return;
      }

      setLocationDropdownOpen(true);

      setHighlightedLocationIndex(
        (current) =>
          current >=
          locationSuggestions.length -
            1
            ? 0
            : current + 1,
      );

      return;
    }

    /*
     * Arrow Up
     */

    if (
      event.key === "ArrowUp"
    ) {
      event.preventDefault();

      if (
        locationSuggestions.length ===
        0
      ) {
        return;
      }

      setHighlightedLocationIndex(
        (current) =>
          current <= 0
            ? locationSuggestions.length -
              1
            : current - 1,
      );

      return;
    }

    /*
     * Enter
     */

    if (
      event.key === "Enter"
    ) {
      if (
        highlightedLocationIndex >=
          0 &&
        highlightedLocationIndex <
          locationSuggestions.length
      ) {
        event.preventDefault();

        handleSelectLocation(
          locationSuggestions[
            highlightedLocationIndex
          ],
        );
      }

      return;
    }

    /*
     * Escape
     */

    if (
      event.key === "Escape"
    ) {
      event.preventDefault();

      setLocationDropdownOpen(
        false,
      );

      setHighlightedLocationIndex(
        -1,
      );
    }
  };

  /*
   * =========================================
   * Toggle Industry
   * =========================================
   */

  const handleToggleIndustry = (
    industry: string,
  ) => {
    if (disabled) {
      return;
    }

    setIndustries((current) => {
      if (current.includes(industry)) {
        return current.filter(
          (item) =>
            item !== industry,
        );
      }

      return [
        ...current,
        industry,
      ];
    });
  };

  /*
   * =========================================
   * Remove Industry
   * =========================================
   */

  const handleRemoveIndustry = (
    value: string,
  ) => {
    if (disabled) {
      return;
    }

    setIndustries((current) =>
      current.filter(
        (item) => item !== value,
      ),
    );
  };

  /*
   * =========================================
   * Continue
   * =========================================
   */

  const handleContinue = () => {
    onContinue?.({
      about,
      regions,
      industries,
    });
  };

  /*
   * =========================================
   * Render
   * =========================================
   */

  return (
    <section className="edit-overview-section">

      <div className="edit-overview-section__fields">

        {/* =====================================
            ABOUT
            ===================================== */}

        <ProfileAboutField
          value={about}
          onChange={setAbout}
          disabled={disabled}
        />

        {/* =====================================
            PREFERRED REGIONS
            ===================================== */}

        <div
          className="location-select"
          ref={locationWrapperRef}
        >
          <label
            htmlFor="preferred-regions"
            className="location-select__label"
          >
            Preferred Regions
          </label>

          <div className="location-select__control">
            <div
              className={`location-select__input-wrapper ${
                locationDropdownOpen
                  ? "location-select__input-wrapper--open"
                  : ""
              }`}
            >
            <input
              id="preferred-regions"
              type="text"
              value={regionSearch}
              onChange={(event) =>
                handleLocationInputChange(
                  event.target.value,
                )
              }
              onFocus={() => {
                if (
                  regionSearch.trim()
                    .length >= 3
                ) {
                  setLocationDropdownOpen(
                    true,
                  );
                }
              }}
              onKeyDown={
                handleLocationKeyDown
              }
              placeholder="Search location"
              disabled={disabled}
              autoComplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={
                locationDropdownOpen
              }
              aria-controls="preferred-regions-listbox"
              aria-activedescendant={
                highlightedLocationIndex >=
                0
                  ? `location-option-${highlightedLocationIndex}`
                  : undefined
              }
            />

            {locationLoading ? (
              <Loader2
                size={13}
                strokeWidth={1.5}
                className="location-select__icon location-select__icon--loading"
                aria-hidden="true"
              />
            ) : (
              <Search
                size={13}
                strokeWidth={1.5}
                className="location-select__icon"
                aria-hidden="true"
              />
              )}
            </div>

            {/* =====================================
                LOCATION RESULTS
              ===================================== */}

          {locationDropdownOpen && (
            <div
              id="preferred-regions-listbox"
              className="location-select__dropdown"
              role="listbox"
            >

              {/* Loading */}

              {locationLoading && (
                <div className="location-select__message">
                  Searching locations...
                </div>
              )}

              {/* Error */}

              {!locationLoading &&
                locationError && (
                  <div className="location-select__message location-select__message--error">
                    {locationError}
                  </div>
                )}

              {/* Empty */}

              {!locationLoading &&
                !locationError &&
                locationSuggestions.length ===
                  0 &&
                regionSearch.trim()
                  .length >= 3 && (
                  <div className="location-select__message">
                    No matching US
                    locations found.
                  </div>
                )}

              {/* Results */}

              {!locationLoading &&
                !locationError &&
                locationSuggestions.map(
                  (
                    suggestion,
                    index,
                  ) => (
                    <button
                      key={
                        suggestion.place_id
                      }
                      id={`location-option-${index}`}
                      type="button"
                      className={`location-select__option ${
                        highlightedLocationIndex ===
                        index
                          ? "location-select__option--highlighted"
                          : ""
                      }`}
                      onMouseDown={(
                        event,
                      ) => {
                        event.preventDefault();
                      }}
                      onClick={() =>
                        handleSelectLocation(
                          suggestion,
                        )
                      }
                      role="option"
                      aria-selected={
                        highlightedLocationIndex ===
                        index
                      }
                    >
                      <span className="location-select__option-content">

                        <span className="location-select__option-name">
                          {
                            suggestion.display_name
                          }
                        </span>

                        <span className="location-select__option-type">
                          {getLocationType(
                            suggestion,
                          )}
                        </span>

                      </span>
                    </button>
                  ),
                )}

              </div>
            )}
          </div>

          {/* =====================================
              SELECTED LOCATION PILLS
              ===================================== */}

          {regions.length > 0 && (
            <div className="location-select__pills">
              {regions.map(
                (region) => (
                  <div
                    key={region.place_id}
                    className="location-select__pill"
                  >
                    <span>
                      {region.display_name}
                    </span>

                    <button
                      type="button"
                      className="location-select__pill-remove"
                      onClick={() =>
                        handleRemoveRegion(
                          region.place_id,
                        )
                      }
                      disabled={
                        disabled
                      }
                      aria-label={`Remove ${region.display_name}`}
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

        {/* =====================================
            INDUSTRIES OF INTEREST
            ===================================== */}

        <div
          className="industry-select"
          ref={industryWrapperRef}
        >
          <label className="industry-select__label">
            Which industries are you interested in?
          </label>

          {/* ===================================
              INDUSTRY TRIGGER
              =================================== */}

          <div className="industry-select__control">
            <button
            type="button"
            className={`industry-select__trigger ${
              industryDropdownOpen
                ? "industry-select__trigger--open"
                : ""
            }`}
            onClick={() =>
              setIndustryDropdownOpen(
                (current) => !current,
              )
            }
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={
              industryDropdownOpen
            }
          >
            <span className="industry-select__placeholder">
              Select all that apply
            </span>

            <ChevronDown
              size={10}
              strokeWidth={1.5}
              className={`industry-select__chevron ${
                industryDropdownOpen
                  ? "industry-select__chevron--open"
                  : ""
              }`}
              aria-hidden="true"
            />
            </button>

            {/* ===================================
                INDUSTRY DROPDOWN
              =================================== */}

          {industryDropdownOpen && (
            <div
              className="industry-select__dropdown"
              role="listbox"
              aria-multiselectable="true"
            >
              {INDUSTRY_OPTIONS.map(
                (industry) => {
                  const isSelected =
                    industries.includes(
                      industry,
                    );

                  return (
                    <button
                      key={industry}
                      type="button"
                      className={`industry-select__option ${
                        isSelected
                          ? "industry-select__option--selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleToggleIndustry(
                          industry,
                        )
                      }
                      role="option"
                      aria-selected={
                        isSelected
                      }
                    >
                      <span>
                        {industry}
                      </span>

                      {isSelected && (
                        <span
                          className="industry-select__check"
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                },
              )}
              </div>
            )}
          </div>

          {/* ===================================
              SELECTED INDUSTRY PILLS
              =================================== */}

          {industries.length > 0 && (
            <div className="industry-select__pills">
              {industries.map(
                (industry) => (
                  <div
                    key={industry}
                    className="industry-select__pill"
                  >
                    <span>
                      {industry}
                    </span>

                    <button
                      type="button"
                      className="industry-select__pill-remove"
                      onClick={() =>
                        handleRemoveIndustry(
                          industry,
                        )
                      }
                      disabled={
                        disabled
                      }
                      aria-label={`Remove ${industry}`}
                    >
                      <X
                        size={10}
                        strokeWidth={1.5}
                      />
                    </button>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

      </div>

      {/* =====================================
          CONTINUE BUTTON
          ===================================== */}

      <div className="edit-overview-section__continue">
        <button
          type="button"
          className="edit-overview-section__continue-button"
          onClick={
            handleContinue
          }
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