"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  DollarSign,
  MapPin,
  X,
} from "lucide-react";

import type { MatchBusinessDetails } from "@/lib/api/matching/matching.types";

import "./MessageBusinessModal.css";

interface MessageBusinessModalProps {
  business: MatchBusinessDetails;
  onClose: () => void;
}

type BusinessTab =
  | "overview"
  | "information"
  | "goals"
  | "assets"
  | "finances";

function formatCurrency(value: number | null): string {
  if (value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
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
    return `${formatCurrency(min)}–${formatCurrency(max)}`;
  }

  return formatCurrency(min ?? max);
}

export default function MessageBusinessModal({
  business,
  onClose,
}: MessageBusinessModalProps) {
  const [activeTab, setActiveTab] =
    useState<BusinessTab>("overview");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="message-business__backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="message-business__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-business-title"
      >
        <button
          type="button"
          className="message-business__close"
          aria-label="Close business details"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <div className="message-business__hero">
          {business.imageUrl ? (
            <img
              src={business.imageUrl}
              alt={business.name}
            />
          ) : (
            <div className="message-business__hero-placeholder">
              <Building2 size={44} strokeWidth={1.4} />
              <span>{business.name}</span>
            </div>
          )}
        </div>

        <section className="message-business__summary">
          <div className="message-business__summary-main">
            <h2 id="message-business-title">
              {business.name}
            </h2>

            <p>
              <MapPin size={14} />
              {business.city}, {business.state}
            </p>

            <div className="message-business__about">
              <h3>About the Business</h3>
              <p>{business.description}</p>
            </div>
          </div>

          <div className="message-business__financials">
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
                {formatCurrency(business.annualProfit)}
              </strong>
            </div>
          </div>
        </section>

        <nav
          className="message-business__tabs"
          aria-label="Business details"
        >
          {[
            ["overview", "Overview"],
            ["information", "Business Information"],
            ["goals", "Sale Goals"],
            ["assets", "Lease & Assets"],
            ["finances", "Finances"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={
                activeTab === value
                  ? "message-business__tab message-business__tab--active"
                  : "message-business__tab"
              }
              onClick={() =>
                setActiveTab(value as BusinessTab)
              }
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="message-business__content">
          {activeTab === "overview" && (
            <>
              <h2>Business Information</h2>

              <div className="message-business__detail-grid">
                <article>
                  <Building2 size={19} />
                  <span>Industry</span>
                  <strong>{business.industry}</strong>
                </article>

                <article>
                  <span>Acquisition Type</span>
                  <strong>
                    {business.acquisitionType}
                  </strong>
                </article>

                <article>
                  <span>Years in Operation</span>
                  <strong>
                    {business.yearsInOperation ?? "N/A"}
                  </strong>
                </article>

                <article>
                  <span>Employees</span>
                  <strong>
                    {business.employees ?? "N/A"}
                  </strong>
                </article>
              </div>
            </>
          )}

          {activeTab === "information" && (
            <>
              <h2>Business Information</h2>
              <p>{business.description}</p>
              <p>
                Owner involvement:{" "}
                {business.ownerHoursPerWeek === null
                  ? "N/A"
                  : `${business.ownerHoursPerWeek} hours per week`}
              </p>
            </>
          )}

          {activeTab === "goals" && (
            <>
              <h2>Sale Goals</h2>

              <div className="message-business__detail-grid">
                <article>
                  <span>Reason for Selling</span>
                  <strong>
                    {business.reasonForSelling}
                  </strong>
                </article>

                <article>
                  <span>Desired Timeline</span>
                  <strong>
                    {business.desiredTimeline}
                  </strong>
                </article>

                <article>
                  <span>Transition Support</span>
                  <strong>
                    {business.transitionSupport}
                  </strong>
                </article>
              </div>
            </>
          )}

          {activeTab === "assets" && (
            <>
              <h2>Lease &amp; Assets</h2>

              <div className="message-business__detail-grid">
                <article>
                  <span>Property Type</span>
                  <strong>
                    {business.propertyType}
                  </strong>
                </article>

                <article>
                  <span>Lease Term Remaining</span>
                  <strong>
                    {business.leaseTermRemaining}
                  </strong>
                </article>
              </div>

              <ul>
                {business.includedAssets.map((asset) => (
                  <li key={asset}>{asset}</li>
                ))}
              </ul>
            </>
          )}

          {activeTab === "finances" && (
            <>
              <h2>Finances</h2>

              <div className="message-business__detail-grid">
                <article>
                  <DollarSign size={19} />
                  <span>Asking Price</span>
                  <strong>
                    {formatCurrency(business.askingPrice)}
                  </strong>
                </article>

                <article>
                  <span>Annual Revenue</span>
                  <strong>
                    {formatRevenueRange(
                      business.annualRevenueMin,
                      business.annualRevenueMax,
                    )}
                  </strong>
                </article>

                <article>
                  <span>Annual Profit</span>
                  <strong>
                    {formatCurrency(
                      business.annualProfit,
                    )}
                  </strong>
                </article>

                <article>
                  <span>Estimated Profit Margin</span>
                  <strong>
                    {business.estimatedProfitMargin === null
                      ? "N/A"
                      : `${business.estimatedProfitMargin}%`}
                  </strong>
                </article>
              </div>
            </>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}