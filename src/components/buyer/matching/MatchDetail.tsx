"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import MatchExplanation from "./MatchExplanation";
import WarmIntroductionTrigger from "@/components/buyer/introduction/WarmIntroductionTrigger";
import {
  createNdaSigningSession,
  getNdaForMatch,
  getOrInitializeNdaForMatch,
} from "@/lib/api/nda/nda";
import type { NdaAccessResponse } from "@/lib/api/nda/nda.types";

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

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
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
    matchId,
    business,
    match,
    highlights,
    financialVerification,
    ndaRequired,
  } = data;

  const [ndaAccess, setNdaAccess] =
    useState<NdaAccessResponse | null>(null);
  const [isNdaLoading, setIsNdaLoading] =
    useState(true);
  const [isSigningSessionLoading, setIsSigningSessionLoading] =
    useState(false);
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

  const isNdaCompleted = ndaAccess?.completed ?? false;
  const currentUserHasSigned =
    ndaAccess?.current_user_has_signed ?? false;
  const locked = ndaRequired && !isNdaCompleted;

  const refreshNda = useCallback(
    async (): Promise<NdaAccessResponse | null> => {
      try {
        const access = await getNdaForMatch(matchId);
        setNdaAccess(access);
        setNdaError("");
        return access;
      } catch {
        setNdaAccess(null);
        setNdaError("");
        return null;
      } finally {
        setIsNdaLoading(false);
      }
    },
    [matchId],
  );

  useEffect(() => {
    let isActive = true;

    getNdaForMatch(matchId)
      .then((access) => {
        if (!isActive) {
          return;
        }

        setNdaAccess(access);
        setNdaError("");
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setNdaAccess(null);
        setNdaError("");
      })
      .finally(() => {
        if (isActive) {
          setIsNdaLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [matchId]);

  useEffect(() => {
    function refreshAfterSigning() {
      void refreshNda();
    }

    window.addEventListener("focus", refreshAfterSigning);

    return () => {
      window.removeEventListener(
        "focus",
        refreshAfterSigning,
      );
    };
  }, [refreshNda]);

  async function openNda() {
    if (isSigningSessionLoading) {
      return;
    }

    setNdaError("");

    let access = ndaAccess;

    if (!access) {
      setIsNdaLoading(true);

      try {
        access = await getOrInitializeNdaForMatch(matchId);
        setNdaAccess(access);
      } catch (error) {
        setNdaError(
          error instanceof Error
            ? error.message
            : "Unable to initialize the NDA.",
        );
        return;
      } finally {
        setIsNdaLoading(false);
      }
    }

    if (access.completed) {
      return;
    }

    if (access.current_user_has_signed) {
      setNdaError(
        "Your NDA signature has been received. Waiting for the other party to sign.",
      );
      return;
    }

    const signingWindow = window.open("", "_blank");

    if (!signingWindow) {
      setNdaError(
        "Please allow pop-ups to open the secure signing session.",
      );
      return;
    }

    signingWindow.opener = null;
    setIsSigningSessionLoading(true);

    try {
      const session = await createNdaSigningSession(
        access.nda.id,
      );

      signingWindow.location.href = session.signing_url;
    } catch (error) {
      signingWindow.close();

      setNdaError(
        error instanceof Error
          ? error.message
          : "Unable to start the secure signing session.",
      );
    } finally {
      setIsSigningSessionLoading(false);
    }
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

        {isNdaCompleted && (
          <section
            className="match-detail__nda-success"
            role="status"
          >
            <ShieldCheck size={25} />

            <div>
              <h2>NDA completed successfully</h2>
              <p>
                Business details are now available to view.
                You can continue reviewing the match and
                request an introduction.
              </p>
            </div>
          </section>
        )}

        {currentUserHasSigned && !isNdaCompleted && (
          <section
            className="match-detail__nda-success"
            role="status"
          >
            <ShieldCheck size={25} />

            <div>
              <h2>Your NDA signature was received</h2>
              <p>
                The confidential profile will unlock after
                the other party completes their signature.
              </p>
            </div>
          </section>
        )}

        {ndaError && (
          <p
            className="match-detail__nda-error"
            role="alert"
          >
            {ndaError}
          </p>
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
                onNdaRequired={() => {
                  void openNda();
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

        <MatchExplanation key={data.matchId} matchId={data.matchId} />

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

            <button
              type="button"
              disabled={
                isNdaLoading ||
                isSigningSessionLoading ||
                currentUserHasSigned
              }
              onClick={() => {
                void openNda();
              }}
            >
              {isNdaLoading
                ? "Loading NDA..."
                : isSigningSessionLoading
                  ? "Opening secure signing..."
                  : currentUserHasSigned
                    ? "Waiting for Seller Signature"
                    : "Sign NDA to Unblock"}
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

            <section className="match-detail__financial-section">
              <h2>Finances</h2>

              <div className="match-detail__finance-card">
                <dl className="match-detail__finance-list">
                  <div>
                    <dt>Annual Revenue</dt>
                    <dd>
                      {formatRevenueRange(
                        business.annualRevenueMin,
                        business.annualRevenueMax,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>Annual Profit (SDE)</dt>
                    <dd>
                      {formatCurrency(
                        business.annualProfit,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>Asking Price</dt>
                    <dd>
                      {formatCurrency(
                        business.askingPrice,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>Years in Operation</dt>
                    <dd>
                      {business.yearsInOperation !== null
                        ? `${business.yearsInOperation} years`
                        : "N/A"}
                    </dd>
                  </div>
                </dl>

                <div className="match-detail__profit-margin">
                  <div>
                    <span>Est. profit margin</span>
                    <strong>
                      {business.estimatedProfitMargin !== null
                        ? `~${business.estimatedProfitMargin}%`
                        : "N/A"}
                    </strong>
                  </div>

                  <div
                    className="match-detail__profit-margin-track"
                    aria-hidden="true"
                  >
                    <span
                      style={{
                        width:
                          business.estimatedProfitMargin !==
                          null
                            ? `${Math.min(
                                business.estimatedProfitMargin,
                                100,
                              )}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="match-detail__financial-metrics">
              <div className="match-detail__financial-metrics-heading">
                <h2>Financial Document Metrics</h2>

                {financialVerification.status ===
                  "verified" && (
                  <span className="match-detail__verified-badge">
                    <ShieldCheck size={14} />
                    Verified Financials
                  </span>
                )}
              </div>

              {financialVerification.status ===
              "verified" ? (
                <div className="match-detail__metrics-table-wrapper">
                  <table className="match-detail__metrics-table">
                    <thead>
                      <tr>
                        <th scope="col">
                          Financial Metrics
                        </th>

                        {financialVerification.periods.map(
                          (period) => (
                            <th
                              key={period.fiscalYear}
                              scope="col"
                            >
                              {period.fiscalYear}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <th scope="row">Revenue</th>

                        {financialVerification.periods.map(
                          (period) => (
                            <td key={period.fiscalYear}>
                              {formatCompactCurrency(
                                period.revenue,
                              )}
                            </td>
                          ),
                        )}
                      </tr>

                      <tr>
                        <th scope="row">SDE</th>

                        {financialVerification.periods.map(
                          (period) => (
                            <td key={period.fiscalYear}>
                              {formatCompactCurrency(
                                period.sde,
                              )}
                            </td>
                          ),
                        )}
                      </tr>

                      <tr>
                        <th scope="row">SDE Margin</th>

                        {financialVerification.periods.map(
                          (period) => (
                            <td key={period.fiscalYear}>
                              {period.sdeMargin.toFixed(1)}%
                            </td>
                          ),
                        )}
                      </tr>

                      <tr>
                        <th scope="row">EBITDA Margin</th>

                        {financialVerification.periods.map(
                          (period) => (
                            <td key={period.fiscalYear}>
                              {period.ebitdaMargin.toFixed(
                                1,
                              )}
                              %
                            </td>
                          ),
                        )}
                      </tr>

                      <tr>
                        <th scope="row">Working Capital</th>

                        {financialVerification.periods.map(
                          (period) => (
                            <td key={period.fiscalYear}>
                              {formatCompactCurrency(
                                period.workingCapital,
                              )}
                            </td>
                          ),
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="match-detail__verification-lock">
                  <div className="match-detail__verification-lock-copy">
                    <span className="match-detail__verification-lock-icon">
                      <LockKeyhole size={20} />
                    </span>

                    <div>
                      <strong>
                        Unlock P&amp;L statements and tax
                        return details
                      </strong>

                      <span>
                        Complete your identity and financial
                        capacity verification to access
                        two-year financials.
                      </span>
                    </div>
                  </div>

                  <button type="button">
                    Finish Verification
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </div>

    </main>
  );
}
