"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import axios from "axios";
import USLocationAutocomplete from "@/components/buyer/profile/USLocationAutocomplete";
import { toStructuredLocation } from "@/lib/api/locations";
import { normalizeBackendLocation } from "@/lib/api/buyerPreferences";
import type { ApiTargetLocation } from "@/lib/api/buyerPreferences.types";
import { Button } from "@/components/common/Button";
import { getIndustryOptions, getBusinessModelOptions, type IndustryOption, type BusinessModelOption } from "@/lib/api/taxonomy";
import { BUSINESS_TYPES, createSellerBusiness, updateSellerBusiness, saveBusinessImage, validateBusinessImage, sellerErrorMessage, type BusinessFields, type SellerBusiness } from "@/lib/api/seller";

const locationFields = ["city", "state", "county", "zip_code"] as const;

const textFields = [
  ["legal_name", "Legal business name", 255], ["dba", "Doing business as", 255],
  ["city", "City", 100], ["state", "State", 100], ["county", "County", 100],
  ["zip_code", "ZIP code", 20], ["preferred_sale_timeline", "Preferred sale timeline", 50],
] as const;
const numericFields = [
  ["years_in_operation", "Years in operation", 0, undefined, 1],
  ["number_of_locations", "Number of locations", 0, undefined, 1],
  ["number_of_routes", "Number of routes", 0, undefined, 1],
  ["arr", "Annual recurring revenue ($)", 0, 9999999999999.99, 0.01],
  ["sde", "Seller discretionary earnings ($)", 0, 9999999999999.99, 0.01],
  ["asking_price", "Asking price ($)", 0.01, 9999999999999.99, 0.01],
  ["customer_concentration", "Largest customer concentration (%)", 0, 100, 0.01],
  ["owner_involvement_hours_per_week", "Owner hours per week", 0, 168, 1],
  ["transition_training_days", "Transition training days", 0, undefined, 1],
] as const;

