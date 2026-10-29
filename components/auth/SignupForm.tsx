"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthCard, { textLink } from "@/components/auth/AuthCard";
import NewPasswordFields from "@/components/auth/NewPasswordFields";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { authErrorMessage } from "@/lib/authErrors";
import { passwordProblem } from "@/lib/passwordRules";
import { createClient } from "@/lib/supabase/client";

// New teacher account. The name goes into user metadata (display_name), the same place the
// dashboard's name prompt writes, so a new teacher isn't asked for it again.
// With "Confirm email" on in Supabase, signUp returns no session and the teacher gets a link
// (handled by /auth/confirm); with it off, they're logged in straight away.
export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    const problem = passwordProblem(password, confirm);
    if (problem) {
      setError(problem);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name.trim().slice(0, 40) },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setLoading(false);
      setError(authErrorMessage(error));
      return;
    }
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    setLoading(false);
    setEmailSent(true);
  }

  if (emailSent) {
    return (
      <AuthCard title="Check your email">
        <p>
          We sent a link to <span className="font-medium">{email}</span>. Click it to finish
          creating your account.
        </p>
        <p className="text-sm text-ink-muted">
          No email after a few minutes? Look in your spam folder.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create a teacher account">
      <form onSubmit={signUp} className="flex flex-col gap-4">
        <Field
          label="Your name (students see it)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          maxLength={40}
          required
        />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <NewPasswordFields
          label="Password"
          password={password}
          confirm={confirm}
          onPasswordChange={setPassword}
          onConfirmChange={setConfirm}
        />
        <Button disabled={loading}>{loading ? "Creating your account…" : "Create account"}</Button>
        {error && <p className="text-sm text-danger">{error}</p>}
      </form>
      <p className="text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/" className={textLink}>
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
