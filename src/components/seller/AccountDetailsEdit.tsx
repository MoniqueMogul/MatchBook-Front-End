"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Input } from "@/components/common/Input";
import { Dropdown } from "@/components/common/Dropdown";
import Toast from "./Toast";

import "./AccountDetailsEdit.css";

const schema = yup.object().shape({
  firstName: yup.string().trim().required("First name is required"),
  lastName: yup.string().trim().required("Last name is required"),
  country: yup.string().required("Country is required"),
  state: yup.string().required("State is required"),
  phone: yup.string().trim().required("Phone is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  website: yup.string().trim().default(""),
  linkedin: yup.string().trim().default(""),
});

type FormValues = yup.InferType<typeof schema>;

const COUNTRIES = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "au", label: "Australia" },
];

const STATES = [
  { value: "fl", label: "Florida" },
  { value: "ny", label: "New York" },
  { value: "ca", label: "California" },
  { value: "tx", label: "Texas" },
  { value: "wa", label: "Washington" },
];

export default function AccountDetailsEdit() {
  const router = useRouter();
  const [toast, setToast] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "Jane",
      lastName: "Doe",
      country: "us",
      state: "fl",
      phone: "+1 562 787-8404",
      email: "jane@example.com",
      website: "www.website.com",
      linkedin: "linkedin.com/in/janedoe",
    },
  });

  const country = watch("country");
  const state = watch("state");

  const onSubmit = async (data: FormValues) => {
    console.log("Save account:", data);
    // TODO: wire to real backend when endpoint is confirmed
    setToast(true);
    setTimeout(() => {
      router.push("/seller/account");
    }, 1200);
  };

  const handleCancel = () => {
    router.push("/seller/account");
  };

  return (
    <div className="account-details-edit">
      <h1>Account Details</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="account-details-edit__form"
      >
        {/* General */}
        <section className="account-details-edit__section">
          <h3>General</h3>
          <Input
            label="First Name"
            placeholder="Placeholder text"
            {...register("firstName")}
            error={errors.firstName?.message}
          />
          <Input
            label="Last Name"
            placeholder="Placeholder text"
            {...register("lastName")}
            error={errors.lastName?.message}
          />
        </section>

        {/* Region */}
        <section className="account-details-edit__section">
          <h3>Region</h3>
          <div className="account-details-edit__row-2">
            <Dropdown
              label="Country"
              options={COUNTRIES}
              value={country}
              onChange={(v) => setValue("country", v, { shouldValidate: true })}
              error={errors.country?.message}
            />
            <Dropdown
              label="State"
              options={STATES}
              value={state}
              onChange={(v) => setValue("state", v, { shouldValidate: true })}
              error={errors.state?.message}
            />
          </div>
        </section>

        {/* Contact */}
        <section className="account-details-edit__section">
          <h3>Contact</h3>
          <div className="account-details-edit__row-2">
            <Input
              label="Phone"
              placeholder="+1 000-000-0000"
              {...register("phone")}
              error={errors.phone?.message}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              error={errors.email?.message}
            />
          </div>
        </section>

        {/* Socials */}
        <section className="account-details-edit__section">
          <h3>Socials</h3>
          <div className="account-details-edit__row-2">
            <Input
              label="Web Company Website"
              placeholder="www.website.com"
              {...register("website")}
              error={errors.website?.message}
            />
            <Input
              label="LinkedIn"
              placeholder="linkedin.com/in/..."
              {...register("linkedin")}
              error={errors.linkedin?.message}
            />
          </div>
        </section>

        {/* Actions */}
        <div className="account-details-edit__actions">
          <button
            type="button"
            className="account-details-edit__btn account-details-edit__btn--outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="account-details-edit__btn account-details-edit__btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Save"}
          </button>
        </div>
      </form>

      {toast && (
        <Toast
          variant="success"
          title="Saved"
          message="Your account details have been updated."
          onClose={() => setToast(false)}
        />
      )}
    </div>
  );
}