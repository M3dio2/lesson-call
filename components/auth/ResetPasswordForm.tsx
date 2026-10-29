"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { authErrorMessage } from "@/lib/authErrors";
import { createClient } from "@/lib/supabase/client";

// Reached from the reset link (already logged in by /auth/confirm), or by a logged-in teacher.
export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await createClient().auth.updateUser({ password });
    if (error) {
      setLoading(false);
      setError(authErrorMessage(error));
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={save} className="flex flex-col gap-4">
        <Field
          label="New password (at least 8 characters)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Button disabled={loading}>{loading ? "Saving…" : "Save and continue"}</Button>
        {error && <p className="text-sm text-danger">{error}</p>}
      </form>
    </AuthCard>
  );
}
