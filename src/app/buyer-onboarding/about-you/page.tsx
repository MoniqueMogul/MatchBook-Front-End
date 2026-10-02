"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import { allCountries } from "country-region-data";

import AuthLayout from "@/components/common/AuthLayout";
import { Button } from "@/components/common/Button";
import { supabase } from "@/lib/supabase";
import { getBuyerProfile, upsertBuyerProfile } from "@/lib/api/buyer";
import { getCurrentUser, updateUserPhone } from "@/lib/api/user";
import { useAuthStore } from "@/store/authStore";
import { useBuyerOnboardingStore } from "@/store/useBuyerOnboardingStore";

import "./page.css";

function getSaveError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail: unknown = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      const messages = detail.flatMap((item: unknown) => {
        if (!item || typeof item !== "object") return [];

        const entry = item as { loc?: unknown; msg?: unknown };
        if (typeof entry.msg !== "string") return [];

        const field = Array.isArray(entry.loc)
          ? entry.loc.filter((part) => part !== "body").join(".")
          : "";

        return [field ? `${field}: ${entry.msg}` : entry.msg];
      });

      if (messages.length) return messages.join(" ");
    }

    return "We could not save your details. Please try again.";
  }

  return error instanceof Error
    ? error.message
    : "We could not save your details. Please try again.";
}

