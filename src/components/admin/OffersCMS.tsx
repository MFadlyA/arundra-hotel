"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tag,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Loader2,
  Save,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  Check,
  Copy,
  ArrowUp,
  ArrowDown,
  X,
  Gift,
  CalendarDays,
  Percent,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Award,
  Clock,
  PhoneCall,
  Crown,
  Heart,
  Wifi,
} from "lucide-react";
import {
  DEFAULT_OFFERS_SETTINGS,
  DEFAULT_OFFERS_ITEMS,
  DEFAULT_GUARANTEE_ITEMS,
  SUPPORTED_GUARANTEE_ICONS,
  SQL_OFFERS_MIGRATION_SCRIPT,
} from "@/lib/offers-settings";
import type { OffersSettings, OfferItem, GuaranteeItem } from "@/types/database";
import TargetLinkSelect from "./TargetLinkSelect";

function renderGuaranteeIcon(
  iconName: string,
  size = 16,
  className = "text-[#a58b72]"
) {
  switch (iconName) {
    case "ShieldCheck":
      return <ShieldCheck size={size} className={className} />;
    case "Award":
      return <Award size={size} className={className} />;
    case "Clock":
      return <Clock size={size} className={className} />;
    case "PhoneCall":
      return <PhoneCall size={size} className={className} />;
    case "Crown":
      return <Crown size={size} className={className} />;
    case "Heart":
      return <Heart size={size} className={className} />;
    case "Check":
      return <Check size={size} className={className} />;
    case "Wifi":
      return <Wifi size={size} className={className} />;
    default:
      return <ShieldCheck size={size} className={className} />;
  }
}

interface OffersCMSProps {
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
  rooms?: Array<{ slug?: string | null; name: string }>;
}

