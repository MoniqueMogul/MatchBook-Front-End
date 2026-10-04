"use client";

import ContentSkeleton from "@/components/common/ContentSkeleton";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import axios from "axios";
import USLocationAutocomplete from "@/components/buyer/profile/USLocationAutocomplete";
import { toStructuredLocation } from "@/lib/api/locations";
import { normalizeBackendLocation } from "@/lib/api/buyerPreferences";
import type { ApiTargetLocation } from "@/lib/api/buyerPreferences.types";
import { Button } from "@/components/common/Button";
import {
  getIndustryOptions,
  getBusinessModelOptions,
  type IndustryOption,
  type BusinessModelOption,
} from "@/lib/api/taxonomy";
import {
  BUSINESS_TYPES,
  createSellerBusiness,
  updateSellerBusiness,
  getSellerBusiness,
  saveBusinessImage,
  validateBusinessImage,
  sellerErrorMessage,
  type BusinessFields,
  type SellerBusiness,
} from "@/lib/api/seller";

const textFields = [
  ["legal_name", "Legal business name", 255],
  ["dba", "Doing business as", 255],
  ["preferred_sale_timeline", "Preferred sale timeline", 50],
] as const;

const numericFields = [
  ["years_in_operation", "Years in operation", 0, undefined, 1],
  ["number_of_locations", "Number of locations", 0, undefined, 1],
  ["number_of_routes", "Number of routes", 0, undefined, 1],
  ["arr", "Annual recurring revenue ($)", 0, 9999999999999.99, 0.01],
  ["sde", "Seller discretionary earnings ($)", 0, 9999999999999.99, 0.01],
  ["asking_price", "Asking price ($)", 0.01, 9999999999999.99, 0.01],
  [
    "customer_concentration",
    "Largest customer concentration (%)",
    0,
    100,
    0.01,
  ],
  [
    "owner_involvement_hours_per_week",
    "Owner hours per week",
    0,
    168,
    1,
  ],
  [
    "transition_training_days",
    "Transition training days",
    0,
    undefined,
    1,
  ],
] as const;

type StructuredBusinessLocation = {
  city: string;
  state: string;
  county: string;
  zip_code: string;
};

