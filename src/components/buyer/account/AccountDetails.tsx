"use client";

import {
  UserRound,
  MapPin,
  Smartphone,
  Mail,
  Pencil,
} from "lucide-react";

import "./AccountDetails.css";

interface AccountDetailsProps {
  firstName?: string;
  lastName?: string;
  region?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  onEdit?: () => void;
}

export default function AccountDetails({
  firstName = "Firstname",
  lastName = "Lastname",
  region = "Florida, USA",
  phone = "+1562 787-8404",
  email = "useremail@gmail.com",
  linkedin = "linkedin.com",
  onEdit,
}: AccountDetailsProps) {
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
              {firstName} {lastName}
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
              {region}
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
                {phone}
              </span>
            </div>

            <div className="account-details__item">
              <Mail
                className="account-details__icon"
                size={24}
                strokeWidth={1.8}
              />

              <span className="account-details__value">
                {email}
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
              {linkedin}
            </span>
          </div>
        </section>
      </div>

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
    </main>
  );
}