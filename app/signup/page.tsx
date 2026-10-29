import SignupForm from "@/components/auth/SignupForm";

// Logged-in teachers are redirected to /dashboard by proxy.ts.
export default function SignupPage() {
  return <SignupForm />;
}
