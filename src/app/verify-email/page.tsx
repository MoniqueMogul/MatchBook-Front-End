"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AuthLayout from "@/components/common/AuthLayout";
import { OtpInput } from "@/components/common/OtpInput";
import { Button } from "@/components/common/Button";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { email, setStep } = useAuthStore();

  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timer, setTimer] = useState(27);
  const [resending, setResending] = useState(false);

  /* ------------------------------
     Resend countdown timer
     ------------------------------ */
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* ------------------------------
     Verify OTP
     ------------------------------ */
  const handleVerifyOtp = async () => {
    if (otp.length !== 8) {
      setErrorMessage("Please enter the full 8-digit code.");
      return;
    }

    setVerifying(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      // OTP verification is successful.
      // Supabase has now established the authenticated session.
      setStep(2);
      router.push("/role-selection");
    } catch (err) {
      setErrorMessage("Could not verify the code. Please try again.");
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  /* ------------------------------
     Resend OTP
     ------------------------------ */
  const handleResend = async () => {
    if (timer > 0 || resending || !email) return;

    setResending(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setTimer(30);
      setOtp("");
    } catch (err) {
      setErrorMessage("Could not resend the code. Please try again.");
      console.error(err);
    } finally {
      setResending(false);
    }
  };

  /* ------------------------------
     Guard: no email in store
     ------------------------------ */
  if (!email) {
    return (
      <AuthLayout>
        <h1 className="page-title">Email missing</h1>

        <p className="page-subtitle">
          Please start again from the signup page.
        </p>

        <Button onClick={() => router.push("/signup")}>
          Go to signup
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="page-title">Verify Your Email</h1>

      <p className="page-subtitle">
        An email with a one-time password has been sent to {email}
      </p>

      <label className="form-label">OTP</label>

      <OtpInput
        length={8}
        onChange={setOtp}
      />

      <p className="resend-text">
        Didn&apos;t receive the OTP?{" "}
        {timer > 0 ? (
          <>Resend in 0:{timer.toString().padStart(2, "0")}</>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              textDecoration: "underline",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {resending ? "Sending…" : "Resend"}
          </button>
        )}
      </p>

      {errorMessage && (
        <p
          className="form-group__error"
          style={{ marginTop: 8 }}
        >
          {errorMessage}
        </p>
      )}

      <Button
        type="button"
        onClick={handleVerifyOtp}
        disabled={verifying || otp.length !== 8}
        style={{ marginTop: "16px", width: "100%" }}
      >
        {verifying ? "Verifying…" : "Verify OTP"}
      </Button>
    </AuthLayout>
  );
}