export default function BusinessEditor({ business, onSaved, onCancel }: {
  business: SellerBusiness | null; onSaved: (business: SellerBusiness) => void; onCancel: () => void;
}) {
  const [locationQuery, setLocationQuery] = useState("");
  const [location, setLocation] = useState({
    city: business?.city ?? "", state: business?.state ?? "",
    county: business?.county ?? "", zip_code: business?.zip_code ?? "",
  });
  const selectedLocations = useMemo(() => Object.values(location).some(Boolean)
    ? [normalizeBackendLocation(location, 0)] : [], [location]);
  const selectLocation = (selected: ApiTargetLocation) => {
    const value = toStructuredLocation(selected);
    setLocation({ city: value.city ?? "", state: value.state ?? "", county: value.county ?? "", zip_code: value.zip_code ?? "" });
  };
  const [industry, setIndustry] = useState(business?.industry ?? "");
  const [businessModel, setBusinessModel] = useState(business?.business_model ?? "");
  const [subIndustry, setSubIndustry] = useState(business?.sub_industry ?? "");
  const [industries, setIndustries] = useState<IndustryOption[]>([]);
  const [models, setModels] = useState<BusinessModelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const submitting = useRef(false);
  const errorSummary = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errorSummary.current) {
      errorSummary.current.focus();
      errorSummary.current.scrollIntoView({ block: "center" });
    }
  }, [fieldErrors]);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const previewUrl = useRef<string | null>(null);
  const savedDraft = useRef<SellerBusiness | null>(null);
  // Reuse across network retries: the server returns the original business.
  const creationKey = useRef<string | null>(null);

  useEffect(() => () => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getIndustryOptions(), getBusinessModelOptions()]).then(([industries, models]) => {
      if (cancelled) return;
      setIndustries(industries); setModels(models); setError(null);
    }).catch((error) => { if (!cancelled) setError(sellerErrorMessage(error)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [retry]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const invalid: Record<string, string> = {};
    for (const control of Array.from(form.elements)) {
      if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement) || control.disabled) continue;
      if (!control.validity.valid) invalid[control.name] = control.validationMessage;
      else if (control.required && control.type !== "file" && !control.value.trim()) invalid[control.name] = "Please enter a value.";
    }
    if (!business && !photo) invalid.photo = "Please choose a business photo.";
    if (Object.keys(invalid).length) {
      setError("Please correct the highlighted fields before saving.");
      setFieldErrors(invalid);
      return;
    }
    const data = new FormData(event.currentTarget);
    const text = (key: string) => String(data.get(key) ?? "").trim();
    const integer = (key: string) => text(key) === "" ? null : Number(text(key));
    const fields: BusinessFields = {
  legal_name: text("legal_name") || null,
  dba: text("dba") || null,
  city: text("city"),
  state: text("state"),
  county: text("county") || null,
  zip_code: text("zip_code") || null,

  business_type: text("business_type"),
  industry,
  sub_industry: subIndustry,
  business_model: businessModel,

  years_in_operation: integer("years_in_operation"),
  number_of_locations: integer("number_of_locations"),
  number_of_routes: integer("number_of_routes"),

  arr: text("arr") || null,
  sde: text("sde") || null,
  asking_price: text("asking_price") || null,
  customer_concentration: text("customer_concentration") || null,

  owner_involvement_hours_per_week: integer(
    "owner_involvement_hours_per_week",
  ),
  transition_training_days: integer("transition_training_days"),

  deal_preference: (text("deal_preference") ||
    null) as BusinessFields["deal_preference"],

  preferred_sale_timeline:
    text("preferred_sale_timeline") || null,
};
    submitting.current = true;
    setSaving(true); setError(null); setFieldErrors({});
    let stage: "details" | "photo" = "details";
    setProgress(business || savedDraft.current ? "Saving…" : "Creating…");
    try {
      creationKey.current ??= crypto.randomUUID();
      const existing = business ?? savedDraft.current;
      let saved = existing ? await updateSellerBusiness(existing.id, fields)
        : await createSellerBusiness(fields, creationKey.current);
      if (!saved?.id) throw new Error("Missing business confirmation");
      savedDraft.current = saved;
      if (photo) {
        stage = "photo";
        setProgress("Uploading photo…");
        saved = await saveBusinessImage(saved.id, photo);
        if (!saved?.id) throw new Error("Missing photo confirmation");
      }
      onSaved(saved);
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const validation: Record<string, string> = {};
      const detail = axios.isAxiosError(error) ? error.response?.data?.detail : undefined;
      if (status === 422 && Array.isArray(detail) && stage === "details") {
        for (const issue of detail) {
          const key = issue.loc?.[0] === "body" ? issue.loc?.[1] : undefined;
          if (typeof key === "string" && Object.hasOwn(fields, key)) {
            validation[key] = "Please check this value; it was not accepted.";
          }
        }
      }
      const message = status === 401 ? "Your session has expired. Sign in again before retrying."
        : status === 403 ? "Your account does not have permission to save this business."
        : status === 422 ? "Some business details were not accepted. Check the highlighted fields and your industry/sub-industry selection."
        : status === 409 ? "The business could not be saved because of a conflict. Review your details and retry."
        : status === 429 ? "Too many requests. Please wait a moment and retry."
        : status && status >= 500 ? "The service is temporarily unavailable. Please try again."
        : axios.isAxiosError(error) && !error.response ? "We could not reach the service. Check your connection and retry."
        : "We could not save your business. Please try again.";
      setError((stage === "photo" ? "Business details were saved, but the photo upload did not finish. Retry saving to finish without creating another business. " : "") + message);
      setFieldErrors(validation);
      if (process.env.NODE_ENV === "development") {
        console.warn("Business save failed", { stage, status, code: axios.isAxiosError(error) ? error.code : "INVALID_RESPONSE" });
      }
    }
    finally { submitting.current = false; setSaving(false); setProgress(""); }
  };
  const label = (value: string) => value.replaceAll("_", " ");
  const fieldFeedback = (key: string) => fieldErrors[key] && <span id={`business-${key}-error`} className="business-editor__field-error">{fieldErrors[key]}</span>;
  const accessibility = (key: string) => ({
    "aria-invalid": !!fieldErrors[key],
    "aria-describedby": fieldErrors[key] ? `business-${key}-error` : undefined,
  });
  return <section className="business-editor">
    <h2>{business ? "Edit Business Profile" : "Create New Business"}</h2>
    <p>Business details only. Your personal information is managed in Account.</p>
    {!loading && (!industries.length || !models.length) && <Button type="button" onClick={() => {
      setLoading(true); setRetry((value) => value + 1);
    }}>Retry loading options</Button>}
    {loading && <p role="status">Loading business options…</p>}
    <form noValidate onSubmit={save} aria-busy={saving}>
      <fieldset disabled={saving || loading || !industries.length || !models.length}>
        <label>Business photo{!business ? " *" : ""}
          <input name="photo" {...accessibility("photo")} type="file" accept="image/jpeg,image/png,image/webp" required={!business && !photo}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                validateBusinessImage(file);
                if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
                previewUrl.current = URL.createObjectURL(file);
                setPreview(previewUrl.current); setPhoto(file); setError(null);
                setFieldErrors((current) => ({ ...current, photo: "" }));
              }
              catch (error) {
                event.target.value = ""; setPhoto(null); setPreview(null);
                if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
                previewUrl.current = null;
                setError("Please choose a supported business photo.");
                setFieldErrors((current) => ({ ...current, photo: sellerErrorMessage(error) }));
              }
            }} />
          <span>JPG, PNG, or WebP up to 10MB. Use a photo of your business.</span>
          {fieldFeedback("photo")}
        </label>
        {preview && <img className="business-photo-preview" src={preview} alt="Selected business photo" />}
        <USLocationAutocomplete label="Business location" value={locationQuery}
          countryCode={null} selectedLocations={selectedLocations} onChange={setLocationQuery}
          onSelect={selectLocation} onRemove={() => setLocation({ city: "", state: "", county: "", zip_code: "" })} disabled={saving || loading} />
        <p className="business-editor__location-help">Search to select a location, then check the structured fields below. Add a ZIP/postal code if the selected result does not provide one.</p>
        <div className="seller-fields">
          {textFields.map(([key, title, max]) => <label key={key}>{title}{key === "city" || key === "state" ? " *" : ""}
            <input name={key} {...accessibility(key)} {...(locationFields.some((field) => field === key)
              ? { value: location[key as keyof typeof location], onChange: (event: React.ChangeEvent<HTMLInputElement>) => setLocation((current) => ({ ...current, [key]: event.target.value })) }
              : { defaultValue: business?.[key] ?? "" })} maxLength={max} required={key === "city" || key === "state"} />
            {fieldFeedback(key)}
          </label>)}
          <label>Business type *<select name="business_type" {...accessibility("business_type")} required defaultValue={business?.business_type ?? ""}>
            <option value="">Select business type</option>{BUSINESS_TYPES.map((value) => <option key={value} value={value}>{label(value)}</option>)}
          </select>{fieldFeedback("business_type")}</label>
          <label>Industry *<select name="industry" {...accessibility("industry")} required value={industry} onChange={(event) => { setIndustry(event.target.value); setSubIndustry(""); }}>
            <option value="">Select industry</option>{industries.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>{fieldFeedback("industry")}</label>
          <label>Sub-industry *<select name="sub_industry" {...accessibility("sub_industry")} required disabled={!industry} value={subIndustry} onChange={(event) => setSubIndustry(event.target.value)}>
            <option value="">Select sub-industry</option>{industries.find((option) => option.value === industry)?.sub_industries.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>{fieldFeedback("sub_industry")}</label>
          <label>Business model *<select name="business_model" {...accessibility("business_model")} required value={businessModel} onChange={(event) => setBusinessModel(event.target.value)}>
            <option value="">Select business model</option>{models.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>{fieldFeedback("business_model")}</label>
          {numericFields.map(([key, title, min, max, step]) => <label key={key}>{title}
            <input type="number" name={key} {...accessibility(key)} min={min} max={max} step={step} defaultValue={business?.[key] ?? ""} />
            {fieldFeedback(key)}
          </label>)}
          <label>Deal preference<select name="deal_preference" {...accessibility("deal_preference")} defaultValue={business?.deal_preference ?? ""}>
            <option value="">Not specified</option><option value="cash">Cash</option><option value="financing">Financing</option><option value="either">Either</option>
          </select>{fieldFeedback("deal_preference")}</label>
        </div>
        <Button type="submit">{saving ? "Saving…" : business ? "Save Business" : "Create Business"}</Button>
      </fieldset>
      {saving && <p role="status">{progress}</p>}
      {error && <div ref={errorSummary} className="business-editor__error" role="alert" tabIndex={-1}>
        <p>{error}</p>
        {Object.entries(fieldErrors).filter(([, message]) => message).map(([key]) => <button key={key} type="button" onClick={() => {
          const field = errorSummary.current?.closest("form")?.elements.namedItem(key);
          if (field instanceof HTMLElement) field.focus();
        }}>Review {key === "photo" ? "business photo" : label(key)}</button>)}
      </div>}
      <Button type="button" variant="secondary" disabled={saving} onClick={() => {
        if (savedDraft.current) onSaved(savedDraft.current);
        else onCancel();
      }}>Cancel</Button>
    </form>
  </section>;
}
