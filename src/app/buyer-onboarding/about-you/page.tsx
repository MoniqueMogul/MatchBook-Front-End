"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import PhoneInputField from "@/components/onboarding/PhoneInputField";
import { useBuyerOnboardingStore } from "@/store/useBuyerOnboardingStore";

const aboutYouSchema = yup.object({
  countryCode: yup
    .string()
    .required("Country code is required"),

  phone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(
      /^[0-9\s\-()]+$/,
      "Enter a valid phone number",
    ),
});

type AboutYouFormData = yup.InferType<
  typeof aboutYouSchema
>;

export default function AboutYouPage() {
  const router = useRouter();

  const { aboutYou, setAboutYou } =
    useBuyerOnboardingStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AboutYouFormData>({
    resolver: yupResolver(aboutYouSchema),
    defaultValues: {
      countryCode: aboutYou.countryCode || "+91",
      phone: aboutYou.phone || "",
    },
  });

  const countryCode = watch("countryCode");

  const onSubmit = (data: AboutYouFormData) => {
    setAboutYou({
      countryCode: data.countryCode,
      phone: data.phone.trim(),
    });

    /*
     * Backend persistence will be wired later.
     * For now, continue through the onboarding UI.
     */
    router.push("/buyer-onboarding/profile");
  };

  const handleBack = () => {
    router.push("/role-selection");
  };

  return (
    <OnboardingLayout progress={10}>
      <h1 className="onboarding-heading">
        About You
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="onboarding-fields"
        noValidate
      >
        <div className="onboarding-section">
          <h2 className="onboarding-section__header">
            Contact
          </h2>

          <div className="onboarding-section__divider" />

          <PhoneInputField
            label="Phone Number"
            countryCodeValue={countryCode}
            onCountryCodeChange={(value) =>
              setValue("countryCode", value, {
                shouldValidate: true,
              })
            }
            error={errors.phone?.message}
            {...register("phone")}
            placeholder="Enter your phone number"
          />
        </div>

        <div className="onboarding-buttons">
          <button
            type="button"
            className="onboarding-btn onboarding-btn--back"
            onClick={handleBack}
          >
            Back
          </button>

          <button
            type="submit"
            className="onboarding-btn onboarding-btn--next"
          >
            Next
          </button>
        </div>
      </form>
    </OnboardingLayout>
  );
}