import type {
  ApiBuyerPreferences,
  UiAcquisitionPreferences,
} from "./buyerPreferences.types";

/* =====================================================
   UI → API
   Only maps fields the backend actually supports.
   All other UI fields stay in local state and are NOT sent.
   ===================================================== */

export function uiToApi(
  ui: Partial<UiAcquisitionPreferences>
): ApiBuyerPreferences {
  const api: ApiBuyerPreferences = {};

  if (ui.industries !== undefined) {
    api.target_industries = ui.industries;
  }

  if (ui.minimumYearsInOperation !== undefined) {
    const parsed = parseFloat(ui.minimumYearsInOperation);
    if (Number.isFinite(parsed)) {
      api.minimum_years_in_operation = parsed;
    }
  }

  if (ui.minimumARR !== undefined) {
    const parsed = parseFloat(ui.minimumARR);
    if (Number.isFinite(parsed)) {
      api.minimum_required_arr = parsed;
    }
  }

  if (ui.minimumSDE !== undefined) {
    const parsed = parseFloat(ui.minimumSDE);
    if (Number.isFinite(parsed)) {
      api.minimum_required_sde = parsed;
    }
  }

  if (ui.timeline !== undefined) {
    api.preferred_acquisition_timeline = ui.timeline;
  }

  return api;
}

/* =====================================================
   API → UI
   Only maps fields the backend supports. Other UI fields
   are left undefined so the caller keeps its own defaults.
   ===================================================== */

export function apiToUi(
  api: ApiBuyerPreferences
): Partial<UiAcquisitionPreferences> {
  const ui: Partial<UiAcquisitionPreferences> = {};

  if (api.target_industries !== undefined) {
    ui.industries = api.target_industries;
  }

  if (api.minimum_years_in_operation !== undefined) {
    ui.minimumYearsInOperation = String(api.minimum_years_in_operation);
  }

  if (api.minimum_required_arr !== undefined) {
    ui.minimumARR = String(api.minimum_required_arr);
  }

  if (api.minimum_required_sde !== undefined) {
    ui.minimumSDE = String(api.minimum_required_sde);
  }

  if (api.preferred_acquisition_timeline !== undefined) {
    ui.timeline = api.preferred_acquisition_timeline;
  }

  return ui;
}