"use client";

import React from "react";
import "./AcquisitionPreferencesPreview.css";

export interface AcquisitionPreferencesPreviewData {
  industries?: string[];

  subIndustries?: string[];

  businessModels?: string[];

  businessTypes?: string[];

  targetLocations?: Array<{
    display_name?: string | null;
    place_id?: string | null;
  }>;

  minimumYearsInOperation?: number | null;
  minimumARR?: number | null;
  minimumSDE?: number | null;
  maximumPurchasePrice?: number | null;

  preferredARR?: number | null;
  preferredSDE?: number | null;
  preferredOwnerHoursPerWeek?: number | null;

  customerConcentration?: boolean | null;
  sellerTrainingDays?: number | null;

  dealPreference?:
    | "cash"
    | "financing"
    | "either"
    | null;

  realEstatePreference?:
    | "included"
    | "lease"
    | "either"
    | null;

  timeline?:
    | "exploring"
    | "within-1-12"
    | "within-12-24"
    | "within-24-plus"
    | null;
}

interface AcquisitionPreferencesPreviewProps {
  data?: AcquisitionPreferencesPreviewData;
}

function formatCurrency(value?: number | null): string {
  if (value === null || value === undefined) {
    return "Not specified";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value?: number | null): string {
  if (value === null || value === undefined) {
    return "Not specified";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

function formatDealPreference(
  value?:
    | "cash"
    | "financing"
    | "either"
    | null,
): string {
  switch (value) {
    case "cash":
      return "Cash";

    case "financing":
      return "Financing";

    case "either":
      return "Either";

    default:
      return "Not specified";
  }
}

function formatRealEstatePreference(
  value?:
    | "included"
    | "lease"
    | "either"
    | null,
): string {
  switch (value) {
    case "included":
      return "Included";

    case "lease":
      return "Lease";

    case "either":
      return "Either";

    default:
      return "Not specified";
  }
}

function formatTimeline(
  value?:
    | "exploring"
    | "within-1-12"
    | "within-12-24"
    | "within-24-plus"
    | null,
): string {
  switch (value) {
    case "exploring":
      return "Exploring";

    case "within-1-12":
      return "Within 1–12 months";

    case "within-12-24":
      return "Within 12–24 months";

    case "within-24-plus":
      return "24+ months";

    default:
      return "Not specified";
  }
}

function renderPills(values: string[]) {
  if (values.length === 0) {
    return (
      <span className="acquisition-preferences-preview__value">
        Not specified
      </span>
    );
  }

  return (
    <div className="acquisition-preferences-preview__pills">
      {values.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className="acquisition-preferences-preview__pill"
        >
          {value}
        </span>
      ))}
    </div>
  );
}

export default function AcquisitionPreferencesPreview({
  data,
}: AcquisitionPreferencesPreviewProps) {
  const previewData =
    data ?? {};

  const industries =
    previewData.industries ?? [];

  const subIndustries =
    previewData.subIndustries ?? [];

  const businessModels =
    previewData.businessModels ?? [];

  const businessTypes =
    previewData.businessTypes ?? [];

  const targetLocations =
    previewData.targetLocations ?? [];

  return (
    <div className="acquisition-preferences-preview">

      {/* Industries of Interest */}

      <div className="acquisition-preferences-preview__section">
        <h2 className="acquisition-preferences-preview__title">
          Industries of Interest
        </h2>

        {renderPills(industries)}
      </div>

      {/* Sub-industries */}

      <div className="acquisition-preferences-preview__section">
        <h2 className="acquisition-preferences-preview__title">
          Sub-industries
        </h2>

        {renderPills(subIndustries)}
      </div>

      {/* Business Models */}

      <div className="acquisition-preferences-preview__section">
        <h2 className="acquisition-preferences-preview__title">
          Preferred Business Models
        </h2>

        {renderPills(businessModels)}
      </div>

      {/* Business Types */}

      <div className="acquisition-preferences-preview__section">
        <h2 className="acquisition-preferences-preview__title">
          Preferred Business Types
        </h2>

        {renderPills(businessTypes)}
      </div>

      {/* Preferred Regions */}

      <div className="acquisition-preferences-preview__section">
        <h2 className="acquisition-preferences-preview__title">
          Preferred Regions
        </h2>

        {targetLocations.length > 0 ? (
          <div className="acquisition-preferences-preview__pills">
            {targetLocations.map((location, index) => (
              <span
                key={
                  location.place_id ??
                  `${location.display_name ?? "location"}-${index}`
                }
                className="acquisition-preferences-preview__pill"
              >
                {location.display_name || "Location"}
              </span>
            ))}
          </div>
        ) : (
          <span className="acquisition-preferences-preview__value">
            Not specified
          </span>
        )}
      </div>

      {/* Business Requirements */}

      <div className="acquisition-preferences-preview__section">
        <h2 className="acquisition-preferences-preview__title">
          Business Requirements
        </h2>

        <div className="acquisition-preferences-preview__grid">

          <div className="acquisition-preferences-preview__item">
            <span className="acquisition-preferences-preview__label">
              Minimum Years in Operation
            </span>

            <span className="acquisition-preferences-preview__value">
              {previewData.minimumYearsInOperation !==
                null &&
              previewData.minimumYearsInOperation !==
                undefined
                ? `${previewData.minimumYearsInOperation} years`
                : "Not specified"}
            </span>
          </div>

          <div className="acquisition-preferences-preview__item">
            <span className="acquisition-preferences-preview__label">
              Minimum ARR
            </span>

            <span className="acquisition-preferences-preview__value">
              {formatCurrency(
                previewData.minimumARR,
              )}
            </span>
          </div>

          <div className="acquisition-preferences-preview__item">
            <span className="acquisition-preferences-preview__label">
              Minimum SDE
            </span>

            <span className="acquisition-preferences-preview__value">
              {formatCurrency(
                previewData.minimumSDE,
              )}
            </span>
          </div>

          <div className="acquisition-preferences-preview__item">
            <span className="acquisition-preferences-preview__label">
              Maximum Purchase Price
            </span>

            <span className="acquisition-preferences-preview__value">
              {formatCurrency(
                previewData.maximumPurchasePrice,
              )}
            </span>
          </div>

        </div>
      </div>

      {/* Preferred Financial Profile */}

      <div className="acquisition-preferences-preview__section">
        <h2 className="acquisition-preferences-preview__title">
          Preferred Financial Profile
        </h2>

        <div className="acquisition-preferences-preview__grid">

          <div className="acquisition-preferences-preview__item">
            <span className="acquisition-preferences-preview__label">
              Preferred ARR
            </span>

            <span className="acquisition-preferences-preview__value">
              {formatCurrency(
                previewData.preferredARR,
              )}
            </span>
          </div>

          <div className="acquisition-preferences-preview__item">
            <span className="acquisition-preferences-preview__label">
              Preferred SDE
            </span>

            <span className="acquisition-preferences-preview__value">
              {formatCurrency(
                previewData.preferredSDE,
              )}
            </span>
          </div>

          <div className="acquisition-preferences-preview__item">
            <span className="acquisition-preferences-preview__label">
              Preferred Owner Hours / Week
            </span>

            <span className="acquisition-preferences-preview__value">
              {previewData.preferredOwnerHoursPerWeek !==
                null &&
              previewData.preferredOwnerHoursPerWeek !==
                undefined
                ? `${formatNumber(
                    previewData.preferredOwnerHoursPerWeek,
                  )} hours`
                : "Not specified"}
            </span>
          </div>

        </div>
      </div>

      {/* Other Preferences */}

      <div className="acquisition-preferences-preview__section">
        <h2 className="acquisition-preferences-preview__title">
          Other Preferences
        </h2>

        <div className="acquisition-preferences-preview__grid">

          <div className="acquisition-preferences-preview__item">
            <span className="acquisition-preferences-preview__label">
              Customer Concentration
            </span>

            <span className="acquisition-preferences-preview__value">
              {previewData.customerConcentration ===
                null ||
              previewData.customerConcentration ===
                undefined
                ? "Not specified"
                : previewData.customerConcentration
                  ? "Yes"
                  : "No"}
            </span>
          </div>

          <div className="acquisition-preferences-preview__item">
            <span className="acquisition-preferences-preview__label">
              Seller Training
            </span>

            <span className="acquisition-preferences-preview__value">
              {previewData.sellerTrainingDays !==
                null &&
              previewData.sellerTrainingDays !==
                undefined
                ? `${formatNumber(
                    previewData.sellerTrainingDays,
                  )} days`
                : "Not specified"}
            </span>
          </div>

          <div className="acquisition-preferences-preview__item">
            <span className="acquisition-preferences-preview__label">
              Deal Preference
            </span>

            <span className="acquisition-preferences-preview__value">
              {formatDealPreference(
                previewData.dealPreference,
              )}
            </span>
          </div>

          <div className="acquisition-preferences-preview__item">
            <span className="acquisition-preferences-preview__label">
              Real Estate Preference
            </span>

            <span className="acquisition-preferences-preview__value">
              {formatRealEstatePreference(
                previewData.realEstatePreference,
              )}
            </span>
          </div>

          <div className="acquisition-preferences-preview__item">
            <span className="acquisition-preferences-preview__label">
              Acquisition Timeline
            </span>

            <span className="acquisition-preferences-preview__value">
              {formatTimeline(
                previewData.timeline,
              )}
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}