export default function BusinessEditor({
  business,
  onSaved,
  onCancel,
}: {
  business: SellerBusiness | null;
  onSaved: (business: SellerBusiness) => void;
  onCancel: () => void;
}) {
  const [locationQuery, setLocationQuery] = useState("");

  const [location, setLocation] = useState<StructuredBusinessLocation>({
    city: business?.city ?? "",
    state: business?.state ?? "",
    county: business?.county ?? "",
    zip_code: business?.zip_code ?? "",
  });

  const selectedLocations = useMemo(
    () =>
      location.city || location.state || location.county || location.zip_code
        ? [normalizeBackendLocation(location, 0)]
        : [],
    [location],
  );

  const selectLocation = (selected: ApiTargetLocation) => {
    const structured = toStructuredLocation(selected);

    setLocation({
      city: structured.city ?? "",
      state: structured.state ?? "",
      county: structured.county ?? "",
      zip_code: structured.zip_code ?? "",
    });

    setLocationQuery("");

    setFieldErrors((current) => {
      const next = { ...current };
      delete next.location;
      delete next.city;
      delete next.state;
      delete next.county;
      delete next.zip_code;
      return next;
    });
  };

  const removeLocation = () => {
    setLocation({
      city: "",
      state: "",
      county: "",
      zip_code: "",
    });

    setLocationQuery("");
  };

  const [industry, setIndustry] = useState(business?.industry ?? "");
  const [businessModel, setBusinessModel] = useState(
    business?.business_model ?? "",
  );
  const [subIndustry, setSubIndustry] = useState(
    business?.sub_industry ?? "",
  );

  const [industries, setIndustries] = useState<IndustryOption[]>([]);
  const [models, setModels] = useState<BusinessModelOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const submitting = useRef(false);
  const errorSummary = useRef<HTMLDivElement>(null);
  const previewUrl = useRef<string | null>(null);

  /*
   * If the business details were created successfully but the photo upload
   * failed, keep the created business here so a retry updates the same
   * business instead of creating a duplicate.
   */
  const savedDraft = useRef<SellerBusiness | null>(null);

  /*
   * Reuse the same idempotency key across retries of the initial create.
   */
  const creationKey = useRef<string | null>(null);

  useEffect(() => {
    if (errorSummary.current) {
      errorSummary.current.focus();
      errorSummary.current.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }
  }, [fieldErrors, error]);

  useEffect(() => {
    return () => {
      if (previewUrl.current) {
        URL.revokeObjectURL(previewUrl.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getIndustryOptions(), getBusinessModelOptions()])
      .then(([industryOptions, modelOptions]) => {
        if (cancelled) return;

        setIndustries(industryOptions);
        setModels(modelOptions);
        setError(null);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(sellerErrorMessage(loadError));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [retry]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting.current) {
      return;
    }

    const form = event.currentTarget;
    const invalid: Record<string, string> = {};

    /*
     * Location is controlled by the autocomplete instead of free-text
     * city/state inputs. City and state are still required by the business
     * API, so validate the structured location directly.
     */
    if (!location.city.trim() || !location.state.trim()) {
      invalid.location =
        "Please select a valid business location from the suggestions.";
    }

    for (const control of Array.from(form.elements)) {
      if (
        !(
          control instanceof HTMLInputElement ||
          control instanceof HTMLSelectElement
        ) ||
        control.disabled
      ) {
        continue;
      }

      if (!control.validity.valid) {
        invalid[control.name] = control.validationMessage;
      } else if (
        control.required &&
        control.type !== "file" &&
        !control.value.trim()
      ) {
        invalid[control.name] = "Please enter a value.";
      }
    }

    if (!business && !savedDraft.current && !photo) {
      invalid.photo = "Please choose a business photo.";
    }

    if (Object.keys(invalid).length) {
      setError("Please correct the highlighted fields before saving.");
      setFieldErrors(invalid);
      return;
    }

    const data = new FormData(form);

    const text = (key: string) =>
      String(data.get(key) ?? "").trim();

    const integer = (key: string) =>
      text(key) === "" ? null : Number(text(key));

    const fields: BusinessFields = {
      legal_name: text("legal_name") || null,
      dba: text("dba") || null,

      /*
       * Structured values come directly from the selected autocomplete
       * result rather than duplicated free-text inputs.
       */
      city: location.city.trim(),
      state: location.state.trim(),
      county: location.county.trim() || null,
      zip_code: location.zip_code.trim() || null,

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

    setSaving(true);
    setError(null);
    setFieldErrors({});

    let stage: "details" | "photo" | "refresh" = "details";

    setProgress(
      business || savedDraft.current ? "Saving…" : "Creating…",
    );

    try {
      creationKey.current ??= crypto.randomUUID();

      const existing = business ?? savedDraft.current;

      let saved = existing
        ? await updateSellerBusiness(existing.id, fields)
        : await createSellerBusiness(fields, creationKey.current);

      if (!saved?.id) {
        throw new Error("Missing business confirmation");
      }

      /*
       * Remember the persisted business immediately. If the image upload
       * fails, retrying will update this business instead of creating
       * another one.
       */
      savedDraft.current = saved;

      if (photo) {
        stage = "photo";
        setProgress("Uploading photo…");

        const imageResult = await saveBusinessImage(saved.id, photo);

        if (!imageResult?.id) {
          throw new Error("Missing photo confirmation");
        }
      }

      /*
       * Do not trust a potentially partial POST/PUT/image response as the
       * final frontend state. Read the business back from the backend so
       * the profile/edit screen receives the canonical persisted record.
       */
      stage = "refresh";
      setProgress("Confirming saved business…");

      const persisted = await getSellerBusiness(saved.id);

      if (!persisted?.id) {
        throw new Error("Could not confirm the saved business");
      }

      savedDraft.current = persisted;

      onSaved(persisted);
    } catch (saveError) {
      const status = axios.isAxiosError(saveError)
        ? saveError.response?.status
        : undefined;

      const validation: Record<string, string> = {};

      const detail = axios.isAxiosError(saveError)
        ? saveError.response?.data?.detail
        : undefined;

      if (
        status === 422 &&
        Array.isArray(detail) &&
        stage === "details"
      ) {
        for (const issue of detail) {
          const key =
            issue.loc?.[0] === "body"
              ? issue.loc?.[1]
              : undefined;

          if (
            typeof key === "string" &&
            Object.hasOwn(fields, key)
          ) {
            validation[key] =
              "Please check this value; it was not accepted.";
          }
        }
      }

      let message: string;

      if (stage === "refresh") {
        message =
          "The business was saved, but MatchBook could not reload the saved record. Retry to confirm the saved information.";
      } else if (status === 401) {
        message =
          "Your session has expired. Sign in again before retrying.";
      } else if (status === 403) {
        message =
          "Your account does not have permission to save this business.";
      } else if (status === 422) {
        message =
          "Some business details were not accepted. Check the highlighted fields and your industry/sub-industry selection.";
      } else if (status === 409) {
        message =
          "The business could not be saved because of a conflict. Review your details and retry.";
      } else if (status === 429) {
        message =
          "Too many requests. Please wait a moment and retry.";
      } else if (status && status >= 500) {
        message =
          "The service is temporarily unavailable. Please try again.";
      } else if (
        axios.isAxiosError(saveError) &&
        !saveError.response
      ) {
        message =
          "We could not reach the service. Check your connection and retry.";
      } else {
        message =
          "We could not save your business. Please try again.";
      }

      if (stage === "photo") {
        message =
          "Business details were saved, but the photo upload did not finish. Retry saving to finish without creating another business. " +
          message;
      }

      setError(message);
      setFieldErrors(validation);

      if (process.env.NODE_ENV === "development") {
        console.warn("Business save failed", {
          stage,
          status,
          code: axios.isAxiosError(saveError)
            ? saveError.code
            : "INVALID_RESPONSE",
          detail,
        });
      }
    } finally {
      submitting.current = false;
      setSaving(false);
      setProgress("");
    }
  };

  const label = (value: string) =>
    value.replaceAll("_", " ");

  const fieldFeedback = (key: string) =>
    fieldErrors[key] ? (
      <span
        id={`business-${key}-error`}
        className="business-editor__field-error"
      >
        {fieldErrors[key]}
      </span>
    ) : null;

  const accessibility = (key: string) => ({
    "aria-invalid": !!fieldErrors[key],
    "aria-describedby": fieldErrors[key]
      ? `business-${key}-error`
      : undefined,
  });

  return (
    <section className="business-editor">
      <h2>
        {business ? "Edit Business Profile" : "Create New Business"}
      </h2>

      <p>
        Business details only. Your personal information is managed in
        Account.
      </p>

      {!loading && (!industries.length || !models.length) && (
        <Button
          type="button"
          onClick={() => {
            setLoading(true);
            setRetry((value) => value + 1);
          }}
        >
          Retry loading options
        </Button>
      )}

      {loading && (
        <ContentSkeleton
          shape="options"
          label="Loading business options"
        />
      )}

      <form
        noValidate
        onSubmit={save}
        aria-busy={saving}
      >
        <fieldset
          disabled={
            saving ||
            loading ||
            !industries.length ||
            !models.length
          }
        >
          <label>
            Business photo
            {!business && !savedDraft.current ? " *" : ""}

            <input
              name="photo"
              {...accessibility("photo")}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={
                !business &&
                !savedDraft.current &&
                !photo
              }
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (!file) {
                  return;
                }

                try {
                  validateBusinessImage(file);

                  if (previewUrl.current) {
                    URL.revokeObjectURL(previewUrl.current);
                  }

                  previewUrl.current =
                    URL.createObjectURL(file);

                  setPreview(previewUrl.current);
                  setPhoto(file);
                  setError(null);

                  setFieldErrors((current) => ({
                    ...current,
                    photo: "",
                  }));
                } catch (imageError) {
                  event.target.value = "";

                  setPhoto(null);
                  setPreview(null);

                  if (previewUrl.current) {
                    URL.revokeObjectURL(
                      previewUrl.current,
                    );
                  }

                  previewUrl.current = null;

                  setError(
                    "Please choose a supported business photo.",
                  );

                  setFieldErrors((current) => ({
                    ...current,
                    photo:
                      sellerErrorMessage(imageError),
                  }));
                }
              }}
            />

            <span>
              JPG, PNG, or WebP up to 10MB. Use a photo of
              your business.
            </span>

            {fieldFeedback("photo")}
          </label>

          {preview && (
            <img
              className="business-photo-preview"
              src={preview}
              alt="Selected business photo"
            />
          )}

          <div
            className={
              fieldErrors.location
                ? "business-editor__location business-editor__location--error"
                : "business-editor__location"
            }
          >
            <USLocationAutocomplete
              label="Business location"
              value={locationQuery}
              countryCode="US"
              selectedLocations={selectedLocations}
              onChange={setLocationQuery}
              onSelect={selectLocation}
              onRemove={removeLocation}
              disabled={saving || loading}
            />

            {fieldFeedback("location")}

            <p className="business-editor__location-help">
              Search for your business location and select it
              from the suggestions.
            </p>

            {location.city && location.state && (
              <div className="business-editor__selected-location">
                <div>
                  <span>City</span>
                  <strong>{location.city}</strong>
                </div>

                <div>
                  <span>State</span>
                  <strong>{location.state}</strong>
                </div>

                {location.county && (
                  <div>
                    <span>County</span>
                    <strong>{location.county}</strong>
                  </div>
                )}
              </div>
            )}

            <label className="business-editor__zip">
              ZIP code
              <input
                name="zip_code_display"
                type="text"
                maxLength={20}
                value={location.zip_code}
                disabled={saving || loading}
                onChange={(event) =>
                  setLocation((current) => ({
                    ...current,
                    zip_code: event.target.value,
                  }))
                }
              />
              <span>
                Add or correct the ZIP code if the selected
                location does not provide one.
              </span>
            </label>
          </div>

          <div className="seller-fields">
            {textFields.map(([key, title, max]) => (
              <label key={key}>
                {title}

                <input
                  name={key}
                  {...accessibility(key)}
                  defaultValue={business?.[key] ?? ""}
                  maxLength={max}
                />

                {fieldFeedback(key)}
              </label>
            ))}

            <label>
              Business type *

              <select
                name="business_type"
                {...accessibility("business_type")}
                required
                defaultValue={business?.business_type ?? ""}
              >
                <option value="">
                  Select business type
                </option>

                {BUSINESS_TYPES.map((value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label(value)}
                  </option>
                ))}
              </select>

              {fieldFeedback("business_type")}
            </label>

            <label>
              Industry *

              <select
                name="industry"
                {...accessibility("industry")}
                required
                value={industry}
                onChange={(event) => {
                  setIndustry(event.target.value);
                  setSubIndustry("");

                  setFieldErrors((current) => ({
                    ...current,
                    industry: "",
                    sub_industry: "",
                  }));
                }}
              >
                <option value="">
                  Select industry
                </option>

                {industries.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              {fieldFeedback("industry")}
            </label>

            <label>
              Sub-industry *

              <select
                name="sub_industry"
                {...accessibility("sub_industry")}
                required
                disabled={!industry}
                value={subIndustry}
                onChange={(event) => {
                  setSubIndustry(event.target.value);

                  setFieldErrors((current) => ({
                    ...current,
                    sub_industry: "",
                  }));
                }}
              >
                <option value="">
                  Select sub-industry
                </option>

                {industries
                  .find(
                    (option) =>
                      option.value === industry,
                  )
                  ?.sub_industries.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
              </select>

              {fieldFeedback("sub_industry")}
            </label>

            <label>
              Business model *

              <select
                name="business_model"
                {...accessibility("business_model")}
                required
                value={businessModel}
                onChange={(event) => {
                  setBusinessModel(event.target.value);

                  setFieldErrors((current) => ({
                    ...current,
                    business_model: "",
                  }));
                }}
              >
                <option value="">
                  Select business model
                </option>

                {models.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              {fieldFeedback("business_model")}
            </label>

            {numericFields.map(
              ([key, title, min, max, step]) => (
                <label key={key}>
                  {title}

                  <input
                    type="number"
                    name={key}
                    {...accessibility(key)}
                    min={min}
                    max={max}
                    step={step}
                    defaultValue={business?.[key] ?? ""}
                  />

                  {fieldFeedback(key)}
                </label>
              ),
            )}

            <label>
              Deal preference

              <select
                name="deal_preference"
                {...accessibility("deal_preference")}
                defaultValue={
                  business?.deal_preference ?? ""
                }
              >
                <option value="">
                  Not specified
                </option>
                <option value="cash">
                  Cash
                </option>
                <option value="financing">
                  Financing
                </option>
                <option value="either">
                  Either
                </option>
              </select>

              {fieldFeedback("deal_preference")}
            </label>
          </div>

          <div className="seller-actions">
            <Button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving…"
                : business
                  ? "Save Business"
                  : "Create Business"}
            </Button>
          </div>
        </fieldset>

        {saving && (
          <p
            className="business-editor__progress"
            role="status"
          >
            {progress}
          </p>
        )}

        {error && (
          <div
            ref={errorSummary}
            className="business-editor__error"
            role="alert"
            tabIndex={-1}
          >
            <p>{error}</p>

            {Object.entries(fieldErrors)
              .filter(([, message]) => message)
              .map(([key]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === "location") {
                      const input =
                        errorSummary.current
                          ?.closest("form")
                          ?.querySelector(
                            ".us-location-autocomplete__input-wrapper input",
                          );

                      if (input instanceof HTMLElement) {
                        input.focus();
                      }

                      return;
                    }

                    const field =
                      errorSummary.current
                        ?.closest("form")
                        ?.elements.namedItem(key);

                    if (field instanceof HTMLElement) {
                      field.focus();
                    }
                  }}
                >
                  Review{" "}
                  {key === "photo"
                    ? "business photo"
                    : key === "location"
                      ? "business location"
                      : label(key)}
                </button>
              ))}
          </div>
        )}

        <Button
          type="button"
          variant="secondary"
          disabled={saving}
          onClick={() => {
            if (savedDraft.current) {
              onSaved(savedDraft.current);
            } else {
              onCancel();
            }
          }}
        >
          Cancel
        </Button>
      </form>
    </section>
  );
}