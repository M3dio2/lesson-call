import Link from "next/link";
import AuthCard, { textLink } from "@/components/auth/AuthCard";
import { buttonClass } from "@/components/ui/Button";

// Where /auth/confirm sends an expired or already used email link.
export default function LinkExpiredPage() {
  return (
    <AuthCard title="This link has expired">
      <p>Email links work once, for a limited time. If you already used it, just log in.</p>
      <Link href="/" className={buttonClass("primary", "md")}>
        Log in
      </Link>
      <p className="text-sm text-ink-muted">
        Resetting your password?{" "}
        <Link href="/forgot-password" className={textLink}>
          Send a new link
        </Link>
      </p>
    </AuthCard>
  );
}
