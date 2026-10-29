import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

// Needs a session (from the reset link); proxy.ts sends logged-out visitors to the login page.
export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
