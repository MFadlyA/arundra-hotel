"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LogIn,
  UserPlus,
  Upload,
  Image as ImageIcon,
  Loader2,
  Save,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  DEFAULT_AUTH_PAGES_SETTINGS,
  SQL_AUTH_PAGES_MIGRATION_SCRIPT,
} from "@/lib/auth-pages-settings";
import type { AuthPagesSettings } from "@/types/database";

interface AuthPagesCMSProps {
  showAlert: (
    message: string,
    title?: string,
    type?: "success" | "error" | "warning" | "info"
  ) => void;
  showConfirm: (
    message: string,
    onConfirm: () => void,
    options?: {
      title?: string;
      confirmText?: string;
      cancelText?: string;
      danger?: boolean;
    }
  ) => void;
}

export default function AuthPagesCMS({
  showAlert,
  showConfirm,
}: AuthPagesCMSProps) {
  const [settings, setSettings] = useState<AuthPagesSettings>(
    DEFAULT_AUTH_PAGES_SETTINGS
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Sub-tabs: "login" | "register"
  const [activeSubTab, setActiveSubTab] = useState<"login" | "register">("login");

  // Uploading states
  const [uploadingLoginImage, setUploadingLoginImage] = useState(false);
  const [uploadingRegisterImage, setUploadingRegisterImage] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth-pages", { cache: "no-store" });
      const data = await res.json();
      if (data.tableMissing) {
        setTableMissing(true);
      } else {
        setTableMissing(false);
      }
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err: unknown) {
      console.error("Error loading auth pages settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_AUTH_PAGES_MIGRATION_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const uploadImageFile = async (
    file: File,
    folder: string
  ): Promise<{ publicUrl: string; storagePath: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/admin/auth-pages/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed.");
    return { publicUrl: data.publicUrl, storagePath: data.storagePath };
  };

  const handleLoginImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLoginImage(true);
    try {
      const { publicUrl, storagePath } = await uploadImageFile(file, "auth/login");
      setSettings((prev) => ({
        ...prev,
        login_image: publicUrl,
        login_image_path: storagePath,
      }));
      showAlert("Login hero photograph uploaded successfully!", "Success", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      showAlert(msg, "Upload Error", "error");
    } finally {
      setUploadingLoginImage(false);
      e.target.value = "";
    }
  };

  const handleRegisterImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingRegisterImage(true);
    try {
      const { publicUrl, storagePath } = await uploadImageFile(
        file,
        "auth/register"
      );
      setSettings((prev) => ({
        ...prev,
        register_image: publicUrl,
        register_image_path: storagePath,
      }));
      showAlert(
        "Register hero photograph uploaded successfully!",
        "Success",
        "success"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      showAlert(msg, "Upload Error", "error");
    } finally {
      setUploadingRegisterImage(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/admin/auth-pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.tableMissing) {
          setTableMissing(true);
        }
        throw new Error(data.error || "Failed to save settings.");
      }

      setSettings(data.settings || settings);
      setTableMissing(false);
      setActionMessage({
        type: "success",
        text: "Login & Register pages CMS settings published successfully!",
      });
      setTimeout(() => setActionMessage(null), 5000);
      showAlert(
        "Login & Register pages settings have been published successfully!",
        "Saved",
        "success"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save error.";
      setActionMessage({ type: "error", text: msg });
      showAlert(msg, "Save Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    showConfirm(
      "Are you sure you want to restore factory default settings for both Login and Register pages? Any custom photographs or greetings will be reset.",
      async () => {
        setSaving(true);
        try {
          const res = await fetch("/api/admin/auth-pages/reset", {
            method: "POST",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Reset failed.");
          setSettings(data.settings || DEFAULT_AUTH_PAGES_SETTINGS);
          showAlert(
            "Login & Register pages settings restored to factory defaults.",
            "Reset Complete",
            "success"
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Reset error.";
          showAlert(msg, "Error", "error");
        } finally {
          setSaving(false);
        }
      },
      {
        title: "Reset Auth Pages Settings?",
        confirmText: "Yes, Reset to Defaults",
        danger: true,
      }
    );
  };

  return (
    <div className="mt-6 space-y-6 pb-16">
      {/* 1. TOP HEADER & FAST ACTIONS */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ded5c8] bg-[#f8f6f1] px-3 py-1 text-xs font-semibold text-[#755b43]">
            <LogIn className="h-3.5 w-3.5 text-[#a58b72]" />
            Authentication Portals CMS
          </div>
          <h2 className="mt-2 font-serif text-2xl font-bold text-[#4a382d]">
            Login &amp; Register Pages CMS
          </h2>
          <p className="text-sm text-[#755b43]">
            Curate hero banner photography, welcoming narrative headlines, and form greetings for the dedicated{" "}
            <code className="rounded bg-[#f8f6f1] px-1.5 py-0.5 text-[#4a382d]">/login</code>{" "}
            and{" "}
            <code className="rounded bg-[#f8f6f1] px-1.5 py-0.5 text-[#4a382d]">/register</code>{" "}
            guest portals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={activeSubTab === "login" ? "/login" : "/register"}
            target="_blank"
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-[#ded5c8] bg-white px-4 py-2.5 text-xs font-medium text-[#4a382d] shadow-sm transition hover:bg-[#f8f6f1]"
          >
            <Eye className="h-3.5 w-3.5 text-[#a58b72]" />
            <span>Preview {activeSubTab === "login" ? "Login" : "Register"} Page</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>

          <button
            type="button"
            onClick={() => fetchSettings()}
            disabled={loading || saving}
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-[#ded5c8] bg-white px-4 py-2.5 text-xs font-medium text-[#755b43] transition hover:bg-[#f8f6f1] hover:text-[#4a382d] disabled:opacity-50"
            title="Reload data from database"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-[#a58b72] ${
                loading ? "animate-spin" : ""
              }`}
            />
            <span>{loading ? "Syncing..." : "Reload"}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-[#ded5c8] bg-white px-4 py-2.5 text-xs font-medium text-[#755b43] transition hover:bg-[#f8f6f1] hover:text-[#4a382d] disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[#a58b72]" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-[#4a382d] px-5 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-[#392b23] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Migration Notice Banner if Table Missing */}
      {tableMissing && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-900 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-amber-900">
                Database Table Setup Required
              </h3>
              <p className="mt-1 text-xs text-amber-800">
                The database table{" "}
                <code className="font-mono font-semibold">
                  public.auth_pages_settings
                </code>{" "}
                has not been created in your Supabase project yet. Default content is currently being safely served.
              </p>
              <p className="mt-2 text-xs text-amber-800">
                Run the migration SQL script below in your Supabase SQL Editor:
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopySql}
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-amber-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-amber-800 transition shrink-0"
            >
              {copiedSql ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy SQL Migration</span>
                </>
              )}
            </button>
          </div>
          <pre className="mt-4 max-h-48 overflow-x-auto rounded-xl bg-amber-900/10 p-3 font-mono text-[11px] text-amber-950">
            {SQL_AUTH_PAGES_MIGRATION_SCRIPT}
          </pre>
        </div>
      )}

      {/* Action Notification Message */}
      {actionMessage && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-4 text-xs font-medium ${
            actionMessage.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* 2. SUB-SECTION NAVIGATION TABS (LOGIN & REGISTER) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#ded5c8] pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab("login")}
          className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition ${
            activeSubTab === "login"
              ? "bg-[#4a382d] text-white shadow-xs"
              : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:text-[#4a382d]"
          }`}
        >
          <LogIn size={14} />
          <span>1. Login Page CMS</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeSubTab === "login"
                ? "bg-white/20 text-white"
                : "bg-[#f4ede4] text-[#62594f]"
            }`}
          >
            /login
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("register")}
          className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition ${
            activeSubTab === "register"
              ? "bg-[#4a382d] text-white shadow-xs"
              : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:text-[#4a382d]"
          }`}
        >
          <UserPlus size={14} />
          <span>2. Register Page CMS</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeSubTab === "register"
                ? "bg-white/20 text-white"
                : "bg-[#f4ede4] text-[#62594f]"
            }`}
          >
            /register
          </span>
        </button>
      </div>

      {/* 3. SUB-TAB 1: LOGIN PAGE CMS */}
      {activeSubTab === "login" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-sm">
            <div className="border-b border-[#ded5c8] pb-4">
              <h3 className="font-serif text-lg font-bold text-[#4a382d]">
                Login Page — Visual Showcase &amp; Welcoming Copy
              </h3>
              <p className="text-xs text-[#755b43]">
                Customize the high-resolution bedroom/sanctuary photo and inspiring headlines shown when guests and personnel sign in.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Left Column Settings: Hero Banner Photo & Narrative */}
              <div className="space-y-4 rounded-xl border border-[#ded5c8] bg-[#fbf9f5] p-5">
                <div className="flex items-center gap-2 border-b border-[#ded5c8] pb-3">
                  <Sparkles size={16} className="text-[#a58b72]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#4a382d]">
                    Left Side: Hero Banner Showcase
                  </h4>
                </div>

                {/* Brand Name & Tagline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-[#ded5c8] pb-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#4a382d]">
                      Brand Name / Hotel Title
                    </label>
                    <input
                      type="text"
                      value={settings.login_brand_title || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          login_brand_title: e.target.value,
                        })
                      }
                      placeholder="Arundra Signature"
                      className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4a382d]">
                      Brand Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      value={settings.login_brand_subtitle || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          login_brand_subtitle: e.target.value,
                        })
                      }
                      placeholder="HOTEL & RESIDENCE"
                      className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Hero Photo Upload */}
                <div>
                  <label className="block text-xs font-semibold text-[#4a382d]">
                    Showcase Background Photograph
                  </label>
                  <div className="mt-2 flex items-start gap-4">
                    <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-xl border border-[#ded5c8] bg-[#eee7dc] shadow-xs">
                      {settings.login_image ? (
                        <img
                          src={settings.login_image}
                          alt="Login Hero Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#a58b72]">
                          <ImageIcon size={24} />
                        </div>
                      )}
                      {uploadingLoginImage && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs">
                          <Loader2 size={18} className="animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-[#4a382d] px-3.5 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition">
                        <Upload size={14} />
                        <span>Upload From Computer</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLoginImageUpload}
                          disabled={uploadingLoginImage}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-[#777064]">
                        JPG, PNG, WEBP, or AVIF (max. 5 MB).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hero Eyebrow */}
                <div>
                  <label className="block text-xs font-semibold text-[#4a382d]">
                    Hero Eyebrow / Pill Text
                  </label>
                  <input
                    type="text"
                    value={settings.login_badge || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, login_badge: e.target.value })
                    }
                    placeholder="YOUR SIGNATURE STAY, YOUR WAY"
                    className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                  />
                </div>

                {/* Hero Headline */}
                <div>
                  <label className="block text-xs font-semibold text-[#4a382d]">
                    Hero Main Headline
                  </label>
                  <input
                    type="text"
                    value={settings.login_title}
                    onChange={(e) =>
                      setSettings({ ...settings, login_title: e.target.value })
                    }
                    placeholder="Your next exceptional stay begins here."
                    className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                  />
                </div>

                {/* Hero Description */}
                <div>
                  <label className="block text-xs font-semibold text-[#4a382d]">
                    Hero Narrative Description
                  </label>
                  <textarea
                    rows={3}
                    value={settings.login_description}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        login_description: e.target.value,
                      })
                    }
                    placeholder="Sign in to manage your reservations at Arundra Signature Residence Pondok Indah or access the management portal..."
                    className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                  />
                </div>
              </div>

              {/* Right Column Settings: Form Header & Live Preview */}
              <div className="space-y-4">
                <div className="rounded-xl border border-[#ded5c8] bg-[#fbf9f5] p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#ded5c8] pb-3">
                    <LogIn size={16} className="text-[#a58b72]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#4a382d]">
                      Right Side: Form Header Copy
                    </h4>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4a382d]">
                      Form Eyebrow Text
                    </label>
                    <input
                      type="text"
                      value={settings.login_form_eyebrow || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          login_form_eyebrow: e.target.value,
                        })
                      }
                      placeholder="YOUR PERSONAL SPACE"
                      className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4a382d]">
                      Form Main Title
                    </label>
                    <input
                      type="text"
                      value={settings.login_form_title || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          login_form_title: e.target.value,
                        })
                      }
                      placeholder="Welcome Back"
                      className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4a382d]">
                      Form Subtitle / Instructions
                    </label>
                    <input
                      type="text"
                      value={settings.login_form_description || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          login_form_description: e.target.value,
                        })
                      }
                      placeholder="Enter your credentials to access your account."
                      className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="rounded-xl border border-[#ded5c8] bg-[#eee7dc] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#a58b72] mb-3">
                    Live Layout Preview (/login)
                  </p>
                  <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#ded5c8] bg-white p-3 shadow-xs overflow-hidden">
                    {/* Left preview */}
                    <div className="relative h-36 rounded-lg overflow-hidden bg-[#292722] p-3 text-white flex flex-col justify-end">
                      {settings.login_image && (
                        <img
                          src={settings.login_image}
                          alt="Preview"
                          className="absolute inset-0 h-full w-full object-cover opacity-60"
                        />
                      )}
                      <div className="relative z-10">
                        <div className="mb-2 flex flex-col">
                          <span className="text-[9px] tracking-wider text-white font-serif font-bold">
                            {settings.login_brand_title || "Arundra Signature"}
                          </span>
                          <span className="text-[5.5px] tracking-[0.2em] text-[#e0c6a5]">
                            {settings.login_brand_subtitle || "HOTEL & RESIDENCE"}
                          </span>
                        </div>
                        <span className="text-[7px] tracking-wider uppercase text-[#e0c6a5] font-semibold">
                          {settings.login_badge || "WELCOME BACK"}
                        </span>
                        <h5 className="font-serif text-[11px] leading-tight font-bold text-white line-clamp-2 mt-0.5">
                          {settings.login_title}
                        </h5>
                      </div>
                    </div>

                    {/* Right preview */}
                    <div className="p-2 flex flex-col justify-center">
                      <div className="mb-1.5 flex flex-col">
                        <span className="text-[9px] tracking-wider text-[#4a382d] font-bold">
                          {settings.login_brand_title || "Arundra Signature"}
                        </span>
                        <span className="text-[5.5px] tracking-widest text-[#a58b72]">
                          {settings.login_brand_subtitle || "HOTEL & RESIDENCE"}
                        </span>
                      </div>
                      <span className="text-[7px] font-bold tracking-widest text-[#a58b72]">
                        {settings.login_form_eyebrow || "YOUR PERSONAL SPACE"}
                      </span>
                      <h5 className="font-serif text-sm font-bold text-[#4a382d] mt-0.5">
                        {settings.login_form_title || "Welcome Back"}
                      </h5>
                      <p className="text-[9px] text-[#777064] mt-0.5 line-clamp-2">
                        {settings.login_form_description}
                      </p>
                      <div className="mt-2 space-y-1">
                        <div className="h-4 rounded bg-[#f4ede4] border border-[#ded5c8]" />
                        <div className="h-4 rounded bg-[#f4ede4] border border-[#ded5c8]" />
                        <div className="h-4 rounded bg-[#4a382d]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB 2: REGISTER PAGE CMS */}
      {activeSubTab === "register" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-sm">
            <div className="border-b border-[#ded5c8] pb-4">
              <h3 className="font-serif text-lg font-bold text-[#4a382d]">
                Register Page — Visual Showcase &amp; Welcoming Copy
              </h3>
              <p className="text-xs text-[#755b43]">
                Customize the interior architecture photo, inspiring member headlines, and registration form header shown at{" "}
                <code className="rounded bg-[#f8f6f1] px-1.5 py-0.5 text-[#4a382d]">/register</code>.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Left Column Settings: Hero Banner Photo & Narrative */}
              <div className="space-y-4 rounded-xl border border-[#ded5c8] bg-[#fbf9f5] p-5">
                <div className="flex items-center gap-2 border-b border-[#ded5c8] pb-3">
                  <Sparkles size={16} className="text-[#a58b72]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#4a382d]">
                    Left Side: Hero Banner Showcase
                  </h4>
                </div>

                {/* Brand Name & Tagline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-[#ded5c8] pb-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#4a382d]">
                      Brand Name / Hotel Title
                    </label>
                    <input
                      type="text"
                      value={settings.register_brand_title || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          register_brand_title: e.target.value,
                        })
                      }
                      placeholder="Arundra Signature"
                      className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4a382d]">
                      Brand Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      value={settings.register_brand_subtitle || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          register_brand_subtitle: e.target.value,
                        })
                      }
                      placeholder="HOTEL & RESIDENCE"
                      className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Hero Photo Upload */}
                <div>
                  <label className="block text-xs font-semibold text-[#4a382d]">
                    Showcase Background Photograph
                  </label>
                  <div className="mt-2 flex items-start gap-4">
                    <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-xl border border-[#ded5c8] bg-[#eee7dc] shadow-xs">
                      {settings.register_image ? (
                        <img
                          src={settings.register_image}
                          alt="Register Hero Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#a58b72]">
                          <ImageIcon size={24} />
                        </div>
                      )}
                      {uploadingRegisterImage && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs">
                          <Loader2 size={18} className="animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-[#4a382d] px-3.5 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition">
                        <Upload size={14} />
                        <span>Upload From Computer</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleRegisterImageUpload}
                          disabled={uploadingRegisterImage}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-[#777064]">
                        JPG, PNG, WEBP, or AVIF (max. 5 MB).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hero Eyebrow */}
                <div>
                  <label className="block text-xs font-semibold text-[#4a382d]">
                    Hero Eyebrow / Pill Text
                  </label>
                  <input
                    type="text"
                    value={settings.register_badge || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        register_badge: e.target.value,
                      })
                    }
                    placeholder="PONDOK INDAH, SOUTH JAKARTA"
                    className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                  />
                </div>

                {/* Hero Headline */}
                <div>
                  <label className="block text-xs font-semibold text-[#4a382d]">
                    Hero Main Headline
                  </label>
                  <input
                    type="text"
                    value={settings.register_title}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        register_title: e.target.value,
                      })
                    }
                    placeholder="Pengalaman Menginap Istimewa."
                    className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                  />
                </div>

                {/* Hero Description */}
                <div>
                  <label className="block text-xs font-semibold text-[#4a382d]">
                    Hero Narrative Description
                  </label>
                  <textarea
                    rows={3}
                    value={settings.register_description}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        register_description: e.target.value,
                      })
                    }
                    placeholder="Create an account to manage your reservations and experience warm modern elegance at Arundra Signature Residence Pondok Indah..."
                    className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                  />
                </div>
              </div>

              {/* Right Column Settings: Form Header & Live Preview */}
              <div className="space-y-4">
                <div className="rounded-xl border border-[#ded5c8] bg-[#fbf9f5] p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#ded5c8] pb-3">
                    <UserPlus size={16} className="text-[#a58b72]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#4a382d]">
                      Right Side: Form Header Copy
                    </h4>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4a382d]">
                      Form Eyebrow Text
                    </label>
                    <input
                      type="text"
                      value={settings.register_form_eyebrow || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          register_form_eyebrow: e.target.value,
                        })
                      }
                      placeholder="BECOME A MEMBER"
                      className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4a382d]">
                      Form Main Title
                    </label>
                    <input
                      type="text"
                      value={settings.register_form_title || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          register_form_title: e.target.value,
                        })
                      }
                      placeholder="Create Account"
                      className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4a382d]">
                      Form Subtitle / Instructions
                    </label>
                    <input
                      type="text"
                      value={settings.register_form_description || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          register_form_description: e.target.value,
                        })
                      }
                      placeholder="Complete your information below to create your account."
                      className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="rounded-xl border border-[#ded5c8] bg-[#eee7dc] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#a58b72] mb-3">
                    Live Layout Preview (/register)
                  </p>
                  <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#ded5c8] bg-white p-3 shadow-xs overflow-hidden">
                    {/* Left preview */}
                    <div className="relative h-36 rounded-lg overflow-hidden bg-[#292722] p-3 text-white flex flex-col justify-end">
                      {settings.register_image && (
                        <img
                          src={settings.register_image}
                          alt="Preview"
                          className="absolute inset-0 h-full w-full object-cover opacity-60"
                        />
                      )}
                      <div className="relative z-10">
                        <div className="mb-2 flex flex-col">
                          <span className="text-[9px] tracking-wider text-white font-serif font-bold">
                            {settings.register_brand_title || "Arundra Signature"}
                          </span>
                          <span className="text-[5.5px] tracking-[0.2em] text-[#e0c6a5]">
                            {settings.register_brand_subtitle || "HOTEL & RESIDENCE"}
                          </span>
                        </div>
                        <span className="text-[7px] tracking-wider uppercase text-[#e0c6a5] font-semibold">
                          {settings.register_badge || "YOUR JOURNEY STARTS HERE"}
                        </span>
                        <h5 className="font-serif text-[11px] leading-tight font-bold text-white line-clamp-2 mt-0.5">
                          {settings.register_title}
                        </h5>
                      </div>
                    </div>

                    {/* Right preview */}
                    <div className="p-2 flex flex-col justify-center">
                      <div className="mb-1.5 flex flex-col">
                        <span className="text-[9px] tracking-wider text-[#4a382d] font-bold">
                          {settings.register_brand_title || "Arundra Signature"}
                        </span>
                        <span className="text-[5.5px] tracking-widest text-[#a58b72]">
                          {settings.register_brand_subtitle || "HOTEL & RESIDENCE"}
                        </span>
                      </div>
                      <span className="text-[7px] font-bold tracking-widest text-[#a58b72]">
                        {settings.register_form_eyebrow || "BECOME A MEMBER"}
                      </span>
                      <h5 className="font-serif text-sm font-bold text-[#4a382d] mt-0.5">
                        {settings.register_form_title || "Create Account"}
                      </h5>
                      <p className="text-[9px] text-[#777064] mt-0.5 line-clamp-2">
                        {settings.register_form_description}
                      </p>
                      <div className="mt-2 space-y-1">
                        <div className="h-4 rounded bg-[#f4ede4] border border-[#ded5c8]" />
                        <div className="h-4 rounded bg-[#f4ede4] border border-[#ded5c8]" />
                        <div className="h-4 rounded bg-[#4a382d]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

