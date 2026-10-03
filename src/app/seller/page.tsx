"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, updateUserPhone, type UserPersonal } from "@/lib/api/user";
import { getSellerProfile, listSellerBusinesses, getSellerBusiness, sellerErrorMessage, type SellerBusiness } from "@/lib/api/seller";
import { Button } from "@/components/common/Button";
import LogoutButton from "@/components/common/LogoutButton";
import AccountSecurity from "@/components/common/AccountSecurity";
import BusinessEditor from "@/components/seller/BusinessEditor";
import BusinessProfile from "@/components/seller/BusinessProfile";
import BusinessImage from "@/components/seller/BusinessImage";
import "@/components/buyer/account/AccountDetails.css";
import "./page.css";

export default function SellerPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"listings" | "account">("listings");
  const [user, setUser] = useState<UserPersonal | null>(null);
  const [businesses, setBusinesses] = useState<SellerBusiness[]>([]);
  const [selected, setSelected] = useState<SellerBusiness | null>(null);
  const [editingBusiness, setEditingBusiness] = useState(false);
  const [editingAccount, setEditingAccount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) { router.replace("/signin"); return; }
        const account = await getCurrentUser();
        if (cancelled) return;
        setUser(account);
        try { await getSellerProfile(); }
        catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) return;
          throw error;
        }
        const items = await listSellerBusinesses();
        if (!cancelled) setBusinesses(items);
      } catch (error) { if (!cancelled) setError(sellerErrorMessage(error)); }
      finally { if (!cancelled) setLoading(false); }
    };
    void load();
    return () => { cancelled = true; };
  }, [router, retry]);

  const selectBusiness = async (id: string) => {
    setBusy(true); setError(null);
    try { setSelected(await getSellerBusiness(id)); }
    catch (error) { setError(sellerErrorMessage(error)); }
    finally { setBusy(false); }
  };
  const saveAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const phone = String(new FormData(event.currentTarget).get("phone") ?? "").trim();
    if (!phone) { setError("Phone is required."); return; }
    setBusy(true); setError(null);
    try { setUser(await updateUserPhone(phone)); setEditingAccount(false); }
    catch (error) { setError(sellerErrorMessage(error)); }
    finally { setBusy(false); }
  };
  const savedBusiness = (business: SellerBusiness) => {
    setBusinesses((current) => [business, ...current.filter((item) => item.id !== business.id)]);
    setSelected(business); setEditingBusiness(false);
  };

  return <div className="seller-page">
    <header><img src="/logo.png" alt="MatchBook" /><nav aria-label="Seller navigation">
      <button type="button" disabled={busy || editingBusiness || editingAccount} aria-current={tab === "listings" ? "page" : undefined} onClick={() => setTab("listings")}>Listings</button>
      <button type="button" disabled={busy || editingBusiness || editingAccount} aria-current={tab === "account" ? "page" : undefined} onClick={() => setTab("account")}>Account</button>
    </nav></header>
    <main>
      <h1>{tab === "account" ? "Account" : "Listings"}</h1>
      {loading && <p role="status">Loading your account…</p>}
      {error && <div role="alert"><p>{error}</p><Button type="button" disabled={busy} onClick={() => {
        setError(null); setLoading(true); setRetry((value) => value + 1);
      }}>Retry</Button></div>}
      {!loading && user && tab === "account" && <>
        <section aria-label="Personal information">
          <h2>Personal information</h2>
          <dl><dt>Name</dt><dd>{user.first_name} {user.last_name}</dd>
            <dt>Email</dt><dd>{user.email || "Not available"}</dd>
            <dt>Phone</dt><dd>{user.phone || "Not provided"}</dd></dl>
          {editingAccount ? <form onSubmit={saveAccount}>
            <label>Phone<input name="phone" type="tel" required maxLength={30} defaultValue={user.phone ?? ""} disabled={busy} /></label>
            <div className="seller-actions"><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
              <Button type="button" variant="secondary" disabled={busy} onClick={() => setEditingAccount(false)}>Cancel</Button></div>
          </form> : <div className="seller-actions"><Button type="button" onClick={() => setEditingAccount(true)}>Edit</Button><LogoutButton /></div>}
        </section>
        <AccountSecurity />
      </>}
      {!loading && user && tab === "listings" && <>
        {editingBusiness ? <BusinessEditor key={selected?.id ?? "new"} business={selected} onSaved={savedBusiness} onCancel={() => setEditingBusiness(false)} />
          : selected ? <BusinessProfile key={selected.id} business={selected} onBack={() => setSelected(null)}
            onEdit={() => setEditingBusiness(true)} onUpdated={savedBusiness} onBusyChange={setBusy} /> : <>
            <Button type="button" disabled={busy || !!error} onClick={() => { setSelected(null); setEditingBusiness(true); }}>Create New Business</Button>
            {!error && !businesses.length && <p>You have no businesses yet. Create your first business to get started.</p>}
            <ul className="seller-listings">{businesses.map((business) => <li key={business.id}>
              <button type="button" disabled={busy} onClick={() => selectBusiness(business.id)}>
                <BusinessImage business={business} thumbnail />
                <strong>{business.dba || business.legal_name || "Untitled business"}</strong>
                <span>{business.city}, {business.state}</span><span>{business.status}</span>
              </button>
            </li>)}</ul>
            {busy && <p role="status">Loading business…</p>}
          </>}
      </>}
      {!loading && !user && <LogoutButton />}
    </main>
  </div>;
}

