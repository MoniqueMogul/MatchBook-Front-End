"use client";

import React, {
  useState,
} from "react";
import {
  useForm,
} from "react-hook-form";
import {
  yupResolver,
} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  useRouter,
} from "next/navigation";

import AuthLayout from "@/components/common/AuthLayout";
import {
  Input,
} from "@/components/common/Input";
import {
  PasswordInput,
} from "@/components/common/PasswordInput";
import {
  Button,
} from "@/components/common/Button";
import {
  getPostSignInPath,
} from "@/lib/auth/postSignIn";
import {
  getAuthErrorMessage,
} from "@/lib/auth/authErrors";
import {
  supabase,
} from "@/lib/supabase";
import {
  useAuthStore,
} from "@/store/authStore";

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .email(
      "Enter a valid email address",
    )
    .required(
      "Email is required",
    ),
});

type SigninFormValues =
  yup.InferType<typeof schema>;

export default function SigninPage() {
  const router = useRouter();

  const {
    setEmail,
    setOtpPurpose,
  } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: {
      errors,
    },
  } =
    useForm<SigninFormValues>({
      resolver:
        yupResolver(schema),
    });

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  );

  const onSubmit = async (
    data: SigninFormValues,
  ) => {
    if (!password) {
      setErrorMessage(
        "Password is required.",
      );

      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const email =
      data.email
        .trim()
        .toLowerCase();

    try {
      const {
        error,
      } =
        await supabase.auth.signInWithPassword(
          {
            email,
            password,
          },
        );

      if (error) {
        setErrorMessage(
          getAuthErrorMessage(
            error,
            "signin",
          ),
        );

        return;
      }

      setEmail(email);
      setOtpPurpose(null);
      setPassword("");

      const destination =
        await getPostSignInPath();

      router.replace(
        destination,
      );
    } catch (error) {
      console.error(
        "Sign-in failed:",
        error,
      );

      setErrorMessage(
        getAuthErrorMessage(
          error,
          "signin",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="brand">
      <h1 className="page-title">
        Welcome back
      </h1>

      <p className="page-subtitle">
        Enter your email and
        password.
      </p>

      <form
        onSubmit={
          handleSubmit(onSubmit)
        }
      >
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
          error={
            errors.email?.message
          }
        />

        <PasswordInput
          label="Password"
          aria-label="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => {
            setPassword(
              event.target.value,
            );

            if (errorMessage) {
              setErrorMessage(
                null,
              );
            }
          }}
        />

        {errorMessage && (
          <p
            className="form-group__error"
            style={{
              marginTop: 12,
            }}
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: "20px",
            width: "100%",
          }}
        >
          {submitting
            ? "Signing in…"
            : "Sign in"}
        </Button>
      </form>

      <p
        className="resend-text"
        style={{
          marginTop: 16,
        }}
      >
        Don&apos;t have an
        account?{" "}
        <a href="/signup">
          Sign up
        </a>
      </p>
    </AuthLayout>
  );
}