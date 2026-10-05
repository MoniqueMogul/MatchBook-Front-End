"use client";

import ContentSkeleton from "@/components/common/ContentSkeleton";
import { useEffect, useState } from "react";
import {
  Check,
  Clock3,
  FileText,
  Lock,
  Plus,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

import {
  getDocumentDownloadUrl,
  listBusinessDocuments,
  uploadAndConfirmBusinessDocument,
} from "@/lib/api/documents/documents";
import type {
  DocumentsViewData,
  DocumentStatus,
  DocumentUploadInput,
  VerifiedDocument,
} from "@/lib/api/documents/documents.types";

import DocumentUploadModal from "./DocumentUploadModal";

import "./DocumentsDashboard.css";

interface DocumentsDashboardProps {
  data: DocumentsViewData;
  businessId?: string;
}

const statusCopy: Record<
  DocumentStatus,
  { label: string; icon: typeof Clock3 }
> = {
  pending: { label: "Under Review", icon: Clock3 },
  approved: { label: "Approved", icon: Check },
  rejected: { label: "Rejected", icon: XCircle },
};

export default function DocumentsDashboard({
  data,
  businessId,
}: DocumentsDashboardProps) {
  const [documents, setDocuments] = useState<VerifiedDocument[]>(
    data.documents,
  );
  const [uploadModalMode, setUploadModalMode] = useState<
    "official" | "tax" | null
  >(null);
  const [isLoadingDocuments, setIsLoadingDocuments] =
    useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadDocuments(): Promise<void> {
      try {
        const existingDocuments = await listBusinessDocuments(businessId);

        if (isActive) {
          setDocuments(existingDocuments);
          setLoadError("");
        }
      } catch (error) {
        if (isActive) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load your existing documents.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingDocuments(false);
        }
      }
    }

    void loadDocuments();

    return () => {
      isActive = false;
    };
  }, [businessId]);

  const hasDocuments = documents.length > 0;

  const hasPendingDocuments = documents.some(
    (document) => document.status === "pending",
  );

  async function handleDocumentUpload(
    uploads: DocumentUploadInput[],
  ): Promise<Array<{ file: File; error?: Error }>> {
    const outcomes = await Promise.allSettled(
      uploads.map((input) =>
        uploadAndConfirmBusinessDocument(
          businessId,
          input,
        ),
      ),
    );

    const succeeded = outcomes
      .filter(
        (
          outcome,
        ): outcome is PromiseFulfilledResult<VerifiedDocument> =>
          outcome.status === "fulfilled",
      )
      .map((outcome) => outcome.value);

    if (succeeded.length > 0) {
      setDocuments((current) => [...succeeded, ...current]);
      setLoadError("");
    }

    return outcomes.map((outcome, index) => ({
      file: uploads[index].file,
      error:
        outcome.status === "rejected"
          ? outcome.reason instanceof Error
            ? outcome.reason
            : new Error("The document could not be uploaded.")
          : undefined,
    }));
  }

  async function handleDownload(documentId: string): Promise<void> {
  try {
    const { download_url } =
      await getDocumentDownloadUrl(documentId);

    window.open(
      download_url,
      "_blank",
      "noopener,noreferrer",
    );
  } catch (error) {
    setLoadError(
      error instanceof Error
        ? error.message
        : "Unable to download the document.",
    );
  }
}

  return (
    <main className="documents-dashboard">
      <h1>Documents</h1>

      {!isLoadingDocuments && loadError && (
        <div
          className="documents-dashboard__pending-banner"
          role="alert"
        >
          <XCircle size={20} />
          <div>
            <strong>Documents Could Not Be Loaded</strong>
            <span>{loadError}</span>
          </div>
        </div>
      )}

      {!isLoadingDocuments && hasPendingDocuments && (
        <div className="documents-dashboard__pending-banner">
          <Clock3 size={20} />
          <div>
            <strong>Documents Under Review</strong>
            <span>
              Your business documents have been submitted and are
              currently being reviewed by our team.
            </span>
          </div>
        </div>
      )}

      {!isLoadingDocuments && !hasDocuments && (
        <div className="documents-dashboard__verify-banner">
          <div className="documents-dashboard__verify-copy">
            <span className="documents-dashboard__verify-icon">
              <ShieldCheck size={20} />
            </span>

            <div>
              <strong>Verify Your Business</strong>
              <p>
                Upload your business tax reports so our team can
                review and verify your business information.
              </p>
            </div>
          </div>

          <ul className="documents-dashboard__verify-benefits">
            <li>
              <Check size={13} />
              Keep your documents secure
            </li>
            <li>
              <Check size={13} />
              Help verify your business
            </li>
            <li>
              <Check size={13} />
              Build trust with buyers
            </li>
          </ul>
        </div>
      )}

      {isLoadingDocuments ? (
        <ContentSkeleton
          shape="documents"
          label="Loading documents"
        />
      ) : loadError ? null : hasDocuments ? (
        <section className="documents-dashboard__table-section">
          <div className="documents-dashboard__table-header">
            <div>
              <h2>Business Documents</h2>
              <p>
                These files are private and will only be visible to
                you and our team.
              </p>
            </div>

            <button
              type="button"
              className="documents-dashboard__upload-button"
              onClick={() => setUploadModalMode("tax")}
            >
              <Plus size={16} />
              Upload Tax Reports
            </button>
          </div>

          <table className="documents-dashboard__table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Visibility</th>
                <th>Uploaded On</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {documents.map((document) => {
                const status = statusCopy[document.status];
                const StatusIcon = status.icon;

                return (
                  <tr key={document.id}>
                    <td>
                      <span className="documents-dashboard__file-cell">
                        <FileText size={16} strokeWidth={1.5} />
                        {document.name}
                      </span>
                    </td>
                    <td>{document.type}</td>
                    <td>
                      <span
                        className={`documents-dashboard__status documents-dashboard__status--${document.status}`}
                      >
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <span className="documents-dashboard__visibility">
                        <Lock size={13} />
                        {document.visibility === "private"
                          ? "Private to you"
                          : "Shared with authorized users"}
                      </span>
                    </td>
                    <td>
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(document.uploadedAt))}
                    </td>
                    <td>
                    <button
                      type="button"
                      onClick={() => handleDownload(document.id)}
                    >
                      Download
                    </button>
                  </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ) : (
        <>
          <h2 className="documents-dashboard__choose-heading">
            Upload Your Business Documents
          </h2>

          <div className="documents-dashboard__methods">
            <article className="documents-dashboard__method-card">
              <span className="documents-dashboard__method-icon">
                <FileText size={22} strokeWidth={1.5} />
              </span>
              <h3>Upload Official Documents</h3>
              <p>
                Provide bank statements or other official
                documentation to verify your funds.
              </p>
              <button
                type="button"
                onClick={() => setUploadModalMode("official")}
              >
                Upload Documents
              </button>
            </article>

            <article className="documents-dashboard__method-card">
              <span className="documents-dashboard__method-icon">
                <FileText size={22} strokeWidth={1.5} />
              </span>
              <h3>Upload Tax Reports</h3>
              <p>
                Upload your business tax reports for verification
                by our team.
              </p>
              <button
                type="button"
                onClick={() => setUploadModalMode("tax")}
              >
                Upload Tax Reports
              </button>
            </article>

            <article className="documents-dashboard__method-card">
              <span className="documents-dashboard__method-icon">
                <User size={22} strokeWidth={1.5} />
              </span>
              <h3>Speak with Our Team</h3>
              <p>
                Schedule a quick call with our team to verify your
                funds and answer any questions.
              </p>
              <button type="button" disabled>
                Schedule a Call
              </button>
            </article>
          </div>
        </>
      )}

      {uploadModalMode && (
        <DocumentUploadModal
          mode={uploadModalMode}
          onClose={() => setUploadModalMode(null)}
          onUpload={handleDocumentUpload}
        />
      )}
    </main>
  );
}
