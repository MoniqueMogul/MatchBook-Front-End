"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { ChevronRight } from "lucide-react";
import { isValidPhoneNumber } from "libphonenumber-js";
import PhoneInputField from "@/components/onboarding/PhoneInputField";
import "./EditOverviewSection.css";

export interface EditOverviewSectionHandle {
  submit: () => Promise<boolean>;
}

interface EditOverviewSectionProps {
  mode?: "edit" | "onboarding";
  showActions?: boolean;

  initialAbout?: string;

  initialPhoneCountryCode?: string;
  initialPhone?: string;

  onPhoneChange?: (phone: string) => void;

  onDataChange?: (data: {
    about: string;
    phoneCountryCode: string;
    phone: string;
  }) => void;

  onContinue?: (data: {
    about: string;
    phoneCountryCode: string;
    phone: string;
  }) => void | Promise<void>;

  disabled?: boolean;
}

const EditOverviewSection = forwardRef<
  EditOverviewSectionHandle,
  EditOverviewSectionProps
>(function EditOverviewSection({
  mode = "edit",
  showActions = true,
  initialAbout = "",
  initialPhoneCountryCode = "+91",
  initialPhone = "",
  onPhoneChange,
  onDataChange,
  onContinue,
  disabled = false,
}: EditOverviewSectionProps, ref) {
  const [about, setAbout] = useState(initialAbout);

  const [phoneCountryCode, setPhoneCountryCode] =
    useState(initialPhoneCountryCode);

  const [phone, setPhone] = useState(initialPhone);
  const [phoneError, setPhoneError] = useState<string>("");

  useEffect(() => {
    setAbout(initialAbout);
  }, [initialAbout]);

  useEffect(() => {
    setPhoneCountryCode(initialPhoneCountryCode);
  }, [initialPhoneCountryCode]);

  useEffect(() => {
    setPhone(initialPhone);
  }, [initialPhone]);

  useEffect(() => {
    onDataChange?.({
      about,
      phoneCountryCode,
      phone,
    });
  }, [
    about,
    phoneCountryCode,
    phone,
    onDataChange,
  ]);

  const handleContinue = async (): Promise<boolean> => {
    const trimmedPhone = phone.trim();
    const fullPhoneNumber = `${phoneCountryCode}${trimmedPhone.replace(/\D/g, "")}`;

    if (!trimmedPhone) {
      setPhoneError("Please enter your phone number.");
      return false;
    }

    if (!isValidPhoneNumber(fullPhoneNumber)) {
      setPhoneError("Please enter a valid phone number.");
      return false;
    }

    setPhoneError("");

    await onContinue?.({
      about: about.trim(),
      phoneCountryCode,
      phone: trimmedPhone,
    });

    return true;
  };

  useImperativeHandle(
    ref,
    () => ({
      submit: handleContinue,
    }),
  );

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
            rows={2}
          />
        </div>

        {/* Contact / Phone */}
        <div className="edit-overview-section__field">
          <PhoneInputField
          label="Contact"
          countryCodeValue={phoneCountryCode}
          error={phoneError}
          onCountryCodeChange={(countryCode) => {
            setPhoneCountryCode(countryCode);

             if (phoneError) {
              setPhoneError("");
            }

            onPhoneChange?.(
              `${countryCode}${phone.replace(/\D/g, "")}`,
            );
          }}
          value={phone}
          onChange={(event) => {
            const value = event.target.value;

            setPhone(value);

            if (phoneError) {
              setPhoneError("");
            }

            onPhoneChange?.(
              `${phoneCountryCode}${value.replace(/\D/g, "")}`,
            );
          }}
          name="phone"
        />
        </div>

      </div>

      {/* Continue */}
      {showActions && (
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
      )}
    </section>
  );
});

export default EditOverviewSection;
