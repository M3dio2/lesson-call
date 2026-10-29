import LoginForm from "@/components/auth/LoginForm";

// Logged-in teachers are redirected to /dashboard by proxy.ts.
export default function Home() {
  return <LoginForm />;
}
