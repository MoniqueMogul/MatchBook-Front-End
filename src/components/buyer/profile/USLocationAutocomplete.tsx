"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";

import type { ApiTargetLocation as TargetLocation } from "@/lib/api/buyerPreferences.types";
import { searchLocations } from "@/lib/api/locations";

import "./USLocationAutocomplete.css";

interface USLocationAutocompleteProps {
  label?: string;
  countryCode?: string | null;
  value: string;
  selectedLocations: TargetLocation[];
  onChange: (value: string) => void;
  onSelect: (location: TargetLocation) => void;
  onRemove: (placeId: string) => void;
  disabled?: boolean;
}

function formatLocationDetails(
  location: TargetLocation,
): string {
  const parts = [
    location.city,
    location.state,
    location.country,
  ].filter(Boolean);

  return parts.join(", ");
}

export default function USLocationAutocomplete({
  label = "Preferred Regions",
  countryCode = "us",
  value,
  selectedLocations,
  onChange,
  onSelect,
  onRemove,
  disabled = false,
}: USLocationAutocompleteProps) {
  const inputId = useId();
  const suggestionsId = `${inputId}-suggestions`;
  const [suggestions, setSuggestions] =
    useState<TargetLocation[]>([]);

  const [open, setOpen] =
    useState(false);

  const [searching, setSearching] =
    useState(false);

  const [searchError, setSearchError] =
    useState<string | null>(null);

  const containerRef =
    useRef<HTMLDivElement>(null);

  /*
   * ------------------------------------------------
   * Debounced backend search
   * ------------------------------------------------
   */
  useEffect(() => {
    const query = value.trim();

    if (query.length < 3 || disabled) {
      setSuggestions([]);
      setSearching(false);
      setOpen(false);
      return;
    }

    let cancelled = false;

    const timeout = window.setTimeout(
      async () => {
        try {
          setSearching(true);
          setSearchError(null);

          const results = await searchLocations(query);

          if (cancelled) {
            return;
          }

          /*
           * Backend uses LocationIQ.
           *
           * Only keep US locations on the
           * frontend as an additional safeguard.
           */
          const usResults =
            results.filter(
              (location) =>
                !countryCode || location.country_code?.toLowerCase() === countryCode.toLowerCase(),
            );

          /*
           * Don't show locations that have
           * already been selected.
           */
          const availableResults =
            usResults.filter(
              (location) =>
                !selectedLocations.some(
                  (selected) =>
                    selected.place_id ===
                    location.place_id,
                ),
            );

          setSuggestions(
            availableResults,
          );

          setOpen(
            availableResults.length > 0,
          );
        } catch (error) {
          if (cancelled) {
            return;
          }

          setSuggestions([]);
          setOpen(false);

          setSearchError(
            error instanceof Error
              ? error.message
              : "Unable to search locations.",
          );
        } finally {
          if (!cancelled) {
            setSearching(false);
          }
        }
      },
      350,
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [
    value,
    disabled,
    selectedLocations,
    countryCode,
  ]);

  /*
   * ------------------------------------------------
   * Close dropdown when clicking outside
   * ------------------------------------------------
   */
  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  /*
   * ------------------------------------------------
   * Select location
   * ------------------------------------------------
   */
  const handleSelect = (
    location: TargetLocation,
  ) => {
    onSelect(location);

    onChange("");

    setSuggestions([]);
    setOpen(false);
  };

  /*
   * ------------------------------------------------
   * Keyboard handling
   * ------------------------------------------------
   */
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="us-location-autocomplete"
    >
      <label htmlFor={inputId} className="us-location-autocomplete__label">
        {label}
      </label>

      <div className="us-location-autocomplete__details">
        <div
          className={`us-location-autocomplete__input-wrapper ${
            open
              ? "us-location-autocomplete__input-wrapper--open"
              : ""
          }`}
        >
          <input
            id={inputId}
            type="text"
            value={value}
            onChange={(event) => {
              onChange(event.target.value);

              if (
                event.target.value.trim()
                  .length >= 3
              ) {
                setOpen(true);
              }
            }}
            onFocus={() => {
              if (
                suggestions.length > 0
              ) {
                setOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search cities or states"
            disabled={
              disabled
            }
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={suggestionsId}
          />
        </div>

        {open && (
          <div
            id={suggestionsId}
            className="us-location-autocomplete__dropdown"
            role="listbox"
          >
            {searching && (
              <div className="us-location-autocomplete__status">
                Searching...
              </div>
            )}

            {!searching &&
              searchError && (
                <div className="us-location-autocomplete__status us-location-autocomplete__status--error">
                  {searchError}
                </div>
              )}

            {!searching &&
              !searchError &&
              suggestions.length ===
                0 &&
              value.trim().length >= 3 && (
                <div className="us-location-autocomplete__status">
                  No locations found.
                </div>
              )}

            {!searching &&
              suggestions.map(
                (location) => (
                  <button
                    key={
                      location.place_id
                    }
                    type="button"
                    className="us-location-autocomplete__option"
                    onMouseDown={(
                      event,
                    ) => {
                      /*
                       * Prevent the input from
                       * losing focus before the
                       * selection happens.
                       */
                      event.preventDefault();
                    }}
                    onClick={() =>
                      handleSelect(
                        location,
                      )
                    }
                    role="option"
                  >
                    <span className="us-location-autocomplete__option-name">
                      {
                        location.display_name
                      }
                    </span>

                    <span className="us-location-autocomplete__option-details">
                      {formatLocationDetails(
                        location,
                      )}
                    </span>
                  </button>
                ),
              )}
          </div>
        )}
      </div>

      {/* Selected location pills */}

      {selectedLocations.length >
        0 && (
        <div className="us-location-autocomplete__pills">
          {selectedLocations.map(
            (location) => (
              <div
                key={
                  location.place_id
                }
                className="us-location-autocomplete__pill"
                title={
                  location.display_name
                }
              >
                <span>
                  {location.display_name}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    onRemove(
                      location.place_id,
                    )
                  }
                  disabled={disabled}
                  aria-label={`Remove ${location.display_name}`}
                >
                  <X size={16} />
                </button>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}