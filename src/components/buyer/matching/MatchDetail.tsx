"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  DollarSign,
  FileText,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";

import WarmIntroductionTrigger from "@/components/buyer/introduction/WarmIntroductionTrigger";

import type {
  BuyerMatchViewData,
  DimensionScore,
} from "@/lib/api/matching/matching.types";

import "./MatchDetail.css";

interface MatchDetailProps {
  data: BuyerMatchViewData;
}

function formatCurrency(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRevenueRange(
  min: number | null,
  max: number | null,
): string {
  if (min === null && max === null) {
    return "N/A";
  }

  if (min !== null && max !== null) {
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  }

  return formatCurrency(min ?? max);
}

function dimensionPercentage(
  dimension?: DimensionScore,
): number | null {
  if (!dimension) {
    return null;
  }

  const raw =
    dimension.score <= 1
      ? dimension.score * 100
      : dimension.score;

  return Math.round(raw);
}

export default function MatchDetail({
  data,
}: MatchDetailProps) {
  const {
    business,
    match,
    highlights,
    ndaRequired,
    ndaSigned,
  } = data;

  const [isNdaOpen, setIsNdaOpen] = useState(false);
  const [isNdaSigned, setIsNdaSigned] =
    useState(ndaSigned);
  const [hasAcceptedNda, setHasAcceptedNda] =
    useState(false);
  const [legalName, setLegalName] = useState("");
  const [ndaError, setNdaError] = useState("");

  const percentage =
    match.evaluation.percentage !== null
      ? Math.round(match.evaluation.percentage)
      : null;

  const dimensions = match.evaluation.dimensions;

  const matchDimensions = [
    {
      label: "Price Fit",
      value: dimensionPercentage(
        dimensions.purchase_price,
      ),
    },
    {
      label: "Geography",
      value: dimensionPercentage(
        dimensions.geography,
      ),
    },
    {
      label: "Industry",
      value: dimensionPercentage(
        dimensions.industry,
      ),
    },
    {
      label: "Profit / SDE Fit",
      value: dimensionPercentage(dimensions.sde),
    },
  ];

  const lockedSections = [
    {
      title: "Business Information",
      description:
        "Industry, acquisition type, years in operation, employees, and operational details.",
    },
    {
      title: "Sale Goals",
      description:
        "Seller timeline, reason for selling, and transition support.",
    },
    {
      title: "Lease & Assets",
      description:
        "Property type, lease terms, and included assets.",
    },
    {
      title: "Finances",
      description:
        "Revenue, profit, asking price, and profit margin.",
    },
    {
      title: "Financial Documents",
      description:
        "Tax returns, P&Ls, and lease agreements when available.",
    },
  ];

  const locked = ndaRequired && !isNdaSigned;

  function openNda() {
    setNdaError("");
    setIsNdaOpen(true);
  }

  function closeNda() {
    setIsNdaOpen(false);
    setNdaError("");
  }

  function signNda() {
    if (!hasAcceptedNda || !legalName.trim()) {
      setNdaError(
        "Confirm the agreement and enter your full legal name before signing.",
      );
      return;
    }

    setIsNdaSigned(true);
    setIsNdaOpen(false);
    setNdaError("");
  }

  return (
    <main className="match-detail">
      <div className="match-detail__container">
        <button
          type="button"
          className="match-detail__back"
          onClick={() => window.history.back()}
        >
          <ChevronLeft size={18} />
          Back to matches
        </button>

        {isNdaSigned && (
          <section
            className="match-detail__nda-success"
            role="status"
          >
            <ShieldCheck size={25} />

            <div>
              <h2>NDA signed successfully</h2>
              <p>
                Business details are now available to be
                viewed. The signed agreement will appear in
                your MatchBook Documents when backend NDA
                storage is connected.
              </p>
            </div>
          </section>
        )}

        <section className="match-detail__hero">
          <div className="match-detail__hero-image">
            {business.imageUrl ? (
              <img
                src={business.imageUrl}
                alt={business.name}
              />
            ) : (
              <div className="match-detail__hero-placeholder">
                <span>{business.name}</span>
              </div>
            )}
          </div>

          <div className="match-detail__hero-content">
            <div className="match-detail__hero-top">
              <div>
                <div className="match-detail__location">
                  <MapPin size={17} />
                  <span>
                    {business.city}, {business.state}
                  </span>
                </div>

                <h1>{business.name}</h1>

                <p className="match-detail__description">
                  {business.description}
                </p>
              </div>

              <WarmIntroductionTrigger
                business={business}
                matchPercentage={percentage}
                requiresNda={locked}
                onNdaSigned={() => {
                  setIsNdaSigned(true);
                  setNdaError("");
                }}
              />
            </div>

            <div className="match-detail__financial-summary">
              <div>
                <span>Asking Price</span>
                <strong>
                  {formatCurrency(business.askingPrice)}
                </strong>
              </div>

              <div>
                <span>Annual Revenue</span>
                <strong>
                  {formatRevenueRange(
                    business.annualRevenueMin,
                    business.annualRevenueMax,
                  )}
                </strong>
              </div>

              <div>
                <span>Annual Profit</span>
                <strong>
                  {formatCurrency(
                    business.annualProfit,
                  )}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className="match-detail__match-card">
          <div className="match-detail__match-header">
            <div>
              <p className="match-detail__eyebrow">
                Why you were matched
              </p>

              <h2>
                {percentage !== null
                  ? `${percentage}% Strong Match`
                  : "Strong Match"}
              </h2>

              <p>
                Your acquisition preferences align strongly
                with this business.
              </p>
            </div>

            <div className="match-detail__score-circle">
              <TrendingUp size={24} />
              <strong>
                {percentage !== null
                  ? `${percentage}%`
                  : "--"}
              </strong>
            </div>
          </div>

          <div className="match-detail__dimensions">
            {matchDimensions.map((dimension) => (
              <div
                className="match-detail__dimension"
                key={dimension.label}
              >
                <div className="match-detail__dimension-row">
                  <span>{dimension.label}</span>
                  <strong>
                    {dimension.value !== null
                      ? `${dimension.value}%`
                      : "N/A"}
                  </strong>
                </div>

                <div className="match-detail__progress-track">
                  <div
                    className="match-detail__progress-value"
                    style={{
                      width: `${dimension.value ?? 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="match-detail__section">
          <h2>Match Highlights</h2>

          <div className="match-detail__highlights">
            {highlights.map((highlight) => (
              <div
                key={highlight.label}
                className={`match-detail__highlight match-detail__highlight--${highlight.type}`}
              >
                <span className="match-detail__highlight-icon">
                  {highlight.type === "positive" ? (
                    <Check size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                </span>

                {highlight.label}
              </div>
            ))}
          </div>
        </section>

        {locked ? (
          <section className="match-detail__nda-lock">
            <div className="match-detail__nda-lock-heading">
              <div className="match-detail__nda-icon">
                <LockKeyhole size={30} />
              </div>

              <div>
                <h2>
                  The rest of this profile is under NDA
                </h2>
                <p>
                  Sign the NDA to unlock all other details
                  about the business.
                </p>
              </div>
            </div>

            <div className="match-detail__locked-sections">
              {lockedSections.map((section) => (
                <div
                  className="match-detail__locked-section"
                  key={section.title}
                >
                  <LockKeyhole size={15} />

                  <div>
                    <strong>{section.title}</strong>
                    <span>{section.description}</span>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={openNda}>
              Sign NDA to Unblock
            </button>
          </section>
        ) : (
          <>
            <section className="match-detail__section">
              <h2>Business Information</h2>

              <div className="match-detail__info-grid">
                <div>
                  <span>Industry</span>
                  <strong>{business.industry}</strong>
                </div>

                <div>
                  <span>Acquisition Type</span>
                  <strong>
                    {business.acquisitionType}
                  </strong>
                </div>

                <div>
                  <span>Years in Operation</span>
                  <strong>
                    {business.yearsInOperation ?? "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Employees</span>
                  <strong>
                    {business.employees ?? "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Owner Involvement</span>
                  <strong>
                    {business.ownerHoursPerWeek !== null
                      ? `${business.ownerHoursPerWeek} hrs/wk`
                      : "N/A"}
                  </strong>
                </div>
              </div>
            </section>

            <section className="match-detail__section">
              <h2>Sale Goals</h2>

              <div className="match-detail__info-grid">
                <div>
                  <span>Reason for Selling</span>
                  <strong>
                    {business.reasonForSelling}
                  </strong>
                </div>

                <div>
                  <span>Desired Timeline</span>
                  <strong>
                    {business.desiredTimeline}
                  </strong>
                </div>

                <div>
                  <span>Transition Support</span>
                  <strong>
                    {business.transitionSupport}
                  </strong>
                </div>
              </div>
            </section>

            <section className="match-detail__section">
              <h2>Lease &amp; Assets</h2>

              <div className="match-detail__info-grid">
                <div>
                  <span>Property</span>
                  <strong>
                    {business.propertyType}
                  </strong>
                </div>

                <div>
                  <span>Lease Term Remaining</span>
                  <strong>
                    {business.leaseTermRemaining}
                  </strong>
                </div>
              </div>

              <div className="match-detail__assets">
                <span>Included Assets</span>

                <div>
                  {business.includedAssets.map((asset) => (
                    <span
                      key={asset}
                      className="match-detail__asset-pill"
                    >
                      {asset}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="match-detail__section">
              <h2>Finances</h2>

              <div className="match-detail__finance-grid">
                <div>
                  <DollarSign size={20} />
                  <span>Asking Price</span>
                  <strong>
                    {formatCurrency(
                      business.askingPrice,
                    )}
                  </strong>
                </div>

                <div>
                  <TrendingUp size={20} />
                  <span>Annual Revenue</span>
                  <strong>
                    {formatRevenueRange(
                      business.annualRevenueMin,
                      business.annualRevenueMax,
                    )}
                  </strong>
                </div>

                <div>
                  <DollarSign size={20} />
                  <span>Annual Profit</span>
                  <strong>
                    {formatCurrency(
                      business.annualProfit,
                    )}
                  </strong>
                </div>

                <div>
                  <TrendingUp size={20} />
                  <span>Profit Margin</span>
                  <strong>
                    {business.estimatedProfitMargin !== null
                      ? `${business.estimatedProfitMargin}%`
                      : "N/A"}
                  </strong>
                </div>
              </div>
            </section>

            <section className="match-detail__section">
              <h2>Financial Documents</h2>

              <div className="match-detail__document-card">
                <FileText size={22} />

                <div>
                  <strong>
                    Confidential financial documents
                  </strong>
                  <span>
                    Documents will appear here when
                    available.
                  </span>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {isNdaOpen && (
        <div className="match-detail__modal-backdrop">
          <section
            className="match-detail__nda-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nda-modal-title"
          >
            <header className="match-detail__nda-modal-header">
              <div>
                <div className="match-detail__nda-title-row">
                  <h2 id="nda-modal-title">
                    MatchBook Platform Agreement
                  </h2>
                  <span>Legally Binding</span>
                </div>

                <p>
                  {business.name} • {business.city},{" "}
                  {business.state}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close NDA agreement"
                onClick={closeNda}
              >
                <X size={20} />
              </button>
            </header>

            <div className="match-detail__nda-scroll">
              <div className="match-detail__nda-notice">
                <strong>Frontend demonstration</strong>
                <p>
                  Approved MatchBook legal text and backend
                  persistence must be connected before
                  production use.
                </p>
              </div>

              <p>
                This agreement applies to the buyer and the
                selected target business. It includes the
                MatchBook platform terms and confidentiality
                requirements.
              </p>

              <div className="match-detail__nda-party-grid">
                <div>
                  <span>Buyer Name</span>
                  <strong>
                    To be pulled from buyer profile
                  </strong>
                </div>

                <div>
                  <span>Address</span>
                  <strong>
                    To be pulled from buyer profile
                  </strong>
                </div>

                <div>
                  <span>City / State / ZIP</span>
                  <strong>
                    To be pulled from buyer profile
                  </strong>
                </div>

                <div>
                  <span>Country</span>
                  <strong>
                    To be pulled from buyer profile
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    To be pulled from buyer profile
                  </strong>
                </div>

                <div>
                  <span>Phone / Cell</span>
                  <strong>
                    To be pulled from buyer profile
                  </strong>
                </div>

                <div>
                  <span>Target Business</span>
                  <strong>{business.name}</strong>
                </div>

                <div>
                  <span>Reference Number</span>
                  <strong>
                    To be supplied by backend
                  </strong>
                </div>

                <div>
                  <span>Business Category</span>
                  <strong>{business.industry}</strong>
                </div>
              </div>

              <h3>
                Part I — Assistance Fee Acknowledgment
              </h3>

              <ol>
                <li>
                  The approved agreement will define any
                  applicable platform or success-fee terms.
                </li>
                <li>
                  The approved agreement will define a
                  qualifying transaction and transaction
                  value.
                </li>
                <li>
                  The approved agreement will specify when
                  any obligation becomes due.
                </li>
              </ol>

              <h3>
                Part II — Non-Disclosure and
                Non-Circumvention Agreement
              </h3>

              <ol>
                <li>
                  Confidential business information must be
                  used only to evaluate the potential
                  acquisition.
                </li>
                <li>
                  Confidential information must not be
                  disclosed except as permitted by the
                  approved agreement.
                </li>
                <li>
                  Approved terms will define duration,
                  exclusions, remedies, governing law, and
                  electronic-signature requirements.
                </li>
              </ol>
            </div>

            <footer className="match-detail__nda-signature">
              <label className="match-detail__nda-checkbox">
                <input
                  type="checkbox"
                  checked={hasAcceptedNda}
                  onChange={(event) =>
                    setHasAcceptedNda(
                      event.target.checked,
                    )
                  }
                />

                <span>
                  I confirm that I have reviewed the
                  agreement and agree to continue with this
                  frontend demonstration.
                </span>
              </label>

              <div className="match-detail__nda-signing-row">
                <label>
                  Full Legal Name
                  <input
                    type="text"
                    value={legalName}
                    placeholder="Enter your full legal name"
                    onChange={(event) =>
                      setLegalName(event.target.value)
                    }
                  />
                </label>

                <div className="match-detail__signature-preview">
                  <span>Signature Preview</span>
                  <strong>
                    {legalName.trim() || "Your signature"}
                  </strong>
                </div>

                <div className="match-detail__security-log">
                  <ShieldCheck size={20} />
                  <div>
                    <strong>Security Log</strong>
                    <span>
                      Timestamp and IP will come from the
                      backend.
                    </span>
                  </div>
                </div>
              </div>

              {ndaError && (
                <p
                  className="match-detail__nda-error"
                  role="alert"
                >
                  {ndaError}
                </p>
              )}

              <button
                type="button"
                className="match-detail__nda-submit"
                onClick={signNda}
              >
                Sign NDA
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
