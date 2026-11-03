import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getCachedAuthPagesSettings } from "@/lib/cms-cache";
import LoginForm from "@/components/LoginForm";

export const revalidate = 60;

export default async function LoginPage() {
  const settings = await getCachedAuthPagesSettings();

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f8f6f1]">
          <Loader2 size={36} className="animate-spin text-[#a58b72]" />
        </main>
      }
    >
      <LoginForm initialSettings={settings} />
    </Suspense>
  );
}
