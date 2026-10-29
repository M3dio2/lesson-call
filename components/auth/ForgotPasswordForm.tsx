"use client";

import Link from "next/link";
import { useState } from "react";
import AuthCard, { textLink } from "@/components/auth/AuthCard";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { authErrorMessage } from "@/lib/authErrors";
import { createClient } from "@/lib/supabase/client";

// Sends a reset link. The email template points it at /auth/confirm (type=recovery), which logs
// the teacher in and continues to /reset-password. Supabase answers the same whether or not the
// email has an account, so the message doesn't say either.
export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setLoading(false);
    if (error) {
      setError(authErrorMessage(error));
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard title="Check your email">
        <p>
          If there&apos;s an account for <span className="font-medium">{email}</span>, we sent it
          a link to choose a new password.
        </p>
        <p className="text-sm text-ink-muted">
          No email after a few minutes? Look in your spam folder.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Forgot your password?">
      <form onSubmit={sendLink} className="flex flex-col gap-4">
        <p className="text-sm text-ink-muted">
          Enter your email and we&apos;ll send you a link to choose a new one.
        </p>
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Button disabled={loading}>{loading ? "Sending…" : "Send link"}</Button>
        {error && <p className="text-sm text-danger">{error}</p>}
      </form>
      <p className="text-sm text-ink-muted">
        <Link href="/" className={textLink}>
          Back to login
        </Link>
      </p>
    </AuthCard>
  );
}
