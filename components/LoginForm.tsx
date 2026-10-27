"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
    <form onSubmit={logIn} className="flex w-full max-w-sm flex-col gap-3">
      <h1 className="text-2xl font-semibold">Teacher login</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        autoComplete="email"
        required
        className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoComplete="current-password"
        required
        className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
      />
      <button
        disabled={loading}
        className="rounded-md bg-blue-600 px-3 py-2 font-medium disabled:opacity-50"
      >
        {loading ? "Logging in…" : "Log in"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <p className="text-sm text-neutral-400">Students: use the invite link from your teacher.</p>
    </form>
  );
}