export default function OffersCMS({
  showAlert,
  showConfirm,
  rooms = [],
}: OffersCMSProps) {
  const [settings, setSettings] = useState<OffersSettings>(DEFAULT_OFFERS_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Sub-tabs: "hero" | "packages" | "guarantee"
  const [activeSubTab, setActiveSubTab] = useState<
    "hero" | "packages" | "guarantee"
  >("hero");

  // Uploading states
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingOfferIdx, setUploadingOfferIdx] = useState<number | null>(null);

  // Buffer for inclusion inputs per offer
  const [inclusionInputs, setInclusionInputs] = useState<Record<number, string>>({});

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/offers", { cache: "no-store" });
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
      console.error("Error loading offers settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_OFFERS_MIGRATION_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleImageUpload = async (
    file: File,
    onSuccess: (url: string, path: string) => void,
    setUploading: (b: boolean) => void
  ) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "offers");

      const res = await fetch("/api/admin/offers/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Upload failed");
      }

      onSuccess(data.publicUrl, data.storagePath);
      showAlert("Image uploaded successfully!", "Success", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      showAlert("Upload failed: " + msg, "Error", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/admin/offers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        if (data.tableMissing) {
          setTableMissing(true);
        }
        throw new Error(data.error || "Failed to save settings");
      }

      setSettings(data.settings || settings);
      setTableMissing(false);
      setActionMessage({
        type: "success",
        text: "Offers settings published and saved successfully!",
      });
      setTimeout(() => setActionMessage(null), 5000);
      showAlert("Offers settings have been published successfully!", "Saved", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save error";
      setActionMessage({
        type: "error",
        text: msg,
      });
      showAlert(msg, "Save Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    showConfirm(
      "Are you sure you want to restore factory default offers settings? All current custom packages and texts will be reset to default.",
      async () => {
        setSaving(true);
        try {
          const res = await fetch("/api/admin/offers/reset", {
            method: "POST",
          });
          const data = await res.json();
          if (!res.ok || data.error) {
            throw new Error(data.error || "Reset failed");
          }
          setSettings(data.settings || DEFAULT_OFFERS_SETTINGS);
          showAlert("Offers settings restored to factory defaults.", "Reset Complete", "success");
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Reset error";
          showAlert(msg, "Error", "error");
        } finally {
          setSaving(false);
        }
      },
      {
        title: "Reset to Default Offers?",
        confirmText: "Yes, Reset",
        danger: true,
      }
    );
  };

  // Offer item actions
  const addOfferItem = () => {
    const newItem: OfferItem = {
      id: `offer-${Date.now()}`,
      title: "New Luxury Package",
      tagline: "Exclusive Retreat Privileges",
      badge: "Limited Offer",
      category: "Special Package",
      description: "Describe the package experience, ambiance, and special highlights.",
      image:
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
      image_path: null,
      price: "From IDR 4,500,000 / night",
      validity: "Valid through 2026",
      inclusions: [
        "Artisanal champagne breakfast for two",
        "Roundtrip luxury airport transfer",
        "Resort dining & spa credits",
      ],
      terms: "Subject to room availability. Blackout dates may apply.",
      promo_code: "PROMO2026",
      show_button: true,
      button_text: "Reserve This Offer",
      button_link: "/#booking",
      visible_on_homepage: true,
    };

    setSettings({
      ...settings,
      offers_items: [...settings.offers_items, newItem],
    });
  };

  const updateOfferItem = (index: number, patch: Partial<OfferItem>) => {
    const updated = [...settings.offers_items];
    updated[index] = { ...updated[index], ...patch };
    setSettings({ ...settings, offers_items: updated });
  };

  const removeOfferItem = (index: number) => {
    showConfirm(
      `Are you sure you want to remove offer "${settings.offers_items[index]?.title || "Package"}"?`,
      () => {
        const updated = settings.offers_items.filter((_, i) => i !== index);
        setSettings({ ...settings, offers_items: updated });
      },
      {
        title: "Remove Offer Package?",
        confirmText: "Delete",
        danger: true,
      }
    );
  };

  const moveOffer = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= settings.offers_items.length) return;
    const items = [...settings.offers_items];
    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    setSettings({ ...settings, offers_items: items });
  };

  const addInclusionToOffer = (offerIdx: number) => {
    const val = (inclusionInputs[offerIdx] || "").trim();
    if (!val) return;
    const target = settings.offers_items[offerIdx];
    const newInclusions = [...(target.inclusions || []), val];
    updateOfferItem(offerIdx, { inclusions: newInclusions });
    setInclusionInputs({ ...inclusionInputs, [offerIdx]: "" });
  };

  const removeInclusionFromOffer = (offerIdx: number, inclusionIdx: number) => {
    const target = settings.offers_items[offerIdx];
    const newInclusions = target.inclusions.filter((_, i) => i !== inclusionIdx);
    updateOfferItem(offerIdx, { inclusions: newInclusions });
  };

  const updateGuaranteeItem = (
    index: number,
    patch: Partial<GuaranteeItem>
  ) => {
    const list = [
      ...(settings.guarantee_items && settings.guarantee_items.length > 0
        ? settings.guarantee_items
        : DEFAULT_GUARANTEE_ITEMS),
    ];
    list[index] = { ...list[index], ...patch };
    setSettings({ ...settings, guarantee_items: list });
  };

  return (
    <div className="mt-6 space-y-6 pb-16">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ded5c8] bg-[#f8f6f1] px-3 py-1 text-xs font-semibold text-[#755b43]">
            <Gift className="h-3.5 w-3.5 text-[#a58b72]" />
            Offers & Packages CMS
          </div>
          <h2 className="mt-2 font-serif text-2xl font-bold text-[#4a382d]">
            Curated Hotel Offers & Promotional Packages
          </h2>
          <p className="text-sm text-[#755b43]">
            Manage the hero banner and promotional stay vouchers shown on the dedicated{" "}
            <code className="rounded bg-[#f8f6f1] px-1.5 py-0.5 text-[#4a382d]">/offers</code>{" "}
            page.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/offers"
            target="_blank"
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-[#ded5c8] bg-white px-4 py-2.5 text-xs font-medium text-[#4a382d] shadow-sm transition hover:bg-[#f8f6f1]"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#a58b72]" />
            View Live Offers Page
          </Link>

          <button
            type="button"
            onClick={() => fetchSettings()}
            disabled={loading || saving}
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-[#ded5c8] bg-white px-4 py-2.5 text-xs font-medium text-[#755b43] transition hover:bg-[#f8f6f1] hover:text-[#4a382d] disabled:opacity-50"
            title="Reload latest data from database"
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
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4a382d] px-5 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-[#392b23] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save All Changes
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
                The database table <code className="font-mono font-semibold">public.offers_settings</code>{" "}
                has not been created in your Supabase project yet. Default content is currently being served safely in-memory.
              </p>
              <p className="mt-2 text-xs text-amber-800">
                Run the migration SQL script below in your{" "}
                <strong>Supabase SQL Editor</strong> to enable persistent database storage.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopySql}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber-800 px-4 py-2 text-xs font-medium text-white transition hover:bg-amber-900"
            >
              {copiedSql ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy SQL Migration
                </>
              )}
            </button>
          </div>
          <pre className="mt-4 max-h-48 overflow-x-auto rounded-xl bg-amber-950 p-3 font-mono text-[11px] text-amber-100">
            {SQL_OFFERS_MIGRATION_SCRIPT}
          </pre>
        </div>
      )}

      {/* Action toast message */}
      {actionMessage && (
        <div
          className={`flex items-center gap-2.5 rounded-xl border p-4 text-xs font-medium ${
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

      {/* 2. SUB-SECTION NAVIGATION TABS (EXPERIENCE CMS STYLE) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#ded5c8] pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab("hero")}
          className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition ${
            activeSubTab === "hero"
              ? "bg-[#4a382d] text-white shadow-xs"
              : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:text-[#4a382d]"
          }`}
        >
          <Gift size={14} />
          <span>1. Offers Page Hero Banner &amp; Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("packages")}
          className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition ${
            activeSubTab === "packages"
              ? "bg-[#4a382d] text-white shadow-xs"
              : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:text-[#4a382d]"
          }`}
        >
          <Tag size={14} />
          <span>2. Promotional Packages &amp; Bespoke Offers</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeSubTab === "packages"
                ? "bg-white/20 text-white"
                : "bg-[#f4ede4] text-[#62594f]"
            }`}
          >
            {settings.offers_items.length} Packages
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("guarantee")}
          className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition ${
            activeSubTab === "guarantee"
              ? "bg-[#4a382d] text-white shadow-xs"
              : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:text-[#4a382d]"
          }`}
        >
          <ShieldCheck size={14} />
          <span>3. The Arundra Guarantee &amp; Direct Privileges</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeSubTab === "guarantee"
                ? "bg-white/20 text-white"
                : "bg-[#f4ede4] text-[#62594f]"
            }`}
          >
            {(settings.guarantee_items && settings.guarantee_items.length > 0
              ? settings.guarantee_items
              : DEFAULT_GUARANTEE_ITEMS
            ).length} Items
          </span>
        </button>
      </div>

      {/* 3. TAB 1: HERO BANNER & INTRO SETTINGS */}
      {activeSubTab === "hero" && (
        <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-sm">
          <div className="border-b border-[#ded5c8] pb-4">
            <h3 className="font-serif text-lg font-bold text-[#4a382d]">
              Offers Page Hero Banner &amp; Overview
            </h3>
            <p className="text-xs text-[#755b43]">
              Configure the opening atmosphere and welcoming headline for guests visiting the offers directory.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Text fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4a382d]">
                  Hero Eyebrow / Pill Text
                </label>
                <input
                  type="text"
                  value={settings.hero_eyebrow}
                  onChange={(e) =>
                    setSettings({ ...settings, hero_eyebrow: e.target.value })
                  }
                  placeholder="Exclusive Curations & Privileges"
                  className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4a382d]">
                  Hero Main Headline
                </label>
                <input
                  type="text"
                  value={settings.hero_title}
                  onChange={(e) =>
                    setSettings({ ...settings, hero_title: e.target.value })
                  }
                  placeholder="Exceptional Stays, Tailored for Wonder"
                  className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4a382d]">
                  Hero Description
                </label>
                <textarea
                  rows={3}
                  value={settings.hero_description}
                  onChange={(e) =>
                    setSettings({ ...settings, hero_description: e.target.value })
                  }
                  placeholder="A welcoming paragraph inviting guests to explore bespoke packages..."
                  className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                />
              </div>
            </div>

            {/* Hero background image upload */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#4a382d]">
                Hero Banner Image
              </label>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-[#ded5c8] bg-[#f8f6f1]">
                {settings.hero_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.hero_image}
                    alt="Offers Hero"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-[#a58b72]">
                    No image selected
                  </div>
                )}

                {uploadingHero && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
              </div>

              <label className="cursor-pointer inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#ded5c8] bg-[#f8f6f1] px-3.5 py-2.5 text-xs font-medium text-[#4a382d] transition hover:bg-[#ded5c8]/50">
                <Upload className="h-3.5 w-3.5 text-[#a58b72]" />
                <span>{settings.hero_image ? "Change Photo" : "Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(
                        file,
                        (url, path) =>
                          setSettings({
                            ...settings,
                            hero_image: url,
                            hero_image_path: path,
                          }),
                        setUploadingHero
                      );
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: PROMOTIONAL PACKAGES & BESPOKE OFFERS */}
      {activeSubTab === "packages" && (
        <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#ded5c8] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#a58b72]">
              <Tag className="h-3.5 w-3.5" />
              Package Catalog ({settings.offers_items.length})
            </div>
            <h3 className="font-serif text-lg font-bold text-[#4a382d]">
              Promotional Packages & Bespoke Offers
            </h3>
            <p className="text-xs text-[#755b43]">
              Curate promotional vouchers, exclusive package perks, pricing details, and booking action links.
            </p>
          </div>

          <button
            type="button"
            onClick={addOfferItem}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4a382d] px-4 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-[#392b23]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New Offer Package
          </button>
        </div>

        {/* Offer Cards List */}
        <div className="mt-6 space-y-6">
          {settings.offers_items.map((offer, index) => (
            <div
              key={offer.id || index}
              className="relative rounded-2xl border border-[#ded5c8] bg-[#fbf9f5] p-5 transition hover:border-[#a58b72]/60"
            >
              {/* Card top toolbar */}
              <div className="flex items-center justify-between border-b border-[#ded5c8] pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4a382d] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="font-serif text-sm font-bold text-[#4a382d]">
                    {offer.title || "Untitled Package"}
                  </span>
                  {offer.badge && (
                    <span className="rounded-full bg-[#4a382d]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#755b43]">
                      {offer.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => moveOffer(index, index - 1)}
                    disabled={index === 0}
                    title="Move Up"
                    className="rounded-lg border border-[#ded5c8] bg-white p-1.5 text-[#755b43] transition hover:bg-[#f8f6f1] disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveOffer(index, index + 1)}
                    disabled={index === settings.offers_items.length - 1}
                    title="Move Down"
                    className="rounded-lg border border-[#ded5c8] bg-white p-1.5 text-[#755b43] transition hover:bg-[#f8f6f1] disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeOfferItem(index)}
                    title="Delete Offer"
                    className="rounded-lg border border-red-200 bg-white p-1.5 text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12">
                {/* Visual Image & File Upload */}
                <div className="space-y-3 lg:col-span-4">
                  <label className="block text-xs font-semibold text-[#4a382d]">
                    Package Image
                  </label>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#ded5c8] bg-white">
                    {offer.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={offer.image}
                        alt={offer.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[#a58b72]">
                        <ImageIcon className="h-8 w-8 text-[#ded5c8]" />
                      </div>
                    )}

                    {uploadingOfferIdx === index && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    )}
                  </div>

                  <label className="cursor-pointer inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#ded5c8] bg-white px-3 py-2 text-xs font-medium text-[#4a382d] transition hover:bg-[#f8f6f1]">
                    <Upload className="h-3.5 w-3.5 text-[#a58b72]" />
                    <span>{offer.image ? "Change Photo" : "Upload Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(
                            file,
                            (url, path) =>
                              updateOfferItem(index, {
                                image: url,
                                image_path: path,
                              }),
                            (b) => setUploadingOfferIdx(b ? index : null)
                          );
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Core Offer Fields */}
                <div className="space-y-4 lg:col-span-8">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#4a382d]">
                        Package Title
                      </label>
                      <input
                        type="text"
                        value={offer.title}
                        onChange={(e) =>
                          updateOfferItem(index, { title: e.target.value })
                        }
                        placeholder="e.g. The Signature Urban Staycation"
                        className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3 py-2 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4a382d]">
                        Tagline / Subheading
                      </label>
                      <input
                        type="text"
                        value={offer.tagline}
                        onChange={(e) =>
                          updateOfferItem(index, { tagline: e.target.value })
                        }
                        placeholder="e.g. Premier Pondok Indah Experience"
                        className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3 py-2 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#4a382d]">
                        Badge (e.g. Most Popular)
                      </label>
                      <input
                        type="text"
                        value={offer.badge}
                        onChange={(e) =>
                          updateOfferItem(index, { badge: e.target.value })
                        }
                        placeholder="Honeymoon Special"
                        className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3 py-2 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4a382d]">
                        Category
                      </label>
                      <input
                        type="text"
                        value={offer.category}
                        onChange={(e) =>
                          updateOfferItem(index, { category: e.target.value })
                        }
                        placeholder="Couples & Romance"
                        className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3 py-2 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4a382d]">
                        Promo Code
                      </label>
                      <input
                        type="text"
                        value={offer.promo_code || ""}
                        onChange={(e) =>
                          updateOfferItem(index, { promo_code: e.target.value })
                        }
                        placeholder="SERENITY26"
                        className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3 py-2 font-mono text-xs uppercase tracking-wider text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#4a382d]">
                        Price / Rate Display
                      </label>
                      <input
                        type="text"
                        value={offer.price}
                        onChange={(e) =>
                          updateOfferItem(index, { price: e.target.value })
                        }
                        placeholder="From IDR 4,850,000 / night"
                        className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3 py-2 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4a382d]">
                        Validity Period
                      </label>
                      <input
                        type="text"
                        value={offer.validity}
                        onChange={(e) =>
                          updateOfferItem(index, { validity: e.target.value })
                        }
                        placeholder="Valid until 31 December 2026"
                        className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3 py-2 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4a382d]">
                      Package Description & Highlights
                    </label>
                    <textarea
                      rows={2}
                      value={offer.description}
                      onChange={(e) =>
                        updateOfferItem(index, { description: e.target.value })
                      }
                      placeholder="Write an enticing summary of the package..."
                      className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3 py-2 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                    />
                  </div>

                  {/* Package Inclusions Checklist */}
                  <div className="rounded-xl border border-[#ded5c8] bg-white p-3.5">
                    <label className="block text-xs font-semibold text-[#4a382d]">
                      Package Inclusions & Benefits ({offer.inclusions?.length || 0})
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {offer.inclusions?.map((inc, incIdx) => (
                        <span
                          key={incIdx}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-[#f8f6f1] px-2.5 py-1 text-xs text-[#4a382d]"
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>{inc}</span>
                          <button
                            type="button"
                            onClick={() => removeInclusionFromOffer(index, incIdx)}
                            className="ml-1 text-[#a58b72] transition hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="text"
                        value={inclusionInputs[index] || ""}
                        onChange={(e) =>
                          setInclusionInputs({
                            ...inclusionInputs,
                            [index]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addInclusionToOffer(index);
                          }
                        }}
                        placeholder="e.g. Daily buffet breakfast for two"
                        className="flex-1 rounded-xl border border-[#ded5c8] bg-white px-3 py-1.5 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => addInclusionToOffer(index)}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#4a382d] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#392b23]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Inclusion
                      </button>
                    </div>
                  </div>

                  {/* Action Button Settings with Toggle */}
                  <div className="rounded-xl border border-[#ded5c8] bg-white p-3.5 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-[#4a382d]">
                            Action Button (Reservation CTA)
                          </label>
                          {offer.show_button !== false ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              Active
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                              Turned Off
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-[#755b43]">
                          Toggle off to hide the action button for this offer on the public page.
                        </p>
                      </div>

                      {/* Switch Toggle */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={offer.show_button !== false}
                        onClick={() =>
                          updateOfferItem(index, {
                            show_button: offer.show_button === false ? true : false,
                          })
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          offer.show_button !== false ? "bg-[#4a382d]" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            offer.show_button !== false ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {offer.show_button !== false ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-[#ded5c8]">
                        <div>
                          <label className="block text-xs font-semibold text-[#4a382d]">
                            Action Button Label
                          </label>
                          <input
                            type="text"
                            value={offer.button_text || ""}
                            onChange={(e) =>
                              updateOfferItem(index, { button_text: e.target.value })
                            }
                            placeholder="Reserve This Offer"
                            className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-[#fbf9f5] px-3 py-2 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#4a382d]">
                            Action Button Link / Target URL
                          </label>
                          <TargetLinkSelect
                            value={offer.button_link || "/#booking"}
                            onChange={(val) =>
                              updateOfferItem(index, { button_link: val })
                            }
                            rooms={rooms}
                            className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-[#fbf9f5] px-3 py-2 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:bg-white focus:outline-none cursor-pointer"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-[#f8f6f1] p-2.5 text-center text-[11px] text-[#755b43] italic border border-dashed border-[#ded5c8]">
                        Action button is currently disabled for this package and will not be displayed on the offers page.
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4a382d]">
                      Terms & Conditions / Booking Policies
                    </label>
                    <input
                      type="text"
                      value={offer.terms || ""}
                      onChange={(e) =>
                        updateOfferItem(index, { terms: e.target.value })
                      }
                      placeholder="e.g. Minimum 2-night stay. Non-refundable deposit required."
                      className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3 py-2 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* 5. TAB 3: THE ARUNDRA GUARANTEE & DIRECT RESERVATION PRIVILEGES */}
      {activeSubTab === "guarantee" && (
        <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-sm">
          <div className="border-b border-[#ded5c8] pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#a58b72]" />
              <h3 className="font-serif text-lg font-bold text-[#4a382d]">
                The Arundra Guarantee &amp; Direct Reservation Privileges
              </h3>
            </div>
            <p className="mt-1 text-xs text-[#755b43]">
              Configure direct reservation guarantee copy and the 4 bespoke guest privilege cards displayed at the bottom of the offers page.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-[#4a382d]">
                Section Eyebrow
              </label>
              <input
                type="text"
                value={settings.guarantee_eyebrow || ""}
                onChange={(e) =>
                  setSettings({ ...settings, guarantee_eyebrow: e.target.value })
                }
                placeholder="THE ARUNDRA GUARANTEE"
                className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3 py-2 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a382d]">
                Section Title
              </label>
              <input
                type="text"
                value={settings.guarantee_title || ""}
                onChange={(e) =>
                  setSettings({ ...settings, guarantee_title: e.target.value })
                }
                placeholder="Direct Reservation Privileges"
                className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3 py-2 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4a382d]">
                Section Description
              </label>
              <input
                type="text"
                value={settings.guarantee_description || ""}
                onChange={(e) =>
                  setSettings({ ...settings, guarantee_description: e.target.value })
                }
                placeholder="Every booking made through our official portal receives dedicated VIP hospitality attention."
                className="mt-1 w-full rounded-xl border border-[#ded5c8] bg-white px-3 py-2 text-xs text-[#4a382d] transition focus:border-[#a58b72] focus:outline-none"
              />
            </div>
          </div>

          {/* 4 Privilege Cards */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(settings.guarantee_items && settings.guarantee_items.length > 0
              ? settings.guarantee_items
              : DEFAULT_GUARANTEE_ITEMS
            ).map((item, gIdx) => (
              <div
                key={gIdx}
                className="rounded-xl border border-[#ded5c8] bg-[#fbf9f5] p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#a58b72] uppercase">
                    Privilege #{gIdx + 1}
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-[#ded5c8]">
                    {renderGuaranteeIcon(item.icon, 14)}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#4a382d]">
                    Icon
                  </label>
                  <select
                    value={item.icon}
                    onChange={(e) =>
                      updateGuaranteeItem(gIdx, { icon: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#ded5c8] bg-white px-2 py-1.5 text-xs text-[#4a382d] focus:border-[#a58b72] focus:outline-none"
                  >
                    {SUPPORTED_GUARANTEE_ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#4a382d]">
                    Title
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) =>
                      updateGuaranteeItem(gIdx, { title: e.target.value })
                    }
                    placeholder="Privilege Title"
                    className="mt-1 w-full rounded-lg border border-[#ded5c8] bg-white px-2.5 py-1.5 text-xs text-[#4a382d] focus:border-[#a58b72] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#4a382d]">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) =>
                      updateGuaranteeItem(gIdx, { description: e.target.value })
                    }
                    placeholder="Short description..."
                    className="mt-1 w-full rounded-lg border border-[#ded5c8] bg-white px-2.5 py-1.5 text-xs text-[#4a382d] focus:border-[#a58b72] focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-2xl border border-[#ded5c8] bg-white/95 p-4 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs text-[#755b43]">
          <span className="font-semibold text-[#4a382d]">Offers Status:</span>
          <span>{settings.offers_items.length} package(s) configured</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded5c8] bg-white px-4 py-2 text-xs font-medium text-[#755b43] transition hover:bg-[#f8f6f1] disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[#a58b72]" />
            Reset
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4a382d] px-6 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#392b23] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
}

