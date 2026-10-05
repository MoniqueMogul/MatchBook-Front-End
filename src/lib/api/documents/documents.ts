import axios from "axios";

import api from "@/lib/api/client";

import type {
  ApiDocumentDownloadResponse,
  ApiDocumentResponse,
  ApiDocumentUploadRequest,
  ApiDocumentUploadResponse,
  DocumentsViewData,
  DocumentStatus,
  DocumentUploadInput,
  VerifiedDocument,
} from "./documents.types";

export function getInitialDocumentsViewData(): DocumentsViewData {
  return {
    isVerified: false,
    documents: [],
  };
}

export async function initiateBuyerDocumentUpload(
  input: DocumentUploadInput,
): Promise<ApiDocumentUploadResponse> {
  const payload: ApiDocumentUploadRequest = {
    expected_document_type: input.documentType,
    original_filename: input.file.name,
    mime_type: "application/pdf",
    file_size: input.file.size,
    declaration_signed: false,
  };

  try {
    const response = await api.post<ApiDocumentUploadResponse>(
      "/verification/documents/buyer",
      payload,
    );

    return response.data;
  } catch (error) {
    throw createDocumentError(
      error,
      `Unable to initialize the upload for ${input.file.name}.`,
    );
  }
}

export async function uploadToPresignedUrl(
  upload: ApiDocumentUploadResponse,
  file: File,
): Promise<void> {
  const response = await fetch(upload.upload_url, {
    method: "PUT",
    headers: upload.required_headers,
    body: file,
  });

  if (!response.ok) {
    throw new Error(
      `The secure upload failed with status ${response.status}.`,
    );
  }
}

export async function confirmDocumentUpload(
  documentId: string,
): Promise<ApiDocumentResponse> {
  try {
    const response = await api.post<ApiDocumentResponse>(
      `/verification/documents/${documentId}/confirm`,
    );

    return response.data;
  } catch (error) {
    throw createDocumentError(
      error,
      "The uploaded document could not be confirmed.",
    );
  }
}

export async function triggerDocumentVerification(
  documentId: string,
): Promise<ApiDocumentResponse> {
  try {
    const response = await api.post<ApiDocumentResponse>(
      `/verification/documents/${documentId}/verify`,
    );

    return response.data;
  } catch (error) {
    throw createDocumentError(
      error,
      "Document verification could not be started.",
    );
  }
}

export async function getDocument(
  documentId: string,
): Promise<ApiDocumentResponse> {
  try {
    const response = await api.get<ApiDocumentResponse>(
      `/verification/documents/${documentId}`,
    );

    return response.data;
  } catch (error) {
    throw createDocumentError(
      error,
      "Unable to refresh the document status.",
    );
  }
}

export async function getDocumentDownloadUrl(
  documentId: string,
): Promise<ApiDocumentDownloadResponse> {
  try {
    const response = await api.get<ApiDocumentDownloadResponse>(
      `/verification/documents/${documentId}/download`,
    );

    return response.data;
  } catch (error) {
    throw createDocumentError(
      error,
      "Unable to open this document.",
    );
  }
}

export async function openDocument(
  documentId: string,
): Promise<void> {
  const download = await getDocumentDownloadUrl(documentId);

  const openedWindow = window.open(
    download.download_url,
    "_blank",
    "noopener,noreferrer",
  );

  if (!openedWindow) {
    window.location.assign(download.download_url);
  }
}

export async function listBuyerDocuments(): Promise<
  VerifiedDocument[]
> {
  try {
    const response = await api.get<ApiDocumentResponse[]>(
      "/verification/documents/buyer",
    );

    return response.data.map((document) =>
      mapApiDocument(
        document,
        getDocumentTypeLabel(document.document_type),
      ),
    );
  } catch (error) {
    throw createDocumentError(
      error,
      "Unable to load your existing documents.",
    );
  }
}

export interface DocumentUploadOutcome {
  input: DocumentUploadInput;
  document?: VerifiedDocument;
  error?: Error;
}

export async function uploadBuyerDocuments(
  inputs: DocumentUploadInput[],
): Promise<DocumentUploadOutcome[]> {
  const settled = await Promise.allSettled(
    inputs.map(async (input) => {
      const upload = await initiateBuyerDocumentUpload(input);

      await uploadToPresignedUrl(
        upload,
        input.file,
      );

      const confirmed = await confirmDocumentUpload(
        upload.document_id,
      );

      return mapApiDocument(
        confirmed,
        input.displayType,
      );
    }),
  );

  return settled.map((result, index) => {
    const input = inputs[index];

    if (result.status === "fulfilled") {
      return {
        input,
        document: result.value,
      };
    }

    return {
      input,
      error: createDocumentError(
        result.reason,
        `Unable to upload ${input.file.name}.`,
      ),
    };
  });
}

function mapApiDocument(
  document: ApiDocumentResponse,
  displayType: string,
): VerifiedDocument {
  return {
    id: document.id,
    name:
      document.original_filename ??
      "Uploaded financial document",
    type: displayType,
    status: mapVerificationStatus(
      document.verification_status,
    ),
    visibility: "private",
    uploadedAt: document.uploaded_at,
    sizeBytes: document.file_size ?? 0,
  };
}

function getDocumentTypeLabel(
  type: ApiDocumentResponse["document_type"],
): string {
  const labels: Record<
    ApiDocumentResponse["document_type"],
    string
  > = {
    bank_statement: "Bank Statements",
    tax_return: "Tax Returns",
    profit_and_loss: "Profit and Loss Statement",
    balance_sheet: "Balance Sheet",
    proof_of_funds: "Proof of Funds",
    loan_approval: "Lender Pre-Approval Letter",
    business_license: "Business License",
    other: "Other",
  };

  return labels[type] ?? "Other";
}

function mapVerificationStatus(
  status: ApiDocumentResponse["verification_status"],
): DocumentStatus {
  if (status === "verified") {
    return "approved";
  }

  if (
    status === "rejected" ||
    status === "failed"
  ) {
    return "rejected";
  }

  return "pending";
}

function createDocumentError(
  error: unknown,
  fallback: string,
): Error {
  if (axios.isAxiosError<{ detail?: string }>(error)) {
    const detail = error.response?.data?.detail;

    if (
      typeof detail === "string" &&
      detail.trim()
    ) {
      return new Error(detail);
    }
  }

  if (
    error instanceof Error &&
    error.message
  ) {
    return error;
  }

  return new Error(fallback);
}