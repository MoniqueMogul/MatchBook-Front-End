"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import PhoneInputField from "@/components/onboarding/PhoneInputField";
import "./EditOverviewSection.css";

interface EditOverviewSectionProps {
  mode?: "edit" | "onboarding";

  initialAbout?: string;

  initialPhoneCountryCode?: string;
  initialPhone?: string;

  onPhoneChange?: (phone: string) => void;

  onContinue?: (data: {
    about: string;
    phoneCountryCode: string;
    phone: string;
  }) => void;

  disabled?: boolean;
}

export default function EditOverviewSection({
  mode = "edit",
  initialAbout = "",
  initialPhoneCountryCode = "+91",
  initialPhone = "",
  onPhoneChange,
  onContinue,
  disabled = false,
}: EditOverviewSectionProps) {
  const [about, setAbout] = useState(initialAbout);

  const [phoneCountryCode, setPhoneCountryCode] =
    useState(initialPhoneCountryCode);

  const [phone, setPhone] = useState(initialPhone);

  useEffect(() => {
    setAbout(initialAbout);
  }, [initialAbout]);

  useEffect(() => {
    setPhoneCountryCode(initialPhoneCountryCode);
  }, [initialPhoneCountryCode]);

  useEffect(() => {
    setPhone(initialPhone);
  }, [initialPhone]);

  const handleContinue = () => {
    onContinue?.({
      about: about.trim(),
      phoneCountryCode,
      phone: phone.trim(),
    });
  };

  return (
    <section className="edit-overview-section">
      <div className="edit-overview-section__fields">

        {/* About */}
        <div className="edit-overview-section__field">
          <label
            htmlFor="about"
            className="edit-overview-section__label"
          >
            About
          </label>

          <textarea
            id="about"
            value={about}
            onChange={(event) => setAbout(event.target.value)}
            placeholder="Tell sellers a little about yourself..."
            disabled={disabled}
            className="edit-overview-section__textarea"
            rows={6}
          />
        </div>

        {/* Contact / Phone */}
        <div className="edit-overview-section__field">
          <PhoneInputField
          label="Contact"
          countryCodeValue={phoneCountryCode}
          onCountryCodeChange={(countryCode) => {
            setPhoneCountryCode(countryCode);

            onPhoneChange?.(
              `${countryCode}${phone.replace(/\D/g, "")}`,
            );
          }}
          value={phone}
          onChange={(event) => {
            const value = event.target.value;

            setPhone(value);

            onPhoneChange?.(
              `${phoneCountryCode}${value.replace(/\D/g, "")}`,
            );
          }}
          name="phone"
        />
        </div>

      </div>

      {/* Continue */}
      <div className="edit-overview-section__continue">
        <button
          type="button"
          className="edit-overview-section__continue-button"
          onClick={handleContinue}
          disabled={disabled}
          aria-label={
            mode === "onboarding"
              ? "Save and continue"
              : "Continue to next profile section"
          }
        >
          {mode === "onboarding" ? (
            "Save & Continue"
          ) : (
            <ChevronRight
              size={32}
              strokeWidth={1.5}
            />
          )}
        </button>
      </div>
    </section>
  );
}