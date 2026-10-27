"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Panel from "@/components/ui/Panel";
import { createClient } from "@/lib/supabase/client";

// Teacher login. There is no sign-up: the teacher account is created in the Supabase dashboard.
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
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Panel className="w-full max-w-sm">
      <form onSubmit={logIn} className="flex flex-col gap-4 p-6">
        <div>
          <p className="text-sm font-medium text-accent">Lesson Call</p>
          <h1 className="text-2xl font-semibold">Teacher login</h1>
        </div>
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
        <p className="text-sm text-ink-muted">Students: use the invite link from your teacher.</p>
      </form>
    </Panel>
  );
}
