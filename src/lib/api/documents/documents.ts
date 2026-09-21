import type { DocumentsViewData } from "./documents.types";

/**
 * Presentation-only Documents data.
 * This stays isolated from the backend contract so the Figma
 * screens can be implemented while the Documents API is finalized.
 */

export function getDocumentsDemoData(): DocumentsViewData {
  return {
    isVerified: false,
    documents: [],
  };
}
