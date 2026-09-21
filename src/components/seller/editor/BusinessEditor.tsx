"use client";

import { useMemo, useState } from "react";
import type { Business } from "@/types/seller";
import "./BusinessEditor.css";

import CoverImageModal, {
  type CoverImageOption,
} from "./CoverImageModal";

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

const COVER_IMAGES: CoverImageOption[] = [
  {
    id: "laundry",
    url: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=900&q=80",
    alt: "Laundry business",
  },
  {
    id: "restaurant",
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
    alt: "Restaurant",
  },
  {
    id: "technology",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
    alt: "Technology",
  },
  {
    id: "office",
    url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    alt: "Office",
  },
  {
    id: "retail",
    url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80",
    alt: "Retail store",
  },
];

const ACQUISITION_OPTIONS = [
  "Asset Purchase",
  "Stock Purchase",
  "Either",
];

const CUSTOMER_BASE_OPTIONS = [
  "B2B",
  "B2C",
  "B2B & B2C",
];

export default function BusinessEditor({
  mode,
  business,
}: BusinessEditorProps) {
  const [activeTab, setActiveTab] =
    useState<EditorTab>("business-info");

  const [coverModalOpen, setCoverModalOpen] =
    useState(false);

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

  const [aboutHistory, setAboutHistory] = useState<string[]>([]);
  const [aboutHistoryIndex, setAboutHistoryIndex] = useState(-1);

  const pageTitle =
    mode === "create"
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

  const updateDescription = (value: string) => {
    setAboutHistory((current) => [
      ...current.slice(0, aboutHistoryIndex + 1),
      form.description,
    ]);

    setAboutHistoryIndex((current) => current + 1);

    updateField("description", value);
  };

  const undoDescription = () => {
    if (aboutHistoryIndex < 0) {
      return;
    }

    const previousValue =
      aboutHistory[aboutHistoryIndex] ?? "";

    updateField("description", previousValue);

    setAboutHistoryIndex((current) => current - 1);
  };

  const redoDescription = () => {
    if (
      aboutHistoryIndex + 1 >=
      aboutHistory.length
    ) {
      return;
    }

    const nextValue =
      aboutHistory[aboutHistoryIndex + 1] ?? "";

    updateField("description", nextValue);

    setAboutHistoryIndex((current) => current + 1);
  };

  const renderBusinessInformation = () => {
    return (
      <section className="business-editor__section">
        <div className="business-editor__about">
          <label
            htmlFor="business-about"
            className="business-editor__form-label"
          >
            About
          </label>

          <textarea
            id="business-about"
            className="business-editor__about-textarea"
            value={form.description}
            onChange={(event) =>
              updateDescription(event.target.value)
            }
            placeholder="Write a brief description of your business..."
          />

          <div className="business-editor__ai-actions">
            <button
              type="button"
              className="business-editor__icon-button"
              aria-label="Undo"
              onClick={undoDescription}
              disabled={aboutHistoryIndex < 0}
            >
              ↶
            </button>

            <button
              type="button"
              className="business-editor__icon-button"
              aria-label="Redo"
              onClick={redoDescription}
              disabled={
                aboutHistoryIndex + 1 >=
                aboutHistory.length
              }
            >
              ↷
            </button>

            <button
              type="button"
              className="business-editor__ai-button"
            >
              ✨&nbsp; Rephrase with AI
            </button>
          </div>
        </div>

        <div className="business-editor__select-field">
          <label
            htmlFor="acquisition-type"
            className="business-editor__form-label"
          >
            Acquisition Type
          </label>

          <select
            id="acquisition-type"
            className="business-editor__select"
            value={form.acquisition_type ?? ""}
            onChange={(event) =>
              updateField(
                "acquisition_type",
                event.target.value
              )
            }
          >
            <option value="">Select an option</option>

            {ACQUISITION_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="business-editor__select-field">
          <label
            htmlFor="customer-base"
            className="business-editor__form-label"
          >
            Customer Base
          </label>

          <select
            id="customer-base"
            className="business-editor__select"
            value={form.customer_base ?? ""}
            onChange={(event) =>
              updateField(
                "customer_base",
                event.target.value
              )
            }
          >
            <option value="">Select an option</option>

            {CUSTOMER_BASE_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>
        </div>
      </section>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "business-info":
        return renderBusinessInformation();

      case "sale-goals":
        return (
          <section className="business-editor__section">
            <div className="business-editor__coming-soon">
              Sale Goals
            </div>
          </section>
        );

      case "lease-assets":
        return (
          <section className="business-editor__section">
            <div className="business-editor__coming-soon">
              Lease &amp; Assets
            </div>
          </section>
        );

      case "finances":
        return (
          <section className="business-editor__section">
            <div className="business-editor__coming-soon">
              Finances
            </div>
          </section>
        );

      case "legal":
        return (
          <section className="business-editor__section">
            <div className="business-editor__coming-soon">
              Legal &amp; Licensing
            </div>
          </section>
        );
    }
  };

  return (
    <div className="business-editor">

      {/* =========================
          HEADER
         ========================= */}

      <header className="business-editor__header">
        <h1 className="business-editor__title">
          {pageTitle}
        </h1>

        <button
          type="button"
          className="business-editor__preview-button"
        >
          Preview
        </button>
      </header>

      {/* =========================
          EDITOR CONTENT
         ========================= */}

      <div className="business-editor__workspace">

        {/* Cover */}

        <section className="business-editor__cover">
          {form.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="business-editor__cover-image"
              src={form.image_url}
              alt={
                form.name ||
                "Business cover"
              }
            />
          ) : (
            <div className="business-editor__cover-placeholder">
              <span className="business-editor__cover-icon">
                ▧
              </span>

              <span>
                Select a cover image
              </span>

              <small>
                JPG, PNG up to 5MB
              </small>
            </div>
          )}

          <button
            type="button"
            className="business-editor__cover-edit"
            aria-label="Edit cover image"
            onClick={() => setCoverModalOpen(true)}
            >
            ✎
            </button>
        </section>

        {/* Business identity */}

        <section className="business-editor__identity">

          <div className="business-editor__identity-field">
            <label
              htmlFor="business-name"
              className="business-editor__identity-label"
            >
              Business Name
            </label>

            <input
              id="business-name"
              className="business-editor__identity-input"
              value={form.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value
                )
              }
              placeholder="Business Name"
            />
          </div>

          <div className="business-editor__identity-field">
            <label
              htmlFor="business-location"
              className="business-editor__identity-label"
            >
              Location
            </label>

            <input
              id="business-location"
              className="business-editor__identity-input"
              value={location}
              onChange={(event) => {
                updateField(
                  "city",
                  event.target.value
                );

                updateField(
                  "state",
                  ""
                );
              }}
              placeholder="City, State"
            />
          </div>

        </section>

        {/* Tabs */}

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
              onClick={() =>
                setActiveTab(tab.id)
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab content */}

        <main className="business-editor__body">
          {renderTabContent()}
        </main>

      </div>

      {/* =========================
          FOOTER
         ========================= */}

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
      <CoverImageModal
        open={coverModalOpen}
        currentImage={form.image_url}
        images={COVER_IMAGES}
        onClose={() => setCoverModalOpen(false)}
        onDone={(imageUrl) => {
            updateField("image_url", imageUrl);
            setCoverModalOpen(false);
        }}
        />

    </div>
  );
}