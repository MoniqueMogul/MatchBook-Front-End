"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardSidebar from "@/components/buyer/profile/DashboardSidebar";
import AccountDetails from "@/components/buyer/account/AccountDetails";
import { supabase } from "@/lib/supabase";
import { getBuyerProfile, type BuyerProfile } from "@/lib/api/buyer";

import "./page.css";

interface AccountData {
  firstName: string;
  lastName: string;
  email: string;
  region: string;
  phone: string;
}

export default function BuyerAccountPage() {
  const router = useRouter();

  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
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

        const firstName =
          user.user_metadata?.first_name?.trim() ?? "";

        const lastName =
          user.user_metadata?.last_name?.trim() ?? "";

        const region = [
          profile.city,
          profile.state,
        ]
          .filter(Boolean)
          .join(", ");

        setAccount({
          firstName,
          lastName,
          email: user.email ?? "",
          region: region || "Not available",
          // Phone will be connected to Tim's User API.
          phone: "Not available yet",
        });
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

  return (
    <div className="buyer-account-page">
      <DashboardSidebar />

      <div className="buyer-account-page__main">
        {loading && <p>Loading account details...</p>}

        {error && (
          <div
            role="alert"
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#fff1f1",
              color: "#b42318",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && account && (
          <AccountDetails
            firstName={account.firstName}
            lastName={account.lastName}
            region={account.region}
            phone={account.phone}
            email={account.email}
            onEdit={() => {
              router.push("/buyer/account/edit");
            }}
          />
        )}
      </div>
    </div>
  );
}