"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Factory,
  FileText,
  User,
  TrendingUp,
  Home,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { getBusinessById } from "@/lib/api/sellerBusinesses";
import type { Business } from "@/types/seller";
import "./BusinessPreview.css";

interface BusinessPreviewProps {
  businessId: string;
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "business-info", label: "Business Information" },
  { id: "sale-goals", label: "Sale Goals" },
  { id: "lease-assets", label: "Lease & Assets" },
  { id: "finances", label: "Finances" },
  { id: "legal", label: "Legal & Licensing" },
];

function formatMoney(n?: number) {
  if (n === undefined || n === null) return "—";

  if (n >= 1_000_000) {
    return `$${(n / 1_000_000).toFixed(1)}M`;
  }

  if (n >= 1_000) {
    return `$${Math.round(n / 1_000)}K`;
  }

  return `$${n}`;
}

export default function BusinessPreview({
  businessId,
}: BusinessPreviewProps) {
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    (async () => {
      try {
        const data = await getBusinessById(businessId);
        setBusiness(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [businessId]);

  if (loading) {
    return (
      <div className="business-preview__loading">
        Loading…
      </div>
    );
  }

  if (!business) {
    return (
      <div className="business-preview__loading">
        Business not found.
      </div>
    );
  }

  const isDraft = business.status === "draft";

  return (
  <div className="business-preview">

    {/* =====================================================
        PREVIEW HEADER
        ===================================================== */}

    <header className="business-preview__header">
      <div className="business-preview__header-left">
        <div className="business-preview__header-title-row">
          <span
            className="business-preview__eye"
            aria-hidden="true"
          >
            ◉
          </span>

          <span className="business-preview__header-title">
            Preview Mode
          </span>

          {isDraft && (
            <span className="business-preview__status">
              Unpublished
            </span>
          )}
        </div>

        <p className="business-preview__header-subtitle">
          Review how potential buyers will see this listing
          before it goes live.
        </p>
      </div>

      <div className="business-preview__header-actions">
        <button
          type="button"
          className="business-preview__btn business-preview__btn--outline"
          onClick={() =>
            router.push(
              `/seller/listings/${businessId}/edit`
            )
          }
        >
          Back to Edit
        </button>

        <button
          type="button"
          className="business-preview__btn business-preview__btn--primary"
          onClick={() =>
            router.push("/seller/listings")
          }
        >
          Publish Listing
        </button>
      </div>
    </header>

    {/* =====================================================
        SCROLLABLE PREVIEW CONTENT
        ===================================================== */}

    <div className="business-preview__content">

      {/* ===================================================
          CONFIDENTIALITY NOTICE
          =================================================== */}

      <div className="business-preview__confidential">
        <div className="business-preview__confidential-icon">
          <Lock size={15} strokeWidth={1.8} />
        </div>

        <div>
          <strong>
            What stays confidential
          </strong>

          <p>
            Business name, exact address, and detailed
            financial documents (tax returns, P&amp;L) stay
            hidden from buyers until they sign the NDA.
            Everything else on this page is visible to any
            qualified buyer.
          </p>
        </div>
      </div>

      {/* ===================================================
          COVER IMAGE
          =================================================== */}

      <div className="business-preview__hero">
        {business.image_url ? (
          <img
            src={business.image_url}
            alt={business.name}
            className="business-preview__hero-image"
          />
        ) : (
          <div className="business-preview__hero-placeholder">
            No cover image selected
          </div>
        )}
      </div>

      {/* ===================================================
          BUSINESS SUMMARY
          =================================================== */}

      <section className="business-preview__summary">

        {/* LEFT SIDE */}
        <div className="business-preview__summary-main">

          {/* Business name */}
          <div className="business-preview__summary-title">
            <h1>
              {business.name || "Business Name"}
            </h1>

            <span className="business-preview__nda">
              Name hidden pre-NDA
            </span>
          </div>

          {/* Location */}
          <p className="business-preview__summary-location">
            {business.city && business.state
              ? `${business.city}, ${business.state}`
              : business.city ||
                business.state ||
                "Location not provided"}
          </p>

          {/* About */}
          <div className="business-preview__summary-about">
            <h3>
              About the Business
            </h3>

            <p>
              {business.description ||
                "No business description has been added yet."}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE — FINANCIAL SUMMARY */}
        <div className="business-preview__summary-financials">

          <div className="business-preview__summary-financial">
            <div className="business-preview__summary-financial-label">
              Asking Price
            </div>

            <div className="business-preview__summary-financial-value">
              {formatMoney(business.asking_price)}
            </div>
          </div>

          <div className="business-preview__summary-financial">
            <div className="business-preview__summary-financial-label">
              Annual Revenue
            </div>

            <div className="business-preview__summary-financial-value">
              {business.annual_revenue_min !== undefined &&
              business.annual_revenue_max !== undefined
                ? `${formatMoney(
                    business.annual_revenue_min
                  )}–${formatMoney(
                    business.annual_revenue_max
                  )}`
                : "—"}
            </div>
          </div>

          <div className="business-preview__summary-financial">
            <div className="business-preview__summary-financial-label">
              Annual Profit
            </div>

            <div className="business-preview__summary-financial-value">
              {formatMoney(business.annual_profit)}
            </div>
          </div>

        </div>
      </section>

      {/* ===================================================
          TABS
          =================================================== */}

      <nav
        className="business-preview__tabs"
        aria-label="Business preview sections"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`business-preview__tab ${
              activeTab === t.id
                ? "business-preview__tab--active"
                : ""
            }`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* ===================================================
          BUSINESS INFORMATION
          =================================================== */}

      <section className="business-preview__section">

        <h2 className="business-preview__section-title">
          Business Information
        </h2>

        <div className="business-preview__info-card">

          {/* Information rows */}
          <div className="business-preview__kv-list">

            <div className="business-preview__kv-row">
              <span className="business-preview__kv-label">
                <Factory size={14} strokeWidth={1.7} />
                Industry
              </span>

              <span className="business-preview__kv-value">
                {business.industry_name || "—"}
              </span>
            </div>

            <div className="business-preview__kv-row">
              <span className="business-preview__kv-label">
                <FileText size={14} strokeWidth={1.7} />
                Acquisition Type
              </span>

              <span className="business-preview__kv-value">
                {business.acquisition_type || "—"}
              </span>
            </div>

            <div className="business-preview__kv-row">
              <span className="business-preview__kv-label">
                <User size={14} strokeWidth={1.7} />
                Work / Location
              </span>

              <span className="business-preview__kv-value">
                {business.work_schedule || "—"}
              </span>
            </div>

            <div className="business-preview__kv-row">
              <span className="business-preview__kv-label">
                <TrendingUp size={14} strokeWidth={1.7} />
                Revenue Trend
              </span>

              <span className="business-preview__kv-value">
                {business.revenue_trend || "—"}
              </span>
            </div>

            <div className="business-preview__kv-row">
              <span className="business-preview__kv-label">
                <Home size={14} strokeWidth={1.7} />
                Premises
              </span>

              <span className="business-preview__kv-value">
                {business.premises_owned
                  ? "Owned"
                  : "Leased"}
              </span>
            </div>

          </div>

          {/* Highlight panel */}
          <div className="business-preview__info-highlight">
            <h4>
              How it operates
            </h4>

            <p>
              {business.work_schedule ||
                "Operating details have not been provided yet."}
              {business.customer_base
                ? ` Customer base is ${business.customer_base.toLowerCase()}.`
                : ""}
            </p>
          </div>

        </div>
      </section>

      {/* ===================================================
          SALE GOALS
          =================================================== */}

      <section className="business-preview__section">

        <h2 className="business-preview__section-title">
          Sale Goals
        </h2>

        <div className="business-preview__goal-grid">

          <div className="business-preview__goal-card">
            <div className="business-preview__goal-icon">
              <TrendingUp
                size={14}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <div className="business-preview__goal-label">
                Reason for Selling
              </div>

              <div className="business-preview__goal-value">
                {business.reason_for_selling ||
                  "Not specified"}
              </div>
            </div>
          </div>

          <div className="business-preview__goal-card">
            <div className="business-preview__goal-icon">
              <Clock
                size={14}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <div className="business-preview__goal-label">
                Desired Timeline
              </div>

              <div className="business-preview__goal-value">
                {business.timeline ||
                  "Not specified"}
              </div>
            </div>
          </div>

          <div className="business-preview__goal-card">
            <div className="business-preview__goal-icon">
              <User
                size={14}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <div className="business-preview__goal-label">
                Buyer Preference
              </div>

              <div className="business-preview__goal-value">
                {business.buyer_preference ||
                  "Not specified"}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ===================================================
          LEASE & ASSETS
          =================================================== */}

      <section className="business-preview__section">

        <h2 className="business-preview__section-title">
          Lease &amp; Assets
        </h2>

        <div className="business-preview__lease-card">

          {/* Property information */}
          <div className="business-preview__kv-list">

            <div className="business-preview__kv-row">
              <span className="business-preview__kv-label">
                <Home
                  size={14}
                  strokeWidth={1.7}
                />
                Property Type
              </span>

              <span className="business-preview__kv-value">
                {business.premises_type || "—"}
              </span>
            </div>

            <div className="business-preview__kv-row">
              <span className="business-preview__kv-label">
                Lease Term Remaining
              </span>

              <span className="business-preview__kv-value">
                {business.lease_term_remaining || "—"}
              </span>
            </div>

          </div>

          {/* Included assets */}
          <div className="business-preview__assets">

            <div className="business-preview__assets-title">
              Included Assets
            </div>

            <div className="business-preview__asset-list">

              {(business.included_assets ?? []).length ===
                0 ? (
                <span className="business-preview__asset">
                  None listed
                </span>
              ) : (
                (business.included_assets ?? []).map(
                  (asset) => (
                    <span
                      key={asset}
                      className="business-preview__asset"
                    >
                      {asset}
                    </span>
                  )
                )
              )}

            </div>
          </div>

        </div>
      </section>

      {/* ===================================================
          FINANCES
          =================================================== */}

      <section className="business-preview__section">

        <h2 className="business-preview__section-title">
          Finances
        </h2>

        <div className="business-preview__finance-card">

          {/* Financial values */}
          <div className="business-preview__kv-list">

            <div className="business-preview__kv-row">
              <span className="business-preview__kv-label">
                Annual Revenue
              </span>

              <span className="business-preview__kv-value">
                {business.annual_revenue_min !== undefined &&
                business.annual_revenue_max !== undefined
                  ? `${formatMoney(
                      business.annual_revenue_min
                    )}–${formatMoney(
                      business.annual_revenue_max
                    )}`
                  : "—"}
              </span>
            </div>

            <div className="business-preview__kv-row">
              <span className="business-preview__kv-label">
                Annual Profit (SDE)
              </span>

              <span className="business-preview__kv-value">
                {formatMoney(
                  business.annual_profit
                )}
              </span>
            </div>

            <div className="business-preview__kv-row">
              <span className="business-preview__kv-label">
                Asking Price
              </span>

              <span className="business-preview__kv-value">
                {formatMoney(
                  business.asking_price
                )}
              </span>
            </div>

            <div className="business-preview__kv-row">
              <span className="business-preview__kv-label">
                Adjusted EBITDA
              </span>

              <span className="business-preview__kv-value">
                {formatMoney(
                  business.adjusted_ebitda
                )}
              </span>
            </div>

            <div className="business-preview__kv-row">
              <span className="business-preview__kv-label">
                Real Estate Value
              </span>

              <span className="business-preview__kv-value">
                {formatMoney(
                  business.real_estate_value
                )}
              </span>
            </div>

            <div className="business-preview__kv-row">
              <span className="business-preview__kv-label">
                Add Backs
              </span>

              <span className="business-preview__kv-value">
                {formatMoney(
                  business.add_backs
                )}
              </span>
            </div>

            <div className="business-preview__kv-row">
              <span className="business-preview__kv-label">
                Bank / Inventories
              </span>

              <span className="business-preview__kv-value">
                {formatMoney(
                  business.bank_inventories
                )}
              </span>
            </div>

            <div className="business-preview__kv-row">
              <span className="business-preview__kv-label">
                vs. Industry Benchmark
              </span>

              <span className="business-preview__kv-value">
                {business.benchmark_delta !== undefined
                  ? `${
                      business.benchmark_delta > 0
                        ? "+"
                        : ""
                    }${business.benchmark_delta}%`
                  : "—"}
              </span>
            </div>

          </div>

          {/* Profit margin */}
          <div className="business-preview__finance-highlight">

            <div className="business-preview__finance-highlight-top">
              <span className="business-preview__finance-highlight-title">
                Est. profit margin
              </span>

              <span className="business-preview__finance-highlight-value">
                {business.annual_revenue_min &&
                business.annual_profit
                  ? `~${Math.round(
                      (business.annual_profit /
                        business.annual_revenue_min) *
                        100
                    )}%`
                  : "—"}
              </span>
            </div>

            <div className="business-preview__progress">
              <div
                className="business-preview__progress-bar"
                style={{
                  width:
                    business.annual_revenue_min &&
                    business.annual_profit
                      ? `${Math.min(
                          100,
                          Math.max(
                            0,
                            (business.annual_profit /
                              business.annual_revenue_min) *
                              100
                          )
                        )}%`
                      : "0%",
                }}
              />
            </div>

            <p className="business-preview__finance-note">
              Based on the low end of the reported revenue range.
            </p>

          </div>

        </div>
      </section>

      {/* ===================================================
          LEGAL & LICENSING
          =================================================== */}

      <section className="business-preview__section">

        <h2 className="business-preview__section-title">
          Legal &amp; Licensing
        </h2>

        <div className="business-preview__legal-card">

          {business.year_established ||
          business.legal_confirmed ? (
            <div className="business-preview__kv-list">

              <div className="business-preview__kv-row">
                <span className="business-preview__kv-label">
                  Year Established
                </span>

                <span className="business-preview__kv-value">
                  {business.year_established || "—"}
                </span>
              </div>

              {business.legal_confirmed && (
                <div className="business-preview__kv-row">
                  <span className="business-preview__kv-label">
                    <CheckCircle2
                      size={14}
                      strokeWidth={1.8}
                    />
                    Legal requirements
                  </span>

                  <span className="business-preview__kv-value">
                    Confirmed
                  </span>
                </div>
              )}

            </div>
          ) : (
            <div className="business-preview__legal-empty">
              Not filled in yet
            </div>
          )}

        </div>
      </section>

      {/* ===================================================
          BUYER VISIBILITY NOTE
          =================================================== */}

      <div className="business-preview__buyer-note">

        <div className="business-preview__buyer-note-icon">
          <span aria-hidden="true">✦</span>
        </div>

        <div className="business-preview__buyer-note-content">
          <p className="business-preview__buyer-note-title">
            That's everything buyers see pre-NDA
          </p>

          <p className="business-preview__buyer-note-text">
            Once your profile meets the minimum match
            threshold, qualified buyers can request an
            introduction from here.
          </p>
        </div>

        <button
          type="button"
          className="business-preview__buyer-note-button"
          onClick={() =>
            router.push(
              `/seller/listings/${businessId}/edit`
            )
          }
        >
          Back to Edit
        </button>

      </div>

      {/* ===================================================
          FOOTER
          =================================================== */}

      <footer className="business-preview__footer">
        Financial and contact details stay private until
        both sides approve an introduction.
      </footer>

    </div>
  </div>
);
}