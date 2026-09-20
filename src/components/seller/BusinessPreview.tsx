"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBusinessById } from "@/lib/api/sellerBusinesses";
import type { Business } from "@/types/seller";
import "./BusinessPreview.css";

interface BusinessPreviewProps {
  businessId: string;
}

export default function BusinessPreview({ businessId }: BusinessPreviewProps) {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="business-preview__loading">Loading…</div>;
  if (!business) return <div className="business-preview__loading">Not found.</div>;

  const isDraft = business.status === "draft";

  return (
    <div className="business-preview">
      {isDraft && (
        <div className="business-preview__banner">
          <span className="business-preview__dot" />
          <div className="business-preview__banner-text">
            <strong>Preview Mode</strong> · Unpublished
            <div className="business-preview__banner-sub">
              Preview how your listing will look if you publish it. This is not
              visible to buyers yet.
            </div>
          </div>
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
      )}

      <div className="business-preview__confidential">
        🔒 <strong>What stays confidential</strong>
        <p>
          Business name, exact address, and detailed financial documents (tax
          returns, P&amp;L) stay hidden from buyers until they sign the NDA.
          Everything else on this page is visible to any qualified buyer.
        </p>
      </div>

      <h1 className="business-preview__title">{business.name}</h1>
      <div className="business-preview__location">
        {business.city}, {business.state}
      </div>

      <div className="business-preview__tabs">
        {["Overview", "Business Information", "Sale Goals", "Lease & Assets", "Finances", "Legal & Licensing"].map(
          (t, i) => (
            <button
              key={t}
              className={`business-preview__tab ${i === 0 ? "business-preview__tab--active" : ""}`}
            >
              {t}
            </button>
          )
        )}
      </div>

      <section className="business-preview__section">
        <h2>Business Information</h2>
        <div className="business-preview__row">
          <span>Industry</span>
          <span>{business.industry_name}</span>
        </div>
      </section>
    </div>
  );
}