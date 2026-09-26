"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { supabase } from "@/lib/supabase";
import {
  getBuyerProfile,
  upsertBuyerProfile,
  type BuyerProfile,
} from "@/lib/api/buyer";

import "./AccountEdit.css";

export default function AccountEdit() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadAccount = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          {
            data: { user },
            error: userError,
          },
          profile,
        ] = await Promise.all([
          supabase.auth.getUser(),
          getBuyerProfile(),
        ]);

        if (userError) {
          throw userError;
        }

        if (!user) {
          throw new Error("You are not authenticated.");
        }

        if (cancelled) {
          return;
        }

        setFirstName(
          user.user_metadata?.first_name?.trim() ?? "",
        );

        setLastName(
          user.user_metadata?.last_name?.trim() ?? "",
        );

        setEmail(user.email ?? "");

        setCity(profile.city ?? "");
        setState(profile.state ?? "");

        /*
         * Phone is intentionally not loaded yet.
         * Tim's User API will provide the backend source
         * for this field.
         */
        setPhone("");
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load account details.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAccount();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCancel = () => {
    router.push("/buyer/account");
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      /*
       * ----------------------------------------------
       * 1. Update Supabase Auth
       * ----------------------------------------------
       *
       * First name + last name are stored in
       * user_metadata.
       *
       * Email is stored on the Supabase Auth user.
       */
      const { data: updatedAuth, error: authError } =
        await supabase.auth.updateUser({
          email: email.trim(),
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        });

      if (authError) {
        throw authError;
      }

      if (!updatedAuth.user) {
        throw new Error(
          "Failed to update your account information.",
        );
      }

      /*
       * ----------------------------------------------
       * 2. Update Buyer Profile location
       * ----------------------------------------------
       *
       * Only city + state are changed here.
       *
       * Existing county, zip code, buyer type, and
       * other Buyer Profile fields remain untouched.
       */
      await upsertBuyerProfile({
        city: city.trim() || null,
        state: state.trim() || null,
      });

      /*
       * ----------------------------------------------
       * 3. Phone
       * ----------------------------------------------
       *
       * Intentionally not sent yet.
       *
       * Tim's User API will be wired here once the
       * backend endpoint is available.
       */

      /*
       * ----------------------------------------------
       * 4. LinkedIn
       * ----------------------------------------------
       *
       * Intentionally not sent.
       *
       * LinkedIn is currently out of scope.
       */

      router.push("/buyer/account");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save account details.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="account-edit">
        <div className="account-edit__content">
          <p>Loading account details...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="account-edit">
      <div className="account-edit__content">
        <h1 className="account-edit__title">
          Account Details
        </h1>

        {error && (
          <div
            role="alert"
            className="account-edit__error"
          >
            {error}
          </div>
        )}

        {/* =========================
            General
           ========================= */}

        <section className="account-edit__section">
          <h2 className="account-edit__section-title">
            General
          </h2>

          <div className="account-edit__divider" />

          <div className="account-edit__two-column">
            <div className="account-edit__field">
              <label
                htmlFor="account-first-name"
                className="account-edit__label"
              >
                First Name
              </label>

              <input
                id="account-first-name"
                type="text"
                value={firstName}
                onChange={(event) =>
                  setFirstName(event.target.value)
                }
                className="account-edit__input"
                autoComplete="given-name"
              />
            </div>

            <div className="account-edit__field">
              <label
                htmlFor="account-last-name"
                className="account-edit__label"
              >
                Last Name
              </label>

              <input
                id="account-last-name"
                type="text"
                value={lastName}
                onChange={(event) =>
                  setLastName(event.target.value)
                }
                className="account-edit__input"
                autoComplete="family-name"
              />
            </div>
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
                htmlFor="account-city"
                className="account-edit__label"
              >
                City
              </label>

              <input
                id="account-city"
                type="text"
                value={city}
                onChange={(event) =>
                  setCity(event.target.value)
                }
                className="account-edit__input"
                autoComplete="address-level2"
              />
            </div>

            <div className="account-edit__field">
              <label
                htmlFor="account-state"
                className="account-edit__label"
              >
                State
              </label>

              <input
                id="account-state"
                type="text"
                value={state}
                onChange={(event) =>
                  setState(event.target.value)
                }
                className="account-edit__input"
                autoComplete="address-level1"
              />
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
                  disabled
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
                  placeholder="Coming soon"
                  className="account-edit__input account-edit__input--phone"
                  disabled
                />
              </div>

              <span className="account-edit__helper">
                Phone editing will be available once the
                User API is connected.
              </span>
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
                autoComplete="email"
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

            <div
              id="account-linkedin"
              className="account-edit__coming-soon"
            >
              Coming soon
            </div>
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
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="account-edit__save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </main>
  );
}