"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthCard, { textLink } from "@/components/auth/AuthCard";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { authErrorMessage } from "@/lib/authErrors";
import { createClient } from "@/lib/supabase/client";

// Teacher login. New teachers create an account at /signup.
export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function logIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError(authErrorMessage(error));
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthCard title="Teacher login">
      <form onSubmit={logIn} className="flex flex-col gap-4">
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        <Button disabled={loading}>{loading ? "Logging in…" : "Log in"}</Button>
        {error && <p className="text-sm text-danger">{error}</p>}
      </form>
      <div className="flex flex-col gap-1 text-sm text-ink-muted">
        <p>
          <Link href="/forgot-password" className={textLink}>
            Forgot your password?
          </Link>
        </p>
        <p>
          New here?{" "}
          <Link href="/signup" className={textLink}>
            Create a teacher account
          </Link>
        </p>
        <p>Students: use the invite link from your teacher.</p>
      </div>
    </AuthCard>
  );
}
