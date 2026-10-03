"use client";

import {
  UserRound,
  MapPin,
  Smartphone,
  Mail,
  Pencil,
} from "lucide-react";

import "./AccountDetails.css";
import AccountSecurity from "@/components/common/AccountSecurity";
import LogoutButton from "@/components/common/LogoutButton";

interface AccountDetailsProps {
  firstName: string;
  lastName: string;
  region: string;
  phone: string;
  email: string;
  onEdit?: () => void;
}

export default function AccountDetails({
  firstName,
  lastName,
  region,
  phone,
  email,
  onEdit,
}: AccountDetailsProps) {
  const fullName =
    [firstName, lastName]
      .filter(Boolean)
      .join(" ") || "Not available";

  return (
    <main className="account-details">
      <div className="account-details__content">
        <h1 className="account-details__title">
          Account Details
        </h1>

        {/* General */}
        <section className="account-details__section">
          <h2 className="account-details__section-title">
            General
          </h2>

          <div className="account-details__divider" />

          <div className="account-details__item">
            <UserRound
              className="account-details__icon"
              size={24}
              strokeWidth={1.8}
            />

            <span className="account-details__value">
              {fullName}
            </span>
          </div>
        </section>

        {/* Region */}
        <section className="account-details__section">
          <h2 className="account-details__section-title">
            Region
          </h2>

          <div className="account-details__divider" />

          <div className="account-details__item">
            <MapPin
              className="account-details__icon"
              size={24}
              strokeWidth={1.8}
            />

            <span className="account-details__value">
              {region || "Not available"}
            </span>
          </div>
        </section>

        {/* Contact */}
        <section className="account-details__section">
          <h2 className="account-details__section-title">
            Contact
          </h2>

          <div className="account-details__divider" />

          <div className="account-details__contact">
            <div className="account-details__item">
              <Smartphone
                className="account-details__icon"
                size={24}
                strokeWidth={1.8}
              />

              <span className="account-details__value">
                {phone || "Not available yet"}
              </span>
            </div>

            <div className="account-details__item">
              <Mail
                className="account-details__icon"
                size={24}
                strokeWidth={1.8}
              />

              <span className="account-details__value">
                {email || "Not available"}
              </span>
            </div>
          </div>
        </section>

        {/* Socials */}
        <section className="account-details__section">
          <h2 className="account-details__section-title">
            Socials
          </h2>

          <div className="account-details__divider" />

          <div className="account-details__item">
            <div
              className="account-details__linkedin-icon"
              aria-hidden="true"
            >
              in
            </div>

            <span className="account-details__value">
              Coming soon
            </span>
          </div>
        </section>
        <AccountSecurity />
      </div>

      <div className="account-details__actions">
      <button
        type="button"
        className="account-details__edit"
        onClick={onEdit}
      >
        <Pencil
          size={18}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <span>Edit</span>
      </button>
      <LogoutButton />
      </div>
    </main>
  );
}