"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import EditOverviewSection, {
  type EditOverviewSectionHandle,
} from "@/components/buyer/profile/EditOverviewSection";

import ExperienceCredentialsEdit, {
  type ExperienceCredentialsData,
  type ExperienceCredentialsEditHandle,
} from "@/components/buyer/profile/ExperienceCredentialsEdit";

import AcquisitionPreferencesSection, {
  type AcquisitionPreferenceData,
  type AcquisitionPreferencesSectionHandle,
} from "@/components/buyer/profile/AcquisitionPreferencesSection";

import {
  getBuyerProfile,
  upsertBuyerProfile,
  type BuyerProfile,
  type BuyerProfilePayload,
} from "@/lib/api/buyer";

import {
  getBuyerPreferences,
  getBuyerReadiness,
  saveBuyerPreferences,
  type BuyerPreferences,
  type BuyerPreferencesPayload,
  type BusinessType,
} from "@/lib/api/buyerPreferences";

import {
  getCurrentUser,
  updateUserPhone,
  type UserPersonal,
} from "@/lib/api/user";

import "./BuyerOnboarding.css";

type SectionId =
  | "overview"
  | "experience"
  | "acquisition";

type SectionState =
  | "completed"
  | "current"
  | "upcoming";


function getResponseStatus(error: unknown): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    return (
      error as {
        response?: {
          status?: number;
        };
      }
    ).response?.status;
  }

  return undefined;
}

function parsePhone(
  phone: string | null | undefined,
): {
  countryCode: string;
  number: string;
} {
  if (!phone) {
    return {
      countryCode: "+1",
      number: "",
    };
  }

  /*
   * Keep this aligned with the country codes currently
   * supported by the existing phone input.
   *
   * Longest prefixes go first so that a shorter prefix
   * cannot accidentally match before a longer one.
   */
  const countryCodes = [
    "+234",
    "+91",
    "+86",
    "+81",
    "+61",
    "+55",
    "+52",
    "+49",
    "+44",
    "+33",
    "+1",
  ];

  const matchedCode = countryCodes.find((code) =>
    phone.startsWith(code),
  );

  if (!matchedCode) {
    return {
      countryCode: "+1",
      number: phone,
    };
  }

  return {
    countryCode: matchedCode,
    number: phone.slice(matchedCode.length),
  };
}

