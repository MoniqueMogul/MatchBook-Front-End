import type {
  ApiBuyerPreferences,
  ApiTargetLocation,
  UiAcquisitionPreferences,
} from "./buyerPreferences.types";

/**
 * Converts the Acquisition Preferences UI state
 * into the payload expected by the backend.
 */
export function uiToApi(
  ui: UiAcquisitionPreferences,
  targetLocations?: ApiTargetLocation[],
): ApiBuyerPreferences {
  const api: ApiBuyerPreferences = {};

  // Industries
  if (ui.industries.length > 0) {
    api.target_industries = ui.industries;
  }

  // Preferred Regions / Locations
  if (targetLocations && targetLocations.length > 0) {
    api.target_locations = targetLocations;
  }

  // Minimum years in operation
  if (ui.minimumYearsInOperation.trim() !== "") {
    const years = Number(ui.minimumYearsInOperation);

    if (Number.isInteger(years) && years >= 0) {
      api.minimum_years_in_operation = years;
    }
  }

  // Minimum ARR
  if (ui.minimumARR.trim() !== "") {
    const arr = Number(ui.minimumARR);

    if (!Number.isNaN(arr) && arr >= 0) {
      api.minimum_required_arr = arr;
    }
  }

  // Minimum SDE
  if (ui.minimumSDE.trim() !== "") {
    const sde = Number(ui.minimumSDE);

    if (!Number.isNaN(sde) && sde >= 0) {
      api.minimum_required_sde = sde;
    }
  }

  // Acquisition timeline
  if (ui.timeline.trim() !== "") {
    api.preferred_acquisition_timeline =
      ui.timeline.trim();
  }

  return api;
}

/**
 * Converts the backend Buyer Preferences response
 * into the Acquisition Preferences UI state.
 *
 * Fields that do not currently exist in the UI
 * are intentionally left at their existing/default values.
 */
export function apiToUi(
  api: ApiBuyerPreferences,
  currentUi: UiAcquisitionPreferences,
): UiAcquisitionPreferences {
  return {
    ...currentUi,

    industries:
      api.target_industries ??
      currentUi.industries,

    minimumYearsInOperation:
      api.minimum_years_in_operation !== undefined &&
      api.minimum_years_in_operation !== null
        ? String(api.minimum_years_in_operation)
        : currentUi.minimumYearsInOperation,

    minimumARR:
      api.minimum_required_arr !== undefined &&
      api.minimum_required_arr !== null
        ? String(api.minimum_required_arr)
        : currentUi.minimumARR,

    minimumSDE:
      api.minimum_required_sde !== undefined &&
      api.minimum_required_sde !== null
        ? String(api.minimum_required_sde)
        : currentUi.minimumSDE,

    timeline:
      api.preferred_acquisition_timeline ??
      currentUi.timeline,
  };
}