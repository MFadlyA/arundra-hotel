"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  Palmtree,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Loader2,
  Save,
  RotateCcw,
  ExternalLink,
  Check,
  Copy,
  Eye,
  Navigation,
  Plane,
  CalendarDays,
  Tag,
  Building2,
  X,
} from "lucide-react";
import {
  DEFAULT_EXPERIENCE_SETTINGS,
  DEFAULT_RECREATION_ITEMS,
  DEFAULT_FACILITY_ITEMS,
  DEFAULT_NEARBY_ITEMS,
  SQL_EXPERIENCE_MIGRATION_SCRIPT,
} from "@/lib/experience-settings";
import type {
  ExperienceSettings,
  RecreationItem,
  FacilityItem,
  NearbyPlaceItem,
} from "@/types/database";

interface ExperienceCMSProps {
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

export default function ExperienceCMS({
  showAlert,
  showConfirm,
}: ExperienceCMSProps) {
  const [settings, setSettings] = useState<ExperienceSettings>(
    DEFAULT_EXPERIENCE_SETTINGS
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Sub-tabs: "recreations" | "facilities" | "location"
  const [activeSubTab, setActiveSubTab] = useState<
    "recreations" | "facilities" | "location"
  >("recreations");

  // Uploading states
  const [uploadingRecreationIdx, setUploadingRecreationIdx] = useState<number | null>(
    null
  );
  const [uploadingFacilityIdx, setUploadingFacilityIdx] = useState<number | null>(
    null
  );
  const [uploadingNearbyIdx, setUploadingNearbyIdx] = useState<number | null>(
    null
  );

  // New facility feature input buffer
  const [featureInputs, setFeatureInputs] = useState<Record<number, string>>({});

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/experience", { cache: "no-store" });
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
      console.error("Error loading experience settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_EXPERIENCE_MIGRATION_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // ----------------------------------------------------------------------------
  // SAVE SETTINGS
  // ----------------------------------------------------------------------------
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.tableMissing) setTableMissing(true);
        throw new Error(data.error || "Failed to save experience settings.");
      }

      setSettings(data.settings);
      setTableMissing(false);
      setActionMessage({
        type: "success",
        text: "Experience page settings successfully published!",
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("experience-settings-updated", {
            detail: data.settings,
          })
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error saving experience settings.";
      setActionMessage({ type: "error", text: msg });
      showAlert(msg, "Save Failed");
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------------------------------
  // RESET SETTINGS
  // ----------------------------------------------------------------------------
  const handleReset = () => {
    showConfirm(
      "Are you sure you want to restore the entire Experience page back to hotel defaults? This will reset the Variety of Recreations, Facilities, and Location Info.",
      async () => {
        setSaving(true);
        setActionMessage(null);
        try {
          const res = await fetch("/api/admin/experience/reset", {
            method: "POST",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to reset.");

          setSettings(data.settings);
          setActionMessage({
            type: "success",
            text: "Experience page restored to hotel defaults!",
          });

          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("experience-settings-updated", {
                detail: data.settings,
              })
            );
          }
        } catch (err: unknown) {
          const msg =
            err instanceof Error ? err.message : "Error resetting experience.";
          showAlert(msg, "Reset Error");
        } finally {
          setSaving(false);
        }
      },
      {
        title: "Reset Experience Page?",
        confirmText: "Reset to Defaults",
        danger: true,
      }
    );
  };

  // ----------------------------------------------------------------------------
  // IMAGE UPLOADS
  // ----------------------------------------------------------------------------
  const uploadImageFile = async (
    file: File,
    folder: string
  ): Promise<{ publicUrl: string; storagePath: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/admin/experience/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed.");
    return { publicUrl: data.publicUrl, storagePath: data.storagePath };
  };

  const handleRecreationImageUpload = async (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingRecreationIdx(idx);
    try {
      const { publicUrl, storagePath } = await uploadImageFile(
        file,
        "experience/recreations"
      );
      setSettings((prev) => {
        const next = [...prev.recreations_items];
        next[idx] = {
          ...next[idx],
          image: publicUrl,
          image_path: storagePath,
        };
        return { ...prev, recreations_items: next };
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      showAlert(msg, "Upload Error");
    } finally {
      setUploadingRecreationIdx(null);
      e.target.value = "";
    }
  };

  const handleFacilityImageUpload = async (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFacilityIdx(idx);
    try {
      const { publicUrl, storagePath } = await uploadImageFile(
        file,
        "experience/facilities"
      );
      setSettings((prev) => {
        const next = [...prev.facilities_items];
        next[idx] = {
          ...next[idx],
          image: publicUrl,
          image_path: storagePath,
        };
        return { ...prev, facilities_items: next };
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      showAlert(msg, "Upload Error");
    } finally {
      setUploadingFacilityIdx(null);
      e.target.value = "";
    }
  };

  const handleNearbyImageUpload = async (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingNearbyIdx(idx);
    try {
      const { publicUrl, storagePath } = await uploadImageFile(
        file,
        "experience/nearby"
      );
      setSettings((prev) => {
        const next = [...prev.nearby_items];
        next[idx] = {
          ...next[idx],
          image: publicUrl,
          image_path: storagePath,
        };
        return { ...prev, nearby_items: next };
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      showAlert(msg, "Upload Error");
    } finally {
      setUploadingNearbyIdx(null);
      e.target.value = "";
    }
  };

  // ----------------------------------------------------------------------------
  // RECREATION LIST HELPERS
  // ----------------------------------------------------------------------------
  const handleAddRecreation = () => {
    const newItem: RecreationItem = {
      id: `rec-${Date.now()}`,
      title: "New Recreational Activity",
      category: "Wellness & Spa",
      description:
        "Describe this bespoke recreational activity, experience, or guided journey.",
      image: DEFAULT_RECREATION_ITEMS[0].image,
      image_path: null,
      badge: "Signature Experience",
      timing: "Daily: 08:00 AM – 06:00 PM",
      visible_on_homepage: true,
    };
    setSettings((prev) => ({
      ...prev,
      recreations_items: [...prev.recreations_items, newItem],
    }));
  };

  const handleRemoveRecreation = (idx: number) => {
    if (settings.recreations_items.length <= 1) {
      showAlert(
        "At least 1 recreational activity must remain published.",
        "Requirement"
      );
      return;
    }
    setSettings((prev) => ({
      ...prev,
      recreations_items: prev.recreations_items.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateRecreation = (
    idx: number,
    field: keyof RecreationItem,
    val: unknown
  ) => {
    setSettings((prev) => {
      const next = [...prev.recreations_items];
      next[idx] = { ...next[idx], [field]: val };
      return { ...prev, recreations_items: next };
    });
  };

  // ----------------------------------------------------------------------------
  // FACILITY LIST HELPERS
  // ----------------------------------------------------------------------------
  const handleAddFacility = () => {
    const newFacility: FacilityItem = {
      id: `fac-${Date.now()}`,
      name: "New World-Class Facility",
      tagline: "Resort Wing",
      description:
        "Describe the architectural details, ambiance, and guest privileges of this facility.",
      image: DEFAULT_FACILITY_ITEMS[0].image,
      image_path: null,
      hours: "07:00 AM – 10:00 PM",
      features: ["VIP Access", "Dedicated Concierge", "Towels & Amenities"],
      visible_on_homepage: true,
    };
    setSettings((prev) => ({
      ...prev,
      facilities_items: [...prev.facilities_items, newFacility],
    }));
  };

  const handleRemoveFacility = (idx: number) => {
    if (settings.facilities_items.length <= 1) {
      showAlert(
        "At least 1 resort facility must remain published.",
        "Requirement"
      );
      return;
    }
    setSettings((prev) => ({
      ...prev,
      facilities_items: prev.facilities_items.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateFacility = (
    idx: number,
    field: keyof FacilityItem,
    val: unknown
  ) => {
    setSettings((prev) => {
      const next = [...prev.facilities_items];
      next[idx] = { ...next[idx], [field]: val };
      return { ...prev, facilities_items: next };
    });
  };

  const handleAddFacilityFeature = (facilityIdx: number) => {
    const text = (featureInputs[facilityIdx] || "").trim();
    if (!text) return;
    setSettings((prev) => {
      const next = [...prev.facilities_items];
      const curFeatures = next[facilityIdx].features || [];
      next[facilityIdx] = {
        ...next[facilityIdx],
        features: [...curFeatures, text],
      };
      return { ...prev, facilities_items: next };
    });
    setFeatureInputs((prev) => ({ ...prev, [facilityIdx]: "" }));
  };

  const handleRemoveFacilityFeature = (
    facilityIdx: number,
    featIdx: number
  ) => {
    setSettings((prev) => {
      const next = [...prev.facilities_items];
      const curFeatures = [...(next[facilityIdx].features || [])];
      curFeatures.splice(featIdx, 1);
      next[facilityIdx] = {
        ...next[facilityIdx],
        features: curFeatures,
      };
      return { ...prev, facilities_items: next };
    });
  };

  // ----------------------------------------------------------------------------
  // NEARBY PLACES HELPERS
  // ----------------------------------------------------------------------------
  const handleAddNearby = () => {
    const newPlace: NearbyPlaceItem = {
      id: `near-${Date.now()}`,
      name: "New Curated Attraction",
      category: "Recreation & Golf",
      distance: "10 mins drive (4 km)",
      description:
        "Describe why this nearby destination or scenic spot is worth exploring for guests.",
      image: DEFAULT_NEARBY_ITEMS[0].image,
      image_path: null,
      visible_on_homepage: true,
    };
    setSettings((prev) => ({
      ...prev,
      nearby_items: [...prev.nearby_items, newPlace],
    }));
  };

  const handleRemoveNearby = (idx: number) => {
    if (settings.nearby_items.length <= 1) {
      showAlert(
        "At least 1 nearby destination must remain published.",
        "Requirement"
      );
      return;
    }
    setSettings((prev) => ({
      ...prev,
      nearby_items: prev.nearby_items.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateNearby = (
    idx: number,
    field: keyof NearbyPlaceItem,
    val: unknown
  ) => {
    setSettings((prev) => {
      const next = [...prev.nearby_items];
      next[idx] = { ...next[idx], [field]: val };
      return { ...prev, nearby_items: next };
    });
  };

  return (
    <div className="mt-6 space-y-6">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & ACTION CONTROLS */}
      {/* ============================================================== */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#f4ede4] p-1.5 text-[#755b43]">
              <Compass size={18} />
            </span>
            <h2 className="text-lg font-serif font-bold text-[#4a382d]">
              Experience Page CMS
            </h2>
          </div>
          <p className="mt-1 text-xs text-[#777064]">
            Curate resort recreations, luxury facilities, location info, Google Maps integration, and nearby landmarks & transit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/experience"
            target="_blank"
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs font-medium text-[#4a382d] hover:bg-[#eee7dc] transition"
          >
            <Eye size={13} />
            <span>Preview Page</span>
            <ExternalLink size={12} className="opacity-70" />
          </Link>

          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-white px-3.5 py-2 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1] hover:text-[#4a382d] disabled:opacity-50 transition"
          >
            <RotateCcw size={13} />
            <span>Reset to Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-5 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#655043] disabled:opacity-50 transition"
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={13} />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div
          className={`rounded-xl border p-4 text-xs font-medium ${
            actionMessage.type === "success"
              ? "border-[#c4deb8] bg-[#f0f8ed] text-[#2c611f]"
              : "border-[#f2c6c0] bg-[#fff5f4] text-[#984b3b]"
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {/* SQL Migration Script Notice if Table Missing */}
      {tableMissing && (
        <div className="rounded-2xl border border-[#e5d5be] bg-[#fbf7f0] p-6 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-serif font-bold text-[#4a382d]">
                Database Table `experience_settings` Not Installed
              </h4>
              <p className="mt-1 text-xs text-[#777064]">
                To persist your custom Experience settings in Supabase, copy and run the SQL migration script in your Supabase SQL Editor. The public website will automatically fall back to elegant built-in defaults in the meantime.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopySql}
              className="cursor-pointer inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#d5b78a] bg-white px-3 py-1.5 text-xs font-semibold text-[#4a382d] hover:bg-[#fcfaf7]"
            >
              {copiedSql ? (
                <>
                  <Check size={13} className="text-green-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy SQL Script</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. SUB-SECTION NAVIGATION TABS */}
      {/* ============================================================== */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#ded5c8] pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab("recreations")}
          className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition ${
            activeSubTab === "recreations"
              ? "bg-[#4a382d] text-white shadow-xs"
              : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:text-[#4a382d]"
          }`}
        >
          <Palmtree size={14} />
          <span>1. Variety of Recreations</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeSubTab === "recreations"
                ? "bg-white/20 text-white"
                : "bg-[#f4ede4] text-[#62594f]"
            }`}
          >
            {settings.recreations_items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("facilities")}
          className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition ${
            activeSubTab === "facilities"
              ? "bg-[#4a382d] text-white shadow-xs"
              : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:text-[#4a382d]"
          }`}
        >
          <Building2 size={14} />
          <span>2. Our Facilities</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeSubTab === "facilities"
                ? "bg-white/20 text-white"
                : "bg-[#f4ede4] text-[#62594f]"
            }`}
          >
            {settings.facilities_items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("location")}
          className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition ${
            activeSubTab === "location"
              ? "bg-[#4a382d] text-white shadow-xs"
              : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:text-[#4a382d]"
          }`}
        >
          <MapPin size={14} />
          <span>3. Location & Nearby Places</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeSubTab === "location"
                ? "bg-white/20 text-white"
                : "bg-[#f4ede4] text-[#62594f]"
            }`}
          >
            {settings.nearby_items.length}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 3. TAB CONTENT: 1. VARIETY OF RECREATIONS */}
      {/* ============================================================== */}
      {activeSubTab === "recreations" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Section Headlines */}
          <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-[#4a382d] text-base">
              Recreations Section Headlines
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                  Section Eyebrow Tag
                </label>
                <input
                  type="text"
                  value={settings.recreations_eyebrow || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      recreations_eyebrow: e.target.value,
                    }))
                  }
                  placeholder="e.g. VARIETY OF RECREATIONS"
                  className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                  Main Section Headline
                </label>
                <input
                  type="text"
                  value={settings.recreations_title || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      recreations_title: e.target.value,
                    }))
                  }
                  placeholder="e.g. Designed for Rest, Adventure & Wonder"
                  className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                Section Description / Narrative
              </label>
              <textarea
                rows={2}
                value={settings.recreations_description || ""}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    recreations_description: e.target.value,
                  }))
                }
                placeholder="Brief introduction describing the recreation offerings..."
                className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Recreation Items List */}
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-[#4a382d] text-base">
              Recreational Activities List ({settings.recreations_items.length})
            </h3>
            <button
              type="button"
              onClick={handleAddRecreation}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-[#4a382d] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#655043] transition shadow-xs"
            >
              <Plus size={14} />
              <span>Add Recreation</span>
            </button>
          </div>

          <div className="grid gap-6">
            {settings.recreations_items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="rounded-2xl border border-[#ded5c8] bg-white p-5 shadow-xs transition hover:border-[#a58b72]"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#ded5c8] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f4ede4] text-xs font-bold text-[#755b43]">
                      {idx + 1}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-[#4a382d]">
                      {item.title || "Untitled Activity"}
                    </h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* VISIBLE ON HOMEPAGE TOGGLE */}
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateRecreation(
                          idx,
                          "visible_on_homepage",
                          item.visible_on_homepage === false ? true : false
                        )
                      }
                      className={`cursor-pointer inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                        item.visible_on_homepage !== false
                          ? "bg-[#eaf4e6] text-[#285e1b] border border-[#c2deb6] hover:bg-[#deeed6]"
                          : "bg-[#f8f6f1] text-[#8c8275] border border-[#ded5c8] hover:bg-[#eee7dc]"
                      }`}
                      title="Toggle visibility on homepage"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          item.visible_on_homepage !== false
                            ? "bg-[#285e1b]"
                            : "bg-[#8c8275]"
                        }`}
                      />
                      <span>
                        {item.visible_on_homepage !== false
                          ? "Visible on Homepage"
                          : "Hidden from Homepage"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveRecreation(idx)}
                      className="cursor-pointer inline-flex items-center gap-1 text-xs text-[#984b3b] hover:text-red-700 transition"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                  {/* Photo Preview & Upload (4 cols) */}
                  <div className="lg:col-span-4 space-y-2.5">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-[#ded5c8] bg-[#eee7dc]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                      {uploadingRecreationIdx === idx && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs font-medium">
                          <Loader2 size={16} className="animate-spin mr-1.5" />
                          Uploading...
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="cursor-pointer inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 py-2 text-xs font-medium text-[#4a382d] hover:bg-[#eee7dc] transition">
                        <Upload size={12} />
                        <span>{item.image ? "Change Photo" : "Upload Photo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleRecreationImageUpload(idx, e)}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Form Details (8 cols) */}
                  <div className="lg:col-span-8 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                          Activity Title
                        </label>
                        <input
                          type="text"
                          value={item.title || ""}
                          onChange={(e) =>
                            handleUpdateRecreation(idx, "title", e.target.value)
                          }
                          placeholder="e.g. Pondok Indah Championship Golf Experience"
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 py-1.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                          Category
                        </label>
                        <input
                          type="text"
                          value={item.category || ""}
                          onChange={(e) =>
                            handleUpdateRecreation(
                              idx,
                              "category",
                              e.target.value
                            )
                          }
                          placeholder="e.g. Recreation & Golf, Wellness & Spa, Halal Dining"
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 py-1.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                          Highlight Badge (Optional)
                        </label>
                        <input
                          type="text"
                          value={item.badge || ""}
                          onChange={(e) =>
                            handleUpdateRecreation(idx, "badge", e.target.value)
                          }
                          placeholder="e.g. Signature Experience, Complimentary"
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 py-1.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                          Schedule / Timing (Optional)
                        </label>
                        <input
                          type="text"
                          value={item.timing || ""}
                          onChange={(e) =>
                            handleUpdateRecreation(idx, "timing", e.target.value)
                          }
                          placeholder="e.g. Daily: 04:30 PM – 07:00 PM"
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 py-1.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={item.description || ""}
                        onChange={(e) =>
                          handleUpdateRecreation(
                            idx,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Detailed narrative describing this recreation..."
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 py-1.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. TAB CONTENT: 2. OUR FACILITIES */}
      {/* ============================================================== */}
      {activeSubTab === "facilities" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Section Headlines */}
          <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-[#4a382d] text-base">
              Facilities Section Headlines
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                  Section Eyebrow Tag
                </label>
                <input
                  type="text"
                  value={settings.facilities_eyebrow || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      facilities_eyebrow: e.target.value,
                    }))
                  }
                  placeholder="e.g. OUR FACILITIES"
                  className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                  Main Section Headline
                </label>
                <input
                  type="text"
                  value={settings.facilities_title || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      facilities_title: e.target.value,
                    }))
                  }
                  placeholder="e.g. World-Class Amenities for Discerning Guests"
                  className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                Section Description / Narrative
              </label>
              <textarea
                rows={2}
                value={settings.facilities_description || ""}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    facilities_description: e.target.value,
                  }))
                }
                placeholder="Overview describing hotel amenities..."
                className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Facility Items List */}
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-[#4a382d] text-base">
              Hotel Facilities Showcase ({settings.facilities_items.length})
            </h3>
            <button
              type="button"
              onClick={handleAddFacility}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-[#4a382d] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#655043] transition shadow-xs"
            >
              <Plus size={14} />
              <span>Add Facility</span>
            </button>
          </div>

          <div className="grid gap-6">
            {settings.facilities_items.map((fac, idx) => (
              <div
                key={fac.id || idx}
                className="rounded-2xl border border-[#ded5c8] bg-white p-5 shadow-xs transition hover:border-[#a58b72]"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#ded5c8] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f4ede4] text-xs font-bold text-[#755b43]">
                      {idx + 1}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-[#4a382d]">
                      {fac.name || "Untitled Facility"}
                    </h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* VISIBLE ON HOMEPAGE TOGGLE */}
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateFacility(
                          idx,
                          "visible_on_homepage",
                          fac.visible_on_homepage === false ? true : false
                        )
                      }
                      className={`cursor-pointer inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                        fac.visible_on_homepage !== false
                          ? "bg-[#eaf4e6] text-[#285e1b] border border-[#c2deb6] hover:bg-[#deeed6]"
                          : "bg-[#f8f6f1] text-[#8c8275] border border-[#ded5c8] hover:bg-[#eee7dc]"
                      }`}
                      title="Toggle visibility on homepage"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          fac.visible_on_homepage !== false
                            ? "bg-[#285e1b]"
                            : "bg-[#8c8275]"
                        }`}
                      />
                      <span>
                        {fac.visible_on_homepage !== false
                          ? "Visible on Homepage"
                          : "Hidden from Homepage"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveFacility(idx)}
                      className="cursor-pointer inline-flex items-center gap-1 text-xs text-[#984b3b] hover:text-red-700 transition"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                  {/* Photo & Upload (4 cols) */}
                  <div className="lg:col-span-4 space-y-2.5">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-[#ded5c8] bg-[#eee7dc]">
                      <img
                        src={fac.image}
                        alt={fac.name}
                        className="h-full w-full object-cover"
                      />
                      {uploadingFacilityIdx === idx && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs font-medium">
                          <Loader2 size={16} className="animate-spin mr-1.5" />
                          Uploading...
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="cursor-pointer inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 py-2 text-xs font-medium text-[#4a382d] hover:bg-[#eee7dc] transition">
                        <Upload size={12} />
                        <span>{fac.image ? "Change Photo" : "Upload Photo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFacilityImageUpload(idx, e)}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Details (8 cols) */}
                  <div className="lg:col-span-8 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                          Facility Name
                        </label>
                        <input
                          type="text"
                          value={fac.name || ""}
                          onChange={(e) =>
                            handleUpdateFacility(idx, "name", e.target.value)
                          }
                          placeholder="e.g. Horizon Infinity Edge Pool"
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 py-1.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                          Location Tag / Subtitle
                        </label>
                        <input
                          type="text"
                          value={fac.tagline || ""}
                          onChange={(e) =>
                            handleUpdateFacility(idx, "tagline", e.target.value)
                          }
                          placeholder="e.g. Urban Serenity, Level 2 Recreation Deck"
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 py-1.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                        Operating Hours / Availability
                      </label>
                      <input
                        type="text"
                        value={fac.hours || ""}
                        onChange={(e) =>
                          handleUpdateFacility(idx, "hours", e.target.value)
                        }
                        placeholder="e.g. 06:00 AM – 10:00 PM, 24/7 Keycard Access"
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 py-1.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={fac.description || ""}
                        onChange={(e) =>
                          handleUpdateFacility(
                            idx,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Architectural features, amenities, and guest comfort details..."
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 py-1.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Features Tags */}
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                        Amenity Highlights / Tags
                      </label>

                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {(fac.features || []).map((feat, fIdx) => (
                          <span
                            key={fIdx}
                            className="inline-flex items-center gap-1 rounded-md bg-[#f4ede4] px-2 py-0.5 text-[11px] font-medium text-[#755b43]"
                          >
                            <span>{feat}</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveFacilityFeature(idx, fIdx)
                              }
                              className="cursor-pointer text-[#a58b72] hover:text-[#984b3b]"
                            >
                              <X size={11} />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={featureInputs[idx] || ""}
                          onChange={(e) =>
                            setFeatureInputs((prev) => ({
                              ...prev,
                              [idx]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddFacilityFeature(idx);
                            }
                          }}
                          placeholder="Type amenity tag & press Enter or Add"
                          className="flex-1 rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 py-1 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddFacilityFeature(idx)}
                          className="cursor-pointer rounded-lg border border-[#ded5c8] bg-white px-3 py-1 text-xs font-medium text-[#4a382d] hover:bg-[#f8f6f1]"
                        >
                          Add Tag
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. TAB CONTENT: 3. LOCATION & NEARBY PLACES */}
      {/* ============================================================== */}
      {activeSubTab === "location" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Location Section Headlines & Coordinates */}
          <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-[#4a382d] text-base">
              Location Info & Google Maps Settings
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                  Section Eyebrow Tag
                </label>
                <input
                  type="text"
                  value={settings.location_eyebrow || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      location_eyebrow: e.target.value,
                    }))
                  }
                  placeholder="e.g. LOCATION & NEARBY PLACES"
                  className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                  Main Section Headline
                </label>
                <input
                  type="text"
                  value={settings.location_title || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      location_title: e.target.value,
                    }))
                  }
                  placeholder="e.g. At the Heart of South Jakarta's Prestige"
                  className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                Section Description / Narrative
              </label>
              <textarea
                rows={2}
                value={settings.location_description || ""}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    location_description: e.target.value,
                  }))
                }
                placeholder="Overview describing the hotel's prime location..."
                className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
              />
            </div>

            {/* Map Card Header: Badge & Hotel Name */}
            <div className="grid gap-4 sm:grid-cols-2 border-t border-[#ded5c8] pt-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                  Badge (Pill)
                </label>
                <input
                  type="text"
                  value={settings.location_badge || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      location_badge: e.target.value,
                    }))
                  }
                  placeholder="e.g. Prestigious Pondok Indah Corridor"
                  className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                  Hotel Name
                </label>
                <input
                  type="text"
                  value={settings.location_hotel_name || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      location_hotel_name: e.target.value,
                    }))
                  }
                  placeholder="e.g. Arundra Signature Pondok Indah"
                  className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                  Hotel Physical Address
                </label>
                <input
                  type="text"
                  value={settings.location_address || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      location_address: e.target.value,
                    }))
                  }
                  placeholder="e.g. Jl. Metro Pondok Indah No. 27, Jakarta Selatan 12310"
                  className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                  Google Maps URL (For &quot;View Maps&quot; Button)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={settings.location_maps_url || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        location_maps_url: e.target.value,
                      }))
                    }
                    placeholder="https://maps.google.com/?q=..."
                    className="flex-1 rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                  />
                  {settings.location_maps_url && (
                    <a
                      href={settings.location_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer inline-flex items-center justify-center rounded-lg border border-[#ded5c8] bg-white px-3 text-xs text-[#4a382d] hover:bg-[#f8f6f1]"
                      title="Test Google Maps Link"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                  Airport Distance & Transit Time
                </label>
                <input
                  type="text"
                  value={settings.location_airport_distance || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      location_airport_distance: e.target.value,
                    }))
                  }
                  placeholder="e.g. ~38 mins to Halim (HLP) • ~42 mins to Soekarno-Hatta (CGK)"
                  className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                  Check-in / Check-out & Concierge Hours
                </label>
                <input
                  type="text"
                  value={settings.location_check_in_info || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      location_check_in_info: e.target.value,
                    }))
                  }
                  placeholder="e.g. Check-in: 03:00 PM • Check-out: 12:00 PM • 24/7 Concierge"
                  className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                Google Maps Embed Iframe URL (Optional)
              </label>
              <input
                type="text"
                value={settings.location_embed_url || ""}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    location_embed_url: e.target.value,
                  }))
                }
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-[#9c9388]">
                From Google Maps: Share → Embed a map → Copy the URL inside the src=&quot;...&quot; attribute.
              </p>
            </div>
          </div>

          {/* Nearby Places List */}
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-[#4a382d] text-base">
              Nearby Places & Attractions ({settings.nearby_items.length})
            </h3>
            <button
              type="button"
              onClick={handleAddNearby}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-[#4a382d] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#655043] transition shadow-xs"
            >
              <Plus size={14} />
              <span>Add Nearby Place</span>
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {settings.nearby_items.map((place, idx) => (
              <div
                key={place.id || idx}
                className="rounded-2xl border border-[#ded5c8] bg-white p-5 shadow-xs transition hover:border-[#a58b72]"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#ded5c8] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f4ede4] text-xs font-bold text-[#755b43]">
                      {idx + 1}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-[#4a382d]">
                      {place.name || "Untitled Place"}
                    </h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* VISIBLE ON HOMEPAGE TOGGLE */}
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateNearby(
                          idx,
                          "visible_on_homepage",
                          place.visible_on_homepage === false ? true : false
                        )
                      }
                      className={`cursor-pointer inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                        place.visible_on_homepage !== false
                          ? "bg-[#eaf4e6] text-[#285e1b] border border-[#c2deb6] hover:bg-[#deeed6]"
                          : "bg-[#f8f6f1] text-[#8c8275] border border-[#ded5c8] hover:bg-[#eee7dc]"
                      }`}
                      title="Toggle visibility on homepage"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          place.visible_on_homepage !== false
                            ? "bg-[#285e1b]"
                            : "bg-[#8c8275]"
                        }`}
                      />
                      <span>
                        {place.visible_on_homepage !== false
                          ? "Visible on Homepage"
                          : "Hidden from Homepage"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveNearby(idx)}
                      className="cursor-pointer inline-flex items-center gap-1 text-xs text-[#984b3b] hover:text-red-700 transition"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Photo Preview & Upload */}
                  <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-[#ded5c8] bg-[#eee7dc]">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="h-full w-full object-cover"
                    />
                    {uploadingNearbyIdx === idx && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs font-medium">
                        <Loader2 size={16} className="animate-spin mr-1.5" />
                        Uploading...
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="cursor-pointer inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 py-2 text-xs font-medium text-[#4a382d] hover:bg-[#eee7dc] transition">
                      <Upload size={12} />
                      <span>{place.image ? "Change Photo" : "Upload Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleNearbyImageUpload(idx, e)}
                      />
                    </label>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                        Place Name
                      </label>
                      <input
                        type="text"
                        value={place.name || ""}
                        onChange={(e) =>
                          handleUpdateNearby(idx, "name", e.target.value)
                        }
                        placeholder="e.g. RS Pondok Indah / Pondok Indah Mall"
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 py-1.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                        Distance / Transit Time
                      </label>
                      <input
                        type="text"
                        value={place.distance || ""}
                        onChange={(e) =>
                          handleUpdateNearby(idx, "distance", e.target.value)
                        }
                        placeholder="e.g. 3 mins walk (250 m)"
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 py-1.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                      Category
                    </label>
                    <input
                      type="text"
                      value={place.category || ""}
                      onChange={(e) =>
                        handleUpdateNearby(idx, "category", e.target.value)
                      }
                      placeholder="e.g. Healthcare, Shopping Mall, Transit, Golf"
                      className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 py-1.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={place.description || ""}
                      onChange={(e) =>
                        handleUpdateNearby(idx, "description", e.target.value)
                      }
                      placeholder="Highlight what guests will enjoy at this place..."
                      className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 py-1.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

