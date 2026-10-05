import type { AuthError } from "@supabase/supabase-js";

export type AuthAction =
  | "signin"
  | "signup"
  | "verify-otp"
  | "resend-otp";

interface SupabaseAuthErrorLike {
  code?: string;
  message?: string;
  status?: number;
  name?: string;
}

export function getAuthErrorMessage(
  error: unknown,
  action: AuthAction,
): string {
  const authError = normalizeAuthError(error);
  const code = authError.code?.toLowerCase();
  const status = authError.status;

  if (
    status === 429 ||
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit"
  ) {
    if (
      action === "signup" ||
      action === "resend-otp"
    ) {
      return "Too many verification emails have been requested. Please wait a moment and try again.";
    }

    return "Too many attempts. Please wait a moment and try again.";
  }

  switch (code) {
    case "invalid_credentials":
      return "Incorrect email or password. Please try again.";

    case "email_not_confirmed":
      return "Please verify your email before signing in.";

    case "user_not_found":
      return "We could not find this account. Sign up to create an account.";

    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists. Sign in instead.";

    case "weak_password":
      return "Your password does not meet the password requirements.";

    case "otp_expired":
      return "This verification code is invalid or has expired. Request a new code and try again.";

    case "flow_state_expired":
    case "flow_state_not_found":
      return "Your sign-in session has expired. Please start again.";

    case "validation_failed":
      return getValidationMessage(action);

    case "email_provider_disabled":
      return "Email authentication is currently unavailable. Please try again later.";

    case "otp_disabled":
      return "Email code sign-in is currently unavailable. Please try again later.";

    case "user_banned":
      return "This account is currently unavailable. Please contact MatchBook support.";

    case "unexpected_failure":
      return "Authentication is temporarily unavailable. Please try again.";

    default:
      break;
  }

  if (
    isNetworkError(authError)
  ) {
    return "We couldn't connect to MatchBook. Check your connection and try again.";
  }

  if (
    status !== undefined &&
    status >= 500
  ) {
    return "Authentication is temporarily unavailable. Please try again.";
  }

  return getFallbackMessage(action);
}

function normalizeAuthError(
  error: unknown,
): SupabaseAuthErrorLike {
  if (
    error &&
    typeof error === "object"
  ) {
    const candidate =
      error as Partial<AuthError> &
        SupabaseAuthErrorLike;

    return {
      code:
        typeof candidate.code ===
        "string"
          ? candidate.code
          : undefined,
      message:
        typeof candidate.message ===
        "string"
          ? candidate.message
          : undefined,
      status:
        typeof candidate.status ===
        "number"
          ? candidate.status
          : undefined,
      name:
        typeof candidate.name ===
        "string"
          ? candidate.name
          : undefined,
    };
  }

  if (
    error instanceof Error
  ) {
    return {
      message: error.message,
      name: error.name,
    };
  }

  return {};
}

function isNetworkError(
  error: SupabaseAuthErrorLike,
): boolean {
  const name =
    error.name?.toLowerCase() ?? "";

  const message =
    error.message?.toLowerCase() ?? "";

  return (
    name.includes("fetch") ||
    name.includes("network") ||
    message.includes("failed to fetch") ||
    message.includes("network request failed") ||
    message.includes("networkerror")
  );
}

function getValidationMessage(
  action: AuthAction,
): string {
  switch (action) {
    case "signin":
      return "Check your email and password and try again.";

    case "signup":
      return "Check your account details and try again.";

    case "verify-otp":
      return "The verification code is invalid. Check the code and try again.";

    case "resend-otp":
      return "We could not send another verification code. Check your email and try again.";
  }
}

function getFallbackMessage(
  action: AuthAction,
): string {
  switch (action) {
    case "signin":
      return "We couldn't sign you in. Please try again.";

    case "signup":
      return "We couldn't create your account. Please try again.";

    case "verify-otp":
      return "We couldn't verify that code. Please try again.";

    case "resend-otp":
      return "We couldn't resend the verification code. Please try again.";
  }
}