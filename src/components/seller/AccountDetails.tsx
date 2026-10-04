"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  Link as LinkIcon,
  Pencil,
} from "lucide-react";

import DeleteConfirmationModal from "./modals/DeleteConfirmationModal";
import "./AccountDetails.css";

interface AccountData {
  firstName: string;
  lastName: string;
  region: string;
  phone: string;
  email: string;
  website: string;
  linkedin: string;
}

const PLACEHOLDER: AccountData = {
  firstName: "Jane",
  lastName: "Doe",
  region: "Florida, USA",
  phone: "+1 562 787-8404",
  email: "jane@example.com",
  website: "www.website.com",
  linkedin: "linkedin.com/in/janedoe",
};

export default function AccountDetails() {
  const router = useRouter();
  const [data] = useState<AccountData>(PLACEHOLDER);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="account-details">
      <header className="account-details__header">
        <h1>Account Details</h1>
        <button
          className="account-details__edit-icon"
          onClick={() => router.push("/seller/account/edit")}
          aria-label="Edit"
        >
          <Pencil size={18} strokeWidth={1.8} />
        </button>
      </header>

      <section className="account-details__section">
        <h3>General</h3>
        <div className="account-details__row">
          <User size={18} strokeWidth={1.6} />
          <span>
            {data.firstName} {data.lastName}
          </span>
        </div>
      </section>

      <section className="account-details__section">
        <h3>Region</h3>
        <div className="account-details__row">
          <MapPin size={18} strokeWidth={1.6} />
          <span>{data.region}</span>
        </div>
      </section>

      <section className="account-details__section">
        <h3>Contact</h3>
        <div className="account-details__row">
          <Phone size={18} strokeWidth={1.6} />
          <span>{data.phone}</span>
        </div>
        <div className="account-details__row">
          <Mail size={18} strokeWidth={1.6} />
          <span>{data.email}</span>
        </div>
      </section>

      <section className="account-details__section">
        <h3>Socials</h3>
        <div className="account-details__row">
          <Globe size={18} strokeWidth={1.6} />
          <span>{data.website}</span>
        </div>
        <div className="account-details__row">
          <LinkIcon size={18} strokeWidth={1.6} />
          <span>{data.linkedin}</span>
        </div>
      </section>

      <div className="account-details__actions">
        <button
          className="account-details__btn account-details__btn--danger-link"
          onClick={() => setDeleteOpen(true)}
        >
          Delete Account
        </button>
        <button
          className="account-details__btn account-details__btn--primary"
          onClick={() => router.push("/seller/account/edit")}
        >
          Edit
        </button>
      </div>

      {deleteOpen && (
        <DeleteConfirmationModal
          message="Once you delete your account, this action cannot be undone."
          onCancel={() => setDeleteOpen(false)}
          onConfirm={async (_password) => {
            // TODO: wire to backend delete endpoint
            console.log("Delete account requested");
            setDeleteOpen(false);
          }}
        />
      )}
    </div>
  );
}