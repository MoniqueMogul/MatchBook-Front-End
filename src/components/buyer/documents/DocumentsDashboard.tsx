"use client";

import { useState } from "react";
import {
  Banknote,
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
  uploadAndVerifyBuyerDocuments,
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
}: DocumentsDashboardProps) {
  const [documents, setDocuments] = useState<VerifiedDocument[]>(
    data.documents,
  );
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);


  const isVerified = documents.length > 0;

  async function handleVerifiedDocuments(
    uploads: DocumentUploadInput[],
  ): Promise<void> {
    const uploadedDocuments =
      await uploadAndVerifyBuyerDocuments(uploads);

    setDocuments((current) => [
      ...uploadedDocuments,
      ...current,
    ]);
    setIsUploadModalOpen(false);
  }

  return (
    <main className="documents-dashboard">
      <h1>Documents</h1>

      {isVerified ? (
        <div className="documents-dashboard__pending-banner">
          <Clock3 size={20} />
          <div>
            <strong>Pending Verification</strong>
            <span>
              We are in the process of verifying the documents you
              submitted. Thank you for your patience! In the
              meanwhile feel free to explore some of our other
              features.
            </span>
          </div>
        </div>
      ) : (
        <div className="documents-dashboard__verify-banner">
          <div className="documents-dashboard__verify-copy">
            <span className="documents-dashboard__verify-icon">
              <ShieldCheck size={20} />
            </span>
            <div>
              <strong>Verify Your Funds</strong>
              <p>
                Use one of our secure methods to verify your
                purchasing power. This helps build trust with
                sellers and gives you access to more business
                listings.
              </p>
            </div>
          </div>

          <ul className="documents-dashboard__verify-benefits">
            <li>
              <Check size={13} />
              Build credibility
            </li>
            <li>
              <Check size={13} />
              Unlock more business listings
            </li>
            <li>
              <Check size={13} />
              Speed up the deal process
            </li>
          </ul>
        </div>
      )}

      {isVerified ? (
        <section className="documents-dashboard__table-section">
          <div className="documents-dashboard__table-header">
            <div>
              <h2>Upload Official Documents</h2>
              <p>
                These files are private and will only be visible to
                you and our team.
              </p>
            </div>

            <button
              type="button"
              className="documents-dashboard__upload-button"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Plus size={16} />
              Upload Documents
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
                          : "Visible to sellers who signed an NDA"}
                      </span>
                    </td>
                    <td>
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(document.uploadedAt))}
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
            Choose A Verification Method
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
                onClick={() => setIsUploadModalOpen(true)}
              >
                Upload Documents
              </button>
            </article>

            <article className="documents-dashboard__method-card">
              <span className="documents-dashboard__method-icon">
                <Banknote size={22} strokeWidth={1.5} />
              </span>
              <h3>Connect Bank Account</h3>
              <p>
                Securely link your bank account to verify your
                account in minutes.
              </p>
              <button type="button" disabled>
                Get Started
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

      {isUploadModalOpen && (
        <DocumentUploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onVerify={handleVerifiedDocuments}
        />
      )}
    </main>
  );
}
