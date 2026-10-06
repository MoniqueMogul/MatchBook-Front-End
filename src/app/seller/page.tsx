"use client";

import ContentSkeleton from "@/components/common/ContentSkeleton";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  BriefcaseBusiness,
  FileText,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  getCurrentUser,
  updateUserPhone,
  type UserPersonal,
} from "@/lib/api/user";
import {
  getSellerProfile,
  listSellerBusinesses,
  getSellerBusiness,
  sellerErrorMessage,
  type SellerBusiness,
} from "@/lib/api/seller";
import { Button } from "@/components/common/Button";
import LogoutButton from "@/components/common/LogoutButton";
import AccountSecurity from "@/components/common/AccountSecurity";
import Sidebar from "@/components/dashboard/Sidebar";
import SellerMessages from "@/components/seller/SellerMessages";
import BusinessEditor from "@/components/seller/BusinessEditor";
import BusinessProfile from "@/components/seller/BusinessProfile";
import BusinessImage from "@/components/seller/BusinessImage";
import DocumentsDashboard from "@/components/buyer/documents/DocumentsDashboard";
import "@/components/buyer/account/AccountDetails.css";
import "./page.css";

type SellerTab =
  | "listings"
  | "deals"
  | "documents"
  | "messages"
  | "account";

const tabTitle: Record<SellerTab, string> = {
  listings: "Listings",
  deals: "Deals",
  documents: "Documents",
  messages: "Messages",
  account: "Account",
};

function ComingSoon({
  type,
}: {
  type: "deals" | "documents";
}) {
  const isDeals = type === "deals";

  return (
    <section
      className="seller-coming-soon"
      aria-labelledby={`${type}-coming-soon-title`}
    >
      <div className="seller-coming-soon__icon">
        {isDeals ? (
          <BriefcaseBusiness
            size={28}
            aria-hidden="true"
          />
        ) : (
          <FileText
            size={28}
            aria-hidden="true"
          />
        )}
      </div>

      <span className="seller-coming-soon__eyebrow">
        Coming soon
      </span>

      <h2 id={`${type}-coming-soon-title`}>
        {isDeals
          ? "Seller deals are on the way"
          : "Seller documents are on the way"}
      </h2>

      <p>
        {isDeals
          ? "This is where you’ll manage active buyer opportunities and follow each transaction as it moves through the MatchBook deal process."
          : "This is where you’ll manage business and transaction documents used during verification and due diligence."}
      </p>
    </section>
  );
}

