"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_AUTH_PAGES_SETTINGS } from "@/lib/auth-pages-settings";
import type { AuthPagesSettings } from "@/types/database";

interface LoginFormProps {
  initialSettings?: AuthPagesSettings;
}

export default function LoginForm({ initialSettings }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshProfile } = useAuth();

  const [settings] = useState<AuthPagesSettings>(
    initialSettings || DEFAULT_AUTH_PAGES_SETTINGS
  );

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const configured = isSupabaseConfigured();

  // Detect email verification callback
  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setSuccessMessage(
        "Email verification confirmed! Welcome to Arundra Signature Pondok Indah. Please sign in below to access your account."
      );
    }
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!configured) {
      setError(
        "Supabase connection is not configured yet. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
      );
      return;
    }

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Invalid email address or password.");
        } else if (signInError.message.includes("Email not confirmed")) {
          setError(
            "Email has not been verified yet. Please check your inbox and confirm your email."
          );
        } else {
          setError(signInError.message);
        }
        return;
      }

      if (data.user) {
        // Check role securely from app_metadata or profiles table
        let role = (data.user.app_metadata?.role as "user" | "admin") || null;
        if (!role) {
          const { data: profileData } = (await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single()) as { data: { role?: "user" | "admin" } | null };
          role = profileData?.role || "user";
        }

        // Non-blocking background sync of phone number if needed
        const metaPhone =
          data.user.user_metadata?.phone ||
          data.user.user_metadata?.phone_number;

        if (metaPhone) {
          (supabase.from("profiles") as any)
            .update({ phone: String(metaPhone).trim() })
            .eq("id", data.user.id)
            .then(() => {})
            .catch(() => {});
        }

        // Trigger context refresh in the background
        refreshProfile().catch(() => {});

        setSuccessMessage("Sign in successful! Redirecting...");

        // Fast redirect without artificial delays
        if (role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An error occurred while signing in.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const brandTitle =
    settings.login_brand_title || DEFAULT_AUTH_PAGES_SETTINGS.login_brand_title;
  const brandSubtitle =
    settings.login_brand_subtitle ||
    DEFAULT_AUTH_PAGES_SETTINGS.login_brand_subtitle;

  const bgImage =
    settings.login_image || DEFAULT_AUTH_PAGES_SETTINGS.login_image;
  const eyebrow =
    settings.login_badge || DEFAULT_AUTH_PAGES_SETTINGS.login_badge;
  const headline =
    settings.login_title || DEFAULT_AUTH_PAGES_SETTINGS.login_title;
  const description =
    settings.login_description || DEFAULT_AUTH_PAGES_SETTINGS.login_description;

  const formEyebrow =
    settings.login_form_eyebrow ||
    DEFAULT_AUTH_PAGES_SETTINGS.login_form_eyebrow;
  const formTitle =
    settings.login_form_title || DEFAULT_AUTH_PAGES_SETTINGS.login_form_title;
  const formDescription =
    settings.login_form_description ||
    DEFAULT_AUTH_PAGES_SETTINGS.login_form_description;

  return (
    <main className="grid min-h-screen bg-[#f8f6f1] lg:grid-cols-2">
      {/* LEFT IMAGE */}
      <section className="relative hidden min-h-screen lg:block">
        <img
          src={bgImage}
          alt="Elegant hotel bedroom"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#292722]/85 via-[#292722]/20 to-[#292722]/20" />

        <Link
          href="/"
          className="cursor-pointer absolute left-12 top-10 z-10 flex flex-col text-white"
        >
          <span className="text-2xl tracking-[0.12em]">{brandTitle}</span>
          <span className="mt-1 text-[9px] tracking-[0.42em] text-[#e0c6a5]">
            {brandSubtitle}
          </span>
        </Link>

        <div className="absolute bottom-16 left-12 right-12 text-white">
          <p className="text-xs tracking-[0.3em] text-[#e0c6a5] font-semibold uppercase">
            {eyebrow}
          </p>

          <h1 className="mt-5 max-w-lg text-5xl leading-tight xl:text-6xl font-serif">
            {headline}
          </h1>

          <p className="mt-6 max-w-md text-sm leading-7 text-white/70">
            {description}
          </p>
        </div>
      </section>

      {/* RIGHT FORM */}
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="cursor-pointer inline-flex items-center gap-2 text-sm text-[#777064] hover:text-[#4a382d]"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="mb-10 mt-12 lg:mt-16">
            <Link href="/" className="cursor-pointer flex flex-col lg:hidden">
              <span className="text-2xl tracking-[0.12em] text-[#4a382d]">
                {brandTitle}
              </span>

              <span className="mt-1 text-[9px] tracking-[0.42em] text-[#a58b72]">
                {brandSubtitle}
              </span>
            </Link>

            <p className="mt-10 text-xs font-semibold tracking-[0.3em] text-[#a58b72] uppercase">
              {formEyebrow}
            </p>

            <h2 className="mt-4 text-4xl text-[#4a382d] sm:text-5xl font-serif">
              {formTitle}
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#777064]">
              {formDescription}
            </p>
          </div>

          {!configured && (
            <div className="mb-6 rounded-lg border border-[#e8d5b5] bg-[#fffaf0] p-4 text-sm text-[#7a5827]">
              <div className="flex items-start gap-2.5">
                <AlertCircle
                  className="mt-0.5 shrink-0 text-[#a87428]"
                  size={18}
                />
                <div>
                  <p className="font-semibold">Supabase Configuration Required</p>
                  <p className="mt-1 text-xs leading-5 text-[#8c652f]">
                    Please configure{" "}
                    <code className="bg-[#f0e3cc] px-1 py-0.5 rounded font-mono">
                      NEXT_PUBLIC_SUPABASE_URL
                    </code>{" "}
                    and{" "}
                    <code className="bg-[#f0e3cc] px-1 py-0.5 rounded font-mono">
                      NEXT_PUBLIC_SUPABASE_ANON_KEY
                    </code>{" "}
                    in your <code className="font-semibold">.env.local</code> file.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-[#e5c2bc] bg-[#fbf2f0] p-4 text-sm text-[#984b3b]">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-[#c4deb8] bg-[#f0f8ed] p-4 text-sm text-[#2c611f]">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#3b872b]" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium uppercase tracking-wider text-[#777064]"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="mt-2 w-full rounded-lg border border-[#ded5c8] bg-white px-4 py-3 text-sm text-[#292722] placeholder:text-[#b8aea2] focus:border-[#4a382d] focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium uppercase tracking-wider text-[#777064]"
                >
                  Password
                </label>
              </div>

              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-[#ded5c8] bg-white px-4 py-3 pr-11 text-sm text-[#292722] placeholder:text-[#b8aea2] focus:border-[#4a382d] focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-[#777064] hover:text-[#4a382d]"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg bg-[#4a382d] py-4 text-sm font-medium text-white shadow-xs transition hover:bg-[#655043] disabled:opacity-50"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Sign In
            </button>
          </form>

          <div className="relative my-8 text-center text-xs text-[#777064]">
            <span className="relative z-10 bg-[#f8f6f1] px-4">
              Don&apos;t have an account?
            </span>
            <div className="absolute inset-0 top-1/2 -z-0 border-t border-[#ded5c8]" />
          </div>

          <Link
            href="/register"
            className="cursor-pointer block rounded-lg border border-[#4a382d] py-4 text-center text-sm font-medium text-[#4a382d] transition hover:bg-[#eee7dc]"
          >
            Create an Account
          </Link>

          <p className="mt-10 text-center text-xs leading-6 text-[#aaa198]">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </section>
    </main>
  );
}

