"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

type AuthFormProps = {
  mode: "login" | "sign-up";
  callbackUrl?: string;
};

export function AuthForm({ mode, callbackUrl }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isSignUp = mode === "sign-up";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      if (isSignUp) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formData.get("fullName"),
            email,
            universityId: formData.get("universityId"),
            password,
            confirmPassword: formData.get("confirmPassword"),
            role: formData.get("role"),
          }),
        });
        const result = await response.json();

        if (!response.ok) {
          setError(typeof result.error === "string" ? result.error : "Unable to create your account.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("We couldn't sign you in with those details.");
        return;
      }

      const destination = callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
        ? callbackUrl
        : "/my-rentals";
      router.replace(destination);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {isSignUp && (
        <>
          <label className="field-label">
            Full name
            <input autoComplete="name" name="fullName" placeholder="Your name" required minLength={3} />
          </label>
          <label className="field-label">
            Campus role
            <select name="role" defaultValue="student">
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </label>
        </>
      )}
      <label className="field-label">
        University email
        <input autoComplete="email" name="email" placeholder="you@university.edu" type="email" required />
      </label>
      {isSignUp && (
        <label className="field-label">
          Student / staff ID
          <input name="universityId" placeholder="Your campus ID" required />
        </label>
      )}
      <label className="field-label">
        Password
        <input
          autoComplete={isSignUp ? "new-password" : "current-password"}
          name="password"
          placeholder={isSignUp ? "At least 8 characters" : "Enter your password"}
          type="password"
          required
          minLength={8}
        />
      </label>
      {isSignUp && (
        <label className="field-label">
          Confirm password
          <input autoComplete="new-password" name="confirmPassword" placeholder="Enter your password again" type="password" required />
        </label>
      )}
      {error && <p className="auth-message" role="alert">{error}</p>}
      <button className="booking-submit" type="submit" disabled={pending}>
        {pending ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
        {!pending && <ArrowRight size={15} />}
      </button>
    </form>
  );
}