export default function BuyerOnboarding() {
  const router = useRouter();

  const overviewRef =
    useRef<HTMLElement | null>(null);

  const experienceRef =
    useRef<HTMLElement | null>(null);

  const acquisitionRef =
    useRef<HTMLElement | null>(null);

  const savingRef = useRef(false);

  const overviewFormRef =
    useRef<EditOverviewSectionHandle | null>(null);

  const experienceFormRef =
    useRef<ExperienceCredentialsEditHandle | null>(null);

  const acquisitionFormRef =
    useRef<AcquisitionPreferencesSectionHandle | null>(null);

  const [profile, setProfile] =
    useState<BuyerProfile | null>(null);

  const [preferences, setPreferences] =
    useState<BuyerPreferences | null>(null);

  const [user, setUser] =
    useState<UserPersonal | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const completingRef = useRef(false);
  const [completing, setCompleting] = useState(false);
  const savedAboutRef = useRef<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [currentSection, setCurrentSection] =
    useState<SectionId>("overview");

  const [completedSections, setCompletedSections] =
    useState<Set<SectionId>>(
      () => new Set<SectionId>(),
    );

  /*
   * ------------------------------------------------
   * Scrolling
   * ------------------------------------------------
   */

  const scrollToSection = useCallback(
    (section: SectionId) => {
      const target =
        section === "overview"
          ? overviewRef.current
          : section === "experience"
            ? experienceRef.current
            : acquisitionRef.current;

      target?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setCurrentSection(section);
    },
    [],
  );

  /*
   * ------------------------------------------------
   * Initial backend load
   * ------------------------------------------------
   *
   * The backend remains the durable source of truth.
   *
   * Existing profile/preferences are loaded so a user
   * who refreshes during onboarding does not lose data
   * that was already persisted.
   *
   * Readiness determines whether onboarding is already
   * complete.
   * ------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    const loadOnboarding = async () => {
      try {
        setLoading(true);
        setError(null);

        /*
         * Check readiness first.
         *
         * A brand-new buyer may receive 404 because no
         * preferences record exists yet. That is normal
         * and means onboarding is still required.
         */
        try {
          const readiness =
            await getBuyerReadiness();

          if (cancelled) {
            return;
          }

          if (readiness.ready) {
            router.replace("/buyer-dashboard");
            return;
          }
        } catch (readinessError) {
          const status =
            getResponseStatus(readinessError);

          if (status !== 404) {
            throw readinessError;
          }
        }

        const [
          userResult,
          profileResult,
          preferencesResult,
        ] = await Promise.allSettled([
          getCurrentUser(),
          getBuyerProfile(),
          getBuyerPreferences(),
        ]);

        if (cancelled) {
          return;
        }

        /*
         * User record
         */

        if (userResult.status === "fulfilled") {
          setUser(userResult.value);
        } else {
          throw userResult.reason;
        }

        /*
         * Buyer profile
         *
         * 404 is expected for a new buyer.
         */

        if (profileResult.status === "fulfilled") {
          setProfile(profileResult.value);
        } else {
          const status =
            getResponseStatus(
              profileResult.reason,
            );

          if (status === 404) {
            setProfile({} as BuyerProfile);
          } else {
            throw profileResult.reason;
          }
        }

        /*
         * Buyer preferences
         *
         * 404 is also expected until Acquisition
         * Preferences have been created.
         */

        if (
          preferencesResult.status === "fulfilled"
        ) {
          setPreferences(
            preferencesResult.value,
          );
        } else {
          const status =
            getResponseStatus(
              preferencesResult.reason,
            );

          if (status === 404) {
            setPreferences(
              {} as BuyerPreferences,
            );
          } else {
            throw preferencesResult.reason;
          }
        }

        /*
         * Work out the best section to show first from
         * data that has actually been persisted.
         *
         * This is only presentation state.
         * It is NOT the durable onboarding-complete flag.
         */

        const loadedProfile =
          profileResult.status === "fulfilled"
            ? profileResult.value
            : null;

        const loadedPreferences =
          preferencesResult.status === "fulfilled"
            ? preferencesResult.value
            : null;

        const nextCompleted =
          new Set<SectionId>();

        if (
          loadedProfile?.about_me &&
          userResult.value.phone
        ) {
          nextCompleted.add("overview");
        }

        if (loadedProfile?.buyer_type) {
          nextCompleted.add("experience");
        }

        if (loadedPreferences) {
          /*
           * We deliberately do not declare Acquisition
           * complete here merely because a preferences
           * row exists. Backend readiness is authoritative.
           */
        }

        setCompletedSections(nextCompleted);

        if (!nextCompleted.has("overview")) {
          setCurrentSection("overview");
        } else if (
          !nextCompleted.has("experience")
        ) {
          setCurrentSection("experience");
        } else {
          setCurrentSection("acquisition");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load buyer onboarding.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadOnboarding();

    return () => {
      cancelled = true;
    };
  }, [router]);

  /*
   * Once initial data is rendered, move to the
   * appropriate incomplete section.
   */

  useEffect(() => {
    if (loading) {
      return;
    }

    const timeout = window.setTimeout(() => {
      scrollToSection(currentSection);
    }, 100);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    loading,
    currentSection,
    scrollToSection,
  ]);

  /*
   * ------------------------------------------------
   * Progress helpers
   * ------------------------------------------------
   */

  const markCompleted = (
    section: SectionId,
  ) => {
    setCompletedSections((current) => {
      const next = new Set(current);
      next.add(section);
      return next;
    });
  };

  const getSectionState = (
    section: SectionId,
  ): SectionState => {
    if (completedSections.has(section)) {
      return "completed";
    }

    if (currentSection === section) {
      return "current";
    }

    return "upcoming";
  };

  /*
   * ------------------------------------------------
   * About You
   * ------------------------------------------------
   */

  const handleOverviewContinue = async (
    data: {
      about: string;
      phoneCountryCode: string;
      phone: string;
    },
  ) => {
    if (savingRef.current) {
      return;
    }

    if (!data.about.trim()) {
      const message = "Please tell sellers a little about yourself.";
      setError(message);
      scrollToSection("overview");
      throw new Error(message);
    }

    savingRef.current = true;
    setSaving(true);
    setError(null);

    try {
      const fullPhone =
        `${data.phoneCountryCode}${data.phone.replace(
          /\D/g,
          "",
        )}`;

      const [savedUser, savedProfile] =
        await Promise.all([
          updateUserPhone(fullPhone),

          upsertBuyerProfile({
            about_me: data.about.trim(),
          }),
        ]);

      savedAboutRef.current = savedProfile.about_me ?? null;
      setUser(savedUser);
      setProfile(savedProfile);

      markCompleted("overview");

      if (!completingRef.current) {
        scrollToSection("experience");
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save About You.",
      );
      throw saveError;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  /*
   * ------------------------------------------------
   * Experience & Credentials
   * ------------------------------------------------
   */

  const handleExperienceContinue = async (
    data: ExperienceCredentialsData,
  ) => {
    if (savingRef.current) {
      return;
    }

    if (!data.buyerType) {
      setError(
        "Please select a buyer type.",
      );
      return;
    }

    const payload: BuyerProfilePayload = {
      buyer_type: data.buyerType,

      current_industry:
        data.currentIndustry || null,

      current_position:
        data.currentPosition || null,

      business_experience_years:
        data.businessExperienceYears === ""
          ? null
          : Number(
              data.businessExperienceYears,
            ),

      relevant_experience:
        data.relevantExperience || null,

      available_hours_per_week:
        data.availableHoursPerWeek === ""
          ? null
          : Number(
              data.availableHoursPerWeek,
            ),

      city: data.city || null,

      county: data.county || null,

      state: data.state || null,

      zip_code: data.zipCode || null,

      /*
       * Experience saves the whole BuyerProfile
       * payload, so preserve the About You value that
       * was already persisted.
       */
      about_me:
        savedAboutRef.current ?? profile?.about_me ?? null,
    };

    savingRef.current = true;
    setSaving(true);
    setError(null);

    try {
      const savedProfile =
        await upsertBuyerProfile(payload);

      setProfile(savedProfile);

      markCompleted("experience");

      if (!completingRef.current) {
        scrollToSection("acquisition");
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save Experience & Credentials.",
      );
      throw saveError;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  /*
   * ------------------------------------------------
   * Acquisition Preferences
   * ------------------------------------------------
   */

  const handleAcquisitionContinue = async (
    data: AcquisitionPreferenceData,
  ) => {
    if (savingRef.current) {
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setError(null);

    try {
      /*
       * This mapping is intentionally the same backend
       * contract already used by BuyerProfileEdit.
       *
       * The child component has already validated the
       * readiness-required values before this callback
       * runs.
       */

      const payload: BuyerPreferencesPayload = {
        target_industry_preferences:
          data.targetIndustryPreferences,

        target_business_models:
          data.targetBusinessModels,

        target_business_types:
          data.targetBusinessTypes as BusinessType[],

        target_locations:
          data.targetLocations,

        maximum_purchase_price:
          data.maximumPurchasePrice ?? null,

        minimum_required_sde:
          data.minimumSDE ?? null,

        preferred_sde:
          data.preferredSDE ?? null,

        minimum_required_arr:
          data.minimumARR ?? null,

        preferred_arr:
          data.preferredARR ?? null,

        preferred_owner_hours_per_week:
          data.preferredOwnerHoursPerWeek ??
          null,

        required_transition_training_days:
          data.sellerTrainingDays ?? null,

        deal_preference:
          data.dealPreference ?? null,

        real_estate_preference:
          data.realEstatePreference ?? null,

        minimum_years_in_operation:
          data.minimumYearsInOperation ?? null,

        accepts_customer_concentration_above_25_percent:
          data.customerConcentration ?? null,

        preferred_acquisition_timeline:
          data.timeline ?? null,
      };

      const savedPreferences =
        await saveBuyerPreferences(payload);

      setPreferences(savedPreferences);

      /*
       * Saving preferences alone does NOT decide that
       * onboarding succeeded.
       *
       * Ask the backend because readiness is the source
       * of truth.
       */

      const readiness =
        await getBuyerReadiness();

      if (!readiness.ready) {
        const missing =
          readiness.missing_fields?.length
            ? ` Missing: ${readiness.missing_fields.join(
                ", ",
              )}.`
            : "";

        setError(
          `Your buyer profile is not ready for matching yet.${missing}`,
        );

        return;
      }

      markCompleted("acquisition");

      router.replace("/buyer-dashboard");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save Acquisition Preferences.",
      );
      throw saveError;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  /*
   * ------------------------------------------------
   * Final onboarding submission
   * ------------------------------------------------
   *
   * Each child keeps ownership of its existing validation.
   * The parent only coordinates the order:
   *
   * About You -> Experience -> Acquisition -> readiness
   *
   * Each submit waits for its existing async onContinue
   * save handler before moving to the next section.
   */

  const handleCompleteProfile = async () => {
    if (savingRef.current || completingRef.current) {
      return;
    }

    // Capture the entered values and enabled submit handlers before saves
    // rerender the forms with disabled=true.
    const submitOverview = overviewFormRef.current?.submit;
    const submitExperience = experienceFormRef.current?.submit;
    const submitAcquisition = acquisitionFormRef.current?.submit;
    if (!submitOverview || !submitExperience || !submitAcquisition) {
      setError("The profile form is still loading. Please try again.");
      return;
    }

    completingRef.current = true;
    setCompleting(true);
    setError(null);
    let activeSection: SectionId = "overview";

    try {
      if (!(await submitOverview())) {
        setError("Please correct the highlighted fields in About You.");
        scrollToSection("overview");
        return;
      }

      activeSection = "experience";
      if (!(await submitExperience())) {
        setError("Please correct the highlighted fields in Experience & Credentials.");
        scrollToSection("experience");
        return;
      }

      activeSection = "acquisition";
      if (!(await submitAcquisition())) {
        setError("Please correct the highlighted fields in Acquisition Preferences.");
        scrollToSection("acquisition");
      }
    } catch {
      // The save handler provides the specific API error.
      scrollToSection(activeSection);
    } finally {
      completingRef.current = false;
      setCompleting(false);
    }
  };

  /*
   * ------------------------------------------------
   * Loading
   * ------------------------------------------------
   */

  if (loading) {
    return (
      <div className="buyer-onboarding">
        <div className="buyer-onboarding__loading">
          Loading your buyer profile...
        </div>
      </div>
    );
  }

  const parsedPhone =
    parsePhone(user?.phone);

  return (
    <div className="buyer-onboarding">
      <div className="buyer-onboarding__container">
        <header className="buyer-onboarding__header">
          <div className="buyer-onboarding__brand">
            MatchBook
          </div>

          <h1 className="buyer-onboarding__title">
            Complete your buyer profile
          </h1>

          <p className="buyer-onboarding__subtitle">
            Tell us about yourself and what
            you&apos;re looking to acquire so we can
            find businesses that fit.
          </p>
        </header>


        {error && (
          <div
            className="buyer-onboarding__error"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="buyer-onboarding__sections">
          <section
            ref={overviewRef}
            className={`buyer-onboarding__section buyer-onboarding__section--${getSectionState(
              "overview",
            )}`}
          >
            <div className="buyer-onboarding__section-heading">
              <span className="buyer-onboarding__eyebrow">
                Step 1
              </span>

              <h2>About You</h2>

              <p>
                Introduce yourself to sellers and add
                your contact information.
              </p>
            </div>

            <EditOverviewSection
              ref={overviewFormRef}
              mode="onboarding"
              showActions={false}
              initialAbout={
                profile?.about_me ?? ""
              }
              initialPhoneCountryCode={
                parsedPhone.countryCode
              }
              initialPhone={
                parsedPhone.number
              }
              onContinue={
                handleOverviewContinue
              }
              disabled={saving || completing}
            />
          </section>

          <section
            ref={experienceRef}
            className={`buyer-onboarding__section buyer-onboarding__section--${getSectionState(
              "experience",
            )}`}
          >
            <div className="buyer-onboarding__section-heading">
              <span className="buyer-onboarding__eyebrow">
                Step 2
              </span>

              <h2>
                Experience &amp; Credentials
              </h2>

              <p>
                Tell us about your background and
                experience as a buyer or operator.
              </p>
            </div>

            <ExperienceCredentialsEdit
              ref={experienceFormRef}
              mode="onboarding"
              showActions={false}
              initialData={{
                buyerType:
                  profile?.buyer_type ?? null,

                currentIndustry:
                  profile?.current_industry ?? "",

                currentPosition:
                  profile?.current_position ?? "",

                businessExperienceYears:
                  profile
                    ?.business_experience_years !=
                  null
                    ? String(
                        profile.business_experience_years,
                      )
                    : "",

                relevantExperience:
                  profile?.relevant_experience ??
                  "",

                availableHoursPerWeek:
                  profile
                    ?.available_hours_per_week !=
                  null
                    ? String(
                        profile.available_hours_per_week,
                      )
                    : "",

                city:
                  profile?.city ?? "",

                county:
                  profile?.county ?? "",

                state:
                  profile?.state ?? "",

                zipCode:
                  profile?.zip_code ?? "",
              }}
              onBack={() =>
                scrollToSection("overview")
              }
              onContinue={
                handleExperienceContinue
              }
              disabled={saving || completing}
            />
          </section>

          <section
            ref={acquisitionRef}
            className={`buyer-onboarding__section buyer-onboarding__section--${getSectionState(
              "acquisition",
            )}`}
          >
            <div className="buyer-onboarding__section-heading">
              <span className="buyer-onboarding__eyebrow">
                Step 3
              </span>

              <h2>
                Acquisition Preferences
              </h2>

              <p>
                Define the businesses, locations,
                economics, and deal structure you are
                looking for.
              </p>
            </div>

            <AcquisitionPreferencesSection
              ref={acquisitionFormRef}
              mode="onboarding"
              showActions={false}
              initialTargetIndustryPreferences={
                preferences
                  ?.target_industry_preferences ??
                []
              }
              initialTargetBusinessModels={
                preferences
                  ?.target_business_models ?? []
              }
              initialTargetBusinessTypes={
                preferences
                  ?.target_business_types ?? []
              }
              initialTargetLocations={
                preferences?.target_locations ??
                []
              }
              initialMinimumYearsInOperation={
                preferences
                  ?.minimum_years_in_operation ??
                null
              }
              initialMinimumARR={
                preferences
                  ?.minimum_required_arr ?? null
              }
              initialMinimumSDE={
                preferences
                  ?.minimum_required_sde ?? null
              }
              initialMaximumPurchasePrice={
                preferences
                  ?.maximum_purchase_price ?? null
              }
              initialPreferredARR={
                preferences?.preferred_arr ??
                null
              }
              initialPreferredSDE={
                preferences?.preferred_sde ??
                null
              }
              initialPreferredOwnerHoursPerWeek={
                preferences
                  ?.preferred_owner_hours_per_week ??
                null
              }
              initialCustomerConcentration={
                preferences
                  ?.accepts_customer_concentration_above_25_percent ??
                null
              }
              initialSellerTrainingDays={
                preferences
                  ?.required_transition_training_days ??
                null
              }
              initialDealPreference={
                preferences?.deal_preference ??
                null
              }
              initialRealEstatePreference={
                preferences
                  ?.real_estate_preference ??
                null
              }
              initialTimeline={
                preferences
                  ?.preferred_acquisition_timeline as
                  | "exploring"
                  | "within-1-12"
                  | "within-12-24"
                  | "within-24-plus"
                  | undefined
              }
              onBack={() =>
                scrollToSection("experience")
              }
              onContinue={
                handleAcquisitionContinue
              }
              disabled={saving || completing}
            />
          </section>
        </div>

        <div className="buyer-onboarding__final-action">
          <button
            type="button"
            className="buyer-onboarding__complete-button"
            onClick={handleCompleteProfile}
            disabled={saving || completing}
          >
            {saving || completing ? "Saving..." : "Complete Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}