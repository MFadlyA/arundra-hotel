"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Check,
  Copy,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  LogOut,
  BedDouble,
  Crown,
  Save,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, isAdmin, isLoading, refreshProfile, signOut } = useAuth();

  // Edit Profile Form States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Change Password Form States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Copy User ID feedback
  const [copiedId, setCopiedId] = useState(false);

  const configured = isSupabaseConfigured();

  // Populate form with current profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    } else if (user) {
      const metaName =
        user.user_metadata?.full_name || user.user_metadata?.name || "";
      const metaPhone =
        user.user_metadata?.phone || user.user_metadata?.phone_number || "";
      setFullName(metaName);
      setPhone(metaPhone);
    }
  }, [profile, user]);

  // Handle Profile Update (Full Name & Phone)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    if (!configured || !user) {
      setProfileMessage({
        type: "error",
        text: "Supabase connection is not configured or user session is missing.",
      });
      return;
    }

    if (!fullName.trim()) {
      setProfileMessage({
        type: "error",
        text: "Please provide your full name.",
      });
      return;
    }

    setIsUpdatingProfile(true);

    try {
      const supabase = createClient();
      const trimmedName = fullName.trim();
      const trimmedPhone = phone.trim() || null;

      // 1. Update public.profiles row
      const { error: profileError } = await (supabase.from("profiles") as any)
        .update({
          full_name: trimmedName,
          phone: trimmedPhone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      // 2. Also update user_metadata in Supabase Auth
      await supabase.auth.updateUser({
        data: {
          full_name: trimmedName,
          name: trimmedName,
          phone: trimmedPhone,
          phone_number: trimmedPhone,
        },
      });

      // 3. Trigger immediate refresh of AuthContext so Navbar and all pages update instantly
      await refreshProfile();

      setProfileMessage({
        type: "success",
        text: "Profile details updated successfully!",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update profile.";
      setProfileMessage({
        type: "error",
        text: msg,
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!configured || !user) {
      setPasswordMessage({
        type: "error",
        text: "Supabase connection is not configured or user session is missing.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 8 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Passwords do not match.",
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({
        type: "success",
        text: "Your password has been successfully updated!",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update password.";
      setPasswordMessage({
        type: "error",
        text: msg,
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const copyUserId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f6f1]">
        <Navbar />
        <main className="flex flex-1 items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3 text-[#4a382d]">
            <Loader2 size={36} className="animate-spin text-[#a58b72]" />
            <p className="text-sm font-medium tracking-wide">
              Loading Profile Information...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not Logged In State
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f6f1]">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-6 py-24">
          <div className="w-full max-w-md rounded-2xl border border-[#ded5c8] bg-white p-8 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fbf3e8] text-[#9b6826]">
              <User size={30} />
            </div>

            <h1 className="mt-5 text-2xl font-serif text-[#4a382d]">
              Sign In Required
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#777064]">
              Please sign in with your Arundra Signature account to view and
              manage your profile details.
            </p>

            <div className="mt-7 flex flex-col gap-3">
              <Link
                href="/login"
                className="cursor-pointer rounded-lg bg-[#4a382d] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#655043]"
              >
                Sign In to Your Account
              </Link>

              <Link
                href="/register"
                className="cursor-pointer rounded-lg border border-[#ded5c8] px-5 py-3 text-sm font-medium text-[#777064] transition hover:bg-[#f8f6f1]"
              >
                Create an Account
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const userInitial = profile?.full_name
    ? profile.full_name[0].toUpperCase()
    : user.email
    ? user.email[0].toUpperCase()
    : "U";

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Active Member";

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f6f1]">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* HEADER SECTION */}
        <section className="border-b border-[#ded5c8] bg-[#f2ece2] py-10 md:py-14">
          <div className="container-custom">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link
                  href="/"
                  className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-[#777064] hover:text-[#4a382d] transition mb-3"
                >
                  <ArrowLeft size={14} />
                  Back to Home
                </Link>

                <p className="text-xs font-semibold tracking-[0.25em] text-[#a58b72]">
                  PERSONAL ACCOUNT
                </p>

                <h1 className="mt-2 text-3xl font-serif text-[#4a382d] sm:text-4xl md:text-5xl">
                  My Profile & Settings
                </h1>

                <p className="mt-2 text-sm text-[#777064]">
                  Manage your personal credentials, contact details, and account security.
                </p>
              </div>

              {/* ACTION SHORTCUTS */}
              <div className="flex items-center gap-2.5 pt-2 sm:pt-0">
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-4 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition"
                  >
                    <ShieldCheck size={15} />
                    Open Admin Portal
                  </Link>
                ) : (
                  <Link
                    href="/#rooms"
                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-4 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition"
                  >
                    <BedDouble size={15} />
                    Explore Suites
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => signOut().then(() => router.push("/"))}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs font-medium text-[#777064] hover:bg-[#fbefeb] hover:text-[#984b3b] hover:border-[#e7c7bd] transition"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT GRID */}
        <section className="container-custom mt-8 md:mt-12">
          <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
            {/* LEFT COLUMN: IDENTITY CARD */}
            <aside className="space-y-6">
              <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs text-center">
                {/* AVATAR BADGE */}
                <div className="mx-auto relative flex h-24 w-24 items-center justify-center rounded-full bg-[#4a382d] text-3xl font-serif text-white shadow-md">
                  {userInitial}
                  <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#28a745] ring-2 ring-white" title="Active Account">
                    <Check size={13} className="text-white" />
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-semibold text-[#4a382d]">
                  {profile?.full_name || user.email?.split("@")[0]}
                </h2>

                <p className="mt-1 text-xs text-[#777064]">{user.email}</p>

                {/* ROLE BADGE */}
                <div className="mt-4 flex justify-center">
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fbf3e8] px-3.5 py-1 text-xs font-semibold text-[#9b6826] border border-[#f0decc]">
                      <ShieldCheck size={14} />
                      Arundra Administrator
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4ede4] px-3.5 py-1 text-xs font-medium text-[#62594f]">
                      <User size={14} />
                      Hotel Guest Member
                    </span>
                  )}
                </div>

                <div className="mt-6 border-t border-[#ded5c8] pt-5 text-left text-xs space-y-3">
                  <div className="flex items-center justify-between text-[#777064]">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#a58b72]" />
                      Member Since:
                    </span>
                    <span className="font-medium text-[#4a382d]">
                      {memberSince}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#777064]">
                    <span className="flex items-center gap-1.5">
                      <Mail size={14} className="text-[#a58b72]" />
                      Email Status:
                    </span>
                    <span className="font-semibold text-[#28a745]">
                      Verified ✓
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#777064]">
                    <span>Account ID:</span>
                    <button
                      type="button"
                      onClick={copyUserId}
                      className="cursor-pointer inline-flex items-center gap-1 font-mono text-[11px] text-[#4a382d] hover:text-[#a58b72]"
                      title="Copy User UUID"
                    >
                      {user.id.slice(0, 8)}...
                      {copiedId ? (
                        <Check size={12} className="text-[#28a745]" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* PRIVILEGES BANNER */}
              <div className="rounded-2xl border border-[#ded5c8] bg-[#fbf9f5] p-5 text-xs text-[#777064] space-y-2">
                <p className="font-semibold text-[#4a382d] flex items-center gap-1.5">
                  <Crown size={15} className="text-[#a58b72]" />
                  Arundra Privileges
                </p>
                <p className="leading-relaxed">
                  {isAdmin
                    ? "As an authorized administrator, you have access to staff controls, role management, and one-time secret key generation."
                    : "As an Arundra Signature member, you enjoy direct suite reservation tracking, exclusive offers, and concierge support."}
                </p>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="cursor-pointer mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#9b6826] hover:underline"
                  >
                    Go to Admin Management Portal <ExternalLink size={12} />
                  </Link>
                )}
              </div>
            </aside>

            {/* RIGHT COLUMN: CRUD FORMS */}
            <div className="space-y-8">
              {/* SECTION 1: PERSONAL INFORMATION (EDIT NAME & PHONE) */}
              <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-3 border-b border-[#ded5c8] pb-4">
                  <div className="rounded-xl bg-[#f4ede4] p-2.5 text-[#4a382d]">
                    <User size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif text-[#4a382d]">
                      Personal Information
                    </h2>
                    <p className="text-xs text-[#777064]">
                      Update your display name and contact phone number.
                    </p>
                  </div>
                </div>

                {profileMessage && (
                  <div
                    className={`mt-5 flex items-center gap-2 rounded-lg border p-3.5 text-xs ${
                      profileMessage.type === "success"
                        ? "border-[#c3e6cb] bg-[#eef8f1] text-[#155724]"
                        : "border-[#e7c7bd] bg-[#fbefeb] text-[#984b3b]"
                    }`}
                  >
                    {profileMessage.type === "success" ? (
                      <CheckCircle2 size={16} className="text-[#28a745] shrink-0" />
                    ) : (
                      <AlertCircle size={16} className="shrink-0" />
                    )}
                    <span>{profileMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="mt-6 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="fullNameInput"
                        className="mb-1.5 block text-xs font-medium text-[#4a382d]"
                      >
                        Full Name
                      </label>
                      <input
                        id="fullNameInput"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Muhammad Fadly"
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-4 py-3 text-xs text-[#292722] placeholder:text-[#aaa198] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phoneInput"
                        className="mb-1.5 block text-xs font-medium text-[#4a382d]"
                      >
                        Phone / WhatsApp Number
                      </label>
                      <input
                        id="phoneInput"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+62 812 3456 7890"
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-4 py-3 text-xs text-[#292722] placeholder:text-[#aaa198] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="emailInput"
                        className="mb-1.5 block text-xs font-medium text-[#777064]"
                      >
                        Email Address (Read-only)
                      </label>
                      <input
                        id="emailInput"
                        type="email"
                        value={user.email || ""}
                        disabled
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#eee7dc]/50 px-4 py-3 text-xs text-[#777064] cursor-not-allowed"
                      />
                      <p className="mt-1 text-[11px] text-[#aaa198]">
                        Contact system administration to change your account email.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="roleDisplay"
                        className="mb-1.5 block text-xs font-medium text-[#777064]"
                      >
                        Account Role Level
                      </label>
                      <input
                        id="roleDisplay"
                        type="text"
                        value={isAdmin ? "Arundra Administrator (Staff)" : "Hotel Guest (Customer)"}
                        disabled
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#eee7dc]/50 px-4 py-3 text-xs text-[#777064] cursor-not-allowed font-medium"
                      />
                      <p className="mt-1 text-[11px] text-[#aaa198]">
                        Role permissions are cryptographically managed.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-6 py-3 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition disabled:opacity-50"
                    >
                      {isUpdatingProfile ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save size={15} />
                          Save Profile Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* SECTION 2: SECURITY & PASSWORD UPDATE */}
              <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-3 border-b border-[#ded5c8] pb-4">
                  <div className="rounded-xl bg-[#fbf3e8] p-2.5 text-[#9b6826]">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif text-[#4a382d]">
                      Security & Password
                    </h2>
                    <p className="text-xs text-[#777064]">
                      Change your account login password.
                    </p>
                  </div>
                </div>

                {passwordMessage && (
                  <div
                    className={`mt-5 flex items-center gap-2 rounded-lg border p-3.5 text-xs ${
                      passwordMessage.type === "success"
                        ? "border-[#c3e6cb] bg-[#eef8f1] text-[#155724]"
                        : "border-[#e7c7bd] bg-[#fbefeb] text-[#984b3b]"
                    }`}
                  >
                    {passwordMessage.type === "success" ? (
                      <CheckCircle2 size={16} className="text-[#28a745] shrink-0" />
                    ) : (
                      <AlertCircle size={16} className="shrink-0" />
                    )}
                    <span>{passwordMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="mt-6 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="newPasswordInput"
                        className="mb-1.5 block text-xs font-medium text-[#4a382d]"
                      >
                        New Password (At least 8 characters)
                      </label>
                      <div className="relative">
                        <input
                          id="newPasswordInput"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          minLength={8}
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-4 py-3 pr-10 text-xs text-[#292722] placeholder:text-[#aaa198] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-[#777064] hover:text-[#4a382d]"
                          title={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPasswordInput"
                        className="mb-1.5 block text-xs font-medium text-[#4a382d]"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPasswordInput"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          minLength={8}
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-4 py-3 pr-10 text-xs text-[#292722] placeholder:text-[#aaa198] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-[#777064] hover:text-[#4a382d]"
                          title={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isUpdatingPassword || !newPassword}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-6 py-3 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition disabled:opacity-50"
                    >
                      {isUpdatingPassword ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        <>
                          <Lock size={15} />
                          Update Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
