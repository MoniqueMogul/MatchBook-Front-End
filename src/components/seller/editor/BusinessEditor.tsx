"use client";

import { useMemo, useState } from "react";
import type { Business } from "@/types/seller";

type EditorMode = "create" | "edit";

type EditorTab =
  | "business-info"
  | "sale-goals"
  | "lease-assets"
  | "finances"
  | "legal";

interface BusinessEditorProps {
  mode: EditorMode;
  business?: Business | null;
}

const TABS: { id: EditorTab; label: string }[] = [
  { id: "business-info", label: "Business Information" },
  { id: "sale-goals", label: "Sale Goals" },
  { id: "lease-assets", label: "Lease & Assets" },
  { id: "finances", label: "Finances" },
  { id: "legal", label: "Legal & Licensing" },
];

export default function BusinessEditor({
  mode,
  business,
}: BusinessEditorProps) {
  const [activeTab, setActiveTab] =
    useState<EditorTab>("business-info");

  /*
   * Keep a local editable copy.
   *
   * This is important because the editor should not directly mutate
   * the Business object received from the page.
   */
  const [form, setForm] = useState<Business>(() => {
    if (business) {
      return { ...business };
    }

    return {
      id: "",
      name: "",
      industry_name: "",
      description: "",
      city: "",
      state: "",
      status: "draft",
      completion_percent: 0,

      image_url: "",

      asking_price: undefined,
      annual_revenue_min: undefined,
      annual_revenue_max: undefined,
      annual_profit: undefined,

      acquisition_type: "",
      customer_base: "",
      work_schedule: "",
      revenue_trend: "",
      premises_owned: false,

      reason_for_selling: "",
      timeline: "",
      buyer_preference: "",

      premises_type: "",
      lease_term_remaining: "",
      included_assets: [],

      adjusted_ebitda: undefined,
      real_estate_value: undefined,
      add_backs: undefined,
      bank_inventories: undefined,
      benchmark_delta: undefined,

      year_established: "",
      legal_confirmed: false,
    };
  });

  const pageTitle = mode === "create"
    ? "New Business Profile"
    : "Edit Business Profile";

  const location = useMemo(() => {
    if (form.city && form.state) {
      return `${form.city}, ${form.state}`;
    }

    return form.city || form.state || "";
  }, [form.city, form.state]);

  const updateField = <K extends keyof Business>(
    field: K,
    value: Business[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <div className="business-editor">
      <header className="business-editor__header">
        <div>
          <h1>{pageTitle}</h1>

          {location && (
            <p className="business-editor__location">
              {location}
            </p>
          )}
        </div>

        <button
          type="button"
          className="business-editor__preview-button"
        >
          Preview
        </button>
      </header>

      <section className="business-editor__cover">
        <div className="business-editor__cover-placeholder">
          {form.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.image_url}
              alt={form.name || "Business cover"}
            />
          ) : (
            <span>Select a cover image</span>
          )}
        </div>

        <button
          type="button"
          className="business-editor__cover-edit"
          aria-label="Edit cover image"
        >
          ✎
        </button>
      </section>

      <section className="business-editor__identity">
        <div className="business-editor__identity-field">
          <label htmlFor="business-name">Business Name</label>
          <input
            id="business-name"
            value={form.name}
            onChange={(event) =>
              updateField("name", event.target.value)
            }
            placeholder="Enter business name"
          />
        </div>

        <div className="business-editor__identity-field">
          <label htmlFor="business-location">Location</label>
          <input
            id="business-location"
            value={location}
            onChange={(event) => {
              /*
               * Location parsing will be handled properly when we
               * build the location field. For Stage 1 we only keep
               * the existing city/state model intact.
               */
              updateField("city", event.target.value);
              updateField("state", "");
            }}
            placeholder="City, State"
          />
        </div>
      </section>

      <nav
        className="business-editor__tabs"
        aria-label="Business editor sections"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`business-editor__tab ${
              activeTab === tab.id
                ? "business-editor__tab--active"
                : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="business-editor__content">
        <div className="business-editor__placeholder">
          <h2>
            {TABS.find((tab) => tab.id === activeTab)?.label}
          </h2>

          <p>
            This section will be implemented next.
          </p>
        </div>
      </main>

      <footer className="business-editor__footer">
        <button
          type="button"
          className="business-editor__button business-editor__button--discard"
        >
          Discard
        </button>

        <div className="business-editor__footer-right">
          <button
            type="button"
            className="business-editor__button business-editor__button--draft"
          >
            Save as Draft
          </button>

          <button
            type="button"
            className="business-editor__button business-editor__button--publish"
          >
            Publish
          </button>
        </div>
      </footer>
    </div>
  );
}