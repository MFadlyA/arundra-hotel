"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { DEFAULT_AUTH_PAGES_SETTINGS } from "@/lib/auth-pages-settings";
import type { AuthPagesSettings } from "@/types/database";

interface RegisterFormProps {
  initialSettings?: AuthPagesSettings;
}

export default function RegisterForm({ initialSettings }: RegisterFormProps) {
  const router = useRouter();

  const [settings] = useState<AuthPagesSettings>(
    initialSettings || DEFAULT_AUTH_PAGES_SETTINGS
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const configured = isSupabaseConfigured();

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

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setIsLoading(true);

    try {
      const trimmedPhone = phone.trim();

      // HOTEL GUEST REGISTRATION: Handled via standard Supabase auth (strictly role: 'user')
      const supabase = createClient();

      const emailRedirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback?next=/login`
          : undefined;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: fullName.trim(),
            phone: trimmedPhone || null,
            phone_number: trimmedPhone || null,
            role: "user",
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data?.user) {
        if (data.session && trimmedPhone) {
          (supabase.from("profiles") as any)
            .update({ phone: trimmedPhone })
            .eq("id", data.user.id)
            .then(() => {})
            .catch(() => {});
        }

        if (data.session) {
          setSuccessMessage(
            "Account successfully registered at Arundra Signature Pondok Indah! Redirecting..."
          );
          setTimeout(() => {
            router.push("/");
          }, 600);
        } else {
          setSuccessMessage(
            `Registration successful! A verification email has been sent to ${email}. Please check your inbox and confirm your email to activate your account.`
          );
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during registration.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const brandTitle =
    settings.register_brand_title ||
    DEFAULT_AUTH_PAGES_SETTINGS.register_brand_title;
  const brandSubtitle =
    settings.register_brand_subtitle ||
    DEFAULT_AUTH_PAGES_SETTINGS.register_brand_subtitle;

  const bgImage =
    settings.register_image || DEFAULT_AUTH_PAGES_SETTINGS.register_image;
  const eyebrow =
    settings.register_badge || DEFAULT_AUTH_PAGES_SETTINGS.register_badge;
  const headline =
    settings.register_title || DEFAULT_AUTH_PAGES_SETTINGS.register_title;
  const description =
    settings.register_description ||
    DEFAULT_AUTH_PAGES_SETTINGS.register_description;

  const formEyebrow =
    settings.register_form_eyebrow ||
    DEFAULT_AUTH_PAGES_SETTINGS.register_form_eyebrow;
  const formTitle =
    settings.register_form_title ||
    DEFAULT_AUTH_PAGES_SETTINGS.register_form_title;
  const formDescription =
    settings.register_form_description ||
    DEFAULT_AUTH_PAGES_SETTINGS.register_form_description;

  return (
    <main className="grid min-h-screen bg-[#f8f6f1] lg:grid-cols-2">
      {/* LEFT IMAGE HERO */}
      <section className="relative hidden min-h-screen lg:block">
        <img
          src={bgImage}
          alt="Warm and elegant hotel interior"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#292722]/85 via-[#292722]/25 to-[#292722]/15" />

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

      {/* RIGHT REGISTRATION SECTION */}
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="cursor-pointer inline-flex items-center gap-2 text-sm text-[#777064] hover:text-[#4a382d]"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="mb-7 mt-8">
            <Link href="/" className="cursor-pointer flex flex-col lg:hidden">
              <span className="text-2xl tracking-[0.12em] text-[#4a382d]">
                {brandTitle}
              </span>

              <span className="mt-1 text-[9px] tracking-[0.42em] text-[#a58b72]">
                {brandSubtitle}
              </span>
            </Link>

            <p className="mt-6 text-xs font-semibold tracking-[0.3em] text-[#a58b72] uppercase">
              {formEyebrow}
            </p>

            <h2 className="mt-3 text-3xl font-serif text-[#4a382d] sm:text-4xl">
              {formTitle}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#777064]">
              {formDescription}
            </p>
          </div>

          {!configured && (
            <div className="mb-6 rounded-lg border border-[#e8d5b5] bg-[#fffaf0] p-4 text-sm text-[#7a5827]">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 shrink-0 text-[#a87428]" size={18} />
                <div>
                  <p className="font-semibold">Supabase Configuration Required</p>
                  <p className="mt-1 text-xs leading-5 text-[#8c652f]">
                    Please configure <code className="bg-[#f0e3cc] px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                    <code className="bg-[#f0e3cc] px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your <code className="font-semibold">.env.local</code> file.
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-medium uppercase tracking-wider text-[#777064]"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                className="mt-2 w-full rounded-lg border border-[#ded5c8] bg-white px-4 py-3 text-sm text-[#292722] placeholder:text-[#b8aea2] focus:border-[#4a382d] focus:outline-none"
              />
            </div>

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
              <label
                htmlFor="phone"
                className="block text-xs font-medium uppercase tracking-wider text-[#777064]"
              >
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+62 812 3456 7890"
                className="mt-2 w-full rounded-lg border border-[#ded5c8] bg-white px-4 py-3 text-sm text-[#292722] placeholder:text-[#b8aea2] focus:border-[#4a382d] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-wider text-[#777064]"
              >
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium uppercase tracking-wider text-[#777064]"
              >
                Confirm Password
              </label>
              <div className="relative mt-2">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full rounded-lg border border-[#ded5c8] bg-white px-4 py-3 pr-11 text-sm text-[#292722] placeholder:text-[#b8aea2] focus:border-[#4a382d] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-[#777064] hover:text-[#4a382d]"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <label className="cursor-pointer flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[#ded5c8] text-[#4a382d] focus:ring-[#4a382d]"
                />
                <span className="text-xs leading-5 text-[#777064]">
                  I agree to Arundra Signature&apos;s{" "}
                  <span className="font-semibold text-[#4a382d]">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="font-semibold text-[#4a382d]">
                    Privacy Policy
                  </span>
                  .
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg bg-[#4a382d] py-4 text-sm font-medium text-white shadow-xs transition hover:bg-[#655043] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#777064]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="cursor-pointer font-semibold text-[#4a382d] hover:text-[#a58b72]"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
