import type { VerifiedDocument } from "./documents.types";

const STORAGE_KEY = "matchbook-demo-documents";

export function saveDemoDocuments(
  documents: VerifiedDocument[],
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(documents),
  );
}

export function readDemoDocuments(): VerifiedDocument[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is VerifiedDocument => {
        if (typeof item !== "object" || item === null) {
          return false;
        }

        const candidate = item as Partial<VerifiedDocument>;

        return (
          typeof candidate.id === "string" &&
          typeof candidate.name === "string" &&
          typeof candidate.type === "string" &&
          typeof candidate.status === "string" &&
          typeof candidate.visibility === "string" &&
          typeof candidate.uploadedAt === "string" &&
          typeof candidate.sizeBytes === "number"
        );
      },
    );
  } catch {
    return [];
  }
}
