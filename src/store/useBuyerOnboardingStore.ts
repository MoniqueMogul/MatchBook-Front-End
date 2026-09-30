import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

export type BuyerProfileSection =
  | "overview"
  | "experience"
  | "acquisition"
  | "finances"
  | "verification";

export interface BuyerOnboardingState {
  currentStep: number;
  totalSteps: number;

  /**
   * true  = user has not finished buyer onboarding
   * false = onboarding is complete
   */
  onboardingInProgress: boolean;

  completedSections: Record<
    BuyerProfileSection,
    boolean
  >;

  /**
   * Runtime-only information.
   * These are NOT persisted.
   */
  activeUserId: string | null;
  isInitialized: boolean;

  nextStep: () => void;
  prevStep: () => void;

  markSectionCompleted: (
    section: BuyerProfileSection
  ) => void;

  completeOnboarding: () => void;

  resetOnboarding: () => void;

  /**
   * Loads this authenticated user's onboarding
   * progress from their own persisted storage.
   */
  initializeForUser: (
    userId: string
  ) => Promise<void>;

  /**
   * Clears the in-memory active user without
   * deleting that user's persisted progress.
   */
  clearActiveUser: () => void;
}

/**
 * Only these fields are persisted.
 *
 * activeUserId and isInitialized are runtime-only.
 */
type BuyerOnboardingPersistedState = Pick<
  BuyerOnboardingState,
  | "currentStep"
  | "totalSteps"
  | "onboardingInProgress"
  | "completedSections"
>;

const DEFAULT_COMPLETED_SECTIONS: Record<
  BuyerProfileSection,
  boolean
> = {
  overview: false,
  experience: false,
  acquisition: false,
  finances: false,
  verification: false,
};

const DEFAULT_STATE: BuyerOnboardingPersistedState =
  {
    currentStep: 1,
    totalSteps: 10,
    onboardingInProgress: true,
    completedSections: {
      ...DEFAULT_COMPLETED_SECTIONS,
    },
  };

const STORAGE_NAME =
  "matchbook:buyer-onboarding";

let activeUserId: string | null = null;

let suppressWrites = false;

const getUserStorageKey = (
  name: string,
  userId: string
) => {
  return `${name}:${userId}`;
};

/**
 * User-specific browser storage.
 *
 * Example:
 *
 * matchbook:buyer-onboarding:<supabase-user-id>
 */
const userScopedStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (
      typeof window === "undefined" ||
      !activeUserId
    ) {
      return null;
    }

    return window.localStorage.getItem(
      getUserStorageKey(
        name,
        activeUserId
      )
    );
  },

  setItem: (
    name: string,
    value: string
  ): void => {
    if (
      typeof window === "undefined" ||
      !activeUserId ||
      suppressWrites
    ) {
      return;
    }

    window.localStorage.setItem(
      getUserStorageKey(
        name,
        activeUserId
      ),
      value
    );
  },

  removeItem: (name: string): void => {
    if (
      typeof window === "undefined" ||
      !activeUserId
    ) {
      return;
    }

    window.localStorage.removeItem(
      getUserStorageKey(
        name,
        activeUserId
      )
    );
  },
};

const storage = createJSONStorage(
  () => userScopedStorage
);

export const useBuyerOnboardingStore =
  create<BuyerOnboardingState>()(
    persist(
      (set, get) => ({
        ...DEFAULT_STATE,

        activeUserId: null,

        isInitialized: false,

        nextStep: () =>
          set((state) => ({
            currentStep: Math.min(
              state.currentStep + 1,
              state.totalSteps
            ),
          })),

        prevStep: () =>
          set((state) => ({
            currentStep: Math.max(
              state.currentStep - 1,
              1
            ),
          })),

        markSectionCompleted: (section) =>
          set((state) => ({
            completedSections: {
              ...state.completedSections,
              [section]: true,
            },
          })),

        completeOnboarding: () =>
          set({
            onboardingInProgress: false,
          }),

        resetOnboarding: () =>
          set({
            ...DEFAULT_STATE,
          }),

        initializeForUser: async (
          userId: string
        ) => {
          if (!userId) {
            throw new Error(
              "Cannot initialize buyer onboarding without a user ID."
            );
          }

          /**
           * Same user is already initialized.
           * Do not reload their state.
           */
          if (
            activeUserId === userId &&
            get().isInitialized
          ) {
            return;
          }

          /**
           * Make this user the active storage owner.
           */
          activeUserId = userId;

          /**
           * Prevent the temporary default state
           * from being persisted while restoring.
           */
          suppressWrites = true;

          try {
            const rawState =
              await userScopedStorage.getItem(
                STORAGE_NAME
              );

            let persistedState:
              | Partial<
                  BuyerOnboardingPersistedState
                >
              | null = null;

            if (rawState) {
              try {
                const parsed =
                  JSON.parse(rawState);

                if (
                  parsed &&
                  typeof parsed === "object" &&
                  parsed.state &&
                  typeof parsed.state === "object"
                ) {
                  persistedState =
                    parsed.state;
                }
              } catch (error) {
                console.error(
                  "Failed to parse persisted buyer onboarding state:",
                  error
                );
              }
            }

            /**
             * Always start with a clean default state.
             *
             * If this user already has saved progress,
             * restore only that user's persisted fields.
             */
            set({
              ...DEFAULT_STATE,

              ...(persistedState
                ? {
                    currentStep:
                      persistedState.currentStep ??
                      DEFAULT_STATE.currentStep,

                    totalSteps:
                      persistedState.totalSteps ??
                      DEFAULT_STATE.totalSteps,

                    onboardingInProgress:
                      persistedState.onboardingInProgress ??
                      DEFAULT_STATE.onboardingInProgress,

                    completedSections:
                      persistedState.completedSections ??
                      DEFAULT_COMPLETED_SECTIONS,
                  }
                : {}),

              activeUserId: userId,

              isInitialized: true,
            });
          } finally {
            suppressWrites = false;
          }
        },

        clearActiveUser: () => {
          /**
           * Do not remove this user's localStorage.
           *
           * Their progress should remain available
           * when they log back in.
           */
          activeUserId = null;

          suppressWrites = true;

          set({
            ...DEFAULT_STATE,

            activeUserId: null,

            isInitialized: false,
          });

          suppressWrites = false;
        },
      }),

      {
        name: STORAGE_NAME,

        storage,

        /**
         * We manually load the correct user's
         * persisted state after Supabase gives us
         * the authenticated user ID.
         */
        skipHydration: true,

        version: 3,

        /**
         * Persist only actual onboarding state.
         *
         * Runtime identity information is excluded.
         */
        partialize: (
          state
        ): BuyerOnboardingPersistedState => ({
          currentStep:
            state.currentStep,

          totalSteps:
            state.totalSteps,

          onboardingInProgress:
            state.onboardingInProgress,

          completedSections:
            state.completedSections,
        }),
      }
    )
  );