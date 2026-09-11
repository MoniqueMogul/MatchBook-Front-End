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

interface LocationSuggestion {
  id: string;
  displayName: string;
  city?: string;
  state?: string;
  stateCode?: string;
  county?: string;
  country?: string;
  countryCode?: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
}

interface LocationIQResult {
  place_id?: string | number;
  osm_id?: string | number;
  osm_type?: string;

  display_name?: string;
  display_place?: string;
  display_address?: string;

  lat?: string;
  lon?: string;

  type?: string;
  class?: string;

  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    locality?: string;
    borough?: string;
    city_district?: string;

    county?: string;

    state?: string;
    state_code?: string;

    postcode?: string;

    country?: string;
    country_code?: string;
  };
}

const LOCATION_RESULT_LIMIT = 8;

type LocationErrorMessage = string | null;

function getLocationErrorMessage(status: number): string {
  switch (status) {
    case 401:
      return "Location search authentication failed.";
    case 403:
      return "Location search is not authorized.";
    case 429:
      return "Location search limit reached. Please try again.";
    default:
      return status >= 500
        ? "Unable to load locations. Please try again."
        : "Unable to load locations. Please try again.";
  }
}

/*
 * =========================================
 * Normalize LocationIQ Result
 * =========================================
 */

function normalizeLocationResult(
  result: LocationIQResult,
): LocationSuggestion | null {
  const address = result.address ?? {};

  const city =
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.locality ??
    address.borough ??
    address.city_district;

  const state = address.state;

  const stateCode =
    address.state_code;

  const country =
    address.country ?? "United States";

  const countryCode =
    address.country_code?.toUpperCase() ?? "US";

  /*
   * Prefer a clean:
   *
   * City, ST, US
   *
   * instead of LocationIQ's long
   * raw display_name.
   */

  let displayName = "";

  if (city) {
    displayName = [
      city,
      stateCode || state,
      countryCode,
    ]
      .filter(Boolean)
      .join(", ");
  } else if (state) {
    displayName = [
      state,
      countryCode,
    ]
      .filter(Boolean)
      .join(", ");
  } else if (address.county) {
    displayName = [
      address.county,
      stateCode || state,
      countryCode,
    ]
      .filter(Boolean)
      .join(", ");
  } else {
    displayName =
      result.display_place ??
      result.display_name ??
      "";
  }

  if (!displayName) {
    return null;
  }

  return {
    id: String(
      result.place_id ??
        `${result.osm_type ?? "location"}-${
          result.osm_id ?? displayName
        }`,
    ),

    displayName,

    city,
    state,
    stateCode,

    county: address.county,

    country,
    countryCode,

    postcode: address.postcode,

    latitude: result.lat
      ? Number(result.lat)
      : undefined,

    longitude: result.lon
      ? Number(result.lon)
      : undefined,
  };
}

/*
 * =========================================
 * Location Type
 * =========================================
 */

