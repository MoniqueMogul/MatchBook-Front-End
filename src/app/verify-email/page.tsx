"use client";

import React, {
  useEffect,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

import AuthLayout from "@/components/common/AuthLayout";
import {
  OtpInput,
} from "@/components/common/OtpInput";
import {
  Button,
} from "@/components/common/Button";
import {
  getAuthErrorMessage,
} from "@/lib/auth/authErrors";
import {
  supabase,
} from "@/lib/supabase";
import {
  useAuthStore,
} from "@/store/authStore";
import {
  getPostSignInPath,
} from "@/lib/auth/postSignIn";

export default function VerifyEmailPage() {
  const router = useRouter();

  const {
    email,
    otpPurpose,
    setOtpPurpose,
  } = useAuthStore();

  const [
    otp,
    setOtp,
  ] = useState("");

  const [
    verifying,
    setVerifying,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  );

  const [
    timer,
    setTimer,
  ] = useState(27);

  const [
    resending,
    setResending,
  ] = useState(false);

  useEffect(() => {
    if (timer <= 0) {
      return;
    }

    const interval =
      window.setInterval(
        () => {
          setTimer((previous) =>
            previous > 0
              ? previous - 1
              : 0,
          );
        },
        1000,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [timer]);

  const handleVerifyOtp =
    async () => {
      if (otp.length !== 8) {
        setErrorMessage(
          "Please enter the full 8-digit code.",
        );

        return;
      }

      if (
        !email ||
        !otpPurpose
      ) {
        setErrorMessage(
          "Your verification session has expired. Please start again.",
        );

        return;
      }

      setVerifying(true);
      setErrorMessage(null);

      try {
        const {
          error,
        } =
          await supabase.auth.verifyOtp(
            {
              email,
              token: otp,
              type:
                otpPurpose ===
                "signup"
                  ? "signup"
                  : "email",
            },
          );

        if (error) {
          setErrorMessage(
            getAuthErrorMessage(
              error,
              "verify-otp",
            ),
          );

          return;
        }

        setOtpPurpose(null);

        const destination =
          await getPostSignInPath();

        router.replace(
          destination,
        );
      } catch (error) {
        console.error(
          "OTP verification failed:",
          error,
        );

        setErrorMessage(
          getAuthErrorMessage(
            error,
            "verify-otp",
          ),
        );
      } finally {
        setVerifying(false);
      }
    };

  const handleResend =
    async () => {
      if (
        timer > 0 ||
        resending ||
        !email ||
        !otpPurpose
      ) {
        return;
      }

      setResending(true);
      setErrorMessage(null);

      try {
        if (
          otpPurpose ===
          "signup"
        ) {
          const {
            error,
          } =
            await supabase.auth.resend(
              {
                type: "signup",
                email,
              },
            );

          if (error) {
            setErrorMessage(
              getAuthErrorMessage(
                error,
                "resend-otp",
              ),
            );

            return;
          }
        } else {
          const {
            error,
          } =
            await supabase.auth.signInWithOtp(
              {
                email,
                options: {
                  shouldCreateUser:
                    false,
                },
              },
            );

          if (error) {
            setErrorMessage(
              getAuthErrorMessage(
                error,
                "resend-otp",
              ),
            );

            return;
          }
        }

        setTimer(30);
        setOtp("");
      } catch (error) {
        console.error(
          "OTP resend failed:",
          error,
        );

        setErrorMessage(
          getAuthErrorMessage(
            error,
            "resend-otp",
          ),
        );
      } finally {
        setResending(false);
      }
    };

  if (
    !email ||
    !otpPurpose
  ) {
    return (
      <AuthLayout variant="brand">
        <h1 className="page-title">
          Verification session
          missing
        </h1>

        <p className="page-subtitle">
          Your verification
          session is no longer
          available. Please sign
          in or create an account
          again.
        </p>

        <Button
          onClick={() =>
            router.push(
              "/signin",
            )
          }
        >
          Go to sign in
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="brand">
      <h1 className="page-title">
        Verify Your Email
      </h1>

      <p className="page-subtitle">
        {otpPurpose ===
        "signup"
          ? "Enter the verification code sent to "
          : "Enter the one-time password sent to "}
        {email}
      </p>

      <label className="form-label">
        OTP
      </label>

      <OtpInput
        length={8}
        onChange={(value) => {
          setOtp(value);

          if (
            errorMessage
          ) {
            setErrorMessage(
              null,
            );
          }
        }}
      />

      <p className="resend-text">
        Didn&apos;t receive the
        OTP?{" "}
        {timer > 0 ? (
          <>
            Resend in 0:
            {timer
              .toString()
              .padStart(2, "0")}
          </>
        ) : (
          <button
            type="button"
            onClick={
              handleResend
            }
            disabled={resending}
            style={{
              background:
                "none",
              border: "none",
              color: "inherit",
              textDecoration:
                "underline",
              cursor: resending
                ? "default"
                : "pointer",
              padding: 0,
            }}
          >
            {resending
              ? "Sending…"
              : "Resend"}
          </button>
        )}
      </p>

      {errorMessage && (
        <p
          className="form-group__error"
          style={{
            marginTop: 8,
          }}
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      <Button
        type="button"
        onClick={
          handleVerifyOtp
        }
        disabled={
          verifying ||
          otp.length !== 8
        }
        style={{
          marginTop: "16px",
          width: "100%",
        }}
      >
        {verifying
          ? "Verifying…"
          : "Verify Email"}
      </Button>
    </AuthLayout>
  );
}