import LoginForm from "@/components/LoginForm";

// Logged-in teachers are redirected to /dashboard by proxy.ts.
export default function Home() {
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center bg-neutral-950 p-4 text-neutral-100">
      <LoginForm />
    </main>
  );
}
