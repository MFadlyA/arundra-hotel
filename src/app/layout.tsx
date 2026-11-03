import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { FooterProvider } from "@/context/FooterContext";
import HangingTag from "@/components/HangingTag";
import GlobalAlertModal from "@/components/GlobalAlertModal";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getCachedFooterSettings } from "@/lib/cms-cache";
import type { Profile } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Arundra Signature Pondok Indah | 4-Star Luxury Hotel & Serviced Residence",
  description:
    "Discover a refined living experience at Arundra Signature Residence Pondok Indah, South Jakarta, where modern elegance meets comfort and personalized hospitality.",
};

async function getInitialAuth(): Promise<{
  user: User | null;
  profile: Profile | null;
}> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null, profile: null };
    }

    const { data: profile } = await (supabase.from("profiles") as any)
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return {
      user,
      profile: (profile as Profile) || null,
    };
  } catch {
    return { user: null, profile: null };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ user, profile }, footerSettings] = await Promise.all([
    getInitialAuth(),
    getCachedFooterSettings(),
  ]);

  return (
    <html lang="en">
      <body>
        <AuthProvider initialUser={user} initialProfile={profile}>
          <FooterProvider initialSettings={footerSettings}>
            {children}
            <HangingTag />
            <GlobalAlertModal />
          </FooterProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
