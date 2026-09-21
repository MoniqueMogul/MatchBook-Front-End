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
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

export default function BusinessPreview({ businessId }: BusinessPreviewProps) {
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
    return <div className="business-preview__loading">Loading…</div>;
  }

  if (!business) {
    return <div className="business-preview__loading">Business not found.</div>;
  }

  const isDraft = business.status === "draft";

  return (
    <div className="business-preview">
      {isDraft && (
        <div className="business-preview__preview-banner">
          <span className="business-preview__dot" />
          <div className="business-preview__banner-text">
            <div className="business-preview__banner-title">
              Preview Mode · <span className="muted">Unpublished</span>
            </div>
            <div className="business-preview__banner-sub">
              Preview how your listing will look if you publish it. This is not
              visible to buyers yet.
            </div>
          </div>
          <div className="business-preview__banner-actions">
            <button
              className="business-preview__btn business-preview__btn--outline"
              onClick={() => router.push(`/seller/listings/${businessId}/edit`)}
            >
              Back to Edit
            </button>
            <button
              className="business-preview__btn business-preview__btn--primary"
              onClick={() => router.push(`/seller/listings`)}
            >
              Publish Listing
            </button>
          </div>
        </div>
      )}

      <div className="business-preview__confidential">
        <Lock size={16} strokeWidth={1.8} />
        <div>
          <strong>What stays confidential</strong>
          <p>
            Business name, exact address, and detailed financial documents (tax
            returns, P&amp;L) stay hidden from buyers until they sign the NDA.
            Everything else on this page is visible to any qualified buyer.
          </p>
        </div>
      </div>

      <div className="business-preview__hero">
        {business.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.image_url} alt={business.name} />
        ) : (
          <div className="business-preview__hero-placeholder" />
        )}
      </div>

      <div className="business-preview__summary">
        <div className="business-preview__summary-left">
          <div className="business-preview__name-row">
            <h1>{business.name}</h1>
            <span className="business-preview__nda-badge">
              Name hidden pre-NDA
            </span>
          </div>
          <div className="business-preview__location">
            {business.city}, {business.state}
          </div>
          <div className="business-preview__tags">
            <span className="business-preview__tag">
              {business.acquisition_type ?? "—"}
            </span>
          </div>
        </div>

        <div className="business-preview__summary-right">
          <div className="business-preview__fin">
            <div className="business-preview__fin-label">ASKING PRICE</div>
            <div className="business-preview__fin-value">
              {formatMoney(business.asking_price)}
            </div>
          </div>
          <div className="business-preview__fin">
            <div className="business-preview__fin-label">ANNUAL REVENUE</div>
            <div className="business-preview__fin-value">
              {business.annual_revenue_min && business.annual_revenue_max
                ? `${formatMoney(business.annual_revenue_min)}–${formatMoney(
                    business.annual_revenue_max
                  )}`
                : "—"}
            </div>
          </div>
          <div className="business-preview__fin">
            <div className="business-preview__fin-label">ANNUAL PROFIT</div>
            <div className="business-preview__fin-value">
              {formatMoney(business.annual_profit)}
            </div>
          </div>
        </div>
      </div>

      <div className="business-preview__about">
        <h3>About the Business</h3>
        <p>{business.description}</p>
      </div>

      <div className="business-preview__tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`business-preview__tab ${
              activeTab === t.id ? "business-preview__tab--active" : ""
            }`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Business Information */}
      <section className="business-preview__section">
        <h2>Business Information</h2>

        <div className="business-preview__kv">
          <div className="business-preview__kv-row">
            <Factory size={16} strokeWidth={1.7} />
            <span className="business-preview__kv-label">Industry</span>
            <span className="business-preview__kv-value">
              {business.industry_name}
            </span>
          </div>
          <div className="business-preview__kv-row">
            <FileText size={16} strokeWidth={1.7} />
            <span className="business-preview__kv-label">Acquisition Type</span>
            <span className="business-preview__kv-value">
              {business.acquisition_type ?? "—"}
            </span>
          </div>
          <div className="business-preview__kv-row">
            <User size={16} strokeWidth={1.7} />
            <span className="business-preview__kv-label">Work / Location</span>
            <span className="business-preview__kv-value">
              {business.work_schedule ?? "—"}
            </span>
          </div>
          <div className="business-preview__kv-row">
            <TrendingUp size={16} strokeWidth={1.7} />
            <span className="business-preview__kv-label">Revenue Trend</span>
            <span className="business-preview__kv-value">
              {business.revenue_trend ?? "—"}
            </span>
          </div>
          <div className="business-preview__kv-row">
            <Home size={16} strokeWidth={1.7} />
            <span className="business-preview__kv-label">Premises</span>
            <span className="business-preview__kv-value">
              {business.premises_owned ? "Owned" : "Leased"}
            </span>
          </div>
        </div>
      </section>

      {/* Sale Goals */}
      <section className="business-preview__section">
        <h2>Sale Goals</h2>

        <div className="business-preview__goal-cards">
          <div className="business-preview__goal-card">
            <Clock size={16} strokeWidth={1.7} />
            <div>
              <div className="business-preview__goal-title">
                Reason for selling
              </div>
              <div className="business-preview__goal-value">
                {business.reason_for_selling || "Not specified"}
              </div>
            </div>
          </div>
          <div className="business-preview__goal-card">
            <Clock size={16} strokeWidth={1.7} />
            <div>
              <div className="business-preview__goal-title">Timeline</div>
              <div className="business-preview__goal-value">
                {business.timeline || "Not specified"}
              </div>
            </div>
          </div>
          <div className="business-preview__goal-card">
            <User size={16} strokeWidth={1.7} />
            <div>
              <div className="business-preview__goal-title">
                Buyer Preference
              </div>
              <div className="business-preview__goal-value">
                {business.buyer_preference || "Not specified"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lease & Assets */}
      <section className="business-preview__section">
        <h2>Lease &amp; Assets</h2>

        <div className="business-preview__lease-grid">
          <div className="business-preview__lease-box">
            <div className="business-preview__lease-label">Premises</div>
            <div className="business-preview__lease-value">
              {business.premises_type ?? "—"}
            </div>
          </div>
          <div className="business-preview__lease-box">
            <div className="business-preview__lease-label">
              Lease term remaining
            </div>
            <div className="business-preview__lease-value">
              {business.lease_term_remaining ?? "—"}
            </div>
          </div>
        </div>

        <div className="business-preview__assets">
          <div className="business-preview__lease-label">Included Assets</div>
          <div className="business-preview__assets-list">
            {(business.included_assets ?? []).length === 0 && (
              <span className="muted">None listed</span>
            )}
            {(business.included_assets ?? []).map((a) => (
              <span key={a} className="business-preview__asset-pill">
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Finances */}
      <section className="business-preview__section">
        <h2>Finances</h2>

        <div className="business-preview__fin-grid">
          <div className="business-preview__fin-cell">
            <div className="business-preview__fin-cell-label">
              Annual Revenue
            </div>
            <div className="business-preview__fin-cell-value">
              {business.annual_revenue_min && business.annual_revenue_max
                ? `${formatMoney(business.annual_revenue_min)}–${formatMoney(
                    business.annual_revenue_max
                  )}`
                : "—"}
            </div>
          </div>
          <div className="business-preview__fin-cell">
            <div className="business-preview__fin-cell-label">
              Annual Profit
            </div>
            <div className="business-preview__fin-cell-value">
              {formatMoney(business.annual_profit)}
            </div>
          </div>
          <div className="business-preview__fin-cell">
            <div className="business-preview__fin-cell-label">
              Adjusted EBITDA
            </div>
            <div className="business-preview__fin-cell-value">
              {formatMoney(business.adjusted_ebitda)}
            </div>
          </div>
          <div className="business-preview__fin-cell">
            <div className="business-preview__fin-cell-label">Asking Price</div>
            <div className="business-preview__fin-cell-value">
              {formatMoney(business.asking_price)}
            </div>
          </div>
          <div className="business-preview__fin-cell">
            <div className="business-preview__fin-cell-label">Real Estate</div>
            <div className="business-preview__fin-cell-value">
              {formatMoney(business.real_estate_value)}
            </div>
          </div>
          <div className="business-preview__fin-cell">
            <div className="business-preview__fin-cell-label">Add Backs</div>
            <div className="business-preview__fin-cell-value">
              {formatMoney(business.add_backs)}
            </div>
          </div>
          <div className="business-preview__fin-cell">
            <div className="business-preview__fin-cell-label">
              Bank / Inventories
            </div>
            <div className="business-preview__fin-cell-value">
              {formatMoney(business.bank_inventories)}
            </div>
          </div>
          <div className="business-preview__fin-cell">
            <div className="business-preview__fin-cell-label">
              vs. Industry Benchmark
            </div>
            <div className="business-preview__fin-cell-value business-preview__benchmark">
              {business.benchmark_delta !== undefined
                ? `${business.benchmark_delta > 0 ? "+" : ""}${
                    business.benchmark_delta
                  }%`
                : "—"}
            </div>
          </div>
        </div>
      </section>

      {/* Legal */}
      <section className="business-preview__section">
        <h2>Legal &amp; Licensing</h2>

        <div className="business-preview__legal">
          <div className="business-preview__legal-row">
            <span className="business-preview__legal-label">
              Year Established
            </span>
            <span className="business-preview__legal-value">
              {business.year_established ?? "—"}
            </span>
          </div>

          {business.legal_confirmed && (
            <div className="business-preview__legal-confirm">
              <CheckCircle2 size={18} strokeWidth={1.8} />
              <span>I have everything required to sell this business.</span>
            </div>
          )}
        </div>
      </section>

      <footer className="business-preview__footer">
        Financial and contact details stay private until both sides approve an
        introduction.
      </footer>
    </div>
  );
}