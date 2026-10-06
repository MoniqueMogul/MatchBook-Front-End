"use client";

import ContentSkeleton from "@/components/common/ContentSkeleton";
import {
  useEffect,
  useState,
} from "react";
import {
  Banknote,
  Check,
  Clock3,
  ExternalLink,
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
  listBuyerDocuments,
  openDocument,
  uploadAndConfirmBusinessDocument,
  uploadBuyerDocuments,
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
  {
    label: string;
    icon: typeof Clock3;
  }
> = {
  pending: {
    label: "Under Review",
    icon: Clock3,
  },
  approved: {
    label: "Approved",
    icon: Check,
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
  },
};

export default function DocumentsDashboard({
  data,
  businessId,
}: DocumentsDashboardProps) {
  const [
    documents,
    setDocuments,
  ] = useState<VerifiedDocument[]>(
    data.documents,
  );

  const [
    uploadModalMode,
    setUploadModalMode,
  ] = useState<
    "official" | "tax" | null
  >(null);

  const [
    isLoadingDocuments,
    setIsLoadingDocuments,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    openingDocumentId,
    setOpeningDocumentId,
  ] = useState<string | null>(
    null,
  );

  const [
    documentActionError,
    setDocumentActionError,
  ] = useState("");

  const isBusinessContext =
    Boolean(businessId);

  useEffect(() => {
    let isActive = true;

    async function loadDocuments(): Promise<void> {
      try {
        const existingDocuments =
          businessId
            ? await listBusinessDocuments(
                businessId,
              )
            : await listBuyerDocuments();

        if (isActive) {
          setDocuments(
            existingDocuments,
          );

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
          setIsLoadingDocuments(
            false,
          );
        }
      }
    }

    void loadDocuments();

    return () => {
      isActive = false;
    };
  }, [businessId]);

  const hasDocuments =
    documents.length > 0;

  const hasPendingDocuments =
    documents.some(
      (document) =>
        document.status ===
        "pending",
    );

  async function refreshDocuments(): Promise<void> {
    const existingDocuments =
      businessId
        ? await listBusinessDocuments(
            businessId,
          )
        : await listBuyerDocuments();

    setDocuments(
      existingDocuments,
    );

    setLoadError("");
  }

  async function handleUploadedDocuments(
    uploads: DocumentUploadInput[],
  ): Promise<
    Array<{
      file: File;
      error?: Error;
    }>
  > {
    if (businessId) {
      const outcomes =
        await Promise.allSettled(
          uploads.map((input) =>
            uploadAndConfirmBusinessDocument(
              businessId,
              input,
            ),
          ),
        );

      const results = outcomes.map(
        (outcome, index) => ({
          file: uploads[index].file,
          error:
            outcome.status ===
            "rejected"
              ? outcome.reason instanceof
                Error
                ? outcome.reason
                : new Error(
                    "The document could not be uploaded.",
                  )
              : undefined,
        }),
      );

      const hasSuccessfulUpload =
        outcomes.some(
          (outcome) =>
            outcome.status ===
            "fulfilled",
        );

      if (hasSuccessfulUpload) {
        try {
          await refreshDocuments();
        } catch (error) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Your documents were uploaded, but the document list could not be refreshed.",
          );
        }
      }

      return results;
    }

    const outcomes =
      await uploadBuyerDocuments(
        uploads,
      );

    const hasSuccessfulUpload =
      outcomes.some(
        (outcome) =>
          outcome.document !==
          undefined,
      );

    if (hasSuccessfulUpload) {
      try {
        await refreshDocuments();
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "Your documents were uploaded, but the document list could not be refreshed.",
        );
      }
    }

    return outcomes.map(
      (outcome) => ({
        file: outcome.input.file,
        error: outcome.error,
      }),
    );
  }

  async function handleOpenDocument(
    documentId: string,
  ): Promise<void> {
    if (openingDocumentId) {
      return;
    }

    setOpeningDocumentId(
      documentId,
    );

    setDocumentActionError("");

    try {
      await openDocument(
        documentId,
      );
    } catch (error) {
      setDocumentActionError(
        error instanceof Error
          ? error.message
          : "Unable to open this document.",
      );
    } finally {
      setOpeningDocumentId(
        null,
      );
    }
  }

  async function handleDownload(
    documentId: string,
  ): Promise<void> {
    setDocumentActionError("");

    try {
      const { download_url } =
        await getDocumentDownloadUrl(
          documentId,
        );

      const openedWindow =
        window.open(
          download_url,
          "_blank",
          "noopener,noreferrer",
        );

      if (!openedWindow) {
        window.location.assign(
          download_url,
        );
      }
    } catch (error) {
      setDocumentActionError(
        error instanceof Error
          ? error.message
          : "Unable to download the document.",
      );
    }
  }

  return (
    <main className="documents-dashboard">
      <h1>Documents</h1>

      {!isLoadingDocuments &&
        loadError && (
          <div
            className="documents-dashboard__pending-banner"
            role="alert"
          >
            <XCircle size={20} />

            <div>
              <strong>
                Documents Could Not Be
                Loaded
              </strong>

              <span>
                {loadError}
              </span>
            </div>
          </div>
        )}

      {documentActionError && (
        <div
          className="documents-dashboard__pending-banner"
          role="alert"
        >
          <XCircle size={20} />

          <div>
            <strong>
              Document Could Not Be
              Opened
            </strong>

            <span>
              {documentActionError}
            </span>
          </div>
        </div>
      )}

      {!isLoadingDocuments &&
        hasPendingDocuments && (
          <div className="documents-dashboard__pending-banner">
            <Clock3 size={20} />

            <div>
              <strong>
                {isBusinessContext
                  ? "Documents Under Review"
                  : "Pending Verification"}
              </strong>

              <span>
                {isBusinessContext
                  ? "Your business documents have been submitted and are currently being reviewed by our team."
                  : "We are in the process of verifying the documents you submitted. Thank you for your patience! In the meanwhile feel free to explore some of our other features."}
              </span>
            </div>
          </div>
        )}

      {!isLoadingDocuments &&
        !hasDocuments && (
          <div className="documents-dashboard__verify-banner">
            <div className="documents-dashboard__verify-copy">
              <span className="documents-dashboard__verify-icon">
                <ShieldCheck
                  size={20}
                />
              </span>

              <div>
                <strong>
                  {isBusinessContext
                    ? "Verify Your Business"
                    : "Verify Your Funds"}
                </strong>

                <p>
                  {isBusinessContext
                    ? "Upload your business tax reports so our team can review and verify your business information."
                    : "Use one of our secure methods to verify your purchasing power. This helps build trust with sellers and gives you access to more business listings."}
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
                {isBusinessContext
                  ? "Help verify your business"
                  : "Help verify your purchasing power"}
              </li>

              <li>
                <Check size={13} />
                {isBusinessContext
                  ? "Build trust with buyers"
                  : "Build trust with sellers"}
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
              <h2>
                {isBusinessContext
                  ? "Business Documents"
                  : "Official Documents"}
              </h2>

              <p>
                These files are private and
                will only be visible to you
                and our team.
              </p>
            </div>

            <button
              type="button"
              className="documents-dashboard__upload-button"
              onClick={() =>
                setUploadModalMode(
                  isBusinessContext
                    ? "tax"
                    : "official",
                )
              }
            >
              <Plus size={16} />

              {isBusinessContext
                ? "Upload Tax Reports"
                : "Upload Documents"}
            </button>
          </div>

          <table className="documents-dashboard__table">
            <thead>
              <tr>
                <th>
                  Document Name
                </th>
                <th>Type</th>
                <th>Status</th>
                <th>Visibility</th>
                <th>
                  Uploaded On
                </th>

                {isBusinessContext && (
                  <th>Action</th>
                )}
              </tr>
            </thead>

            <tbody>
              {documents.map(
                (document) => {
                  const status =
                    statusCopy[
                      document.status
                    ];

                  const StatusIcon =
                    status.icon;

                  const isOpening =
                    openingDocumentId ===
                    document.id;

                  return (
                    <tr
                      key={
                        document.id
                      }
                    >
                      <td>
                        {isBusinessContext ? (
                          <span className="documents-dashboard__file-cell">
                            <FileText
                              size={16}
                              strokeWidth={
                                1.5
                              }
                            />

                            {
                              document.name
                            }
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="documents-dashboard__file-cell"
                            disabled={
                              isOpening
                            }
                            onClick={() =>
                              void handleOpenDocument(
                                document.id,
                              )
                            }
                            title="Open document"
                          >
                            <FileText
                              size={16}
                              strokeWidth={
                                1.5
                              }
                            />

                            <span>
                              {isOpening
                                ? "Opening..."
                                : document.name}
                            </span>

                            {!isOpening && (
                              <ExternalLink
                                size={13}
                                strokeWidth={
                                  1.5
                                }
                              />
                            )}
                          </button>
                        )}
                      </td>

                      <td>
                        {document.type}
                      </td>

                      <td>
                        <span
                          className={`documents-dashboard__status documents-dashboard__status--${document.status}`}
                        >
                          <StatusIcon
                            size={12}
                          />

                          {
                            status.label
                          }
                        </span>
                      </td>

                      <td>
                        <span className="documents-dashboard__visibility">
                          <Lock
                            size={13}
                          />

                          {document.visibility ===
                          "private"
                            ? "Private to you"
                            : isBusinessContext
                              ? "Shared with authorized users"
                              : "Visible to sellers who signed an NDA"}
                        </span>
                      </td>

                      <td>
                        {new Intl.DateTimeFormat(
                          "en-US",
                          {
                            month:
                              "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        ).format(
                          new Date(
                            document.uploadedAt,
                          ),
                        )}
                      </td>

                      {isBusinessContext && (
                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              void handleDownload(
                                document.id,
                              )
                            }
                          >
                            Download
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </section>
      ) : (
        <>
          <h2 className="documents-dashboard__choose-heading">
            {isBusinessContext
              ? "Upload Your Business Documents"
              : "Choose a Verification Method"}
          </h2>

          <div className="documents-dashboard__methods">
            <article className="documents-dashboard__method-card">
              <span className="documents-dashboard__method-icon">
                <FileText
                  size={22}
                  strokeWidth={1.5}
                />
              </span>

              <h3>
                {isBusinessContext
                  ? "Upload Tax Reports"
                  : "Upload Official Documents"}
              </h3>

              <p>
                {isBusinessContext
                  ? "Upload your business tax reports for verification by our team."
                  : "Provide bank statements or other official documentation to verify your funds."}
              </p>

              <button
                type="button"
                onClick={() =>
                  setUploadModalMode(
                    isBusinessContext
                      ? "tax"
                      : "official",
                  )
                }
              >
                {isBusinessContext
                  ? "Upload Tax Reports"
                  : "Upload Documents"}
              </button>
            </article>

            {!isBusinessContext && (
              <article className="documents-dashboard__method-card">
                <span className="documents-dashboard__method-icon">
                  <Banknote
                    size={22}
                    strokeWidth={
                      1.5
                    }
                  />
                </span>

                <h3>
                  Connect Bank Account
                </h3>

                <p>
                  Securely link your bank
                  account to verify your
                  account in minutes.
                </p>

                <button
                  type="button"
                  disabled
                >
                  Get Started
                </button>
              </article>
            )}

            <article className="documents-dashboard__method-card">
              <span className="documents-dashboard__method-icon">
                <User
                  size={22}
                  strokeWidth={1.5}
                />
              </span>

              <h3>
                Speak with Our Team
              </h3>

              <p>
                {isBusinessContext
                  ? "Schedule a quick call with our team to discuss your business verification and answer any questions."
                  : "Schedule a quick call with our team to verify your funds and answer any questions."}
              </p>

              <button
                type="button"
                disabled
              >
                Schedule a Call
              </button>
            </article>
          </div>
        </>
      )}

      {uploadModalMode && (
        <DocumentUploadModal
          mode={uploadModalMode}
          onClose={() =>
            setUploadModalMode(
              null,
            )
          }
          onUpload={
            handleUploadedDocuments
          }
        />
      )}
    </main>
  );
}