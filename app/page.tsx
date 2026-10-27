import LoginForm from "@/components/LoginForm";

// Logged-in teachers are redirected to /dashboard by proxy.ts.
export default function Home() {
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center p-4">
      <LoginForm />
    </main>
  );
}
