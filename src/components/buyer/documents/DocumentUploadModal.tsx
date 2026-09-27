"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import type { ChangeEvent, DragEvent } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  File as FileIcon,
  Upload,
  X,
} from "lucide-react";

import {
  fundingSourceOptions,
  uploadSlotDefinitions,
} from "@/lib/api/documents/documents.types";
import type {
  DocumentUploadInput,
  FundingSource,
} from "@/lib/api/documents/documents.types";

import "./DocumentUploadModal.css";

type UploadSlotKey =
  (typeof uploadSlotDefinitions)[number]["key"];

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["application/pdf"]);

interface SlotState {
  file: File | null;
  error: string | null;
}

interface DocumentUploadModalProps {
  onClose: () => void;
  onVerify: (
    documents: DocumentUploadInput[],
  ) => Promise<void>;
}

export default function DocumentUploadModal({
  onClose,
  onVerify,
}: DocumentUploadModalProps) {
  const fileInputRefs = useRef<
    Partial<Record<UploadSlotKey, HTMLInputElement | null>>
  >({});

  const [fundingSources, setFundingSources] = useState<
    FundingSource[]
  >([]);
  const [isFundingMenuOpen, setIsFundingMenuOpen] =
    useState(false);
  const [slots, setSlots] = useState<
    Record<UploadSlotKey, SlotState>
  >(() =>
    uploadSlotDefinitions.reduce(
      (state, slot) => {
        state[slot.key] = { file: null, error: null };
        return state;
      },
      {} as Record<UploadSlotKey, SlotState>,
    ),
  );
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function toggleFundingSource(value: FundingSource) {
    setFundingSources((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function setSlotFile(slotKey: UploadSlotKey, file: File | null) {
    if (!file) {
      setSlots((current) => ({
        ...current,
        [slotKey]: { file: null, error: null },
      }));
      return;
    }

    if (!ACCEPTED_TYPES.has(file.type)) {
      setSlots((current) => ({
        ...current,
        [slotKey]: {
          file,
          error: "Please upload a PDF document.",
        },
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSlots((current) => ({
        ...current,
        [slotKey]: {
          file,
          error: "The PDF must be 20 MB or smaller.",
        },
      }));
      return;
    }

    setSlots((current) => ({
      ...current,
      [slotKey]: { file, error: null },
    }));
  }

  function handleInputChange(
    slotKey: UploadSlotKey,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setSlotFile(slotKey, event.target.files?.[0] ?? null);
    event.target.value = "";
  }

  function handleDrop(
    slotKey: UploadSlotKey,
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    setSlotFile(slotKey, event.dataTransfer.files?.[0] ?? null);
  }

  async function handleVerify() {
    const filledSlots = uploadSlotDefinitions.filter(
      (slot) => slots[slot.key].file,
    );

    if (filledSlots.length === 0) {
      setFormError("Please upload at least one document.");
      return;
    }

    const hasBlockingError = filledSlots.some(
      (slot) => slots[slot.key].error,
    );

    if (hasBlockingError) {
      setFormError(
        "Please resolve the file errors before continuing.",
      );
      return;
    }

    const uploads: DocumentUploadInput[] = filledSlots.map(
      (slot) => {
        const file = slots[slot.key].file as File;

        return {
          file,
          documentType: slot.documentType,
          displayType: slot.label,
        };
      },
    );

    setIsSubmitting(true);
    setFormError("");

    try {
      await onVerify(uploads);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "The documents could not be uploaded.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="document-upload-modal__backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="document-upload-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-upload-modal-title"
      >
        <header className="document-upload-modal__header">
          <div>
            <h2 id="document-upload-modal-title">
              Upload Official Documents
            </h2>
            <p>
              Please provide official documentation to verify your
              funds. These files are private and will only be
              visible to you and our team.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </header>

        <div className="document-upload-modal__body">
          <div className="document-upload-modal__field">
            <label htmlFor="document-upload-funding-source">
              How do you plan to fund your acquisition?
            </label>

            <div className="document-upload-modal__multiselect">
              <button
                id="document-upload-funding-source"
                type="button"
                className="document-upload-modal__multiselect-trigger"
                aria-haspopup="listbox"
                aria-expanded={isFundingMenuOpen}
                onClick={() =>
                  setIsFundingMenuOpen((current) => !current)
                }
              >
                {fundingSources.length === 0
                  ? "Select all that apply"
                  : fundingSourceOptions
                      .filter((option) =>
                        fundingSources.includes(option.value),
                      )
                      .map((option) => option.label)
                      .join(", ")}

                <ChevronDown size={16} />
              </button>

              {isFundingMenuOpen && (
                <ul
                  className="document-upload-modal__multiselect-menu"
                  role="listbox"
                  aria-multiselectable="true"
                >
                  {fundingSourceOptions.map((option) => (
                    <li key={option.value}>
                      <label>
                        <input
                          type="checkbox"
                          checked={fundingSources.includes(
                            option.value,
                          )}
                          onChange={() =>
                            toggleFundingSource(option.value)
                          }
                        />
                        {option.label}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {uploadSlotDefinitions.map((slot) => {
            const slotState = slots[slot.key];

            return (
              <div
                key={slot.key}
                className="document-upload-modal__slot"
              >
                <span className="document-upload-modal__slot-label">
                  {slot.label}
                </span>

                <input
                  ref={(element) => {
                    fileInputRefs.current[slot.key] = element;
                  }}
                  type="file"
                  accept="application/pdf"
                  className="document-upload-modal__file-input"
                  onChange={(event) =>
                    handleInputChange(slot.key, event)
                  }
                />

                {slotState.error && (
                  <span className="document-upload-modal__slot-error">
                    {slotState.error}
                  </span>
                )}

                {slotState.file ? (
                  <div
                    className={
                      slotState.error
                        ? "document-upload-modal__file document-upload-modal__file--error"
                        : "document-upload-modal__file"
                    }
                  >
                    <FileIcon size={16} strokeWidth={1.5} />

                    <div className="document-upload-modal__file-info">
                      <span className="document-upload-modal__file-name">
                        {slotState.file.name}
                      </span>
                      <span className="document-upload-modal__file-size">
                        {formatFileSize(slotState.file.size)}
                      </span>
                    </div>

                    <button
                      type="button"
                      aria-label={`Remove ${slotState.file.name}`}
                      onClick={() => setSlotFile(slot.key, null)}
                    >
                      <X size={14} strokeWidth={1.6} />
                    </button>
                  </div>
                ) : (
                  <div
                    className="document-upload-modal__dropzone"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDrop(slot.key, event)}
                    onClick={() =>
                      fileInputRefs.current[slot.key]?.click()
                    }
                    role="button"
                    tabIndex={0}
                    aria-label={`Upload ${slot.label}`}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        fileInputRefs.current[slot.key]?.click();
                      }
                    }}
                  >
                    <Upload size={16} strokeWidth={1.4} />
                    <span>Click to upload or drag and drop</span>
                    <small>PDF up to 20MB</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {formError && (
          <p
            className="document-upload-modal__form-error"
            role="alert"
          >
            {formError}
          </p>
        )}

        <footer className="document-upload-modal__footer">
          <button
            type="button"
            className="document-upload-modal__verify-button"
            disabled={isSubmitting}
            onClick={handleVerify}
          >
            {isSubmitting
              ? "Uploading and verifying..."
              : "Verify Documents"}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