export default function BuyerAboutYouPage() {
  const router = useRouter();
  const savingRef = useRef(false);

  const [name, setName] = useState("");
  const [country, setCountry] = useState<CountryCode>("US");
  const [region, setRegion] = useState("");
  const [nationalPhone, setNationalPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  const countries = useMemo(() => {
    const displayNames = new Intl.DisplayNames(["en"], {
      type: "region",
    });

    return getCountries()
      .map((countryCode) => ({
        code: countryCode,
        name: displayNames.of(countryCode) ?? countryCode,
        callingCode: getCountryCallingCode(countryCode),
      }))
      .sort((first, second) =>
        first.name.localeCompare(second.name),
      );
  }, []);

  const callingCode = getCountryCallingCode(country);

  const regions = useMemo(() => {
    const selectedCountry = allCountries.find(
      ([, countryCode]) => countryCode === country,
    );

    return (selectedCountry?.[2] ?? []).map(
      ([regionName, regionCode]) => ({
        name: regionName,
        isoCode: regionCode || regionName,
        countryCode: country,
      }),
    );
  }, [country]);

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      setLoading(true);
      setLoadError(null);

      try {
        const { data, error } = await supabase.auth.getUser();

        if (!active) return;

        if (error || !data.user) {
          router.replace("/signin");
          return;
        }

        const user = data.user;
        const metadata = user.user_metadata;

        const accountName = [
          typeof metadata.first_name === "string"
            ? metadata.first_name.trim()
            : "",
          typeof metadata.last_name === "string"
            ? metadata.last_name.trim()
            : "",
        ]
          .filter(Boolean)
          .join(" ");

        setName(
          accountName ||
            (typeof metadata.full_name === "string"
              ? metadata.full_name
              : "") ||
            user.email ||
            "",
        );

        await useBuyerOnboardingStore
          .getState()
          .initializeForUser(user.id);

        const [personalResult, profileResult] =
          await Promise.allSettled([
            getCurrentUser(),
            getBuyerProfile(),
          ]);

        if (!active) return;

        if (personalResult.status === "rejected") {
          throw personalResult.reason;
        }

        const savedPhone = personalResult.value.phone ?? "";
        const parsedSavedPhone =
          parsePhoneNumberFromString(savedPhone);

        if (parsedSavedPhone) {
          if (parsedSavedPhone.country) {
            setCountry(parsedSavedPhone.country);
          }

          setNationalPhone(parsedSavedPhone.nationalNumber);
        } else {
          setNationalPhone(savedPhone.replace(/\D/g, ""));
        }

        if (profileResult.status === "fulfilled") {
          setRegion(profileResult.value.state ?? "");
        } else if (
          !axios.isAxiosError(profileResult.reason) ||
          profileResult.reason.response?.status !== 404
        ) {
          throw profileResult.reason;
        }

        useAuthStore.getState().setRole("buyer");
      } catch (error: unknown) {
        if (active) setLoadError(getSaveError(error));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDetails();

    return () => {
      active = false;
    };
  }, [router, loadAttempt]);

  async function handleContinue(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (savingRef.current || loading || loadError) return;

    setSaveError(null);
    setPhoneError(null);

    const parsedPhone = parsePhoneNumberFromString(
      nationalPhone.trim(),
      country,
    );

    if (
      !parsedPhone?.isValid() ||
      parsedPhone.country !== country
    ) {
      setPhoneError(
        "Enter a valid phone number for the selected country.",
      );
      return;
    }

    if (!region.trim()) {
      setSaveError("Enter your state, province, or region.");
      return;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/signin");
        return;
      }

      await updateUserPhone(parsedPhone.number);

      await upsertBuyerProfile({
        state: region.trim(),
      });

      useAuthStore.getState().setRole("buyer");
      useAuthStore.getState().setStep(4);

      router.replace("/buyer-dashboard");
    } catch (error: unknown) {
      setSaveError(getSaveError(error));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <div className="about-you-page">
      <AuthLayout variant="brand">
        <h1 className="about-you-title">About You</h1>

        {loading ? (
          <p role="status">Loading your details...</p>
        ) : loadError ? (
          <div>
            <p className="form-group__error" role="alert">
              {loadError}
            </p>

            <Button
              type="button"
              onClick={() =>
                setLoadAttempt((attempt) => attempt + 1)
              }
            >
              Try again
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleContinue}
            className="about-you-form"
          >
            <div className="about-you-field">
              <label htmlFor="about-you-name">
                Legal Name
              </label>

              <input
                id="about-you-name"
                value={name}
                readOnly
                autoComplete="name"
                className="about-you-input"
              />
            </div>

            <fieldset
              className="about-you-group"
              disabled={saving}
            >
              <legend>Region</legend>

              <div className="about-you-field">
                <label htmlFor="about-you-country">
                  Country
                </label>

                <select
                  id="about-you-country"
                  value={country}
                  onChange={(event) => {
                    setCountry(
                      event.target.value as CountryCode,
                    );
                    setRegion("");
                    setNationalPhone("");
                    setPhoneError(null);
                  }}
                  autoComplete="country"
                  required
                  className="about-you-input"
                >
                  {countries.map((item) => (
                    <option
                      key={item.code}
                      value={item.code}
                    >
                      {item.name} (+{item.callingCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="about-you-field">
                <label htmlFor="about-you-region">
                  State / Province / Region
                </label>

                {regions.length > 0 ? (
                  <select
                    id="about-you-region"
                    value={region}
                    onChange={(event) =>
                      setRegion(event.target.value)
                    }
                    autoComplete="address-level1"
                    required
                    className="about-you-input"
                  >
                    <option value="">
                      Select state, province, or region
                    </option>

                    {region &&
                      !regions.some(
                        (item) => item.name === region,
                      ) && (
                        <option value={region}>
                          {region}
                        </option>
                      )}

                    {regions.map((item) => (
                      <option
                        key={`${item.countryCode}-${item.isoCode}`}
                        value={item.name}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="about-you-region"
                    value={region}
                    onChange={(event) =>
                      setRegion(event.target.value)
                    }
                    autoComplete="address-level1"
                    placeholder="Enter state, province, or region"
                    required
                    className="about-you-input"
                  />
                )}
              </div>
            </fieldset>

            <fieldset
              className="about-you-group"
              disabled={saving}
            >
              <legend>Contact</legend>

              <div className="about-you-field">
                <label htmlFor="about-you-phone">
                  Phone
                </label>

                <div className="about-you-phone">
                  <input
                    value={`+${callingCode}`}
                    readOnly
                    aria-label="Phone country calling code"
                    className="about-you-input about-you-phone__code"
                  />

                  <input
                    id="about-you-phone"
                    type="tel"
                    value={nationalPhone}
                    onChange={(event) => {
                      setNationalPhone(
                        event.target.value.replace(/\D/g, ""),
                      );
                      setPhoneError(null);
                    }}
                    placeholder="Phone number"
                    autoComplete="tel-national"
                    required
                    aria-invalid={Boolean(phoneError)}
                    aria-describedby={
                      phoneError
                        ? "about-you-phone-error"
                        : undefined
                    }
                    className="about-you-input"
                  />
                </div>

                {phoneError && (
                  <p
                    id="about-you-phone-error"
                    className="form-group__error"
                    role="alert"
                  >
                    {phoneError}
                  </p>
                )}
              </div>
            </fieldset>

            {saveError && (
              <p
                className="form-group__error"
                role="alert"
              >
                {saveError}
              </p>
            )}

            <div className="about-you-actions">
              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={() =>
                  router.push("/role-selection")
                }
              >
                Back
              </Button>

              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Next"}
              </Button>
            </div>
          </form>
        )}
      </AuthLayout>
    </div>
  );
}