export default function SellerPage() {
  const router = useRouter();

  const [navigationMessage, setNavigationMessage] =
    useState<string | null>(null);

  const [activeNavigation, setActiveNavigation] =
    useState("profile");

  const [tab, setTab] =
    useState<SellerTab>("listings");

  const [user, setUser] =
    useState<UserPersonal | null>(null);

  const [businesses, setBusinesses] =
    useState<SellerBusiness[]>([]);

  const [selected, setSelected] =
    useState<SellerBusiness | null>(null);

  const [documentsBusinessId, setDocumentsBusinessId] =
    useState<string | null>(null);

  const [editingBusiness, setEditingBusiness] =
    useState(false);

  const [editingAccount, setEditingAccount] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [retry, setRetry] =
    useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const {
          data,
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !data.user) {
          router.replace("/signin");
          return;
        }

        const account = await getCurrentUser();

        if (cancelled) {
          return;
        }

        setUser(account);

        /*
         * A seller profile may not exist until the user creates their
         * first business. A 404 here is therefore not a fatal page error.
         */
        try {
          await getSellerProfile();
        } catch (profileError) {
          if (
            !axios.isAxiosError(profileError) ||
            profileError.response?.status !== 404
          ) {
            throw profileError;
          }
        }

        /*
         * Always ask for the user's businesses, even when the seller
         * ownership profile has not been created yet. This keeps the
         * page load behavior separate from profile creation.
         */
        const items =
          await listSellerBusinesses();

        if (!cancelled) {
          setBusinesses(items);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            sellerErrorMessage(loadError),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [router, retry]);

  const selectBusiness = async (id: string) => {
    setBusy(true);
    setError(null);

    try {
      const business =
        await getSellerBusiness(id);

      setSelected(business);
    } catch (selectError) {
      setError(
        sellerErrorMessage(selectError),
      );
    } finally {
      setBusy(false);
    }
  };

  const saveAccount = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const phone = String(
      new FormData(
        event.currentTarget,
      ).get("phone") ?? "",
    ).trim();

    if (!phone) {
      setError("Phone is required.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const updated =
        await updateUserPhone(phone);

      setUser(updated);
      setEditingAccount(false);
    } catch (accountError) {
      setError(
        sellerErrorMessage(accountError),
      );
    } finally {
      setBusy(false);
    }
  };

  const savedBusiness = (
    business: SellerBusiness,
  ) => {
    /*
     * BusinessEditor supplies the canonical record returned by
     * the backend after the business is saved.
     */
    setBusinesses((current) => [
      business,
      ...current.filter(
        (item) =>
          item.id !== business.id,
      ),
    ]);

    setSelected(business);
    setEditingBusiness(false);
    setTab("listings");
    setActiveNavigation("profile");
    setError(null);
  };

  const navigateSeller = (
    id: string,
  ) => {
    setNavigationMessage(null);

    switch (id) {
      case "home":
        setTab("listings");
        setActiveNavigation("home");
        setSelected(null);
        setEditingBusiness(false);
        break;

      case "profile":
        setTab("listings");
        setActiveNavigation("profile");
        break;

      case "deals":
        setTab("deals");
        setActiveNavigation("deals");
        setSelected(null);
        setEditingBusiness(false);
        break;

      case "documents":
        setTab("documents");
        setActiveNavigation("documents");
        setSelected(null);
        setEditingBusiness(false);

        if (businesses.length === 1) {
          setDocumentsBusinessId(businesses[0].id);
        } else {
          setDocumentsBusinessId(null);
        }

        break;

      case "messages":
        setTab("messages");
        setActiveNavigation("messages");
        setSelected(null);
        setEditingBusiness(false);
        break;

      case "account":
      case "settings":
        setTab("account");
        setActiveNavigation("account");
        setSelected(null);
        setEditingBusiness(false);
        break;

      default:
        setNavigationMessage(
          `${
            id.charAt(0).toUpperCase() +
            id.slice(1)
          } is not yet available for seller accounts.`,
        );
        break;
    }

    return false;
  };

  const listedBusinesses = businesses.filter(
    (business) => business.status === "active",
  ).length;
  const unlistedBusinesses = businesses.length - listedBusinesses;

  return (
    <div className="seller-page dashboard-shell">
      <Sidebar
        profileLabel="Listings"
        activeItem={
          tab === "listings" &&
          (selected || editingBusiness)
            ? "profile"
            : activeNavigation
        }
        onNavigate={navigateSeller}
      />

      <main
        className={`seller-content${
          tab === "messages"
            ? " seller-content--messages"
            : ""
        }`}
      >
        {navigationMessage && (
          <p role="status">
            {navigationMessage}
          </p>
        )}

        <div className="seller-listings-header">
           {!editingBusiness && tab !== "documents" && (
            <h1>{tabTitle[tab]}</h1>
          )}

          {tab === "listings" &&
            !editingBusiness &&
            !selected && (
              <Button
                type="button"
                disabled={busy || !!error}
                onClick={() => {
                  setSelected(null);
                  setEditingBusiness(true);
                }}
              >
                Create New Business
              </Button>
            )}
        </div>

        {loading && (
          <ContentSkeleton
            shape={
              tab === "messages"
                ? "messages"
                : tab === "account"
                  ? "account"
                  : "listings"
            }
            label="Loading your seller account"
          />
        )}

        {error && (
          <div role="alert">
            <p>{error}</p>

            <Button
              type="button"
              disabled={busy}
              onClick={() => {
                setError(null);
                setLoading(true);
                setRetry(
                  (value) => value + 1,
                );
              }}
            >
              Retry
            </Button>
          </div>
        )}

        {!loading && user && (
          <div hidden={tab !== "account"}>
            <section aria-label="Personal information">
              <h2>Personal information</h2>

              <dl>
                <dt>Name</dt>
                <dd>
                  {user.first_name}{" "}
                  {user.last_name}
                </dd>

                <dt>Email</dt>
                <dd>
                  {user.email ||
                    "Not available"}
                </dd>

                <dt>Phone</dt>
                <dd>
                  {user.phone ||
                    "Not provided"}
                </dd>
              </dl>

              {editingAccount ? (
                <form onSubmit={saveAccount}>
                  <label>
                    Phone

                    <input
                      name="phone"
                      type="tel"
                      required
                      maxLength={30}
                      defaultValue={
                        user.phone ?? ""
                      }
                      disabled={busy}
                    />
                  </label>

                  <div className="seller-actions">
                    <Button
                      type="submit"
                      disabled={busy}
                    >
                      {busy
                        ? "Saving…"
                        : "Save"}
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busy}
                      onClick={() =>
                        setEditingAccount(
                          false,
                        )
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="seller-actions">
                  <Button
                    type="button"
                    onClick={() =>
                      setEditingAccount(
                        true,
                      )
                    }
                  >
                    Edit
                  </Button>

                  <LogoutButton />
                </div>
              )}
            </section>

            <AccountSecurity />
          </div>
        )}

        {!loading && user && (
          <div hidden={tab !== "listings"}>
            {editingBusiness ? (
              <BusinessEditor
                key={selected?.id ?? "new"}
                business={selected}
                onSaved={savedBusiness}
                onCancel={() =>
                  setEditingBusiness(false)
                }
              />
            ) : selected ? (
              <BusinessProfile
                key={selected.id}
                business={selected}
                onBack={() =>
                  setSelected(null)
                }
                onEdit={() =>
                  setEditingBusiness(true)
                }
                onUpdated={savedBusiness}
                onBusyChange={setBusy}
              />
            ) : (
              <div className="seller-listings-workspace">
                <div className="seller-listings-workspace__primary">
                  {!error &&
                    !businesses.length && (
                      <p>
                        You have no businesses
                        yet. Create your first
                        business to get started.
                      </p>
                    )}

                  <ul className="seller-listings">
                    {businesses.map(
                      (business) => (
                        <li key={business.id}>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              selectBusiness(
                                business.id,
                              )
                            }
                          >
                            <BusinessImage
                              business={business}
                              thumbnail
                            />

                            <span className="seller-listing-card__copy">
                              <strong>
                                {business.dba ||
                                  business.legal_name ||
                                  "Untitled business"}
                              </strong>

                              <span>
                                {business.city}
                                {business.state
                                  ? `, ${business.state}`
                                  : ""}
                              </span>

                              <span className="seller-listing-card__status">
                                {business.status}
                              </span>
                            </span>
                          </button>
                        </li>
                      ),
                    )}
                  </ul>

                  {busy && (
                    <ContentSkeleton
                      shape="options"
                      label="Loading business"
                    />
                  )}
                </div>

                <aside className="seller-context-rail" aria-label="Listing status summary">
                  <section className="seller-context-card">
                    <span className="seller-context-card__eyebrow">Portfolio</span>
                    <h2>Listing Status</h2>

                    <dl className="seller-context-card__stats">
                      <div>
                        <dt>Total businesses</dt>
                        <dd>{businesses.length}</dd>
                      </div>
                      <div>
                        <dt>Listed</dt>
                        <dd>{listedBusinesses}</dd>
                      </div>
                      <div>
                        <dt>Not listed</dt>
                        <dd>{unlistedBusinesses}</dd>
                      </div>
                    </dl>

                    <p>
                      Open a business to review its profile, edit its information,
                      or change whether it is listed.
                    </p>
                  </section>
                </aside>
              </div>
            )}
          </div>
        )}

        {!loading &&
          user &&
          tab === "deals" && (
            <ComingSoon type="deals" />
          )}

        {!loading &&
          user &&
          tab === "documents" && (
            <>
              {documentsBusinessId ? (
                <DocumentsDashboard
                  key={documentsBusinessId}
                  data={{
                    isVerified: false,
                    documents: [],
                  }}
                  businessId={documentsBusinessId}
                />
              ) : businesses.length > 1 ? (
                <section>
                  <h2>Select a Business</h2>
                  <p>
                    Choose the business whose documents you want to manage.
                  </p>

                  <div>
                    {businesses.map((business) => (
                      <Button
                        key={business.id}
                        type="button"
                        onClick={() =>
                          setDocumentsBusinessId(business.id)
                        }
                      >
                        {business.dba ||
                          business.legal_name ||
                          "Untitled business"}
                      </Button>
                    ))}
                  </div>
                </section>
              ) : (
                <section>
                  <h2>No Business Available</h2>
                  <p>
                    Create a business first before uploading verification
                    documents.
                  </p>
                </section>
              )}
            </>
          )}

        {!loading &&
          user &&
          tab === "messages" && (
            <SellerMessages user={user} />
          )}

        {!loading && !user && (
          <LogoutButton />
        )}
      </main>
    </div>
  );
}
