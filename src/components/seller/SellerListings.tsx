"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";

import BusinessCard from "./BusinessCard";
import AddBusinessCard from "./AddBusinessCard";
import Toast, { type ToastVariant } from "./Toast";
import DeleteConfirmationModal from "./modals/DeleteConfirmationModal";
import IncompleteWarningModal from "./modals/IncompleteWarningModal";

import {
  getSellerBusinesses,
  publishBusiness,
  unpublishBusiness,
  deleteBusiness,
} from "@/lib/api/sellerBusinesses";
import type { Business } from "@/types/seller";

import "./SellerListings.css";

type Tab = "active" | "drafts";

interface ToastState {
  variant: ToastVariant;
  title: string;
  message: string;
}

export default function SellerListings() {
  const router = useRouter();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("active");

  const [toast, setToast] = useState<ToastState | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [incompleteTargetId, setIncompleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSellerBusinesses();
        setBusinesses(data);
      } catch (err) {
        console.error("Failed to load listings:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const active = businesses.filter((b) => b.status === "active");
  const drafts = businesses.filter((b) => b.status === "draft");
  const visible = tab === "active" ? active : drafts;

  /* ---------- Actions ---------- */

  const handleUnlist = async (id: string) => {
    const biz = businesses.find((b) => b.id === id);
    if (!biz) return;
    await unpublishBusiness(id);
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "draft" as const } : b))
    );
    setToast({
      variant: "info",
      title: "Un-Published",
      message: `${biz.name} listing has been moved to Draft Listings.`,
    });
  };

  const handlePublishRequest = (id: string) => {
    const biz = businesses.find((b) => b.id === id);
    if (!biz) return;
    if (biz.completion_percent < 100) {
      setIncompleteTargetId(id);
    } else {
      void performPublish(id);
    }
  };

  const performPublish = async (id: string) => {
    const biz = businesses.find((b) => b.id === id);
    if (!biz) return;
    await publishBusiness(id);
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "active" as const } : b))
    );
    setToast({
      variant: "success",
      title: "Published",
      message: `${biz.name} listing has been published and moved to Active Listings.`,
    });
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteTargetId(id);
  };

  const performDelete = async (password: string) => {
    if (!deleteTargetId) return;
    const biz = businesses.find((b) => b.id === deleteTargetId);
    await deleteBusiness(deleteTargetId, password);
    setBusinesses((prev) => prev.filter((b) => b.id !== deleteTargetId));
    setDeleteTargetId(null);
    setToast({
      variant: "danger",
      title: "Deleted",
      message: `${biz?.name ?? "Listing"} has been deleted.`,
    });
  };

  /* ---------- Render ---------- */

  const deleteTargetBiz = businesses.find((b) => b.id === deleteTargetId);
  const incompleteTargetBiz = businesses.find((b) => b.id === incompleteTargetId);

  return (
    <div className="seller-listings">
      <header className="seller-listings__header">
        <h1 className="seller-listings__title">Your business listings</h1>
        <p className="seller-listings__subtitle">
          Manage what buyers see, pause a listing, or add another business.
        </p>
      </header>

      <div className="seller-listings__tabs">
        <button
          className={`seller-listings__tab ${tab === "active" ? "seller-listings__tab--active" : ""}`}
          onClick={() => setTab("active")}
        >
          Active <span className="seller-listings__tab-count">{active.length}</span>
        </button>
        <button
          className={`seller-listings__tab ${tab === "drafts" ? "seller-listings__tab--active" : ""}`}
          onClick={() => setTab("drafts")}
        >
          Drafts <span className="seller-listings__tab-count">{drafts.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="seller-listings__empty">Loading…</div>
      ) : (
        <div className="seller-listings__grid">
          {visible.map((biz) => (
            <BusinessCard
              key={biz.id}
              business={biz}
              onView={(id) => router.push(`/seller/listings/${id}`)}
              onUnlist={handleUnlist}
              onPublish={handlePublishRequest}
              onDelete={handleDeleteRequest}
            />
          ))}

          {tab === "active" && (
            <AddBusinessCard onClick={() => router.push("/seller/listings/new")} />
          )}
        </div>
      )}

      <footer className="seller-listings__footer">
        <Info size={14} strokeWidth={1.6} />
        <span>
          Financial and contact details stay private until both sides approve an
          introduction.
        </span>
      </footer>

      {deleteTargetId && deleteTargetBiz && (
        <DeleteConfirmationModal
          message="Once you delete the listing, this action cannot be undone."
          onCancel={() => setDeleteTargetId(null)}
          onConfirm={performDelete}
        />
      )}

      {incompleteTargetId && incompleteTargetBiz && (
        <IncompleteWarningModal
          businessName={incompleteTargetBiz.name}
          completionPercent={incompleteTargetBiz.completion_percent}
          onPublishAnyway={async () => {
            const id = incompleteTargetId;
            setIncompleteTargetId(null);
            await performPublish(id);
          }}
          onComplete={() => {
            const id = incompleteTargetId;
            setIncompleteTargetId(null);
            router.push(`/seller/listings/${id}/edit`);
          }}
          onClose={() => setIncompleteTargetId(null)}
        />
      )}

      {toast && (
        <Toast
          variant={toast.variant}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}