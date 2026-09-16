import type { MatchBusinessDetails } from "@/lib/api/matching/matching.types";

const STORAGE_KEY =
  "matchbook-demo-warm-introductions";

export interface StoredWarmIntroduction {
  business: MatchBusinessDetails;
  content: string;
  createdAt: string;
}

export function saveWarmIntroduction(
  introduction: StoredWarmIntroduction,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const current = readWarmIntroductions();

  const withoutSameBusiness = current.filter(
    (item) =>
      item.business.id !== introduction.business.id,
  );

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([
      introduction,
      ...withoutSameBusiness,
    ]),
  );
}

export function readWarmIntroductions(): StoredWarmIntroduction[] {
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
      (
        item,
      ): item is StoredWarmIntroduction => {
        if (
          typeof item !== "object" ||
          item === null
        ) {
          return false;
        }

        const candidate =
          item as Partial<StoredWarmIntroduction>;

        return (
          typeof candidate.content === "string" &&
          typeof candidate.createdAt === "string" &&
          typeof candidate.business === "object" &&
          candidate.business !== null &&
          typeof candidate.business.id === "string" &&
          typeof candidate.business.name === "string"
        );
      },
    );
  } catch {
    return [];
  }
}