function getLocationType(
  suggestion: LocationSuggestion,
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

  initialRegions = [
    "Location 1",
    "Location 2",
    "Location 3",
  ],

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
    useState<string[]>(initialRegions);

  const [regionSearch, setRegionSearch] =
    useState("");

  const [
    locationSuggestions,
    setLocationSuggestions,
  ] = useState<LocationSuggestion[]>([]);

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

  const abortControllerRef =
    useRef<AbortController | null>(null);

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
    const query =
      regionSearch.trim();

    /*
     * Don't search until at least
     * two characters are entered.
     */

    if (query.length < 2) {
      setLocationSuggestions([]);

      setLocationLoading(false);

      setLocationError(null);

      setLocationDropdownOpen(false);

      setHighlightedLocationIndex(-1);

      abortControllerRef.current?.abort();

      return;
    }

    const apiKey =
      process.env
        .NEXT_PUBLIC_LOCATIONIQ_API_KEY;

    if (!apiKey) {
      console.error(
        "NEXT_PUBLIC_LOCATIONIQ_API_KEY is not configured.",
      );

      setLocationSuggestions([]);

      setLocationLoading(false);

      setLocationError("Location search is not configured. Add NEXT_PUBLIC_LOCATIONIQ_API_KEY to your environment and restart the Next.js dev server.");

      setLocationDropdownOpen(true);

      return;
    }

    /*
     * Abort the previous request so
     * older responses cannot overwrite
     * newer searches.
     */

    const controller =
      new AbortController();

    abortControllerRef.current?.abort();

    abortControllerRef.current =
      controller;

    /*
     * Small debounce so LocationIQ
     * isn't called on every keystroke.
     */

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

            const params =
              new URLSearchParams({
                key: apiKey,

                q: query,

                format: "json",

                /*
                 * US only.
                 */
                countrycodes: "us",

                /*
                 * Only useful profile
                 * location types.
                 */
                layers:
                  "city,state,county",

                limit: String(
                  LOCATION_RESULT_LIMIT,
                ),

                normalizecity: "1",

                /*
                 * IMPORTANT:
                 * This key must be quoted
                 * because it contains a hyphen.
                 */
                "accept-language": "en",

                dedupe: "1",
              });

            const response =
              await fetch(
                `https://api.locationiq.com/v1/autocomplete?${params.toString()}`,
                {
                  method: "GET",

                  signal:
                    controller.signal,
                },
              );

            if (!response.ok) {
              const status = response.status;
              throw new Error(
                getLocationErrorMessage(status),
              );
            }

            const data = await response.json();

            if (
              controller.signal.aborted
            ) {
              return;
            }

            if (!Array.isArray(data)) {
              throw new Error(
                "Location search returned an unexpected response.",
              );
            }

            const results =
              data as LocationIQResult[];

            /*
             * Normalize the API response.
             */

            const normalizedResults =
              results
                .map(
                  normalizeLocationResult,
                )
                .filter(
                  (
                    item,
                  ): item is LocationSuggestion =>
                    item !== null,
                );

            /*
             * Remove duplicate display names.
             */

            const uniqueResults =
              normalizedResults.filter(
                (
                  item,
                  index,
                  array,
                ) =>
                  array.findIndex(
                    (candidate) =>
                      candidate.displayName.toLowerCase() ===
                      item.displayName.toLowerCase(),
                  ) === index,
              );

            /*
             * Cities first.
             * States second.
             * Counties third.
             */

            uniqueResults.sort(
              (a, b) => {
                const priority = (
                  suggestion: LocationSuggestion,
                ) => {
                  if (
                    suggestion.city
                  ) {
                    return 0;
                  }

                  if (
                    suggestion.state
                  ) {
                    return 1;
                  }

                  if (
                    suggestion.county
                  ) {
                    return 2;
                  }

                  return 3;
                };

                return (
                  priority(a) -
                  priority(b)
                );
              },
            );

            setLocationSuggestions(
              uniqueResults,
            );

            setLocationError(null);
          } catch (error) {
            /*
             * Aborted requests are expected
             * and should not show an error.
             */

            if (
              error instanceof
                DOMException &&
              error.name ===
                "AbortError"
            ) {
              return;
            }

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
            if (
              !controller.signal.aborted
            ) {
              setLocationLoading(false);
            }
          }
        },
        250,
      );

    return () => {
      window.clearTimeout(
        timeoutId,
      );

      controller.abort();
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
      value.trim().length >= 2,
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
    suggestion: LocationSuggestion,
  ) => {
    if (disabled) {
      return;
    }

    const value =
      suggestion.displayName.trim();

    if (!value) {
      return;
    }

    /*
     * Prevent duplicate selections.
     */

    if (!regions.includes(value)) {
      setRegions((current) => [
        ...current,
        value,
      ]);
    }

    /*
     * Reset search UI.
     */

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
    value: string,
  ) => {
    if (disabled) {
      return;
    }

    setRegions((current) =>
      current.filter(
        (item) => item !== value,
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
                    .length >= 2
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
                  .length >= 2 && (
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
                        suggestion.id
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
                            suggestion.displayName
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
                    key={region}
                    className="location-select__pill"
                  >
                    <span>
                      {region}
                    </span>

                    <button
                      type="button"
                      className="location-select__pill-remove"
                      onClick={() =>
                        handleRemoveRegion(
                          region,
                        )
                      }
                      disabled={
                        disabled
                      }
                      aria-label={`Remove ${region}`}
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