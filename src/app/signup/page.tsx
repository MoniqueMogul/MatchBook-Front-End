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
  getAuthErrorMessage,
} from "@/lib/auth/authErrors";
import {
  getPostSignInPath,
} from "@/lib/auth/postSignIn";
import {
  supabase,
} from "@/lib/supabase";
import {
  useAuthStore,
} from "@/store/authStore";

const schema = yup.object({
  firstName: yup
    .string()
    .trim()
    .required(
      "First name is required",
    ),

  lastName: yup
    .string()
    .trim()
    .required(
      "Last name is required",
    ),

  email: yup
    .string()
    .trim()
    .email(
      "Enter a valid email address",
    )
    .required(
      "Email is required",
    ),

  password: yup
    .string()
    .required(
      "Password is required",
    )
    .min(
      8,
      "Password must be at least 8 characters",
    ),

  confirmPassword: yup
    .string()
    .required(
      "Please confirm your password",
    )
    .oneOf(
      [yup.ref("password")],
      "Passwords do not match",
    ),
});

type SignupFormValues =
  yup.InferType<typeof schema>;

export default function SignupPage() {
  const router = useRouter();

  const {
    setEmail,
    setStep,
    setOtpPurpose,
  } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: {
      errors,
    },
  } =
    useForm<SignupFormValues>({
      resolver:
        yupResolver(schema),
    });

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
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
    data: SignupFormValues,
  ) => {
    setSubmitting(true);
    setErrorMessage(null);

    const email =
      data.email
        .trim()
        .toLowerCase();

    try {
      const {
        data: signupData,
        error,
      } =
        await supabase.auth.signUp(
          {
            email,
            password:
              data.password,
            options: {
              data: {
                first_name:
                  data.firstName.trim(),
                last_name:
                  data.lastName.trim(),
              },
            },
          },
        );

      if (error) {
        setErrorMessage(
          getAuthErrorMessage(
            error,
            "signup",
          ),
        );

        return;
      }

      if (!signupData.user) {
        setErrorMessage(
          "We couldn't create your account. Please try again.",
        );

        return;
      }

      /*
       * Supabase can deliberately avoid returning an
       * error when signUp() is called for an email that
       * already belongs to an account.
       *
       * In that case it can return an obfuscated user
       * with no identities.
       *
       * Do NOT send that user to /verify-email because
       * Supabase has not created a new account and no
       * new signup verification code was sent.
       */
      if (
        signupData.user.identities &&
        signupData.user.identities.length === 0
      ) {
        setOtpPurpose(null);

        setErrorMessage(
          "An account with this email already exists. Sign in instead.",
        );

        return;
      }

      /*
       * If Supabase returns a session immediately,
       * email confirmation is not required for this
       * project/configuration.
       *
       * The user is already authenticated, so use the
       * normal post-sign-in routing logic instead of
       * hardcoding a role-selection route.
       */
      if (signupData.session) {
        setEmail(email);
        setStep(1);
        setOtpPurpose(null);

        setPassword("");
        setConfirmPassword("");

        const destination =
          await getPostSignInPath();

        router.replace(
          destination,
        );

        return;
      }

      /*
       * Normal MatchBook signup:
       *
       * Account created
       *      ↓
       * Email confirmation required
       *      ↓
       * Store signup verification context
       *      ↓
       * Go to verification page
       */
      setEmail(email);
      setStep(1);
      setOtpPurpose(
        "signup",
      );

      setPassword("");
      setConfirmPassword("");

      router.push(
        "/verify-email",
      );
    } catch (error) {
      console.error(
        "Signup failed:",
        error,
      );

      setErrorMessage(
        getAuthErrorMessage(
          error,
          "signup",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="brand">
      <h1 className="page-title">
        Create your account
      </h1>

      <p className="page-subtitle">
        Enter your details,
        create a password, and
        verify your email to get
        started.
      </p>

      <form
        onSubmit={
          handleSubmit(onSubmit)
        }
      >
        <Input
          label="First Name"
          type="text"
          placeholder="Enter your first name"
          autoComplete="given-name"
          {...register(
            "firstName",
          )}
          error={
            errors.firstName
              ?.message
          }
        />

        <Input
          label="Last Name"
          type="text"
          placeholder="Enter your last name"
          autoComplete="family-name"
          {...register(
            "lastName",
          )}
          error={
            errors.lastName
              ?.message
          }
        />

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
          autoComplete="new-password"
          required
          value={password}
          {...register(
            "password",
            {
              onChange: (
                event,
              ) => {
                setPassword(
                  event.target.value,
                );

                if (
                  errorMessage
                ) {
                  setErrorMessage(
                    null,
                  );
                }
              },
            },
          )}
          error={
            errors.password
              ?.message
          }
        />

        <PasswordInput
          label="Confirm Password"
          aria-label="Confirm Password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          {...register(
            "confirmPassword",
            {
              onChange: (
                event,
              ) => {
                setConfirmPassword(
                  event.target.value,
                );

                if (
                  errorMessage
                ) {
                  setErrorMessage(
                    null,
                  );
                }
              },
            },
          )}
          error={
            errors
              .confirmPassword
              ?.message
          }
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
            ? "Creating account…"
            : "Create Account"}
        </Button>
      </form>

      <p
        className="resend-text"
        style={{
          marginTop: 16,
        }}
      >
        Already have an account?{" "}
        <a href="/signin">
          Sign in
        </a>
      </p>
    </AuthLayout>
  );
}