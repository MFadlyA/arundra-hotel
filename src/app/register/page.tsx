import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getCachedAuthPagesSettings } from "@/lib/cms-cache";
import RegisterForm from "@/components/RegisterForm";

export const revalidate = 60;

export default async function RegisterPage() {
  const settings = await getCachedAuthPagesSettings();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8f6f1]">
          <Loader2 className="animate-spin text-[#a58b72]" size={36} />
        </div>
      }
    >
      <RegisterForm initialSettings={settings} />
    </Suspense>
  );
}
