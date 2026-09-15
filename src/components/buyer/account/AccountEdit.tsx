"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

import "./AccountEdit.css";

export default function AccountEdit() {
  const router = useRouter();

  const [name, setName] = useState("Placeholder text");

  const [country, setCountry] = useState("United States");
  const [state, setState] = useState("Florida");

  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("000-000-0000");

  const [email, setEmail] = useState("Placeholder text");

  const [linkedin, setLinkedin] =
    useState("Placeholder text");

  const handleCancel = () => {
    router.push("/buyer/account");
  };

  const handleSave = () => {
    /*
     * Backend/API integration will be connected
     * once the final API contract is available.
     */
    console.log("Account save requested:", {
      name,
      country,
      state,
      countryCode,
      phone,
      email,
      linkedin,
    });

    router.push("/buyer/account");
  };

  return (
    <main className="account-edit">
      <div className="account-edit__content">

        {/* =========================
            Title
           ========================= */}

        <h1 className="account-edit__title">
          Account Details
        </h1>

        {/* =========================
            General
           ========================= */}

        <section className="account-edit__section">
          <h2 className="account-edit__section-title">
            General
          </h2>

          <div className="account-edit__divider" />

          <div className="account-edit__field">
            <label
              htmlFor="account-name"
              className="account-edit__label"
            >
              Name
            </label>

            <input
              id="account-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              className="account-edit__input account-edit__input--name"
            />
          </div>
        </section>

        {/* =========================
            Region
           ========================= */}

        <section className="account-edit__section">
          <h2 className="account-edit__section-title">
            Region
          </h2>

          <div className="account-edit__divider" />

          <div className="account-edit__two-column">

            <div className="account-edit__field">
              <label
                htmlFor="account-country"
                className="account-edit__label"
              >
                Country
              </label>

              <div className="account-edit__select-wrapper">
                <select
                  id="account-country"
                  value={country}
                  onChange={(event) =>
                    setCountry(event.target.value)
                  }
                  className="account-edit__select"
                >
                  <option>United States</option>
                  <option>India</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                </select>

                <ChevronDown
                  className="account-edit__select-icon"
                  size={18}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="account-edit__field">
              <label
                htmlFor="account-state"
                className="account-edit__label"
              >
                State
              </label>

              <div className="account-edit__select-wrapper">
                <select
                  id="account-state"
                  value={state}
                  onChange={(event) =>
                    setState(event.target.value)
                  }
                  className="account-edit__select"
                >
                  <option>Florida</option>
                  <option>California</option>
                  <option>Texas</option>
                  <option>New York</option>
                </select>

                <ChevronDown
                  className="account-edit__select-icon"
                  size={18}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </div>
            </div>

          </div>
        </section>

        {/* =========================
            Contact
           ========================= */}

        <section className="account-edit__section">
          <h2 className="account-edit__section-title">
            Contact
          </h2>

          <div className="account-edit__divider" />

          <div className="account-edit__two-column">

            <div className="account-edit__field">
              <label
                htmlFor="account-phone"
                className="account-edit__label"
              >
                Phone
              </label>

              <div className="account-edit__phone">
                <select
                  value={countryCode}
                  onChange={(event) =>
                    setCountryCode(event.target.value)
                  }
                  className="account-edit__country-code"
                  aria-label="Country calling code"
                >
                  <option>+1</option>
                  <option>+91</option>
                  <option>+44</option>
                  <option>+61</option>
                </select>

                <input
                  id="account-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  className="account-edit__input account-edit__input--phone"
                />
              </div>
            </div>

            <div className="account-edit__field">
              <label
                htmlFor="account-email"
                className="account-edit__label"
              >
                Email
              </label>

              <input
                id="account-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className="account-edit__input"
              />
            </div>

          </div>
        </section>

        {/* =========================
            Socials
           ========================= */}

        <section className="account-edit__section">
          <h2 className="account-edit__section-title">
            Socials
          </h2>

          <div className="account-edit__divider" />

          <div className="account-edit__field">
            <label
              htmlFor="account-linkedin"
              className="account-edit__label"
            >
              LinkedIn
            </label>

            <input
              id="account-linkedin"
              type="text"
              value={linkedin}
              onChange={(event) =>
                setLinkedin(event.target.value)
              }
              className="account-edit__input account-edit__input--linkedin"
            />
          </div>
        </section>

        {/* =========================
            Actions
           ========================= */}

        <div className="account-edit__actions">

          <button
            type="button"
            className="account-edit__cancel"
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="account-edit__save"
            onClick={handleSave}
          >
            Save
          </button>

        </div>

      </div>
    </main>
  );
}