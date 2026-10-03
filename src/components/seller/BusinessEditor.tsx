"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/common/Button";
import { getIndustryOptions, getBusinessModelOptions, type IndustryOption, type BusinessModelOption } from "@/lib/api/taxonomy";
import { BUSINESS_TYPES, createSellerBusiness, updateSellerBusiness, saveBusinessImage, validateBusinessImage, sellerErrorMessage, type BusinessFields, type SellerBusiness } from "@/lib/api/seller";

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
  const [industry, setIndustry] = useState(business?.industry ?? "");
  const [businessModel, setBusinessModel] = useState(business?.business_model ?? "");
  const [subIndustry, setSubIndustry] = useState(business?.sub_industry ?? "");
  const [industries, setIndustries] = useState<IndustryOption[]>([]);
  const [models, setModels] = useState<BusinessModelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    if (saving) return;
    const data = new FormData(event.currentTarget);
    const text = (key: string) => String(data.get(key) ?? "").trim();
    const integer = (key: string) => text(key) === "" ? null : Number(text(key));
    const fields: BusinessFields = {
      legal_name: text("legal_name") || null, dba: text("dba") || null,
      city: text("city"), state: text("state"), county: text("county") || null,
      zip_code: text("zip_code") || null, business_type: text("business_type"),
      industry, sub_industry: subIndustry, business_model: text("business_model"),
      years_in_operation: integer("years_in_operation"), number_of_locations: integer("number_of_locations"),
      number_of_routes: integer("number_of_routes"), arr: text("arr") || null,
      sde: text("sde") || null, asking_price: text("asking_price") || null,
      customer_concentration: text("customer_concentration") || null,
      owner_involvement_hours_per_week: integer("owner_involvement_hours_per_week"),
      transition_training_days: integer("transition_training_days"),
      deal_preference: (text("deal_preference") || null) as BusinessFields["deal_preference"],
      preferred_sale_timeline: text("preferred_sale_timeline") || null,
    };
    if (!fields.city || !fields.state) { setError("City and state are required."); return; }
    if (!business && !photo) { setError("Please choose a business photo."); return; }
    setSaving(true); setError(null);
    try {
      creationKey.current ??= crypto.randomUUID();
      const existing = business ?? savedDraft.current;
      let saved = existing ? await updateSellerBusiness(existing.id, fields)
        : await createSellerBusiness(fields, creationKey.current);
      savedDraft.current = saved;
      if (photo) saved = await saveBusinessImage(saved.id, photo);
      onSaved(saved);
    } catch (error) {
      setError((savedDraft.current ? "Business details were saved. The photo may not have uploaded; retry saving to finish. " : "") + sellerErrorMessage(error));
    }
    finally { setSaving(false); }
  };
  const label = (value: string) => value.replaceAll("_", " ");
  return <section>
    <h2>{business ? "Edit Business Profile" : "Create New Business"}</h2>
    <p>Business details only. Your personal information is managed in Account.</p>
    {error && <p role="alert">{error}</p>}
    {!loading && (!industries.length || !models.length) && <Button type="button" onClick={() => {
      setLoading(true); setRetry((value) => value + 1);
    }}>Retry loading options</Button>}
    {loading && <p role="status">Loading business options…</p>}
    <form onSubmit={save}>
      <fieldset disabled={saving || loading || !industries.length || !models.length}>
        <label>Business photo{!business ? " *" : ""}
          <input type="file" accept="image/jpeg,image/png,image/webp" required={!business && !photo}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                validateBusinessImage(file);
                if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
                previewUrl.current = URL.createObjectURL(file);
                setPreview(previewUrl.current); setPhoto(file); setError(null);
              }
              catch (error) { event.target.value = ""; setError(sellerErrorMessage(error)); }
            }} />
          <span>JPG, PNG, or WebP up to 10MB. Use a photo of your business.</span>
        </label>
        {preview && <img className="business-photo-preview" src={preview} alt="Selected business photo" />}
        <div className="seller-fields">
          {textFields.map(([key, title, max]) => <label key={key}>{title}{key === "city" || key === "state" ? " *" : ""}
            <input name={key} defaultValue={business?.[key] ?? ""} maxLength={max} required={key === "city" || key === "state"} />
          </label>)}
          <label>Business type *<select name="business_type" required defaultValue={business?.business_type ?? ""}>
            <option value="">Select business type</option>{BUSINESS_TYPES.map((value) => <option key={value} value={value}>{label(value)}</option>)}
          </select></label>
          <label>Industry *<select required value={industry} onChange={(event) => { setIndustry(event.target.value); setSubIndustry(""); }}>
            <option value="">Select industry</option>{industries.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select></label>
          <label>Sub-industry *<select required disabled={!industry} value={subIndustry} onChange={(event) => setSubIndustry(event.target.value)}>
            <option value="">Select sub-industry</option>{industries.find((option) => option.value === industry)?.sub_industries.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select></label>
          <label>Business model *<select name="business_model" required value={businessModel} onChange={(event) => setBusinessModel(event.target.value)}>
            <option value="">Select business model</option>{models.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select></label>
          {numericFields.map(([key, title, min, max, step]) => <label key={key}>{title}
            <input type="number" name={key} min={min} max={max} step={step} defaultValue={business?.[key] ?? ""} />
          </label>)}
          <label>Deal preference<select name="deal_preference" defaultValue={business?.deal_preference ?? ""}>
            <option value="">Not specified</option><option value="cash">Cash</option><option value="financing">Financing</option><option value="either">Either</option>
          </select></label>
        </div>
        <Button type="submit">{saving ? "Saving…" : business ? "Save Business" : "Create Business"}</Button>
      </fieldset>
      <Button type="button" variant="secondary" disabled={saving} onClick={() => {
        if (savedDraft.current) onSaved(savedDraft.current);
        else onCancel();
      }}>Cancel</Button>
    </form>
  </section>;
}
