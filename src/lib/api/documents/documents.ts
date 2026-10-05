import axios from "axios";

import api from "@/lib/api/client";

import type {
  ApiDocumentResponse,
  ApiDocumentUploadRequest,
  ApiDocumentUploadResponse,
  BusinessDocumentUploadRequest,
  BuyerFinancialsReference,
  DocumentDownloadResponse,
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

export async function ensureBuyerFinancialsId(): Promise<string> {
  try {
    const response = await api.get<BuyerFinancialsReference>(
      "/intake/buyers/financials",
    );

    return response.data.id;
  } catch (error) {
    if (
      !axios.isAxiosError(error) ||
      error.response?.status !== 404
    ) {
      throw createDocumentError(
        error,
        "Unable to load your financial profile.",
      );
    }
  }

  try {
    const response = await api.put<BuyerFinancialsReference>(
      "/intake/buyers/financials",
      {},
    );

    return response.data.id;
  } catch (error) {
    throw createDocumentError(
      error,
      "Unable to create your financial profile.",
    );
  }
}

export async function initiateDocumentUpload(
  input: DocumentUploadInput,
  buyerFinancialsId: string,
): Promise<ApiDocumentUploadResponse> {
  const payload: ApiDocumentUploadRequest = {
    expected_document_type: input.documentType,
    original_filename: input.file.name,
    mime_type: "application/pdf",
    file_size: input.file.size,
    buyer_financials_id: buyerFinancialsId,
  };

  try {
    const response = await api.post<ApiDocumentUploadResponse>(
      "/verification/documents",
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

export async function initiateBusinessDocumentUpload(
  businessId: string,
  input: DocumentUploadInput,
): Promise<ApiDocumentUploadResponse> {
  const payload: BusinessDocumentUploadRequest = {
    expected_document_type: input.documentType,
    original_filename: input.file.name,
    mime_type: input.file.type || "application/pdf",
    file_size: input.file.size,
  };

  try {
    const response = await api.post<ApiDocumentUploadResponse>(
      `/verification/documents/businesses/${businessId}`,
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
): Promise<DocumentDownloadResponse> {
  try {
    const response = await api.get<DocumentDownloadResponse>(
      `/verification/documents/${documentId}/download`,
    );

    return response.data;
  } catch (error) {
    throw createDocumentError(
      error,
      "Unable to generate the document download link.",
    );
  }
}

export async function listBuyerDocuments(): Promise<
  VerifiedDocument[]
> {
  const buyerFinancialsId = await ensureBuyerFinancialsId();

  try {
    const response = await api.get<ApiDocumentResponse[]>(
      "/verification/documents",
      {
        params: {
          buyer_financials_id: buyerFinancialsId,
        },
      },
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

export async function listBusinessDocuments(
  businessId: string,
): Promise<VerifiedDocument[]> {
  try {
    const response = await api.get<ApiDocumentResponse[]>(
      `/verification/documents/businesses/${businessId}`,
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
      "Unable to load your business documents.",
    );
  }
}

export interface DocumentUploadOutcome {
  input: DocumentUploadInput;
  document?: VerifiedDocument;
  error?: Error;
}

export async function uploadAndVerifyBuyerDocuments(
  inputs: DocumentUploadInput[],
): Promise<DocumentUploadOutcome[]> {
  const buyerFinancialsId = await ensureBuyerFinancialsId();

  const settled = await Promise.allSettled(
    inputs.map(async (input) => {
      const upload = await initiateDocumentUpload(
        input,
        buyerFinancialsId,
      );

      await uploadToPresignedUrl(upload, input.file);
      await confirmDocumentUpload(upload.document_id);

      const verified = await triggerDocumentVerification(
        upload.document_id,
      );

      return mapApiDocument(verified, input.displayType);
    }),
  );

  return settled.map((result, index) => {
    const input = inputs[index];

    if (result.status === "fulfilled") {
      return { input, document: result.value };
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

export async function uploadAndConfirmBusinessDocument(
  businessId: string,
  input: DocumentUploadInput,
): Promise<VerifiedDocument> {
  const upload = await initiateBusinessDocumentUpload(
    businessId,
    input,
  );

  await uploadToPresignedUrl(upload, input.file);

  const confirmed = await confirmDocumentUpload(
    upload.document_id,
  );

  return mapApiDocument(
    confirmed,
    input.displayType,
  );
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

  if (status === "rejected" || status === "failed") {
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

    if (typeof detail === "string" && detail.trim()) {
      return new Error(detail);
    }
  }

  if (error instanceof Error && error.message) {
    return error;
  }

  return new Error(fallback);
}
