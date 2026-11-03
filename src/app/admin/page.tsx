"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Users,
  LogOut,
  ArrowLeft,
  Search,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  KeyRound,
  Plus,
  Copy,
  Check,
  Share2,
  Trash2,
  Crown,
  X,
  Clock,
  Send,
  Database as DatabaseIcon,
  Building2,
  MapPin,
  Save,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Globe,
  SlidersHorizontal,
  Eye,
  Compass,
  MessageCircle,
  BedDouble,
  Image as ImageIcon,
  Upload,
  Pencil,
  Tag,
  ExternalLink,
  ArrowRight,
  Award,
  Coffee,
  Heart,
  Wifi,
  Gift,
  LogIn,
} from "lucide-react";
import ExperienceCMS from "@/components/admin/ExperienceCMS";
import OffersCMS from "@/components/admin/OffersCMS";
import AuthPagesCMS from "@/components/admin/AuthPagesCMS";
import TargetLinkSelect from "@/components/admin/TargetLinkSelect";
import { useAuth } from "@/context/AuthContext";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  DEFAULT_FOOTER_SETTINGS,
  SQL_FOOTER_MIGRATION_SCRIPT,
} from "@/lib/footer-settings";
import { SQL_ROOMS_MIGRATION_SCRIPT, formatPrice } from "@/data/rooms";
import { SQL_HERO_SLIDES_MIGRATION_SCRIPT } from "@/data/hero-slides";
import {
  DEFAULT_DIFFERENCE_SETTINGS,
  SQL_DIFFERENCE_MIGRATION_SCRIPT,
} from "@/lib/difference-settings";
import {
  DEFAULT_ESCAPE_SETTINGS,
  SQL_ESCAPE_MIGRATION_SCRIPT,
} from "@/lib/escape-settings";
import {
  DEFAULT_WHY_BOOK_SETTINGS,
  SQL_WHY_BOOK_MIGRATION_SCRIPT,
  SUPPORTED_WHY_BOOK_ICONS,
} from "@/lib/why-book-settings";
import {
  DEFAULT_HOSPITALITY_SETTINGS,
  SQL_HOSPITALITY_MIGRATION_SCRIPT,
} from "@/lib/hospitality-settings";
import {
  DEFAULT_ROOMS_HEADER_SETTINGS,
  SQL_ROOMS_HEADER_MIGRATION_SCRIPT,
} from "@/lib/rooms-header-settings";
import type {
  Profile,
  UserRole,
  FooterSettings,
  FooterLink,
  DbRoom,
  DbHeroSlide,
  DifferenceSettings,
  DifferenceItem,
  EscapeSettings,
  WhyBookSettings,
  WhyBookItem,
  HospitalitySettings,
  RoomsHeaderSettings,
} from "@/types/database";

function renderAdminWhyBookIcon(
  name: string,
  size = 20,
  className = "text-[#a58b72]"
) {
  switch (name) {
    case "ShieldCheck":
      return <ShieldCheck className={className} size={size} />;
    case "Check":
      return <Check className={className} size={size} />;
    case "MapPin":
      return <MapPin className={className} size={size} />;
    case "Crown":
    case "Sparkles":
      return <Crown className={className} size={size} />;
    case "Clock":
      return <Clock className={className} size={size} />;
    case "Heart":
      return <Heart className={className} size={size} />;
    case "Coffee":
      return <Coffee className={className} size={size} />;
    case "BedDouble":
      return <BedDouble className={className} size={size} />;
    case "Award":
      return <Award className={className} size={size} />;
    case "Phone":
      return <Phone className={className} size={size} />;
    case "Wifi":
      return <Wifi className={className} size={size} />;
    case "Compass":
      return <Compass className={className} size={size} />;
    default:
      return <Award className={className} size={size} />;
  }
}

export default function AdminPage() {
  const router = useRouter();
  const { user, profile, isAdmin, isLoading, signOut } = useAuth();

  // Active Tab: "members" | "rooms" | "banners" | "difference" | "escape" | "why-book" | "hospitality" | "footer" | "experience" | "offers" | "auth-pages"
  const [activeTab, setActiveTab] = useState<
    | "members"
    | "rooms"
    | "banners"
    | "difference"
    | "escape"
    | "why-book"
    | "hospitality"
    | "footer"
    | "experience"
    | "offers"
    | "auth-pages"
  >("rooms");

  // Navigation category filter: "all" | "homepage" | "hotel" | "access"
  const [tabCategory, setTabCategory] = useState<
    "all" | "homepage" | "hotel" | "access"
  >("all");

  // Member profiles state
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Footer settings state
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(
    DEFAULT_FOOTER_SETTINGS
  );
  const [loadingFooter, setLoadingFooter] = useState(false);
  const [savingFooter, setSavingFooter] = useState(false);
  const [footerTableMissing, setFooterTableMissing] = useState(false);
  const [newExploreLabel, setNewExploreLabel] = useState("");
  const [newExploreUrl, setNewExploreUrl] = useState("");
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Universal Custom Confirm Modal (replaces native browser confirm)
  const [confirmDialog, setConfirmDialog] = useState<{
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const showAlert = (
    message: string,
    title = "Arundra Admin Notice",
    type?: "success" | "error" | "warning" | "info"
  ) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("arundra-alert", { detail: { message, title, type } })
      );
    }
  };

  const showConfirm = (
    message: string,
    onConfirm: () => void,
    options?: {
      title?: string;
      confirmText?: string;
      cancelText?: string;
      danger?: boolean;
    }
  ) => {
    setConfirmDialog({
      message,
      onConfirm,
      title: options?.title || "Confirmation",
      confirmText: options?.confirmText || "Confirm",
      cancelText: options?.cancelText || "Cancel",
      danger: options?.danger ?? false,
    });
  };

  // Rooms CMS state
  const [adminRooms, setAdminRooms] = useState<DbRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsTableMissing, setRoomsTableMissing] = useState(false);
  const [roomsSearchQuery, setRoomsSearchQuery] = useState("");
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [savingRoom, setSavingRoom] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [isSeedingRooms, setIsSeedingRooms] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<DbRoom | null>(null);
  const [showDeleteRoomModal, setShowDeleteRoomModal] = useState(false);
  const [customAmenityInput, setCustomAmenityInput] = useState("");
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);

  // Rooms Section Headlines CMS state
  const [roomsSubTab, setRoomsSubTab] = useState<"management" | "headlines">("management");
  const [roomsHeaderSettings, setRoomsHeaderSettings] = useState<RoomsHeaderSettings>(DEFAULT_ROOMS_HEADER_SETTINGS);
  const [loadingRoomsHeader, setLoadingRoomsHeader] = useState(false);
  const [savingRoomsHeader, setSavingRoomsHeader] = useState(false);
  const [roomsHeaderTableMissing, setRoomsHeaderTableMissing] = useState(false);

  const initialRoomForm: Partial<DbRoom> & {
    removed_gallery_paths?: string[];
  } = {
    name: "",
    slug: "",
    description: "",
    full_description: "",
    price: 935000,
    guests: 2,
    size: 22,
    bed: "1 King Bed",
    cover_image: "",
    cover_image_path: null,
    gallery_images: [],
    gallery_image_paths: [],
    removed_gallery_paths: [],
    amenities: [
      "Air Conditioning",
      "Complimentary Wi-Fi",
      "Flat-Screen TV",
      "Private Bathroom",
    ],
    is_published: true,
    is_featured: false,
    order_rank: 1,
  };
  const [roomForm, setRoomForm] = useState(initialRoomForm);

  // Hero Carousel Banners CMS state
  const [adminBanners, setAdminBanners] = useState<DbHeroSlide[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [bannersTableMissing, setBannersTableMissing] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [reorderingBannerId, setReorderingBannerId] = useState<string | null>(null);
  const [deletingBannerId, setDeletingBannerId] = useState<string | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<DbHeroSlide | null>(null);
  const [showDeleteBannerModal, setShowDeleteBannerModal] = useState(false);
  const [isSeedingBanners, setIsSeedingBanners] = useState(false);

  const initialBannerForm: Partial<DbHeroSlide> & {
    old_image_path?: string | null;
  } = {
    title: "",
    eyebrow: "EXCLUSIVE RETREAT",
    description: "",
    button_text: "Reserve Your Suite",
    button_link: "/rooms",
    image_url: "",
    image_path: null,
    is_active: true,
    order_rank: 1,
  };
  const [bannerForm, setBannerForm] = useState(initialBannerForm);

  // The Difference section CMS state
  const [differenceSettings, setDifferenceSettings] = useState<DifferenceSettings>(
    DEFAULT_DIFFERENCE_SETTINGS
  );
  const [loadingDifference, setLoadingDifference] = useState(false);
  const [savingDifference, setSavingDifference] = useState(false);
  const [differenceTableMissing, setDifferenceTableMissing] = useState(false);
  const [showResetDifferenceModal, setShowResetDifferenceModal] = useState(false);

  // Escape / Special Offer section CMS state
  const [escapeSettings, setEscapeSettings] = useState<EscapeSettings>(
    DEFAULT_ESCAPE_SETTINGS
  );
  const [loadingEscape, setLoadingEscape] = useState(false);
  const [savingEscape, setSavingEscape] = useState(false);
  const [uploadingEscape, setUploadingEscape] = useState(false);
  const [escapeTableMissing, setEscapeTableMissing] = useState(false);
  const [showResetEscapeModal, setShowResetEscapeModal] = useState(false);

  // Why Book / Trust Badges CMS state
  const [whyBookSettings, setWhyBookSettings] = useState<WhyBookSettings>(
    DEFAULT_WHY_BOOK_SETTINGS
  );
  const [loadingWhyBook, setLoadingWhyBook] = useState(false);
  const [savingWhyBook, setSavingWhyBook] = useState(false);
  const [whyBookTableMissing, setWhyBookTableMissing] = useState(false);
  const [showResetWhyBookModal, setShowResetWhyBookModal] = useState(false);

  // Hospitality (The Art of Hospitality) CMS state
  const [hospitalitySettings, setHospitalitySettings] = useState<HospitalitySettings>(
    DEFAULT_HOSPITALITY_SETTINGS
  );
  const [loadingHospitality, setLoadingHospitality] = useState(false);
  const [savingHospitality, setSavingHospitality] = useState(false);
  const [uploadingHospitality, setUploadingHospitality] = useState(false);
  const [hospitalityTableMissing, setHospitalityTableMissing] = useState(false);
  const [showResetHospitalityModal, setShowResetHospitalityModal] = useState(false);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<
    | "key"
    | "wa"
    | "sql"
    | "banner-sql"
    | "diff-sql"
    | "escape-sql"
    | "why-book-sql"
    | "hospitality-sql"
    | null
  >(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // General action messages
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const configured = isSupabaseConfigured();

  // Fetch all profiles
  const fetchAllProfiles = useCallback(async () => {
    if (!configured) return;
    setLoadingProfiles(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching profiles:", error);
      } else if (data) {
        setProfiles(data as Profile[]);
      }
    } catch (err: unknown) {
      console.error("Profiles fetch error:", err);
    } finally {
      setLoadingProfiles(false);
    }
  }, [configured]);

  // Fetch footer settings
  const fetchFooterSettings = useCallback(async () => {
    setLoadingFooter(true);
    try {
      const res = await fetch("/api/admin/footer", { cache: "no-store" });
      const data = await res.json();
      if (data.tableMissing) {
        setFooterTableMissing(true);
      } else {
        setFooterTableMissing(false);
      }
      if (data.settings) {
        setFooterSettings(data.settings);
      }
    } catch (err: unknown) {
      console.error("Error fetching footer settings:", err);
    } finally {
      setLoadingFooter(false);
    }
  }, []);

  // Fetch admin rooms
  const fetchAdminRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const res = await fetch("/api/admin/rooms", { cache: "no-store" });
      const data = await res.json();
      if (data.tableMissing) {
        setRoomsTableMissing(true);
        setAdminRooms([]);
      } else {
        setRoomsTableMissing(false);
        setAdminRooms(data.rooms || []);
      }
    } catch (err: unknown) {
      console.error("Error fetching rooms:", err);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  // Fetch rooms section header settings
  const fetchRoomsHeaderSettings = useCallback(async () => {
    setLoadingRoomsHeader(true);
    try {
      const res = await fetch("/api/admin/rooms-header", { cache: "no-store" });
      const data = await res.json();
      if (data.tableMissing) {
        setRoomsHeaderTableMissing(true);
      } else {
        setRoomsHeaderTableMissing(false);
      }
      if (data.settings) {
        setRoomsHeaderSettings(data.settings);
      }
    } catch (err: unknown) {
      console.error("Error fetching rooms header settings:", err);
    } finally {
      setLoadingRoomsHeader(false);
    }
  }, []);

  // Fetch hero carousel banners
  const fetchAdminBanners = useCallback(async () => {
    setLoadingBanners(true);
    try {
      const res = await fetch("/api/admin/hero-slides", { cache: "no-store" });
      const data = await res.json();
      if (data.tableMissing) {
        setBannersTableMissing(true);
        setAdminBanners([]);
      } else {
        setBannersTableMissing(false);
        setAdminBanners(data.slides || []);
      }
    } catch (err: unknown) {
      console.error("Error fetching hero banners:", err);
    } finally {
      setLoadingBanners(false);
    }
  }, []);

  // Fetch difference settings
  const fetchDifferenceSettings = useCallback(async () => {
    setLoadingDifference(true);
    try {
      const res = await fetch("/api/admin/difference", { cache: "no-store" });
      const data = await res.json();
      if (data.tableMissing) {
        setDifferenceTableMissing(true);
      } else {
        setDifferenceTableMissing(false);
      }
      if (data.settings) {
        setDifferenceSettings(data.settings);
      }
    } catch (err: unknown) {
      console.error("Error fetching difference settings:", err);
    } finally {
      setLoadingDifference(false);
    }
  }, []);

  // Fetch escape settings
  const fetchEscapeSettings = useCallback(async () => {
    setLoadingEscape(true);
    try {
      const res = await fetch("/api/admin/escape", { cache: "no-store" });
      const data = await res.json();
      if (data.tableMissing) {
        setEscapeTableMissing(true);
      } else {
        setEscapeTableMissing(false);
      }
      if (data.settings) {
        setEscapeSettings(data.settings);
      }
    } catch (err: unknown) {
      console.error("Error fetching escape settings:", err);
    } finally {
      setLoadingEscape(false);
    }
  }, []);

  // Fetch why book settings
  const fetchWhyBookSettings = useCallback(async () => {
    setLoadingWhyBook(true);
    try {
      const res = await fetch("/api/admin/why-book", { cache: "no-store" });
      const data = await res.json();
      if (data.tableMissing) {
        setWhyBookTableMissing(true);
      } else {
        setWhyBookTableMissing(false);
      }
      if (data.settings) {
        setWhyBookSettings(data.settings);
      }
    } catch (err: unknown) {
      console.error("Error fetching why book settings:", err);
    } finally {
      setLoadingWhyBook(false);
    }
  }, []);

  // Fetch hospitality settings
  const fetchHospitalitySettings = useCallback(async () => {
    setLoadingHospitality(true);
    try {
      const res = await fetch("/api/admin/hospitality", { cache: "no-store" });
      const data = await res.json();
      if (data.tableMissing) {
        setHospitalityTableMissing(true);
      } else {
        setHospitalityTableMissing(false);
      }
      if (data.settings) {
        setHospitalitySettings(data.settings);
      }
    } catch (err: unknown) {
      console.error("Error fetching hospitality settings:", err);
    } finally {
      setLoadingHospitality(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchAllProfiles();
      fetchFooterSettings();
      fetchAdminRooms();
      fetchRoomsHeaderSettings();
      fetchAdminBanners();
      fetchDifferenceSettings();
      fetchEscapeSettings();
      fetchWhyBookSettings();
      fetchHospitalitySettings();
    }
  }, [
    isAdmin,
    fetchAllProfiles,
    fetchFooterSettings,
    fetchAdminRooms,
    fetchRoomsHeaderSettings,
    fetchAdminBanners,
    fetchDifferenceSettings,
    fetchEscapeSettings,
    fetchWhyBookSettings,
    fetchHospitalitySettings,
  ]);

  // Upload cover image
  const handleUploadCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "rooms/cover");

      const res = await fetch("/api/admin/rooms/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload cover.");

      setRoomForm((prev) => ({
        ...prev,
        cover_image: data.publicUrl,
        cover_image_path: data.storagePath,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cover upload failed.";
      showAlert(msg, "Cover Upload Error");
    } finally {
      setUploadingCover(false);
    }
  };

  // Upload gallery images
  const handleUploadGalleryFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    try {
      const newUrls: string[] = [];
      const newPaths: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "rooms/gallery");

        const res = await fetch("/api/admin/rooms/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.publicUrl) {
          newUrls.push(data.publicUrl);
          newPaths.push(data.storagePath);
        }
      }

      setRoomForm((prev) => ({
        ...prev,
        gallery_images: [...(prev.gallery_images || []), ...newUrls],
        gallery_image_paths: [...(prev.gallery_image_paths || []), ...newPaths],
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gallery upload failed.";
      showAlert(msg, "Gallery Upload Error");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setRoomForm((prev) => {
      const nextUrls = [...(prev.gallery_images || [])];
      const nextPaths = [...(prev.gallery_image_paths || [])];
      const removedPath = nextPaths[index];

      nextUrls.splice(index, 1);
      nextPaths.splice(index, 1);

      return {
        ...prev,
        gallery_images: nextUrls,
        gallery_image_paths: nextPaths,
        removed_gallery_paths: removedPath
          ? [...(prev.removed_gallery_paths || []), removedPath]
          : prev.removed_gallery_paths,
      };
    });
  };

  const handleOpenCreateRoom = () => {
    setEditingRoomId(null);
    setRoomForm({
      ...initialRoomForm,
      order_rank: adminRooms.length + 1,
    });
    setCustomAmenityInput("");
    setShowRoomModal(true);
  };

  const handleOpenEditRoom = (r: DbRoom) => {
    setEditingRoomId(r.id);
    setRoomForm({
      name: r.name,
      slug: r.slug,
      description: r.description,
      full_description: r.full_description,
      price: Number(r.price),
      guests: r.guests,
      size: r.size,
      bed: r.bed,
      cover_image: r.cover_image,
      cover_image_path: r.cover_image_path,
      gallery_images: Array.isArray(r.gallery_images) ? r.gallery_images : [],
      gallery_image_paths: Array.isArray(r.gallery_image_paths) ? r.gallery_image_paths : [],
      removed_gallery_paths: [],
      amenities: Array.isArray(r.amenities) ? r.amenities : [],
      is_published: r.is_published,
      is_featured: Boolean(r.is_featured),
      order_rank: r.order_rank,
    });
    setCustomAmenityInput("");
    setShowRoomModal(true);
  };

  // Rooms Section Headlines CMS Handlers
  const handleSaveRoomsHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRoomsHeader(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/admin/rooms-header", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomsHeaderSettings),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to save rooms header settings.");
      }
      if (data.tableMissing) {
        setRoomsHeaderTableMissing(true);
        setActionMessage({
          type: "error",
          text: "Database table `rooms_header_settings` is not installed. Please run the SQL migration script.",
        });
        return;
      }
      setRoomsHeaderTableMissing(false);
      if (data.settings) {
        setRoomsHeaderSettings(data.settings);
        window.dispatchEvent(
          new CustomEvent("rooms-header-settings-updated", { detail: data.settings })
        );
      }
      setActionMessage({
        type: "success",
        text: "Homepage Rooms & Suites section headlines saved successfully!",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error saving rooms header settings.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setSavingRoomsHeader(false);
    }
  };

  const handleResetRoomsHeader = async () => {
    showConfirm(
      "Are you sure you want to revert the Homepage Rooms & Suites headlines back to the original default text?",
      async () => {
        setSavingRoomsHeader(true);
        setActionMessage(null);
        try {
          const res = await fetch("/api/admin/rooms-header", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "reset" }),
          });
          const data = await res.json();
          if (!res.ok || data.error) {
            throw new Error(data.error || "Failed to reset rooms header settings.");
          }
          if (data.settings) {
            setRoomsHeaderSettings(data.settings);
            window.dispatchEvent(
              new CustomEvent("rooms-header-settings-updated", { detail: data.settings })
            );
          }
          setActionMessage({
            type: "success",
            text: "Homepage Rooms & Suites section headlines reset to defaults.",
          });
        } catch (err: unknown) {
          const msg =
            err instanceof Error ? err.message : "Error resetting settings.";
          setActionMessage({ type: "error", text: msg });
        } finally {
          setSavingRoomsHeader(false);
        }
      },
      {
        title: "Reset Section Headlines to Arundra Defaults?",
      }
    );
  };

  const handleToggleFeatured = async (room: DbRoom) => {
    const currentFeaturedCount = adminRooms.filter((r) => r.is_featured).length;
    const newFeaturedState = !room.is_featured;

    if (newFeaturedState && currentFeaturedCount >= 3) {
      showAlert(
        "Maximum 3 rooms can be featured on the homepage. Please unfeature one of the existing 3 rooms first.",
        "Featured Limit Reached"
      );
      return;
    }

    setTogglingFeaturedId(room.id);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/rooms/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          is_featured: newFeaturedState,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update featured status.");

      setAdminRooms((prev) =>
        prev.map((r) =>
          r.id === room.id ? { ...r, is_featured: newFeaturedState } : r
        )
      );

      setActionMessage({
        type: "success",
        text: data.message || `Homepage featured status updated for '${room.name}'.`,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error updating featured status.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setTogglingFeaturedId(null);
    }
  };

  const handleAddAmenity = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (roomForm.amenities?.includes(trimmed)) return;
    setRoomForm((prev) => ({
      ...prev,
      amenities: [...(prev.amenities || []), trimmed],
    }));
    setCustomAmenityInput("");
  };

  const handleRemoveAmenity = (index: number) => {
    setRoomForm((prev) => ({
      ...prev,
      amenities: (prev.amenities || []).filter((_, i) => i !== index),
    }));
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.name?.trim()) {
      showAlert("Please enter a room name.", "Validation Error");
      return;
    }
    if (!roomForm.cover_image?.trim()) {
      showAlert("Please upload or provide a cover image.", "Validation Error");
      return;
    }

    if (roomForm.is_featured) {
      const currentFeaturedCount = adminRooms.filter(
        (r) => r.is_featured && r.id !== editingRoomId
      ).length;
      if (currentFeaturedCount >= 3) {
        showAlert(
          "Maximum 3 rooms can be featured on the homepage. Please unfeature one of the existing 3 rooms first.",
          "Featured Limit Reached"
        );
        return;
      }
    }

    setSavingRoom(true);
    setActionMessage(null);

    try {
      const url = editingRoomId
        ? `/api/admin/rooms/${editingRoomId}`
        : `/api/admin/rooms`;
      const method = editingRoomId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomForm),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.tableMissing) setRoomsTableMissing(true);
        throw new Error(data.error || "Failed to save room.");
      }

      setShowRoomModal(false);
      fetchAdminRooms();
      setActionMessage({
        type: "success",
        text: data.message || "Room saved successfully!",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving room.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setSavingRoom(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;
    setDeletingRoomId(roomToDelete.id);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/rooms/${roomToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete room.");

      setAdminRooms((prev) => prev.filter((r) => r.id !== roomToDelete.id));
      setShowDeleteRoomModal(false);
      setRoomToDelete(null);
      setActionMessage({
        type: "success",
        text: data.message || "Room deleted successfully.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete room.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setDeletingRoomId(null);
    }
  };

  const handleSeedRooms = async () => {
    setIsSeedingRooms(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/rooms/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        if (data.tableMissing) setRoomsTableMissing(true);
        throw new Error(data.error || "Failed to seed default rooms.");
      }

      fetchAdminRooms();
      setActionMessage({
        type: "success",
        text: "Default rooms successfully seeded into database!",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error seeding rooms.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setIsSeedingRooms(false);
    }
  };

  // Save footer settings
  const handleSaveFooter = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingFooter(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(footerSettings),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.tableMissing) {
          setFooterTableMissing(true);
        }
        throw new Error(data.error || "Failed to update footer settings.");
      }

      setFooterSettings(data.settings);
      setFooterTableMissing(false);
      setActionMessage({
        type: "success",
        text: "Hotel footer and contact details updated successfully! Live changes are now synced.",
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("footer-settings-updated", { detail: data.settings })
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update footer settings.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setSavingFooter(false);
    }
  };

  // Reset footer settings
  const handleResetFooter = async () => {
    setSavingFooter(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/footer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.tableMissing) {
          setFooterTableMissing(true);
        }
        throw new Error(data.error || "Failed to reset footer settings.");
      }

      setFooterSettings(data.settings);
      setFooterTableMissing(false);
      setShowResetConfirmModal(false);
      setActionMessage({
        type: "success",
        text: "Footer settings have been reset to Arundra defaults.",
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("footer-settings-updated", { detail: data.settings })
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to reset footer settings.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setSavingFooter(false);
    }
  };

  // Explore Links CRUD handlers
  const handleAddExploreLink = () => {
    if (!newExploreLabel.trim() || !newExploreUrl.trim()) return;
    setFooterSettings((prev) => ({
      ...prev,
      explore_links: [
        ...(prev.explore_links || []),
        { label: newExploreLabel.trim(), url: newExploreUrl.trim() },
      ],
    }));
    setNewExploreLabel("");
    setNewExploreUrl("");
  };

  const handleRemoveExploreLink = (index: number) => {
    setFooterSettings((prev) => ({
      ...prev,
      explore_links: (prev.explore_links || []).filter((_, i) => i !== index),
    }));
  };

  const handleUpdateExploreLink = (
    index: number,
    field: "label" | "url",
    val: string
  ) => {
    setFooterSettings((prev) => {
      const nextLinks = [...(prev.explore_links || [])];
      nextLinks[index] = { ...nextLinks[index], [field]: val };
      return { ...prev, explore_links: nextLinks };
    });
  };

  const handleMoveExploreLink = (
    index: number,
    direction: "up" | "down"
  ) => {
    setFooterSettings((prev) => {
      const links = prev.explore_links || [];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= links.length) return prev;
      const nextLinks = [...links];
      const temp = nextLinks[index];
      nextLinks[index] = nextLinks[targetIndex];
      nextLinks[targetIndex] = temp;
      return { ...prev, explore_links: nextLinks };
    });
  };

  // Hero Carousel Banners CMS Handlers
  const handleOpenCreateBanner = () => {
    setEditingBannerId(null);
    setBannerForm({
      ...initialBannerForm,
      order_rank: adminBanners.length + 1,
    });
    setShowBannerModal(true);
  };

  const handleOpenEditBanner = (b: DbHeroSlide) => {
    setEditingBannerId(b.id);
    setBannerForm({
      title: b.title,
      eyebrow: b.eyebrow || "",
      description: b.description || "",
      button_text: b.button_text || "Reserve Your Suite",
      button_link: b.button_link || "/rooms",
      image_url: b.image_url,
      image_path: b.image_path || null,
      is_active: b.is_active,
      order_rank: b.order_rank,
      old_image_path: b.image_path || null,
    });
    setShowBannerModal(true);
  };

  const handleUploadBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    setActionMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/hero-slides/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload banner image");
      }

      const uploadedUrl = data.url || data.publicUrl;
      const uploadedPath = data.path || data.storagePath;

      if (!uploadedUrl) {
        throw new Error("Upload succeeded but no image URL was returned.");
      }

      setBannerForm((prev) => ({
        ...prev,
        image_url: uploadedUrl,
        image_path: uploadedPath || null,
      }));

      setActionMessage({
        type: "success",
        text: "Banner photo uploaded to Supabase Storage successfully!",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setUploadingBanner(false);
      e.target.value = "";
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title?.trim()) {
      showAlert("Please provide a promo headline for the banner.", "Validation Error");
      return;
    }
    if (!bannerForm.image_url?.trim()) {
      showAlert("Please upload a background photo for this banner slide.", "Validation Error");
      return;
    }

    setSavingBanner(true);
    setActionMessage(null);

    try {
      const endpoint = editingBannerId
        ? `/api/admin/hero-slides/${editingBannerId}`
        : `/api/admin/hero-slides`;
      const method = editingBannerId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bannerForm),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.tableMissing) {
          setBannersTableMissing(true);
        }
        throw new Error(data.error || "Failed to save banner slide.");
      }

      setShowBannerModal(false);
      setEditingBannerId(null);
      await fetchAdminBanners();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hero-slides-updated"));
      }

      setActionMessage({
        type: "success",
        text: editingBannerId
          ? "Banner slide updated successfully!"
          : "New banner slide published successfully!",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save banner slide.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setSavingBanner(false);
    }
  };

  const handleToggleBannerActive = async (banner: DbHeroSlide) => {
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/hero-slides/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !banner.is_active }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update banner status.");
      }

      setAdminBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, is_active: !banner.is_active } : b))
      );

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hero-slides-updated"));
      }

      setActionMessage({
        type: "success",
        text: !banner.is_active
          ? `Banner "${banner.title}" is now active on the homepage.`
          : `Banner "${banner.title}" is now set to draft.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle banner status.";
      setActionMessage({ type: "error", text: msg });
    }
  };

  const handleReorderBanner = async (slideId: string, direction: "up" | "down") => {
    setReorderingBannerId(slideId);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/hero-slides/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideId, direction }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reorder banner.");
      }

      await fetchAdminBanners();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hero-slides-updated"));
      }

      setActionMessage({
        type: "success",
        text: `Banner sequence shifted ${direction === "up" ? "higher" : "lower"} successfully.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change banner sequence.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setReorderingBannerId(null);
    }
  };

  const handleConfirmDeleteBanner = (b: DbHeroSlide) => {
    setBannerToDelete(b);
    setShowDeleteBannerModal(true);
  };

  const handleDeleteBanner = async () => {
    if (!bannerToDelete) return;
    setDeletingBannerId(bannerToDelete.id);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/hero-slides/${bannerToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete banner slide.");
      }

      setShowDeleteBannerModal(false);
      setBannerToDelete(null);
      await fetchAdminBanners();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hero-slides-updated"));
      }

      setActionMessage({
        type: "success",
        text: "Banner slide and associated storage files deleted successfully.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete banner.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setDeletingBannerId(null);
    }
  };

  const handleSeedBanners = async () => {
    showConfirm(
      "Load default luxury hero carousel banners into the database? Existing custom slides will remain.",
      async () => {
        setIsSeedingBanners(true);
        setActionMessage(null);

        try {
          const res = await fetch("/api/admin/hero-slides/seed", {
            method: "POST",
          });

          const data = await res.json();
          if (!res.ok) {
            if (data.tableMissing) {
              setBannersTableMissing(true);
            }
            throw new Error(data.error || "Failed to seed hero banners.");
          }

          setBannersTableMissing(false);
          await fetchAdminBanners();

          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("hero-slides-updated"));
          }

          setActionMessage({
            type: "success",
            text: data.message || "Default hero banners successfully seeded!",
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to seed banners.";
          setActionMessage({ type: "error", text: msg });
        } finally {
          setIsSeedingBanners(false);
        }
      },
      {
        title: "Load Default Hero Banners",
        confirmText: "Load Defaults",
      }
    );
  };

  // The Difference Section Handlers
  const handleSaveDifference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!differenceSettings.title?.trim()) {
      showAlert("Please provide a section headline.", "Validation Error");
      return;
    }

    setSavingDifference(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/difference", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(differenceSettings),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.tableMissing) {
          setDifferenceTableMissing(true);
        }
        throw new Error(data.error || "Failed to save difference settings.");
      }

      setDifferenceSettings(data.settings);
      setDifferenceTableMissing(false);
      setActionMessage({
        type: "success",
        text: "The Difference section settings saved successfully!",
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("difference-settings-updated", { detail: data.settings })
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save difference settings.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setSavingDifference(false);
    }
  };

  const handleResetDifference = async () => {
    setSavingDifference(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/difference", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.tableMissing) {
          setDifferenceTableMissing(true);
        }
        throw new Error(data.error || "Failed to reset difference settings.");
      }

      setDifferenceSettings(data.settings);
      setDifferenceTableMissing(false);
      setShowResetDifferenceModal(false);
      setActionMessage({
        type: "success",
        text: "The Difference section has been reset to Arundra defaults.",
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("difference-settings-updated", { detail: data.settings })
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to reset difference settings.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setSavingDifference(false);
    }
  };

  const handleAddDifferenceItem = () => {
    const nextCount = (differenceSettings.items || []).length + 1;
    const newItem: DifferenceItem = {
      number: String(nextCount).padStart(2, "0"),
      title: "New Distinction",
      description: "Describe this signature experience or hospitality standard.",
    };

    setDifferenceSettings((prev) => ({
      ...prev,
      items: [...(prev.items || []), newItem],
    }));
  };

  const handleRemoveDifferenceItem = (index: number) => {
    if ((differenceSettings.items || []).length <= 1) {
      showAlert("At least 1 feature pillar must remain.", "Pillars Requirement");
      return;
    }

    setDifferenceSettings((prev) => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index),
    }));
  };

  const handleUpdateDifferenceItem = (
    index: number,
    field: keyof DifferenceItem,
    val: string
  ) => {
    setDifferenceSettings((prev) => {
      const nextItems = [...(prev.items || [])];
      nextItems[index] = { ...nextItems[index], [field]: val };
      return { ...prev, items: nextItems };
    });
  };

  const handleMoveDifferenceItem = (
    index: number,
    direction: "up" | "down"
  ) => {
    setDifferenceSettings((prev) => {
      const items = prev.items || [];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;

      const nextItems = [...items];
      const temp = nextItems[index];
      nextItems[index] = nextItems[targetIndex];
      nextItems[targetIndex] = temp;

      return { ...prev, items: nextItems };
    });
  };

  // The Escape Section Handlers
  const handleUploadEscapeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingEscape(true);
    setActionMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/escape/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      const uploadedUrl = data.url || data.publicUrl;
      const uploadedPath = data.path || data.storagePath;

      if (!uploadedUrl) {
        throw new Error("Upload succeeded but no image URL was returned.");
      }

      setEscapeSettings((prev) => ({
        ...prev,
        image_url: uploadedUrl,
        image_path: uploadedPath || null,
      }));

      setActionMessage({
        type: "success",
        text: "Escape banner photo uploaded to Supabase Storage successfully!",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setUploadingEscape(false);
      e.target.value = "";
    }
  };

  const handleSaveEscape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escapeSettings.title_line1?.trim()) {
      showAlert("Please provide a primary headline.", "Validation Error");
      return;
    }

    setSavingEscape(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/escape", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(escapeSettings),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.tableMissing) {
          setEscapeTableMissing(true);
        }
        throw new Error(data.error || "Failed to save escape banner settings.");
      }

      setEscapeSettings(data.settings);
      setEscapeTableMissing(false);
      setActionMessage({
        type: "success",
        text: "Escape banner settings saved successfully!",
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("escape-settings-updated", { detail: data.settings })
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save escape settings.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setSavingEscape(false);
    }
  };

  const handleResetEscape = async () => {
    setSavingEscape(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/escape", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.tableMissing) {
          setEscapeTableMissing(true);
        }
        throw new Error(data.error || "Failed to reset escape banner settings.");
      }

      setEscapeSettings(data.settings);
      setEscapeTableMissing(false);
      setShowResetEscapeModal(false);
      setActionMessage({
        type: "success",
        text: "Escape banner has been reset to Arundra defaults.",
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("escape-settings-updated", { detail: data.settings })
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to reset escape settings.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setSavingEscape(false);
    }
  };

  // Why Book (Trust Badges) Section Handlers
  const handleSaveWhyBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((whyBookSettings.items || []).length === 0) {
      showAlert("Please keep at least 1 trust badge item.", "Badges Requirement");
      return;
    }

    setSavingWhyBook(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/why-book", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(whyBookSettings),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.tableMissing) {
          setWhyBookTableMissing(true);
        }
        throw new Error(data.error || "Failed to save why book settings.");
      }

      setWhyBookSettings(data.settings);
      setWhyBookTableMissing(false);
      setActionMessage({
        type: "success",
        text: "Why Book trust badges saved successfully!",
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("why-book-settings-updated", { detail: data.settings })
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save why book settings.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setSavingWhyBook(false);
    }
  };

  const handleResetWhyBook = async () => {
    setSavingWhyBook(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/why-book", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.tableMissing) {
          setWhyBookTableMissing(true);
        }
        throw new Error(data.error || "Failed to reset why book settings.");
      }

      setWhyBookSettings(data.settings);
      setWhyBookTableMissing(false);
      setShowResetWhyBookModal(false);
      setActionMessage({
        type: "success",
        text: "Why Book trust badges have been reset to Arundra defaults.",
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("why-book-settings-updated", { detail: data.settings })
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to reset why book settings.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setSavingWhyBook(false);
    }
  };

  const handleAddWhyBookItem = () => {
    const newItem: WhyBookItem = {
      icon: "Crown",
      title: "Signature Benefit",
      description: "Description of this luxury hospitality standard or convenience.",
    };

    setWhyBookSettings((prev) => ({
      ...prev,
      items: [...(prev.items || []), newItem],
    }));
  };

  const handleRemoveWhyBookItem = (index: number) => {
    if ((whyBookSettings.items || []).length <= 1) {
      showAlert("At least 1 trust badge item must remain.", "Badges Requirement");
      return;
    }

    setWhyBookSettings((prev) => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index),
    }));
  };

  const handleUpdateWhyBookItem = (
    index: number,
    field: keyof WhyBookItem,
    val: string
  ) => {
    setWhyBookSettings((prev) => {
      const nextItems = [...(prev.items || [])];
      nextItems[index] = { ...nextItems[index], [field]: val };
      return { ...prev, items: nextItems };
    });
  };

  const handleMoveWhyBookItem = (
    index: number,
    direction: "up" | "down"
  ) => {
    setWhyBookSettings((prev) => {
      const items = prev.items || [];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;

      const nextItems = [...items];
      const temp = nextItems[index];
      nextItems[index] = nextItems[targetIndex];
      nextItems[targetIndex] = temp;

      return { ...prev, items: nextItems };
    });
  };

  // Hospitality (The Art of Hospitality) Handlers
  const handleUploadHospitalityFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHospitality(true);
    setActionMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/hospitality/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      const uploadedUrl = data.url || data.publicUrl;
      const uploadedPath = data.path || data.storagePath;

      if (!uploadedUrl) {
        throw new Error("Upload succeeded but no image URL was returned.");
      }

      setHospitalitySettings((prev) => ({
        ...prev,
        image_url: uploadedUrl,
        image_path: uploadedPath || null,
      }));

      setActionMessage({
        type: "success",
        text: "Hospitality photo uploaded to Supabase Storage successfully!",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setUploadingHospitality(false);
      e.target.value = "";
    }
  };

  const handleSaveHospitality = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalitySettings.title_line1?.trim()) {
      showAlert("Please provide at least the primary headline line.", "Validation Error");
      return;
    }

    setSavingHospitality(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/hospitality", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hospitalitySettings),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.tableMissing) {
          setHospitalityTableMissing(true);
        }
        throw new Error(data.error || "Failed to save hospitality settings.");
      }

      setHospitalitySettings(data.settings);
      setHospitalityTableMissing(false);
      setActionMessage({
        type: "success",
        text: "Hospitality section settings saved successfully!",
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("hospitality-settings-updated", {
            detail: data.settings,
          })
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save hospitality settings.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setSavingHospitality(false);
    }
  };

  const handleResetHospitality = async () => {
    setSavingHospitality(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/hospitality", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.tableMissing) {
          setHospitalityTableMissing(true);
        }
        throw new Error(data.error || "Failed to reset hospitality settings.");
      }

      setHospitalitySettings(data.settings);
      setHospitalityTableMissing(false);
      setShowResetHospitalityModal(false);
      setActionMessage({
        type: "success",
        text: "The Art of Hospitality section has been reset to Arundra defaults.",
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("hospitality-settings-updated", {
            detail: data.settings,
          })
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to reset hospitality settings.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setSavingHospitality(false);
    }
  };

  // Copy helper
  const copyToClipboard = async (
    text: string,
    id: string,
    type:
      | "sql"
      | "banner-sql"
      | "diff-sql"
      | "escape-sql"
      | "why-book-sql"
      | "hospitality-sql"
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setCopiedType(type);
      setTimeout(() => {
        setCopiedId(null);
        setCopiedType(null);
      }, 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  // Update member role
  const handleUpdateRole = async (targetUserId: string, newRole: UserRole) => {
    if (!configured) return;
    setUpdatingId(targetUserId);
    setActionMessage(null);

    try {
      const supabase = createClient();
      const { error } = await (supabase.from("profiles") as any)
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("id", targetUserId);

      if (error) {
        setActionMessage({
          type: "error",
          text: `Failed to update role: ${error.message}`,
        });
      } else {
        setActionMessage({
          type: "success",
          text: `User role has been successfully updated to '${newRole}'.`,
        });
        setProfiles((prev) =>
          prev.map((p) => (p.id === targetUserId ? { ...p, role: newRole } : p))
        );
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update role.";
      setActionMessage({
        type: "error",
        text: message,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete user account (strictly restricted to non-admin accounts)
  const handleDeleteUser = async (targetUserId: string, targetName: string) => {
    setDeletingUserId(targetUserId);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/members/${targetUserId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user account.");
      }

      setActionMessage({
        type: "success",
        text:
          data.message ||
          `Account for "${targetName}" has been successfully deleted.`,
      });

      // Update local profiles list
      setProfiles((prev) => prev.filter((p) => p.id !== targetUserId));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete user account.";
      setActionMessage({
        type: "error",
        text: message,
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const confirmDeleteUser = (p: Profile) => {
    if (p.role === "admin") {
      showAlert(
        "Arundra Administrative Protection: Administrator accounts cannot be deleted.",
        "Action Forbidden"
      );
      return;
    }

    showConfirm(
      `Are you sure you want to permanently delete the account for "${
        p.full_name || p.email
      }"?\n\nThis will permanently remove their authentication credentials, profile data, and system access. This action cannot be undone.`,
      () => handleDeleteUser(p.id, p.full_name || p.email),
      {
        title: "Delete Member Account",
        confirmText: "Yes, Delete Account",
        cancelText: "Keep Account",
        danger: true,
      }
    );
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f6f1]">
        <div className="flex flex-col items-center gap-3 text-[#4a382d]">
          <Loader2 size={36} className="animate-spin text-[#a58b72]" />
          <p className="text-sm font-medium tracking-wide">
            Loading Arundra Signature Admin Portal...
          </p>
        </div>
      </main>
    );
  }

  // Not logged in or not admin
  if (!user || !isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f6f1] px-6">
        <div className="w-full max-w-md rounded-2xl border border-[#ded5c8] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fbf3e8] text-[#9b6826]">
            <AlertTriangle size={32} />
          </div>

          <p className="mt-6 text-xs font-semibold tracking-[0.3em] text-[#a58b72]">
            ACCESS RESTRICTED
          </p>

          <h1 className="mt-2 text-2xl font-serif text-[#4a382d]">
            Arundra Administrative Personnel Only
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#777064]">
            This portal is strictly reserved for authorized management personnel with{" "}
            <span className="font-semibold text-[#4a382d]">Admin</span> privileges.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  href="/"
                  className="cursor-pointer rounded-lg bg-[#4a382d] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#655043]"
                >
                  Return to Website
                </Link>
                <button
                  type="button"
                  onClick={() => signOut().then(() => router.push("/"))}
                  className="cursor-pointer rounded-lg border border-[#ded5c8] px-5 py-3 text-sm font-medium text-[#777064] transition hover:bg-[#f8f6f1]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="cursor-pointer rounded-lg bg-[#4a382d] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#655043]"
              >
                Sign In as Administrator
              </Link>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Filter profiles
  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone && p.phone.includes(searchQuery));
    const matchesRole = roleFilter === "all" || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalAdmins = profiles.filter((p) => p.role === "admin").length;
  const totalUsers = profiles.filter((p) => p.role === "user").length;

  return (
    <div className="min-h-screen bg-[#f8f6f1] text-[#292722]">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#ded5c8] bg-white shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="cursor-pointer flex items-center gap-2 text-xs text-[#777064] hover:text-[#4a382d]"
            >
              <ArrowLeft size={16} />
              Return to Website
            </Link>

            <div className="h-4 w-px bg-[#ded5c8]" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-medium tracking-[0.08em] text-[#4a382d]">
                  Arundra Signature
                </span>
                <span className="rounded-full bg-[#4a382d] px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#e0c6a5]">
                  ADMIN PORTAL
                </span>
              </div>
              <p className="text-[10px] tracking-[0.25em] text-[#a58b72]">
                HOTEL & RESIDENCE MANAGEMENT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="cursor-pointer hidden text-right sm:block p-1.5 -m-1.5 rounded-lg hover:bg-[#f8f6f1] transition group"
              title="View & Edit Profile"
            >
              <p className="text-sm font-medium text-[#4a382d] group-hover:text-[#a58b72] transition">
                {profile?.full_name || user.email}
              </p>
              <p className="text-xs text-[#a58b72]">Hotel Administrator (Edit Profile →)</p>
            </Link>

            <button
              onClick={() => signOut().then(() => router.push("/"))}
              className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-[#ded5c8] px-3.5 py-2 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1] hover:text-[#4a382d]"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* STATS OVERVIEW */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-[#ded5c8] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-[#777064]">
                Total Registered Members
              </span>
              <div className="rounded-lg bg-[#f4ede4] p-2 text-[#4a382d]">
                <Users size={18} />
              </div>
            </div>
            <p className="mt-4 text-3xl font-semibold text-[#4a382d]">
              {profiles.length}
            </p>
            <p className="mt-1 text-xs text-[#777064]">
              Hotel guests & active staff
            </p>
          </div>

          <div className="rounded-xl border border-[#ded5c8] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-[#777064]">
                Hotel Guests
              </span>
              <div className="rounded-lg bg-[#eef8f1] p-2 text-[#155724]">
                <Users size={18} />
              </div>
            </div>
            <p className="mt-4 text-3xl font-semibold text-[#155724]">
              {totalUsers}
            </p>
            <p className="mt-1 text-xs text-[#777064]">Active reservation guests</p>
          </div>

          <div className="rounded-xl border border-[#ded5c8] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-[#777064]">
                Administrative Staff
              </span>
              <div className="rounded-lg bg-[#fbf3e8] p-2 text-[#9b6826]">
                <ShieldCheck size={18} />
              </div>
            </div>
            <p className="mt-4 text-3xl font-semibold text-[#9b6826]">
              {totalAdmins}
            </p>
            <p className="mt-1 text-xs text-[#777064]">
              Authorized management personnel
            </p>
          </div>
        </section>

        {/* FEEDBACK BANNER */}
        {actionMessage && (
          <div
            className={`mt-6 flex items-center justify-between rounded-lg border p-4 text-sm ${
              actionMessage.type === "success"
                ? "border-[#c3e6cb] bg-[#eef8f1] text-[#155724]"
                : "border-[#e7c7bd] bg-[#fbefeb] text-[#984b3b]"
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === "success" ? (
                <CheckCircle size={18} />
              ) : (
                <AlertTriangle size={18} />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="cursor-pointer text-xs font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* NAVIGATION TABS (CATEGORIZED, FLEX-WRAPPED, NO OVERFLOW) */}
        <div className="mt-8 space-y-4">
          {/* CATEGORY SELECTOR & QUICK JUMP */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#ded5c8] pb-3">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a58b72] mr-1 hidden md:inline">
                Category:
              </span>

              <button
                type="button"
                onClick={() => setTabCategory("all")}
                className={`cursor-pointer inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  tabCategory === "all"
                    ? "bg-[#4a382d] text-white shadow-xs"
                    : "bg-[#f4ede4] text-[#62594f] hover:bg-[#e9dfd1]"
                }`}
              >
                <span>All Features</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    tabCategory === "all"
                      ? "bg-white/20 text-white"
                      : "bg-[#ded5c8] text-[#4a382d]"
                  }`}
                >
                  11
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTabCategory("homepage");
                  if (
                    ![
                      "banners",
                      "hospitality",
                      "difference",
                      "escape",
                      "why-book",
                    ].includes(activeTab)
                  ) {
                    setActiveTab("banners");
                  }
                }}
                className={`cursor-pointer inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  tabCategory === "homepage"
                    ? "bg-[#4a382d] text-white shadow-xs"
                    : "bg-[#f4ede4] text-[#62594f] hover:bg-[#e9dfd1]"
                }`}
              >
                <Globe size={13} />
                <span>Homepage CMS</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    tabCategory === "homepage"
                      ? "bg-white/20 text-white"
                      : "bg-[#ded5c8] text-[#4a382d]"
                  }`}
                >
                  5
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTabCategory("hotel");
                  if (!["rooms", "footer", "experience", "offers"].includes(activeTab)) {
                    setActiveTab("rooms");
                  }
                }}
                className={`cursor-pointer inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  tabCategory === "hotel"
                    ? "bg-[#4a382d] text-white shadow-xs"
                    : "bg-[#f4ede4] text-[#62594f] hover:bg-[#e9dfd1]"
                }`}
              >
                <BedDouble size={13} />
                <span>Rooms & Hotel</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    tabCategory === "hotel"
                      ? "bg-white/20 text-white"
                      : "bg-[#ded5c8] text-[#4a382d]"
                  }`}
                >
                  4
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTabCategory("access");
                  if (!["members", "auth-pages"].includes(activeTab)) {
                    setActiveTab("members");
                  }
                }}
                className={`cursor-pointer inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  tabCategory === "access"
                    ? "bg-[#4a382d] text-white shadow-xs"
                    : "bg-[#f4ede4] text-[#62594f] hover:bg-[#e9dfd1]"
                }`}
              >
                <ShieldCheck size={13} />
                <span>Access & Team</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    tabCategory === "access"
                      ? "bg-white/20 text-white"
                      : "bg-[#ded5c8] text-[#4a382d]"
                  }`}
                >
                  2
                </span>
              </button>
            </div>

            {/* Quick Jump Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#a58b72] hidden lg:inline whitespace-nowrap">
                Quick Jump:
              </span>
              <select
                id="adminTabSelector"
                value={activeTab}
                onChange={(e) => {
                  const target = e.target.value as any;
                  setActiveTab(target);
                }}
                className="cursor-pointer w-full sm:w-auto rounded-lg border border-[#ded5c8] bg-white px-3 py-1.5 text-xs font-medium text-[#4a382d] shadow-2xs focus:border-[#4a382d] focus:outline-none"
              >
                <optgroup label="Homepage Content (CMS)">
                  <option value="banners">Hero Banners CMS</option>
                  <option value="hospitality">The Art of Hospitality</option>
                  <option value="difference">The Arundra Difference</option>
                  <option value="escape">Escape Banner (CTA)</option>
                  <option value="why-book">Why Book / Badges</option>
                </optgroup>
                <optgroup label="Rooms & Hotel Facilities">
                  <option value="rooms">Rooms & Suites CMS</option>
                  <option value="experience">Experience Page CMS</option>
                  <option value="offers">Offers & Packages CMS</option>
                  <option value="footer">Footer, Info & Hanging Tag</option>
                </optgroup>
                <optgroup label="Management & Access">
                  <option value="members">Member Directory & Roles</option>
                  <option value="auth-pages">Login &amp; Register CMS</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* ACTIVE TAB PILLS (FLEX-WRAP, WON'T OVERFLOW) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Members & Roles */}
            {(tabCategory === "all" || tabCategory === "access") && (
              <button
                type="button"
                onClick={() => setActiveTab("members")}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                  activeTab === "members"
                    ? "bg-[#4a382d] text-white shadow-xs ring-1 ring-[#4a382d]"
                    : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:bg-[#fbf9f5] hover:text-[#4a382d]"
                }`}
              >
                <Users
                  size={15}
                  className={activeTab === "members" ? "text-[#e0c6a5]" : "text-[#a58b72]"}
                />
                <span>Member Directory</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === "members"
                      ? "bg-white/20 text-white"
                      : "bg-[#f4ede4] text-[#62594f]"
                  }`}
                >
                  {profiles.length}
                </span>
              </button>
            )}

            {/* 3. Rooms & Suites */}
            {(tabCategory === "all" || tabCategory === "hotel") && (
              <button
                type="button"
                onClick={() => setActiveTab("rooms")}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                  activeTab === "rooms"
                    ? "bg-[#4a382d] text-white shadow-xs ring-1 ring-[#4a382d]"
                    : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:bg-[#fbf9f5] hover:text-[#4a382d]"
                }`}
              >
                <BedDouble
                  size={15}
                  className={activeTab === "rooms" ? "text-[#e0c6a5]" : "text-[#a58b72]"}
                />
                <span>Rooms & Suites CMS</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === "rooms"
                      ? "bg-white/20 text-white"
                      : "bg-[#f4ede4] text-[#62594f]"
                  }`}
                >
                  {adminRooms.length}
                </span>
              </button>
            )}

            {/* 4. Hero Banners */}
            {(tabCategory === "all" || tabCategory === "homepage") && (
              <button
                type="button"
                onClick={() => setActiveTab("banners")}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                  activeTab === "banners"
                    ? "bg-[#4a382d] text-white shadow-xs ring-1 ring-[#4a382d]"
                    : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:bg-[#fbf9f5] hover:text-[#4a382d]"
                }`}
              >
                <SlidersHorizontal
                  size={15}
                  className={activeTab === "banners" ? "text-[#e0c6a5]" : "text-[#a58b72]"}
                />
                <span>Hero Banners CMS</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === "banners"
                      ? "bg-white/20 text-white"
                      : "bg-[#f4ede4] text-[#62594f]"
                  }`}
                >
                  {adminBanners.length}
                </span>
              </button>
            )}

            {/* 5. The Art of Hospitality */}
            {(tabCategory === "all" || tabCategory === "homepage") && (
              <button
                type="button"
                onClick={() => setActiveTab("hospitality")}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                  activeTab === "hospitality"
                    ? "bg-[#4a382d] text-white shadow-xs ring-1 ring-[#4a382d]"
                    : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:bg-[#fbf9f5] hover:text-[#4a382d]"
                }`}
              >
                <Award
                  size={15}
                  className={activeTab === "hospitality" ? "text-[#e0c6a5]" : "text-[#a58b72]"}
                />
                <span>Experience Gateway CMS</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === "hospitality"
                      ? "bg-white/20 text-white"
                      : "bg-[#f4ede4] text-[#62594f]"
                  }`}
                >
                  Gateway
                </span>
              </button>
            )}

            {/* 6. The Difference */}
            {(tabCategory === "all" || tabCategory === "homepage") && (
              <button
                type="button"
                onClick={() => setActiveTab("difference")}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                  activeTab === "difference"
                    ? "bg-[#4a382d] text-white shadow-xs ring-1 ring-[#4a382d]"
                    : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:bg-[#fbf9f5] hover:text-[#4a382d]"
                }`}
              >
                <Award
                  size={15}
                  className={activeTab === "difference" ? "text-[#e0c6a5]" : "text-[#a58b72]"}
                />
                <span>The Difference CMS</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === "difference"
                      ? "bg-white/20 text-white"
                      : "bg-[#f4ede4] text-[#62594f]"
                  }`}
                >
                  {differenceSettings.items?.length || 3}
                </span>
              </button>
            )}

            {/* 7. Escape Banner */}
            {(tabCategory === "all" || tabCategory === "homepage") && (
              <button
                type="button"
                onClick={() => setActiveTab("escape")}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                  activeTab === "escape"
                    ? "bg-[#4a382d] text-white shadow-xs ring-1 ring-[#4a382d]"
                    : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:bg-[#fbf9f5] hover:text-[#4a382d]"
                }`}
              >
                <Compass
                  size={15}
                  className={activeTab === "escape" ? "text-[#e0c6a5]" : "text-[#a58b72]"}
                />
                <span>Escape Banner CMS</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === "escape"
                      ? "bg-white/20 text-white"
                      : "bg-[#f4ede4] text-[#62594f]"
                  }`}
                >
                  CTA
                </span>
              </button>
            )}

            {/* 8. Why Book Badges */}
            {(tabCategory === "all" || tabCategory === "homepage") && (
              <button
                type="button"
                onClick={() => setActiveTab("why-book")}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                  activeTab === "why-book"
                    ? "bg-[#4a382d] text-white shadow-xs ring-1 ring-[#4a382d]"
                    : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:bg-[#fbf9f5] hover:text-[#4a382d]"
                }`}
              >
                <ShieldCheck
                  size={15}
                  className={activeTab === "why-book" ? "text-[#e0c6a5]" : "text-[#a58b72]"}
                />
                <span>Why Book / Badges</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === "why-book"
                      ? "bg-white/20 text-white"
                      : "bg-[#f4ede4] text-[#62594f]"
                  }`}
                >
                  {whyBookSettings.items?.length || 3}
                </span>
              </button>
            )}

            {/* 9. Footer & Info */}
            {(tabCategory === "all" || tabCategory === "hotel") && (
              <button
                type="button"
                onClick={() => setActiveTab("footer")}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                  activeTab === "footer"
                    ? "bg-[#4a382d] text-white shadow-xs ring-1 ring-[#4a382d]"
                    : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:bg-[#fbf9f5] hover:text-[#4a382d]"
                }`}
              >
                <Building2
                  size={15}
                  className={activeTab === "footer" ? "text-[#e0c6a5]" : "text-[#a58b72]"}
                />
                <span>Footer & Hanging Tag</span>
              </button>
            )}
            {/* 10. Experience Page CMS */}
            {(tabCategory === "all" || tabCategory === "hotel") && (
              <button
                type="button"
                onClick={() => setActiveTab("experience")}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                  activeTab === "experience"
                    ? "bg-[#4a382d] text-white shadow-xs ring-1 ring-[#4a382d]"
                    : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:bg-[#fbf9f5] hover:text-[#4a382d]"
                }`}
              >
                <Compass
                  size={15}
                  className={activeTab === "experience" ? "text-[#e0c6a5]" : "text-[#a58b72]"}
                />
                <span>Experience Page CMS</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === "experience"
                      ? "bg-white/20 text-white"
                      : "bg-[#f4ede4] text-[#62594f]"
                  }`}
                >
                  3 Sections
                </span>
              </button>
            )}

            {/* 11. Offers & Packages CMS */}
            {(tabCategory === "all" || tabCategory === "hotel") && (
              <button
                type="button"
                onClick={() => setActiveTab("offers")}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                  activeTab === "offers"
                    ? "bg-[#4a382d] text-white shadow-xs ring-1 ring-[#4a382d]"
                    : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:bg-[#fbf9f5] hover:text-[#4a382d]"
                }`}
              >
                <Gift
                  size={15}
                  className={activeTab === "offers" ? "text-[#e0c6a5]" : "text-[#a58b72]"}
                />
                <span>Offers & Packages CMS</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === "offers"
                      ? "bg-white/20 text-white"
                      : "bg-[#f4ede4] text-[#62594f]"
                  }`}
                >
                  Offers
                </span>
              </button>
            )}

            {/* 12. Login & Register CMS */}
            {(tabCategory === "all" || tabCategory === "hotel" || tabCategory === "access") && (
              <button
                type="button"
                onClick={() => setActiveTab("auth-pages")}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                  activeTab === "auth-pages"
                    ? "bg-[#4a382d] text-white shadow-xs ring-1 ring-[#4a382d]"
                    : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:bg-[#fbf9f5] hover:text-[#4a382d]"
                }`}
              >
                <LogIn
                  size={15}
                  className={activeTab === "auth-pages" ? "text-[#e0c6a5]" : "text-[#a58b72]"}
                />
                <span>Login &amp; Register CMS</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === "auth-pages"
                      ? "bg-white/20 text-white"
                      : "bg-[#f4ede4] text-[#62594f]"
                  }`}
                >
                  2 Pages
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* MEMBER DIRECTORY & ROLE MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === "members" && (
          <section className="mt-6 rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-serif text-[#4a382d]">
                  Member Directory & Role Management
                </h2>
                <p className="mt-1 text-xs text-[#777064]">
                  Manage access credentials between Hotel Guests and Arundra Signature Administrative Staff.
                </p>
              </div>

              <button
                onClick={fetchAllProfiles}
                disabled={loadingProfiles}
                className="cursor-pointer inline-flex items-center gap-2 self-start rounded-lg border border-[#ded5c8] bg-[#f8f6f1] px-4 py-2 text-xs font-medium text-[#4a382d] hover:bg-[#eee7dc] disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={loadingProfiles ? "animate-spin" : ""}
                />
                Refresh Directory
              </button>
            </div>

            {/* SEARCH & FILTERS */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa198]"
                />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] py-2.5 pl-10 pr-4 text-xs text-[#292722] placeholder:text-[#aaa198] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRoleFilter("all")}
                  className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-medium transition ${
                    roleFilter === "all"
                      ? "bg-[#4a382d] text-white"
                      : "border border-[#ded5c8] bg-white text-[#777064] hover:bg-[#f8f6f1]"
                  }`}
                >
                  All ({profiles.length})
                </button>
                <button
                  onClick={() => setRoleFilter("user")}
                  className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-medium transition ${
                    roleFilter === "user"
                      ? "bg-[#4a382d] text-white"
                      : "border border-[#ded5c8] bg-white text-[#777064] hover:bg-[#f8f6f1]"
                  }`}
                >
                  Hotel Guests ({totalUsers})
                </button>
                <button
                  onClick={() => setRoleFilter("admin")}
                  className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-medium transition ${
                    roleFilter === "admin"
                      ? "bg-[#4a382d] text-white"
                      : "border border-[#ded5c8] bg-white text-[#777064] hover:bg-[#f8f6f1]"
                  }`}
                >
                  Admins ({totalAdmins})
                </button>
              </div>
            </div>

            {/* PROFILES TABLE */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#ded5c8] bg-[#fbf9f5] text-[#777064]">
                  <tr>
                    <th className="px-4 py-3.5 font-medium">Member</th>
                    <th className="px-4 py-3.5 font-medium">Contact</th>
                    <th className="px-4 py-3.5 font-medium">Role</th>
                    <th className="px-4 py-3.5 font-medium">Joined</th>
                    <th className="px-4 py-3.5 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee7dc]">
                  {loadingProfiles ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#777064]">
                        <Loader2
                          size={24}
                          className="mx-auto animate-spin text-[#a58b72]"
                        />
                        <p className="mt-2 text-xs">Loading records from database...</p>
                      </td>
                    </tr>
                  ) : filteredProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#777064]">
                        <Users size={28} className="mx-auto text-[#ded5c8]" />
                        <p className="mt-2 text-sm font-medium text-[#4a382d]">
                          No members found
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredProfiles.map((p) => {
                      const isSelf = p.id === user.id;
                      const isRowUpdating = updatingId === p.id;
                      const isRowDeleting = deletingUserId === p.id;

                      return (
                        <tr key={p.id} className="hover:bg-[#fdfbf7] transition">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4a382d] text-xs font-semibold text-white">
                                {p.full_name
                                  ? p.full_name.slice(0, 2).toUpperCase()
                                  : "U"}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-[#4a382d]">
                                    {p.full_name || "Unnamed"}
                                  </span>
                                  {isSelf && (
                                    <span className="rounded bg-[#ded5c8] px-1.5 py-0.2 text-[9px] font-medium text-[#4a382d]">
                                      You
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-[#777064] font-mono">
                                  ID: {p.id.slice(0, 8)}...
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[#4a382d]">
                                <Mail size={12} className="text-[#a58b72]" />
                                <span>{p.email}</span>
                              </div>
                              {p.phone && (
                                <div className="flex items-center gap-1.5 text-[#777064]">
                                  <Phone size={12} className="text-[#a58b72]" />
                                  <span>{p.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            {p.role === "admin" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#fbf3e8] px-2.5 py-1 text-[11px] font-semibold text-[#9b6826] border border-[#f0decc]">
                                <ShieldCheck size={12} />
                                Arundra Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#f4ede4] px-2.5 py-1 text-[11px] font-medium text-[#62594f]">
                                Hotel Guest
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4 text-[#777064]">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={12} className="text-[#a58b72]" />
                              <span>
                                {p.created_at
                                  ? new Date(p.created_at).toLocaleDateString(
                                      "en-US",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )
                                  : "-"}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-right">
                            {isSelf ? (
                              <span className="text-[11px] italic text-[#aaa198]">
                                Current Account
                              </span>
                            ) : (
                              <div className="inline-flex items-center gap-2">
                                {p.role === "user" ? (
                                  <>
                                    <button
                                      type="button"
                                      disabled={isRowUpdating || isRowDeleting}
                                      onClick={() =>
                                        handleUpdateRole(p.id, "admin")
                                      }
                                      className="cursor-pointer rounded border border-[#ded5c8] bg-white px-2.5 py-1 text-[11px] font-medium text-[#9b6826] hover:border-[#9b6826] hover:bg-[#fffcf7] transition disabled:opacity-50"
                                    >
                                      {isRowUpdating ? (
                                        <Loader2
                                          size={12}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        "Promote to Admin"
                                      )}
                                    </button>

                                    <button
                                      type="button"
                                      disabled={isRowUpdating || isRowDeleting}
                                      onClick={() => confirmDeleteUser(p)}
                                      className="cursor-pointer inline-flex items-center gap-1 rounded border border-[#ded5c8] bg-white px-2.5 py-1 text-[11px] font-medium text-[#984b3b] hover:border-[#984b3b] hover:bg-[#fbefeb] transition disabled:opacity-50"
                                      title="Permanently delete user account"
                                    >
                                      {isRowDeleting ? (
                                        <Loader2
                                          size={12}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <>
                                          <Trash2 size={12} />
                                          <span>Delete</span>
                                        </>
                                      )}
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isRowUpdating || isRowDeleting}
                                    onClick={() =>
                                      handleUpdateRole(p.id, "user")
                                    }
                                    className="cursor-pointer rounded border border-[#ded5c8] bg-white px-2.5 py-1 text-[11px] font-medium text-[#777064] hover:border-[#984b3b] hover:text-[#984b3b] hover:bg-[#fbefeb] transition disabled:opacity-50"
                                  >
                                    {isRowUpdating ? (
                                      <Loader2
                                        size={12}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      "Demote to Guest"
                                    )}
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* TAB: ROOMS & SUITES CMS */}
        {/* ============================================================== */}
        {activeTab === "rooms" && (
          <div className="mt-6 space-y-6">
            {/* 1. TOP HEADER & ACTION CONTROLS */}
            <div className="flex flex-col gap-4 rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#f4ede4] p-1.5 text-[#755b43]">
                    <BedDouble size={18} />
                  </span>
                  <h2 className="text-lg font-serif font-bold text-[#4a382d]">
                    Rooms &amp; Suites CMS
                  </h2>
                </div>
                <p className="mt-1 text-xs text-[#777064]">
                  Manage luxury rooms &amp; suites catalog, pricing, amenities, featured slots, and customize the homepage introductory headlines.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/rooms"
                  target="_blank"
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs font-medium text-[#4a382d] hover:bg-[#eee7dc] transition"
                >
                  <Eye size={13} />
                  <span>Preview Rooms</span>
                  <ExternalLink size={12} className="opacity-70" />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    fetchAdminRooms();
                    fetchRoomsHeaderSettings();
                  }}
                  disabled={loadingRooms || loadingRoomsHeader}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-white px-3.5 py-2 text-xs font-medium text-[#4a382d] hover:bg-[#f8f6f1] disabled:opacity-50 transition"
                  title="Reload all rooms data"
                >
                  <RefreshCw
                    size={13}
                    className={loadingRooms || loadingRoomsHeader ? "animate-spin" : ""}
                  />
                  <span>Reload Data</span>
                </button>
              </div>
            </div>

            {/* 2. SUB-SECTION NAVIGATION TABS (EXPERIENCE CMS STYLE) */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[#ded5c8] pb-3">
              <button
                type="button"
                onClick={() => setRoomsSubTab("management")}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition ${
                  roomsSubTab === "management"
                    ? "bg-[#4a382d] text-white shadow-xs"
                    : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:text-[#4a382d]"
                }`}
              >
                <BedDouble size={14} />
                <span>1. Rooms &amp; Suites Management</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    roomsSubTab === "management"
                      ? "bg-white/20 text-white"
                      : "bg-[#f4ede4] text-[#62594f]"
                  }`}
                >
                  {adminRooms.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRoomsSubTab("headlines")}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition ${
                  roomsSubTab === "headlines"
                    ? "bg-[#4a382d] text-white shadow-xs"
                    : "border border-[#ded5c8] bg-white text-[#777064] hover:border-[#a58b72] hover:text-[#4a382d]"
                }`}
              >
                <SlidersHorizontal size={14} />
                <span>2. Homepage Section Copy &amp; Headlines</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    roomsSubTab === "headlines"
                      ? "bg-white/20 text-white"
                      : "bg-[#f4ede4] text-[#62594f]"
                  }`}
                >
                  {roomsHeaderSettings.eyebrow || "YOUR PRIVATE RETREAT"}
                </span>
              </button>
            </div>

            {/* ============================================================== */}
            {/* SUB-TAB 1: ROOMS & SUITES MANAGEMENT */}
            {/* ============================================================== */}
            {roomsSubTab === "management" && (
              <div className="space-y-6">
                {/* ROOMS TABLE MISSING BANNER */}
                {roomsTableMissing && (
                  <div className="rounded-2xl border border-[#e8d5b5] bg-[#fffaf0] p-6 shadow-xs text-[#7a5827]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <DatabaseIcon className="mt-1 shrink-0 text-[#a87428]" size={24} />
                        <div>
                          <h3 className="text-base font-semibold text-[#7a5827]">
                            Database Table `rooms` Not Installed
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-[#8c652f]">
                            To enable the Rooms CMS and store custom room types with Supabase Storage images, the table{" "}
                            <code className="bg-[#f0e3cc] px-1 py-0.5 rounded font-mono font-bold">
                              rooms
                            </code>{" "}
                            needs to be created in your database. Copy the migration SQL script below and execute it in{" "}
                            <span className="font-semibold">Supabase Dashboard &gt; SQL Editor</span>.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            SQL_ROOMS_MIGRATION_SCRIPT,
                            "rooms-migration",
                            "sql"
                          )
                        }
                        className="cursor-pointer inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#9b6826] px-4 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#7e521c] transition"
                      >
                        {copiedId === "rooms-migration" ? (
                          <>
                            <Check size={16} />
                            Copied to Clipboard!
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            Copy SQL Migration Script
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* HEADER CONTROLS */}
                <div className="flex flex-col gap-4 rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#4a382d]">
                      Room &amp; Suite Catalog
                    </h3>
                    <p className="mt-1 text-xs text-[#777064]">
                      Add new luxury room selections, upload high-res cover &amp; gallery images to Supabase Storage, customize pricing, and manage amenities.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={fetchAdminRooms}
                      disabled={loadingRooms}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-[#ded5c8] bg-[#f8f6f1] px-3.5 py-2 text-xs font-medium text-[#4a382d] hover:bg-[#eee7dc] disabled:opacity-50"
                      title="Reload room list"
                    >
                      <RefreshCw
                        size={14}
                        className={loadingRooms ? "animate-spin" : ""}
                      />
                      Refresh Rooms
                    </button>

                    {adminRooms.length === 0 && (
                      <button
                        type="button"
                        onClick={handleSeedRooms}
                        disabled={isSeedingRooms}
                        className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-[#ded5c8] bg-white px-3.5 py-2 text-xs font-medium text-[#4a382d] hover:bg-[#f8f6f1] disabled:opacity-50"
                      >
                        {isSeedingRooms ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <DatabaseIcon size={14} className="text-[#a58b72]" />
                        )}
                        Seed Default Rooms
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleOpenCreateRoom}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition"
                    >
                      <Plus size={16} />
                      Add New Room
                    </button>
                  </div>
                </div>

                {/* HOMEPAGE FEATURED ROOMS SELECTION (3 SLOTS) */}
            <div className="rounded-2xl border border-[#ded5c8] bg-white p-5 shadow-xs">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#ded5c8] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fbf3e8] text-sm">
                    ⭐
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#4a382d]">
                      Homepage Featured Rooms (Max 3)
                    </h3>
                    <p className="text-xs text-[#777064]">
                      Select which 3 rooms are showcased on the main homepage. All other rooms can be viewed by guests in &quot;View All Rooms&quot;.
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-[#fbf3e8] px-3 py-1 text-xs font-bold text-[#9b6826] border border-[#f0decc] self-start sm:self-auto">
                  {adminRooms.filter((r) => r.is_featured).length} / 3 Selected
                </span>
              </div>

              {/* 3 PREVIEW SLOTS */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[0, 1, 2].map((slotIdx) => {
                  const featuredList = adminRooms.filter((r) => r.is_featured);
                  const room = featuredList[slotIdx];

                  return room ? (
                    <div
                      key={room.id}
                      className="flex items-center gap-3 rounded-xl border border-[#e8d5b5] bg-[#fffcf7] p-3 shadow-2xs"
                    >
                      <img
                        src={room.cover_image}
                        alt={room.name}
                        className="h-12 w-16 rounded-lg object-cover border border-[#ded5c8]"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9b6826] flex items-center gap-1">
                          ⭐ Slot {slotIdx + 1}
                        </span>
                        <h4 className="text-xs font-semibold text-[#4a382d] truncate">
                          {room.name}
                        </h4>
                        <p className="text-[10px] text-[#777064]">
                          {formatPrice(Number(room.price))} / night
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(room)}
                        disabled={togglingFeaturedId === room.id}
                        className="cursor-pointer rounded-lg p-1.5 text-[#777064] hover:bg-[#faeae5] hover:text-[#984b3b] transition"
                        title="Remove from homepage"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      key={slotIdx}
                      className="flex items-center justify-center rounded-xl border border-dashed border-[#ded5c8] bg-[#fbf9f5] p-3 text-center text-[#aaa198]"
                    >
                      <span className="text-xs italic">
                        Empty Slot {slotIdx + 1} (Click &quot;☆ Feature&quot; on a room below)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ROOMS SEARCH & FILTER BAR */}
            <div className="flex flex-col gap-3 rounded-xl border border-[#ded5c8] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777064]"
                />
                <input
                  type="text"
                  placeholder="Search by room name, bed type, or slug..."
                  value={roomsSearchQuery}
                  onChange={(e) => setRoomsSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] py-2 pl-9 pr-3 text-xs text-[#292722] placeholder:text-[#aaa198] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-[#777064]">
                <span className="font-medium text-[#4a382d]">
                  {
                    adminRooms.filter(
                      (r) =>
                        r.name.toLowerCase().includes(roomsSearchQuery.toLowerCase()) ||
                        r.slug.toLowerCase().includes(roomsSearchQuery.toLowerCase()) ||
                        r.bed.toLowerCase().includes(roomsSearchQuery.toLowerCase())
                    ).length
                  }
                </span>{" "}
                room(s) listed
              </div>
            </div>

            {/* ROOMS GRID */}
            {loadingRooms ? (
              <div className="flex items-center justify-center rounded-2xl border border-[#ded5c8] bg-white py-16 text-[#777064]">
                <Loader2 size={24} className="animate-spin mr-2 text-[#a58b72]" />
                <span className="text-sm">Loading rooms...</span>
              </div>
            ) : adminRooms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#ded5c8] bg-white p-12 text-center text-[#777064]">
                <BedDouble size={40} className="mx-auto text-[#c4aa8c]" />
                <h3 className="mt-4 text-base font-semibold text-[#4a382d]">
                  No Rooms in Database
                </h3>
                <p className="mt-1 text-xs text-[#777064]">
                  {roomsTableMissing
                    ? "The rooms table is not installed in Supabase yet. Run the SQL migration above to get started."
                    : "No rooms currently in the database. Click '+ Add New Room' or 'Seed Default Rooms' to populate the catalogue."}
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleOpenCreateRoom}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-[#4a382d] px-4 py-2 text-xs font-medium text-white hover:bg-[#655043]"
                  >
                    <Plus size={14} />
                    Add Room
                  </button>
                  <button
                    type="button"
                    onClick={handleSeedRooms}
                    disabled={isSeedingRooms}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] px-4 py-2 text-xs font-medium text-[#4a382d] hover:bg-[#f8f6f1]"
                  >
                    <DatabaseIcon size={14} />
                    Seed Defaults
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {adminRooms
                  .filter(
                    (r) =>
                      r.name.toLowerCase().includes(roomsSearchQuery.toLowerCase()) ||
                      r.slug.toLowerCase().includes(roomsSearchQuery.toLowerCase()) ||
                      r.bed.toLowerCase().includes(roomsSearchQuery.toLowerCase())
                  )
                  .map((room) => {
                    const galleryCount = Array.isArray(room.gallery_images)
                      ? room.gallery_images.length
                      : 0;

                    return (
                      <article
                        key={room.id}
                        className="group flex flex-col overflow-hidden rounded-2xl border border-[#ded5c8] bg-white shadow-xs transition hover:shadow-md"
                      >
                        {/* COVER IMAGE */}
                        <div className="relative h-48 w-full overflow-hidden bg-[#eee7dc]">
                          <img
                            src={room.cover_image}
                            alt={room.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider ${
                                room.is_published
                                  ? "bg-[#155724] text-white"
                                  : "bg-[#777064] text-white"
                              }`}
                            >
                              {room.is_published ? "PUBLISHED" : "DRAFT"}
                            </span>

                            {room.is_featured && (
                              <span className="rounded-full bg-[#9b6826] px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-white shadow-xs">
                                ⭐ HOMEPAGE
                              </span>
                            )}
                          </div>

                          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-1 text-[11px] font-medium text-white">
                            <ImageIcon size={13} />
                            <span>{galleryCount + 1} photos</span>
                          </div>
                        </div>

                        {/* CONTENT */}
                        <div className="flex flex-1 flex-col p-5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-lg font-serif text-[#4a382d]">
                                {room.name}
                              </h3>
                              <p className="text-[11px] font-mono text-[#a58b72]">
                                /{room.slug}
                              </p>
                            </div>
                            <span className="font-semibold text-sm text-[#4a382d] whitespace-nowrap">
                              {formatPrice(Number(room.price))}
                              <span className="text-[10px] text-[#777064] font-normal block text-right">
                                / night
                              </span>
                            </span>
                          </div>

                          <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#777064]">
                            {room.description}
                          </p>

                          {/* SPECS */}
                          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#ded5c8] pt-3 text-[11px] text-[#777064]">
                            <span className="flex items-center gap-1">
                              <Users size={13} className="text-[#a58b72]" />
                              {room.guests} Guests
                            </span>
                            <span>•</span>
                            <span>{room.size} m²</span>
                            <span>•</span>
                            <span>{room.bed}</span>
                          </div>

                          {/* AMENITIES PREVIEW */}
                          {Array.isArray(room.amenities) && room.amenities.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {room.amenities.slice(0, 3).map((amenity, i) => (
                                <span
                                  key={i}
                                  className="rounded bg-[#f8f6f1] px-2 py-0.5 text-[10px] text-[#777064] border border-[#ded5c8]"
                                >
                                  {amenity}
                                </span>
                              ))}
                              {room.amenities.length > 3 && (
                                <span className="text-[10px] text-[#a58b72] self-center">
                                  +{room.amenities.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* CARD ACTIONS */}
                          <div className="mt-5 flex items-center justify-between border-t border-[#ded5c8] pt-3">
                            <Link
                              href={`/rooms/${room.slug}`}
                              target="_blank"
                              className="cursor-pointer inline-flex items-center gap-1 text-xs text-[#777064] hover:text-[#4a382d]"
                              title="Preview on live site"
                            >
                              <ExternalLink size={13} />
                              Preview
                            </Link>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleFeatured(room)}
                                disabled={togglingFeaturedId === room.id}
                                className={`cursor-pointer inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition ${
                                  room.is_featured
                                    ? "bg-[#fbf3e8] border-[#f0decc] text-[#9b6826] hover:bg-[#f5e6d0]"
                                    : "bg-white border-[#ded5c8] text-[#777064] hover:border-[#a58b72] hover:text-[#4a382d]"
                                }`}
                                title={
                                  room.is_featured
                                    ? "Click to remove from homepage featured"
                                    : "Click to feature on homepage (3 max)"
                                }
                              >
                                {togglingFeaturedId === room.id ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <span>{room.is_featured ? "⭐ Featured" : "☆ Feature"}</span>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditRoom(room)}
                                className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-[#ded5c8] bg-[#f8f6f1] px-3 py-1.5 text-xs font-medium text-[#4a382d] hover:bg-[#eee7dc] transition"
                              >
                                <Pencil size={13} />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setRoomToDelete(room);
                                  setShowDeleteRoomModal(true);
                                }}
                                className="cursor-pointer rounded-lg p-1.5 text-[#b05244] hover:bg-[#faeae5] transition"
                                title="Delete room"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
              </div>
            )}
              </div>
            )}

            {/* ============================================================== */}
            {/* SUB-TAB 2: HOMEPAGE SECTION COPY & HEADLINES */}
            {/* ============================================================== */}
            {roomsSubTab === "headlines" && (
              <div className="space-y-6">
                {/* HOMEPAGE SECTION HEADLINES & COPY (YOUR PRIVATE RETREAT) */}
                <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#ded5c8] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4ede4] text-[#4a382d]">
                        <BedDouble size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#4a382d]">
                          Homepage Section Copy &amp; Headlines
                        </h3>
                        <p className="text-xs text-[#777064]">
                          Customize the &quot;YOUR PRIVATE RETREAT / Rooms &amp; Suites&quot; introductory headlines and call-to-action button displayed on the main homepage.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={fetchRoomsHeaderSettings}
                        disabled={loadingRoomsHeader}
                        className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-[#f8f6f1] px-3 py-1.5 text-xs font-medium text-[#4a382d] hover:bg-[#eee7dc] transition disabled:opacity-50"
                        title="Reload Section Copy"
                      >
                        <RefreshCw
                          size={13}
                          className={loadingRoomsHeader ? "animate-spin" : ""}
                        />
                        <span>Reload Copy</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetRoomsHeader}
                        disabled={savingRoomsHeader}
                        className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-white px-3 py-1.5 text-xs font-medium text-[#777064] hover:bg-[#faeae5] hover:text-[#984b3b] transition disabled:opacity-50"
                      >
                        <RotateCcw size={13} />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  {roomsHeaderTableMissing && (
                    <div className="rounded-xl border border-[#e8d5b5] bg-[#fffaf0] p-4 text-[#7a5827]">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <DatabaseIcon className="mt-0.5 shrink-0 text-[#a87428]" size={18} />
                          <p className="text-xs">
                            Table <code className="bg-[#f0e3cc] px-1 py-0.5 rounded font-mono font-bold">rooms_header_settings</code> has not been created in Supabase yet. Changes will not be saved permanently until the SQL migration is executed.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              SQL_ROOMS_HEADER_MIGRATION_SCRIPT,
                              "rooms-header-migration",
                              "sql"
                            )
                          }
                          className="cursor-pointer inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#9b6826] px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-[#7e521c] transition"
                        >
                          {copiedId === "rooms-header-migration" ? (
                            <>
                              <Check size={14} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              Copy SQL
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSaveRoomsHeader} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Eyebrow Tagline */}
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#4a382d]">
                          Eyebrow Tagline / Category <span className="text-[#984b3b]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={roomsHeaderSettings.eyebrow}
                          onChange={(e) =>
                            setRoomsHeaderSettings((prev) => ({
                              ...prev,
                              eyebrow: e.target.value,
                            }))
                          }
                          placeholder="e.g. YOUR PRIVATE RETREAT"
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                        />
                        <p className="mt-1 text-[11px] text-[#777064]">
                          Small category text above the title (anchor navigation target for &quot;Rooms &amp; Suites&quot;).
                        </p>
                      </div>

                      {/* Main Section Title */}
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#4a382d]">
                          Main Section Title <span className="text-[#984b3b]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={roomsHeaderSettings.title}
                          onChange={(e) =>
                            setRoomsHeaderSettings((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="e.g. Rooms & Suites"
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                        />
                        <p className="mt-1 text-[11px] text-[#777064]">
                          Main headline for the rooms &amp; suites section on the homepage.
                        </p>
                      </div>

                      {/* Subtitle / Description */}
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-[#4a382d]">
                          Section Subtitle / Description <span className="text-[#984b3b]">*</span>
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={roomsHeaderSettings.description}
                          onChange={(e) =>
                            setRoomsHeaderSettings((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="e.g. Thoughtfully designed spaces for rest, comfort, and exceptional moments."
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none leading-relaxed"
                        />
                      </div>

                      {/* Action Button Text */}
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#4a382d]">
                          Action Button Label
                        </label>
                        <input
                          type="text"
                          value={roomsHeaderSettings.button_text}
                          onChange={(e) =>
                            setRoomsHeaderSettings((prev) => ({
                              ...prev,
                              button_text: e.target.value,
                            }))
                          }
                          placeholder="e.g. View All Rooms"
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                        />
                      </div>

                      {/* Action Button Target Link / URL (<select> and <option>) */}
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#4a382d]">
                          Action Button Target Link (Destination Page)
                        </label>
                        <TargetLinkSelect
                          value={roomsHeaderSettings.button_link || "/rooms"}
                          onChange={(val) =>
                            setRoomsHeaderSettings((prev) => ({
                              ...prev,
                              button_link: val,
                            }))
                          }
                          rooms={adminRooms}
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* LIVE PREVIEW BOX */}
                    <div className="mt-4 rounded-xl border border-[#ded5c8] bg-[#eee7dc] p-5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#a58b72] mb-3">
                        Live Homepage Preview
                      </p>
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                          <p className="text-[10px] font-semibold tracking-[0.3em] text-[#a58b72]">
                            {roomsHeaderSettings.eyebrow || "YOUR PRIVATE RETREAT"}
                          </p>
                          <h4 className="mt-2 text-2xl text-[#4a382d]">
                            {roomsHeaderSettings.title || "Rooms & Suites"}
                          </h4>
                          <p className="mt-2 max-w-lg text-xs leading-5 text-[#777064]">
                            {roomsHeaderSettings.description ||
                              "Thoughtfully designed spaces for rest, comfort, and exceptional moments."}
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4a382d]">
                          <span>{roomsHeaderSettings.button_text || "View All Rooms"}</span>
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>

                    {/* SAVE BUTTON */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={savingRoomsHeader}
                        className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition disabled:opacity-50"
                      >
                        {savingRoomsHeader ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save size={14} />
                            <span>Save Section Headlines</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: FOOTER & HOTEL INFO SETTINGS */}
        {/* ============================================================== */}
        {activeTab === "footer" && (
          <div className="mt-6 space-y-6">
            {/* FOOTER DATABASE TABLE MISSING BANNER */}
            {footerTableMissing && (
              <div className="rounded-2xl border border-[#e8d5b5] bg-[#fffaf0] p-6 shadow-xs text-[#7a5827]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <DatabaseIcon className="mt-1 shrink-0 text-[#a87428]" size={24} />
                    <div>
                      <h3 className="text-base font-semibold text-[#7a5827]">
                        Database Table `footer_settings` Not Installed
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[#8c652f]">
                        To persist dynamic footer settings in Supabase, the table{" "}
                        <code className="bg-[#f0e3cc] px-1 py-0.5 rounded font-mono font-bold">
                          footer_settings
                        </code>{" "}
                        needs to be created. Copy the migration SQL script below and execute it in{" "}
                        <span className="font-semibold">Supabase Dashboard &gt; SQL Editor</span>.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        SQL_FOOTER_MIGRATION_SCRIPT,
                        "footer-migration",
                        "sql"
                      )
                    }
                    className="cursor-pointer inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#9b6826] px-4 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#7e521c] transition"
                  >
                    {copiedId === "footer-migration" ? (
                      <>
                        <Check size={16} />
                        Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy SQL Migration Script
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* HEADER CONTROLS */}
            <div className="flex flex-col gap-4 rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-serif text-[#4a382d]">
                    Footer, Hotel Info & Hanging Tag Settings
                  </h2>
                  <span className="rounded-full bg-[#f4ede4] px-2.5 py-0.5 text-[10px] font-bold text-[#755b43]">
                    WhatsApp Concierge
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#777064]">
                  Customize the hotel brand name, address, telephone, email, WhatsApp Concierge &amp; Floating Hanging Tag, check-in/out hours, explore links, and social channels.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={fetchFooterSettings}
                  disabled={loadingFooter}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-[#ded5c8] bg-[#f8f6f1] px-3.5 py-2 text-xs font-medium text-[#4a382d] hover:bg-[#eee7dc] disabled:opacity-50"
                  title="Reload current settings from database"
                >
                  <RefreshCw
                    size={14}
                    className={loadingFooter ? "animate-spin" : ""}
                  />
                  Reload
                </button>

                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(true)}
                  disabled={savingFooter}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-[#e7c7bd] bg-[#fff5f2] px-3.5 py-2 text-xs font-medium text-[#984b3b] hover:bg-[#faeae5] disabled:opacity-50"
                >
                  <RotateCcw size={14} />
                  Reset to Defaults
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveFooter()}
                  disabled={savingFooter}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-5 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition disabled:opacity-50"
                >
                  {savingFooter ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* FORM SECTIONS */}
            <form onSubmit={handleSaveFooter} className="space-y-6">
              {/* SECTION 1: BRAND & HOTEL IDENTITY */}
              <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs">
                <div className="mb-4 flex items-center gap-2 border-b border-[#ded5c8] pb-3">
                  <Building2 size={18} className="text-[#a58b72]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#4a382d]">
                    Brand Identity & Description
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#4a382d]">
                      Hotel Brand Name
                    </label>
                    <input
                      type="text"
                      value={footerSettings.brand_name || ""}
                      onChange={(e) =>
                        setFooterSettings({
                          ...footerSettings,
                          brand_name: e.target.value,
                        })
                      }
                      placeholder="Arundra Signature"
                      className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#4a382d]">
                      Sub-title / Tagline
                    </label>
                    <input
                      type="text"
                      value={footerSettings.brand_tagline || ""}
                      onChange={(e) =>
                        setFooterSettings({
                          ...footerSettings,
                          brand_tagline: e.target.value,
                        })
                      }
                      placeholder="HOTEL & RESIDENCE"
                      className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-[#4a382d]">
                      Brand Overview / Hospitality Description
                    </label>
                    <textarea
                      rows={3}
                      value={footerSettings.description || ""}
                      onChange={(e) =>
                        setFooterSettings({
                          ...footerSettings,
                          description: e.target.value,
                        })
                      }
                      placeholder="4-Star luxury hotel & serviced residence in prestigious Pondok Indah, South Jakarta, where modern elegance meets warm, personalized service."
                      className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: CONTACT & LOCATION */}
              <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs">
                <div className="mb-4 flex items-center gap-2 border-b border-[#ded5c8] pb-3">
                  <MapPin size={18} className="text-[#a58b72]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#4a382d]">
                    Location & Contact Channels
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-[#4a382d]">
                      Hotel Physical Address
                    </label>
                    <input
                      type="text"
                      value={footerSettings.address || ""}
                      onChange={(e) =>
                        setFooterSettings({
                          ...footerSettings,
                          address: e.target.value,
                        })
                      }
                      placeholder="Jl. Metro Pondok Indah No. 27, RT.15/RW.13, Kel. Pondok Pinang, Kec. Kebayoran Lama, Jakarta Selatan, DKI Jakarta 12310, Indonesia"
                      className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#4a382d]">
                      Official Reservations Email
                    </label>
                    <input
                      type="email"
                      value={footerSettings.email || ""}
                      onChange={(e) =>
                        setFooterSettings({
                          ...footerSettings,
                          email: e.target.value,
                        })
                      }
                      placeholder="reservation@arundrasignature.com"
                      className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#4a382d]">
                      Primary Telephone Line
                    </label>
                    <input
                      type="text"
                      value={footerSettings.phone || ""}
                      onChange={(e) =>
                        setFooterSettings({
                          ...footerSettings,
                          phone: e.target.value,
                        })
                      }
                      placeholder="+62 21 5088 XXXX"
                      className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="rounded-xl border border-[#ded5c8] bg-[#fbf9f5] p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#ded5c8] pb-3 mb-3.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-[#4a382d]">
                            Floating Hanging Tag & WhatsApp Concierge
                          </label>
                          <span className="rounded-full bg-[#f4ede4] px-2 py-0.5 text-[10px] font-bold text-[#755b43]">
                            Active on Guest Pages
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-[#777064]">
                          Controls the destination number for the bottom-right floating tag (&quot;Need Help? Chat with us&quot;) and the footer chat button.
                        </p>
                      </div>

                      {/* Quick Test Link */}
                      {footerSettings.whatsapp && (
                        <a
                          href={`https://wa.me/${footerSettings.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello Arundra Signature, I would like to inquire about hotel stays and reservations.")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 self-start text-[11px] font-semibold text-[#4a382d] hover:text-[#755b43] underline transition"
                        >
                          <ExternalLink size={12} />
                          Test WhatsApp Link
                        </a>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 sm:items-center">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#4a382d]">
                          WhatsApp Concierge Phone Number *
                        </label>
                        <input
                          type="text"
                          value={footerSettings.whatsapp || ""}
                          onChange={(e) =>
                            setFooterSettings({
                              ...footerSettings,
                              whatsapp: e.target.value,
                            })
                          }
                          placeholder="+62 21 5088 XXXX"
                          className="w-full rounded-lg border border-[#ded5c8] bg-white px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:outline-none"
                        />
                        <p className="mt-1 text-[11px] text-[#777064]">
                          Include international country code (e.g. +62 for Indonesia).
                        </p>
                      </div>

                      {/* Live visual preview of the Hanging Tag */}
                      <div className="flex flex-col items-start sm:items-end justify-center rounded-lg border border-dashed border-[#ded5c8] bg-[#f4ede4]/50 p-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#a58b72] mb-1.5">
                          Live Tag Visual Preview
                        </span>
                        <div className="flex items-center gap-2 select-none">
                          <div className="flex items-center rounded-lg border border-[#ded5c8] bg-white px-2.5 py-1.5 shadow-xs">
                            <span className="text-[11px] text-[#5a5247]">
                              Need Help? <strong className="font-semibold text-[#4a382d]">Chat with us</strong>
                            </span>
                          </div>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#c89d4d] via-[#b88c3a] to-[#9d7426] text-white shadow-xs">
                            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-current" aria-hidden="true">
                              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.41a8.16 8.16 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.08l-.29-.17-3.12.82.83-3.04-.19-.3A8.17 8.17 0 0 1 3.8 11.91c0-4.54 3.7-8.24 8.25-8.24zm4.52 11.53c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.41 1.01 2.58c.13.17 1.75 2.67 4.24 3.75.59.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[#4a382d]">
                        Check-in Time
                      </label>
                      <input
                        type="text"
                        value={footerSettings.check_in_time || ""}
                        onChange={(e) =>
                          setFooterSettings({
                            ...footerSettings,
                            check_in_time: e.target.value,
                          })
                        }
                        placeholder="14:00"
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[#4a382d]">
                        Check-out Time
                      </label>
                      <input
                        type="text"
                        value={footerSettings.check_out_time || ""}
                        onChange={(e) =>
                          setFooterSettings({
                            ...footerSettings,
                            check_out_time: e.target.value,
                          })
                        }
                        placeholder="12:00"
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: EXPLORE NAVIGATION LINKS (FULL CRUD) */}
              <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs">
                <div className="mb-4 flex items-center justify-between border-b border-[#ded5c8] pb-3">
                  <div className="flex items-center gap-2">
                    <Compass size={18} className="text-[#a58b72]" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#4a382d]">
                      Explore Navigation Links
                    </h3>
                  </div>
                  <span className="text-xs text-[#777064]">
                    {(footerSettings.explore_links || []).length} active link(s)
                  </span>
                </div>

                <p className="mb-4 text-xs text-[#777064]">
                  Manage the quick links displayed in the Explore section of the footer. You can reorder, edit titles, update destination URLs, or remove links.
                </p>

                {/* CURRENT LINKS LIST */}
                <div className="space-y-3">
                  {(footerSettings.explore_links || []).map((link, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-2 rounded-xl border border-[#ded5c8] bg-[#fbf9f5] p-3 sm:flex-row sm:items-center sm:gap-3"
                    >
                      {/* REORDER BUTTONS */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveExploreLink(idx, "up")}
                          disabled={idx === 0}
                          className="cursor-pointer rounded p-1 text-[#777064] hover:bg-white hover:text-[#4a382d] disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveExploreLink(idx, "down")}
                          disabled={
                            idx === (footerSettings.explore_links || []).length - 1
                          }
                          className="cursor-pointer rounded p-1 text-[#777064] hover:bg-white hover:text-[#4a382d] disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>

                      {/* LABEL INPUT */}
                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-[#a58b72] block sm:hidden">
                          Label
                        </label>
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) =>
                            handleUpdateExploreLink(idx, "label", e.target.value)
                          }
                          placeholder="Link Label (e.g. Rooms & Suites)"
                          className="w-full rounded-lg border border-[#ded5c8] bg-white px-3 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:outline-none"
                        />
                      </div>

                      {/* URL SELECT */}
                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-[#a58b72] block sm:hidden">
                          Destination Page
                        </label>
                        <TargetLinkSelect
                          value={link.url}
                          onChange={(val) =>
                            handleUpdateExploreLink(idx, "url", val)
                          }
                          rooms={adminRooms}
                          className="w-full rounded-lg border border-[#ded5c8] bg-white px-3 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:outline-none cursor-pointer"
                        />
                      </div>

                      {/* DELETE BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleRemoveExploreLink(idx)}
                        className="cursor-pointer self-end sm:self-center rounded-lg p-2 text-[#b05244] hover:bg-[#faeae5] transition"
                        title="Delete link"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* ADD NEW LINK ROW */}
                <div className="mt-4 rounded-xl border border-dashed border-[#cbbdaf] bg-[#f8f6f1] p-3.5">
                  <p className="mb-2 text-xs font-semibold text-[#4a382d]">
                    + Add New Navigation Link
                  </p>
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={newExploreLabel}
                      onChange={(e) => setNewExploreLabel(e.target.value)}
                      placeholder="Title / Label (e.g. Wellness Spa)"
                      className="flex-1 rounded-lg border border-[#ded5c8] bg-white px-3 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:outline-none"
                    />
                    <div className="flex-1">
                      <TargetLinkSelect
                        value={newExploreUrl}
                        onChange={(val) => setNewExploreUrl(val)}
                        rooms={adminRooms}
                        placeholder="-- Select Destination Page --"
                        className="w-full rounded-lg border border-[#ded5c8] bg-white px-3 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:outline-none cursor-pointer"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddExploreLink}
                      disabled={!newExploreLabel.trim() || !newExploreUrl.trim()}
                      className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#4a382d] px-4 py-2 text-xs font-medium text-white hover:bg-[#655043] disabled:opacity-40 transition"
                    >
                      <Plus size={14} />
                      Add Link
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 4: SOCIAL MEDIA & LEGAL */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* SOCIAL MEDIA */}
                <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs">
                  <div className="mb-4 flex items-center gap-2 border-b border-[#ded5c8] pb-3">
                    <Globe size={18} className="text-[#a58b72]" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#4a382d]">
                      Social Media Channels
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        Instagram URL
                      </label>
                      <input
                        type="text"
                        value={footerSettings.instagram_url || ""}
                        onChange={(e) =>
                          setFooterSettings({
                            ...footerSettings,
                            instagram_url: e.target.value,
                          })
                        }
                        placeholder="https://instagram.com/arundrasignature"
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        Facebook URL
                      </label>
                      <input
                        type="text"
                        value={footerSettings.facebook_url || ""}
                        onChange={(e) =>
                          setFooterSettings({
                            ...footerSettings,
                            facebook_url: e.target.value,
                          })
                        }
                        placeholder="https://facebook.com/arundrasignature"
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        TikTok URL
                      </label>
                      <input
                        type="text"
                        value={footerSettings.tiktok_url || ""}
                        onChange={(e) =>
                          setFooterSettings({
                            ...footerSettings,
                            tiktok_url: e.target.value,
                          })
                        }
                        placeholder="https://tiktok.com/@arundrasignature"
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        YouTube Channel URL
                      </label>
                      <input
                        type="text"
                        value={footerSettings.youtube_url || ""}
                        onChange={(e) =>
                          setFooterSettings({
                            ...footerSettings,
                            youtube_url: e.target.value,
                          })
                        }
                        placeholder="https://youtube.com/@arundrasignature"
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* LEGAL & COPYRIGHT */}
                <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs">
                  <div className="mb-4 flex items-center gap-2 border-b border-[#ded5c8] pb-3">
                    <SlidersHorizontal size={18} className="text-[#a58b72]" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#4a382d]">
                      Copyright & Footer Base Note
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        Copyright Statement
                      </label>
                      <input
                        type="text"
                        value={footerSettings.copyright_text || ""}
                        onChange={(e) =>
                          setFooterSettings({
                            ...footerSettings,
                            copyright_text: e.target.value,
                          })
                        }
                        placeholder="Arundra Signature Hotel. All rights reserved."
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                      <p className="mt-1 text-[11px] text-[#777064]">
                        The year (© {new Date().getFullYear()}) is automatically appended.
                      </p>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        Bottom Tagline / Signature Note
                      </label>
                      <input
                        type="text"
                        value={footerSettings.bottom_note || ""}
                        onChange={(e) =>
                          setFooterSettings({
                            ...footerSettings,
                            bottom_note: e.target.value,
                          })
                        }
                        placeholder="Designed for exceptional stays."
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="rounded-xl bg-[#f8f6f1] p-3 text-xs leading-5 text-[#777064]">
                      💡 <span className="font-semibold text-[#4a382d]">Instant Sync:</span>{" "}
                      Clicking <span className="font-semibold">"Save Changes"</span> updates Supabase and immediately propagates the new values to all live site visitors without requiring page rebuilds.
                    </div>
                  </div>
                </div>
              </div>

              {/* SAVE ACTION BAR */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(true)}
                  disabled={savingFooter}
                  className="cursor-pointer rounded-lg border border-[#ded5c8] px-4 py-2.5 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1] disabled:opacity-50"
                >
                  Reset Defaults
                </button>
                <button
                  type="submit"
                  disabled={savingFooter}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-6 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition disabled:opacity-50"
                >
                  {savingFooter ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Save All Footer Changes
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* LIVE VISUAL PREVIEW MOCKUP */}
            <div className="mt-8 rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs">
              <div className="mb-4 flex items-center justify-between border-b border-[#ded5c8] pb-3">
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-[#a58b72]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#4a382d]">
                    Live Visual Preview (Real-Time Rendering)
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef8f1] px-2.5 py-0.5 text-[11px] font-medium text-[#155724] border border-[#c3e6cb]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#28a745] animate-pulse" />
                  Live Sync
                </span>
              </div>

              {/* MOCK FOOTER */}
              <div className="rounded-xl bg-[#292722] text-white overflow-hidden p-8">
                <div className="grid gap-8 md:grid-cols-3">
                  <div>
                    <h4 className="text-2xl tracking-[0.12em] font-serif">
                      {footerSettings.brand_name || "Arundra Signature"}
                    </h4>
                    <p className="mt-1 text-[9px] tracking-[0.3em] text-[#c4aa8c] font-medium">
                      {footerSettings.brand_tagline || "HOTEL & RESIDENCE"}
                    </p>
                    <p className="mt-3 text-xs leading-6 text-white/60">
                      {footerSettings.description ||
                        "4-Star luxury hotel & serviced residence in prestigious Pondok Indah, South Jakarta, where modern elegance meets warm, personalized service."}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-base font-medium">Explore</h5>
                    <div className="mt-3 flex flex-col gap-2 text-xs text-white/60">
                      {(footerSettings.explore_links || []).map((link, i) => (
                        <span key={i} className="hover:text-white cursor-pointer">
                          {link.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-base font-medium">Get in Touch</h5>
                    <div className="mt-3 space-y-2 text-xs text-white/60">
                      <p className="flex items-start gap-2">
                        <MapPin size={13} className="mt-0.5 shrink-0 text-[#c4aa8c]" />
                        <span>{footerSettings.address || "Jl. Metro Pondok Indah No. 27, RT.15/RW.13, Kel. Pondok Pinang, Kec. Kebayoran Lama, Jakarta Selatan, DKI Jakarta 12310, Indonesia"}</span>
                      </p>
                      {footerSettings.email && (
                        <p className="flex items-center gap-2">
                          <Mail size={13} className="shrink-0 text-[#c4aa8c]" />
                          <span>{footerSettings.email}</span>
                        </p>
                      )}
                      {footerSettings.phone && (
                        <p className="flex items-center gap-2">
                          <Phone size={13} className="shrink-0 text-[#c4aa8c]" />
                          <span>{footerSettings.phone}</span>
                        </p>
                      )}
                      {footerSettings.whatsapp && (
                        <p className="flex items-center gap-2 text-[#25D366]">
                          <MessageCircle size={13} className="shrink-0" />
                          <span>WhatsApp: {footerSettings.whatsapp}</span>
                        </p>
                      )}
                      {(footerSettings.check_in_time || footerSettings.check_out_time) && (
                        <p className="flex items-center gap-2 text-white/40 pt-1">
                          <Clock size={13} className="shrink-0 text-[#c4aa8c]" />
                          <span>
                            Check-in: {footerSettings.check_in_time || "14:00"} • Check-out: {footerSettings.check_out_time || "12:00"}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/10 pt-4 flex flex-col justify-between gap-2 text-[11px] text-white/40 sm:flex-row">
                  <p>
                    © {new Date().getFullYear()} {footerSettings.copyright_text || "Arundra Signature Hotel. All rights reserved."}
                  </p>
                  <p>{footerSettings.bottom_note || "Designed for exceptional stays."}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* BANNER DATABASE TABLE MISSING BANNER */}
        {/* ============================================================== */}
        {bannersTableMissing && (
          <div className="mt-6 rounded-2xl border border-[#e8d5b5] bg-[#fffaf0] p-6 shadow-xs text-[#7a5827]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <DatabaseIcon className="mt-1 shrink-0 text-[#a87428]" size={24} />
                <div>
                  <h3 className="text-base font-semibold text-[#7a5827]">
                    Database Table `hero_slides` Not Installed in Supabase
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#8c652f]">
                    The homepage hero carousel is currently running smoothly on default fallback banners. To manage custom banners, promo text, background photos, and banner sequences, run the migration script below in your{" "}
                    <span className="font-semibold">Supabase Dashboard &gt; SQL Editor</span>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    SQL_HERO_SLIDES_MIGRATION_SCRIPT,
                    "hero-migration",
                    "banner-sql"
                  )
                }
                className="cursor-pointer inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#9b6826] px-4 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#7e521c] transition"
              >
                {copiedId === "hero-migration" ? (
                  <>
                    <Check size={16} />
                    Copied SQL Script!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy SQL Migration Script
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: HERO CAROUSEL BANNERS CMS */}
        {/* ============================================================== */}
        {activeTab === "banners" && (
          <div className="mt-6 space-y-6">
            {/* TOP HEADER & ACTION BAR */}
            <div className="flex flex-col gap-4 rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4ede4] text-[#4a382d]">
                    <SlidersHorizontal size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#4a382d]">
                      Hero Carousel Banners (Homepage)
                    </h2>
                    <p className="text-xs text-[#777064]">
                      Change primary slide photos, customize promo headlines, and reorder slide sequence.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/"
                  target="_blank"
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs font-medium text-[#4a382d] hover:bg-white hover:border-[#4a382d] transition"
                  title="View live homepage carousel"
                >
                  <Eye size={14} />
                  <span>Live Preview</span>
                  <ExternalLink size={12} className="opacity-60" />
                </Link>

                <button
                  type="button"
                  onClick={handleSeedBanners}
                  disabled={isSeedingBanners}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-white px-3.5 py-2 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1] transition disabled:opacity-50"
                  title="Restore or seed default Arundra hero slides"
                >
                  {isSeedingBanners ? (
                    <Loader2 size={14} className="animate-spin text-[#4a382d]" />
                  ) : (
                    <DatabaseIcon size={14} className="text-[#a58b72]" />
                  )}
                  <span>Seed Default Slides</span>
                </button>

                <button
                  type="button"
                  onClick={fetchAdminBanners}
                  disabled={loadingBanners}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-white px-3.5 py-2 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1] transition disabled:opacity-50"
                  title="Refresh banners"
                >
                  <RefreshCw
                    size={14}
                    className={loadingBanners ? "animate-spin text-[#4a382d]" : ""}
                  />
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenCreateBanner}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-[#4a382d] px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition"
                >
                  <Plus size={15} />
                  <span>Add New Banner</span>
                </button>
              </div>
            </div>

            {/* BANNERS LIST */}
            {loadingBanners ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-[#ded5c8] bg-white py-16">
                <Loader2 size={32} className="animate-spin text-[#4a382d]" />
                <p className="mt-3 text-xs text-[#777064]">
                  Loading hero carousel slides...
                </p>
              </div>
            ) : adminBanners.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#ded5c8] bg-white p-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f8f6f1] text-[#a58b72]">
                  <SlidersHorizontal size={28} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#4a382d]">
                  No Carousel Banners Found
                </h3>
                <p className="mt-1 max-w-md text-xs leading-5 text-[#777064]">
                  You have not created any custom banners in your database yet. You can seed the 3 default luxury hotel slides with 1 click, or create a brand new custom slide.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleSeedBanners}
                    disabled={isSeedingBanners}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition"
                  >
                    {isSeedingBanners ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <DatabaseIcon size={14} />
                    )}
                    Seed Default Luxury Banners
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenCreateBanner}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-[#ded5c8] bg-white px-5 py-2.5 text-xs font-medium text-[#4a382d] hover:bg-[#f8f6f1] transition"
                  >
                    <Plus size={14} />
                    Create First Slide
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* SEQUENCE TIP */}
                <div className="flex items-center justify-between rounded-xl border border-[#ded5c8] bg-[#fbf9f5] px-4 py-2.5 text-xs text-[#777064]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#4a382d]">
                      {adminBanners.length} Total Slides
                    </span>
                    <span>•</span>
                    <span className="text-[#155724] font-medium">
                      {adminBanners.filter((b) => b.is_active).length} Active on Homepage
                    </span>
                  </div>
                  <div className="text-[11px] text-[#8c8273]">
                    Use the <span className="font-bold">▲ / ▼</span> buttons to reorder the slide sequence.
                  </div>
                </div>

                {/* SLIDES CARDS */}
                {adminBanners.map((banner, index) => {
                  const isFirst = index === 0;
                  const isLast = index === adminBanners.length - 1;
                  const isReordering = reorderingBannerId === banner.id;

                  return (
                    <div
                      key={banner.id}
                      className="overflow-hidden rounded-2xl border border-[#ded5c8] bg-white shadow-xs transition hover:shadow-md"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12">
                        {/* THUMBNAIL PREVIEW WITH SLIDE OVERLAY (COL 1 to 5) */}
                        <div className="relative md:col-span-5 h-56 md:h-auto min-h-[220px] bg-[#1a1714] overflow-hidden group">
                          {banner.image_url ? (
                            <img
                              src={banner.image_url}
                              alt={banner.title}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#292722] text-[#c4aa8c]">
                              <ImageIcon size={32} />
                            </div>
                          )}

                          {/* Dark luxury gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25" />

                          {/* Order rank badge top-left */}
                          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-bold text-white border border-white/20">
                            <span>#{index + 1}</span>
                            <span className="text-[10px] font-normal text-white/60">
                              (Rank {banner.order_rank})
                            </span>
                          </div>

                          {/* Active / Draft badge top-right */}
                          <div className="absolute top-3 right-3 z-10">
                            {banner.is_active ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#155724]/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white border border-emerald-400/30">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white/70 border border-white/20">
                                Draft
                              </span>
                            )}
                          </div>

                          {/* Simulated slide text overlay */}
                          <div className="absolute bottom-3 left-3 right-3 z-10 p-2">
                            {banner.eyebrow && (
                              <span className="inline-block rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-[9px] font-bold tracking-[0.2em] uppercase text-[#fbf3e8] border border-white/30 mb-1.5">
                                {banner.eyebrow}
                              </span>
                            )}
                            <h4 className="text-sm font-serif font-medium text-white line-clamp-2 leading-snug drop-shadow-sm">
                              {banner.title}
                            </h4>
                            {banner.button_text && (
                              <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-white/25 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-white border border-white/30">
                                <span>{banner.button_text}</span>
                                <span className="text-[10px]">→</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* BANNER CONTENT & CONTROLS (COL 6 to 12) */}
                        <div className="md:col-span-7 flex flex-col justify-between p-5 md:p-6">
                          <div>
                            {/* TOP ROW: TITLE & REORDER CONTROLS */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="space-y-1">
                                {banner.eyebrow && (
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#a58b72]">
                                    {banner.eyebrow}
                                  </span>
                                )}
                                <h3 className="text-base font-serif font-bold text-[#4a382d]">
                                  {banner.title}
                                </h3>
                              </div>

                              {/* REORDER BUTTONS */}
                              <div className="flex items-center gap-1 rounded-xl border border-[#ded5c8] bg-[#f8f6f1] p-1 shrink-0 self-start">
                                <button
                                  type="button"
                                  onClick={() => handleReorderBanner(banner.id, "up")}
                                  disabled={isFirst || isReordering}
                                  title="Move banner up (display earlier)"
                                  className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg text-[#4a382d] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                                >
                                  {isReordering ? (
                                    <Loader2 size={15} className="animate-spin text-[#4a382d]" />
                                  ) : (
                                    <ArrowUp size={15} />
                                  )}
                                </button>
                                <span className="text-xs font-bold text-[#777064] px-1.5">
                                  #{index + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleReorderBanner(banner.id, "down")}
                                  disabled={isLast || isReordering}
                                  title="Move banner down (display later)"
                                  className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg text-[#4a382d] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                                >
                                  {isReordering ? (
                                    <Loader2 size={15} className="animate-spin text-[#4a382d]" />
                                  ) : (
                                    <ArrowDown size={15} />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* DESCRIPTION */}
                            {banner.description ? (
                              <p className="mt-3 text-xs leading-relaxed text-[#777064] line-clamp-3">
                                {banner.description}
                              </p>
                            ) : (
                              <p className="mt-3 text-xs italic text-[#a58b72]">
                                No description provided.
                              </p>
                            )}

                            {/* BUTTON & LINK PILL */}
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-medium text-[#777064]">
                                Button Action:
                              </span>
                              <span className="rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-2.5 py-1 text-xs font-semibold text-[#4a382d]">
                                {banner.button_text || "Explore Our Rooms"}
                              </span>
                              <span className="text-[#a58b72] text-xs">➔</span>
                              <span className="font-mono text-xs text-[#777064] bg-[#f4ede4] px-2 py-0.5 rounded">
                                {banner.button_link || "#rooms"}
                              </span>
                            </div>

                            {/* STORAGE PATH NOTICE */}
                            {banner.image_path && (
                              <p className="mt-2 text-[10px] text-[#a58b72] font-mono truncate">
                                📁 Supabase Storage: {banner.image_path}
                              </p>
                            )}
                          </div>

                          {/* ACTION BUTTONS ROW */}
                          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#ded5c8] pt-4">
                            {/* TOGGLE ACTIVE */}
                            <button
                              type="button"
                              onClick={() => handleToggleBannerActive(banner)}
                              className={`cursor-pointer inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                                banner.is_active
                                  ? "border-[#c3e6cb] bg-[#eef8f1] text-[#155724] hover:bg-[#e2f3e7]"
                                  : "border-[#ded5c8] bg-[#f8f6f1] text-[#777064] hover:bg-[#eeebe3]"
                              }`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  banner.is_active ? "bg-emerald-500" : "bg-gray-400"
                                }`}
                              />
                              <span>{banner.is_active ? "Visible on Homepage" : "Set to Active"}</span>
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditBanner(banner)}
                                className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-white px-3.5 py-1.5 text-xs font-medium text-[#4a382d] hover:bg-[#f8f6f1] transition"
                              >
                                <Pencil size={13} />
                                <span>Edit Promo &amp; Photo</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleConfirmDeleteBanner(banner)}
                                className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#f3d3cb] bg-[#fbefeb] px-3.5 py-1.5 text-xs font-medium text-[#984b3b] hover:bg-[#f7dfd8] transition"
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* DIFFERENCE DATABASE TABLE MISSING BANNER */}
        {/* ============================================================== */}
        {differenceTableMissing && (
          <div className="mt-6 rounded-2xl border border-[#e8d5b5] bg-[#fffaf0] p-6 shadow-xs text-[#7a5827]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <DatabaseIcon className="mt-1 shrink-0 text-[#a87428]" size={24} />
                <div>
                  <h3 className="text-base font-semibold text-[#7a5827]">
                    Database Table `difference_settings` Not Installed in Supabase
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#8c652f]">
                    The section is currently running smoothly on default Arundra fallback copy. To customize the headline, section subtitle, and 3 pillars in the database, run the migration script below in your{" "}
                    <span className="font-semibold">Supabase Dashboard &gt; SQL Editor</span>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    SQL_DIFFERENCE_MIGRATION_SCRIPT,
                    "diff-migration",
                    "diff-sql"
                  )
                }
                className="cursor-pointer inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#9b6826] px-4 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#7e521c] transition"
              >
                {copiedId === "diff-migration" ? (
                  <>
                    <Check size={16} />
                    Copied SQL Script!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy SQL Migration Script
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: THE ARUNDRA DIFFERENCE CMS */}
        {/* ============================================================== */}
        {activeTab === "difference" && (
          <div className="mt-6 space-y-6">
            {/* TOP HEADER & ACTION BAR */}
            <div className="flex flex-col gap-4 rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4ede4] text-[#4a382d]">
                    <Award size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#4a382d]">
                      The Arundra Difference Section (Homepage)
                    </h2>
                    <p className="text-xs text-[#777064]">
                      Edit section eyebrow tagline, main headline, description, and the signature feature pillars.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/#experience"
                  target="_blank"
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs font-medium text-[#4a382d] hover:bg-white hover:border-[#4a382d] transition"
                  title="View live section on homepage"
                >
                  <Eye size={14} />
                  <span>Live Preview</span>
                  <ExternalLink size={12} className="opacity-60" />
                </Link>

                <button
                  type="button"
                  onClick={() => setShowResetDifferenceModal(true)}
                  disabled={savingDifference || loadingDifference}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-white px-3.5 py-2 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1] transition disabled:opacity-50"
                  title="Reset to Arundra default copy"
                >
                  <RotateCcw size={14} />
                  <span>Reset Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={fetchDifferenceSettings}
                  disabled={loadingDifference}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-white px-3.5 py-2 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1] transition disabled:opacity-50"
                  title="Refresh settings"
                >
                  <RefreshCw
                    size={14}
                    className={loadingDifference ? "animate-spin text-[#4a382d]" : ""}
                  />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {loadingDifference ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-[#ded5c8] bg-white py-16">
                <Loader2 size={32} className="animate-spin text-[#4a382d]" />
                <p className="mt-3 text-xs text-[#777064]">
                  Loading The Difference settings...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSaveDifference} className="space-y-6">
                {/* SECTION 1: HEADER & COPYWRITING */}
                <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs">
                  <div className="mb-4 flex items-center gap-2 border-b border-[#ded5c8] pb-3">
                    <Award size={18} className="text-[#a58b72]" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#4a382d]">
                      Section Header &amp; Copywriting
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        Eyebrow / Small Header Tagline
                      </label>
                      <input
                        type="text"
                        value={differenceSettings.tagline || ""}
                        onChange={(e) =>
                          setDifferenceSettings({
                            ...differenceSettings,
                            tagline: e.target.value,
                          })
                        }
                        placeholder="THE Arundra Signature DIFFERENCE"
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none uppercase tracking-widest font-semibold"
                      />
                      <p className="mt-1 text-[11px] text-[#777064]">
                        Displayed in tracked golden typography above the main title.
                      </p>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        Main Section Headline <span className="text-[#984b3b]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={differenceSettings.title || ""}
                        onChange={(e) =>
                          setDifferenceSettings({
                            ...differenceSettings,
                            title: e.target.value,
                          })
                        }
                        placeholder="Thoughtful in Every Detail"
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none font-serif text-sm"
                      />
                      <p className="mt-1 text-[11px] text-[#777064]">
                        The primary serif title for this section.
                      </p>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        Section Subtitle / Description
                      </label>
                      <textarea
                        rows={2}
                        value={differenceSettings.description || ""}
                        onChange={(e) =>
                          setDifferenceSettings({
                            ...differenceSettings,
                            description: e.target.value,
                          })
                        }
                        placeholder="More than a place to stay, a carefully considered experience shaped around your comfort."
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: FEATURE PILLARS */}
                <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs">
                  <div className="mb-4 flex items-center justify-between border-b border-[#ded5c8] pb-3">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal size={18} className="text-[#a58b72]" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-[#4a382d]">
                        Feature Pillars ({differenceSettings.items?.length || 0} Pillars)
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddDifferenceItem}
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-[#4a382d] px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition"
                    >
                      <Plus size={14} />
                      <span>Add Pillar</span>
                    </button>
                  </div>

                  <p className="mb-4 text-xs text-[#777064]">
                    These are the distinctions displayed across 3 columns on the homepage (typically 01, 02, 03). Use the arrows to reorder.
                  </p>

                  <div className="space-y-4">
                    {(differenceSettings.items || []).map((item, index) => {
                      const isFirst = index === 0;
                      const isLast = index === (differenceSettings.items?.length || 0) - 1;

                      return (
                        <div
                          key={index}
                          className="rounded-xl border border-[#ded5c8] bg-[#fdfcf9] p-4 transition hover:border-[#a58b72]"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            {/* Sequence number & Reorder controls */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 rounded-lg border border-[#ded5c8] bg-white p-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveDifferenceItem(index, "up")}
                                  disabled={isFirst}
                                  title="Move earlier"
                                  className="cursor-pointer flex h-6 w-6 items-center justify-center rounded text-[#4a382d] hover:bg-[#f8f6f1] disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ArrowUp size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveDifferenceItem(index, "down")}
                                  disabled={isLast}
                                  title="Move later"
                                  className="cursor-pointer flex h-6 w-6 items-center justify-center rounded text-[#4a382d] hover:bg-[#f8f6f1] disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ArrowDown size={13} />
                                </button>
                              </div>

                              <div className="w-16">
                                <input
                                  type="text"
                                  value={item.number}
                                  onChange={(e) =>
                                    handleUpdateDifferenceItem(index, "number", e.target.value)
                                  }
                                  placeholder={String(index + 1).padStart(2, "0")}
                                  className="w-full rounded-lg border border-[#ded5c8] bg-white px-2.5 py-1.5 text-center text-xs font-bold text-[#a58b72] focus:border-[#4a382d] focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveDifferenceItem(index)}
                              title="Delete pillar"
                              className="cursor-pointer self-end sm:self-auto rounded-lg p-1.5 text-[#b05244] hover:bg-[#faeae5] transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* Inputs: Title & Description */}
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3">
                            <div className="md:col-span-4">
                              <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                                Pillar Title
                              </label>
                              <input
                                type="text"
                                required
                                value={item.title}
                                onChange={(e) =>
                                  handleUpdateDifferenceItem(index, "title", e.target.value)
                                }
                                placeholder="e.g. Refined Comfort"
                                className="w-full rounded-lg border border-[#ded5c8] bg-white px-3 py-2 text-xs font-semibold text-[#292722] focus:border-[#4a382d] focus:outline-none"
                              />
                            </div>

                            <div className="md:col-span-8">
                              <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                                Pillar Description
                              </label>
                              <textarea
                                rows={2}
                                value={item.description}
                                onChange={(e) =>
                                  handleUpdateDifferenceItem(index, "description", e.target.value)
                                }
                                placeholder="e.g. Thoughtfully designed spaces that bring comfort and elegance together."
                                className="w-full rounded-lg border border-[#ded5c8] bg-white px-3 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SAVE ACTION BAR */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetDifferenceModal(true)}
                    disabled={savingDifference}
                    className="cursor-pointer rounded-lg border border-[#ded5c8] px-4 py-2.5 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1] disabled:opacity-50"
                  >
                    Reset Defaults
                  </button>
                  <button
                    type="submit"
                    disabled={savingDifference}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-6 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition disabled:opacity-50"
                  >
                    {savingDifference ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        Save Difference Settings
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* LIVE VISUAL PREVIEW MOCKUP */}
            <div className="mt-8 rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs">
              <div className="mb-4 flex items-center justify-between border-b border-[#ded5c8] pb-3">
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-[#a58b72]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#4a382d]">
                    Live Visual Preview (Real-Time Rendering)
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef8f1] px-2.5 py-0.5 text-[11px] font-medium text-[#155724] border border-[#c3e6cb]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#28a745] animate-pulse" />
                  Live Sync
                </span>
              </div>

              {/* MOCK HOMEPAGE SECTION */}
              <div className="rounded-xl border border-[#ded5c8] bg-[#f8f6f1] p-8 md:p-12">
                <div className="mx-auto max-w-2xl text-center">
                  <p className="text-xs font-semibold tracking-[0.3em] text-[#a58b72] uppercase">
                    {differenceSettings.tagline || "THE Arundra Signature DIFFERENCE"}
                  </p>

                  <h2 className="mt-4 text-3xl font-serif text-[#4a382d] sm:text-4xl">
                    {differenceSettings.title || "Thoughtful in Every Detail"}
                  </h2>

                  {differenceSettings.description && (
                    <p className="mt-4 text-xs leading-6 text-[#777064]">
                      {differenceSettings.description}
                    </p>
                  )}
                </div>

                <div className="mt-12 grid gap-8 md:grid-cols-3">
                  {(differenceSettings.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="border-t border-[#ded5c8] pt-6"
                    >
                      <span className="text-sm tracking-widest text-[#a58b72] font-semibold">
                        {item.number || String(idx + 1).padStart(2, "0")}
                      </span>

                      <h3 className="mt-4 text-xl font-serif text-[#4a382d]">
                        {item.title || "Pillar Title"}
                      </h3>

                      <p className="mt-3 text-xs leading-6 text-[#777064]">
                        {item.description || "Description of this distinct standard..."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ESCAPE DATABASE TABLE MISSING BANNER */}
        {/* ============================================================== */}
        {escapeTableMissing && (
          <div className="mt-6 rounded-2xl border border-[#e8d5b5] bg-[#fffaf0] p-6 shadow-xs text-[#7a5827]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <DatabaseIcon className="mt-1 shrink-0 text-[#a87428]" size={24} />
                <div>
                  <h3 className="text-base font-semibold text-[#7a5827]">
                    Database Table `escape_settings` Not Installed in Supabase
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#8c652f]">
                    The section is currently operating on default fallback copy. To customize the headline, background photo, button link, and description in your database, execute the migration SQL script below in your{" "}
                    <span className="font-semibold">Supabase Dashboard &gt; SQL Editor</span>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    SQL_ESCAPE_MIGRATION_SCRIPT,
                    "escape-migration",
                    "escape-sql"
                  )
                }
                className="cursor-pointer inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#9b6826] px-4 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#7e521c] transition"
              >
                {copiedId === "escape-migration" ? (
                  <>
                    <Check size={16} />
                    Copied SQL Script!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy SQL Migration Script
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: ESCAPE / SPECIAL OFFER BANNER CMS */}
        {/* ============================================================== */}
        {activeTab === "escape" && (
          <div className="mt-6 space-y-6">
            {/* TOP HEADER & ACTION BAR */}
            <div className="flex flex-col gap-4 rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4ede4] text-[#4a382d]">
                    <Compass size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#4a382d]">
                      Your Next Escape Awaits (Special Offer CTA Banner)
                    </h2>
                    <p className="text-xs text-[#777064]">
                      Manage the high-impact promotional section with custom background photo, luxury gold badge, headlines, and call-to-action button.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={fetchEscapeSettings}
                  disabled={loadingEscape}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-white px-3.5 py-2 text-xs font-medium text-[#4a382d] hover:bg-[#f8f6f1] transition disabled:opacity-50"
                >
                  <RefreshCw
                    size={13}
                    className={loadingEscape ? "animate-spin" : ""}
                  />
                  <span>Reload Data</span>
                </button>
              </div>
            </div>

            {loadingEscape ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-[#ded5c8] bg-white p-12 text-[#777064]">
                <Loader2 size={32} className="animate-spin text-[#a58b72]" />
                <p className="mt-3 text-xs font-medium">
                  Loading Escape Banner settings...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSaveEscape} className="space-y-6">
                {/* SECTION 1: PROMO CONTENT & TEXT */}
                <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs space-y-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4a382d] border-b border-[#ded5c8] pb-3">
                    Promotional Copy &amp; Headlines
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Eyebrow Tagline */}
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-[#4a382d]">
                        Eyebrow / Category Tag
                      </label>
                      <input
                        type="text"
                        value={escapeSettings.eyebrow}
                        onChange={(e) =>
                          setEscapeSettings((prev) => ({
                            ...prev,
                            eyebrow: e.target.value,
                          }))
                        }
                        placeholder="e.g. YOUR NEXT ESCAPE AWAITS"
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] uppercase tracking-wider focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                      <p className="mt-1 text-[11px] text-[#777064]">
                        Displayed with gold luxury styling and subtle sparkle accent.
                      </p>
                    </div>

                    {/* Headline Line 1 */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#4a382d]">
                        Main Headline Line 1 <span className="text-[#984b3b]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={escapeSettings.title_line1}
                        onChange={(e) =>
                          setEscapeSettings((prev) => ({
                            ...prev,
                            title_line1: e.target.value,
                          }))
                        }
                        placeholder="e.g. Make Your Next Stay"
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none font-serif"
                      />
                    </div>

                    {/* Headline Line 2 (Italic Accent) */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#4a382d]">
                        Highlight Headline Line 2 (Italicized Luxury Accent)
                      </label>
                      <input
                        type="text"
                        value={escapeSettings.title_line2}
                        onChange={(e) =>
                          setEscapeSettings((prev) => ({
                            ...prev,
                            title_line2: e.target.value,
                          }))
                        }
                        placeholder="e.g. Something Special"
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none italic font-serif"
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-[#4a382d]">
                        Invitation Description
                      </label>
                      <textarea
                        rows={3}
                        value={escapeSettings.description}
                        onChange={(e) =>
                          setEscapeSettings((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="e.g. Discover your next getaway and experience a stay designed around comfort, thoughtful details, and lasting memories."
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Button Text */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#4a382d]">
                        Action Button Label
                      </label>
                      <input
                        type="text"
                        value={escapeSettings.button_text}
                        onChange={(e) =>
                          setEscapeSettings((prev) => ({
                            ...prev,
                            button_text: e.target.value,
                          }))
                        }
                        placeholder="e.g. Plan Your Stay"
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Button Link */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#4a382d]">
                        Action Button Target Link / URL
                      </label>
                      <TargetLinkSelect
                        value={escapeSettings.button_link}
                        onChange={(val) =>
                          setEscapeSettings((prev) => ({
                            ...prev,
                            button_link: val,
                          }))
                        }
                        rooms={adminRooms}
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: BACKGROUND PHOTO */}
                <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#ded5c8] pb-3">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4a382d]">
                        Banner Background Image
                      </h3>
                      <p className="text-[11px] text-[#777064]">
                        Stored securely in Supabase Storage (`hotel-assets/escape/`)
                      </p>
                    </div>

                    {uploadingEscape && (
                      <div className="flex items-center gap-1.5 text-xs text-[#9b6826]">
                        <Loader2 size={13} className="animate-spin" />
                        <span>Uploading photo...</span>
                      </div>
                    )}
                  </div>

                  {escapeSettings.image_url ? (
                    <div className="space-y-3">
                      <div className="relative h-64 w-full rounded-xl overflow-hidden bg-[#292722] border border-[#ded5c8] group">
                        <img
                          src={escapeSettings.image_url}
                          alt="Escape section preview"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-[#292722]/65" />

                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white pointer-events-none">
                          <Compass size={22} className="text-[#e0c6a5]" />
                          <p className="mt-2 text-[10px] tracking-[0.25em] text-[#e0c6a5] uppercase">
                            {escapeSettings.eyebrow || "YOUR NEXT ESCAPE AWAITS"}
                          </p>
                          <h4 className="mt-1 font-serif text-xl sm:text-2xl font-bold">
                            {escapeSettings.title_line1}{" "}
                            <span className="italic">{escapeSettings.title_line2}</span>
                          </h4>
                          <span className="mt-3 inline-block rounded-md bg-[#f8f6f1] px-4 py-1.5 text-xs font-medium text-[#4a382d]">
                            {escapeSettings.button_text || "Plan Your Stay"} →
                          </span>
                        </div>

                        {/* Hover Overlay with Replace / Remove */}
                        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/55 opacity-0 group-hover:opacity-100 transition backdrop-blur-xs">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-medium text-[#4a382d] shadow-sm hover:bg-[#f8f6f1] transition">
                            <Upload size={14} />
                            <span>Replace Background</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingEscape}
                              onChange={handleUploadEscapeFile}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setEscapeSettings((prev) => ({
                                ...prev,
                                image_url: "",
                                image_path: null,
                              }))
                            }
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-[#984b3b] px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#7b3a2d] transition"
                          >
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        </div>

                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-medium text-emerald-400 border border-emerald-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Photo Loaded
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end text-xs pt-1">
                        <label className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-[#4a382d] hover:underline">
                          <Upload size={12} />
                          <span>Change Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingEscape}
                            onChange={handleUploadEscapeFile}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#ded5c8] bg-white p-8 text-center hover:bg-[#fbf9f5] transition">
                      <ImageIcon size={40} className="text-[#c4aa8c]" />
                      <p className="mt-2 text-xs font-semibold text-[#4a382d]">
                        Upload Escape Banner Background Photo
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#777064]">
                        JPG, PNG, WEBP, or AVIF (Recommended: 1920x1080 or 2200x900 Landscape, max 10MB)
                      </p>

                      <label className="cursor-pointer mt-4 inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition">
                        {uploadingEscape ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Uploading to Storage...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={14} />
                            <span>Choose Photo from Computer</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingEscape}
                          onChange={handleUploadEscapeFile}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* SAVE ACTION BAR */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetEscapeModal(true)}
                    disabled={savingEscape}
                    className="cursor-pointer rounded-lg border border-[#ded5c8] px-4 py-2.5 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1] disabled:opacity-50"
                  >
                    Reset Defaults
                  </button>
                  <button
                    type="submit"
                    disabled={savingEscape}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-6 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition disabled:opacity-50"
                  >
                    {savingEscape ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        Save Escape Banner Settings
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* LIVE VISUAL PREVIEW MOCKUP */}
            <div className="mt-8 rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs">
              <div className="mb-4 flex items-center justify-between border-b border-[#ded5c8] pb-3">
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-[#a58b72]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#4a382d]">
                    Live Visual Preview (Real-Time Rendering)
                  </h3>
                </div>
                <span className="rounded-full bg-[#f4ede4] px-2.5 py-0.5 text-[10px] font-bold text-[#62594f]">
                  Homepage Banner View
                </span>
              </div>

              <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-2xl bg-[#4a382d] border border-[#ded5c8] shadow-md">
                <img
                  src={escapeSettings.image_url || DEFAULT_ESCAPE_SETTINGS.image_url}
                  alt="Escape background"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[#292722]/65" />

                <div className="relative z-10 py-16 px-6 text-center">
                  <Compass size={26} className="mx-auto text-[#e0c6a5]" strokeWidth={1.3} />

                  <p className="mt-5 text-[11px] font-semibold tracking-[0.3em] text-[#e0c6a5] uppercase">
                    {escapeSettings.eyebrow || "YOUR NEXT ESCAPE AWAITS"}
                  </p>

                  <h3 className="mx-auto mt-4 max-w-2xl font-serif text-3xl sm:text-4xl leading-tight text-white">
                    {escapeSettings.title_line1 || "Make Your Next Stay"}{" "}
                    {escapeSettings.title_line2 && (
                      <span className="italic block sm:inline">
                        {escapeSettings.title_line2}
                      </span>
                    )}
                  </h3>

                  {escapeSettings.description && (
                    <p className="mx-auto mt-5 max-w-lg text-xs leading-6 text-white/75">
                      {escapeSettings.description}
                    </p>
                  )}

                  <div className="mt-7">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-[#f8f6f1] px-6 py-3 text-xs font-semibold text-[#4a382d] shadow-md">
                      {escapeSettings.button_text || "Plan Your Stay"}
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* WHY BOOK DATABASE TABLE MISSING BANNER */}
        {/* ============================================================== */}
        {whyBookTableMissing && (
          <div className="mt-6 rounded-2xl border border-[#e8d5b5] bg-[#fffaf0] p-6 shadow-xs text-[#7a5827]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <DatabaseIcon className="mt-1 shrink-0 text-[#a87428]" size={24} />
                <div>
                  <h3 className="text-base font-semibold text-[#7a5827]">
                    Database Table `why_book_settings` Not Installed in Supabase
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#8c652f]">
                    The section is currently operating on default fallback copy. To customize the trust badges, icons, and descriptions in your database, execute the migration SQL script below in your{" "}
                    <span className="font-semibold">Supabase Dashboard &gt; SQL Editor</span>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    SQL_WHY_BOOK_MIGRATION_SCRIPT,
                    "why-book-migration",
                    "why-book-sql"
                  )
                }
                className="cursor-pointer inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#9b6826] px-4 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#7e521c] transition"
              >
                {copiedId === "why-book-migration" ? (
                  <>
                    <Check size={16} />
                    Copied SQL Script!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy SQL Migration Script
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: WHY BOOK WITH US / TRUST BADGES CMS */}
        {/* ============================================================== */}
        {activeTab === "why-book" && (
          <div className="mt-6 space-y-6">
            {/* TOP HEADER & ACTION BAR */}
            <div className="flex flex-col gap-4 rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4ede4] text-[#4a382d]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#4a382d]">
                      Why Book With Us (Trust &amp; Service Badges)
                    </h2>
                    <p className="text-xs text-[#777064]">
                      Edit the core hospitality reassurance highlights displayed below the Escape section.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={fetchWhyBookSettings}
                  disabled={loadingWhyBook}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-white px-3.5 py-2 text-xs font-medium text-[#4a382d] hover:bg-[#f8f6f1] transition disabled:opacity-50"
                >
                  <RefreshCw
                    size={13}
                    className={loadingWhyBook ? "animate-spin" : ""}
                  />
                  <span>Reload Data</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddWhyBookItem}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-[#4a382d] px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition"
                >
                  <Plus size={14} />
                  <span>Add Badge</span>
                </button>
              </div>
            </div>

            {loadingWhyBook ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-[#ded5c8] bg-white p-12 text-[#777064]">
                <Loader2 size={32} className="animate-spin text-[#a58b72]" />
                <p className="mt-3 text-xs font-medium">
                  Loading Why Book trust badges...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSaveWhyBook} className="space-y-6">
                <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#ded5c8] pb-3">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4a382d]">
                        Trust &amp; Service Reassurance Badges
                      </h3>
                      <p className="text-[11px] text-[#777064]">
                        Customize the luxury icon, title, and concise reassurance subtitle for each badge.
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-[#a58b72]">
                      {whyBookSettings.items?.length || 0} Badges
                    </span>
                  </div>

                  <div className="space-y-4">
                    {(whyBookSettings.items || []).map((item, index) => {
                      const isFirst = index === 0;
                      const isLast =
                        index === (whyBookSettings.items || []).length - 1;

                      return (
                        <div
                          key={index}
                          className="rounded-xl border border-[#ded5c8] bg-[#fbf9f5] p-4.5 transition hover:border-[#bfa892]"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#ded5c8] pb-3">
                            {/* Reordering and numbering */}
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f4ede4] text-xs font-bold text-[#4a382d]">
                                #{index + 1}
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveWhyBookItem(index, "up")}
                                  disabled={isFirst}
                                  title="Move earlier"
                                  className="cursor-pointer flex h-6 w-6 items-center justify-center rounded text-[#4a382d] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ArrowUp size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveWhyBookItem(index, "down")}
                                  disabled={isLast}
                                  title="Move later"
                                  className="cursor-pointer flex h-6 w-6 items-center justify-center rounded text-[#4a382d] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ArrowDown size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveWhyBookItem(index)}
                              title="Delete badge"
                              className="cursor-pointer self-end sm:self-auto rounded-lg p-1.5 text-[#b05244] hover:bg-[#faeae5] transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* Inputs: Icon, Title, Description */}
                          <div className="mt-3.5 grid grid-cols-1 md:grid-cols-12 gap-3.5">
                            {/* Icon picker */}
                            <div className="md:col-span-4">
                              <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                                Luxury Icon
                              </label>
                              <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#ded5c8] bg-white">
                                  {renderAdminWhyBookIcon(item.icon, 20)}
                                </div>
                                <select
                                  value={item.icon}
                                  onChange={(e) =>
                                    handleUpdateWhyBookItem(index, "icon", e.target.value)
                                  }
                                  className="w-full rounded-lg border border-[#ded5c8] bg-white px-2.5 py-2 text-xs font-medium text-[#292722] focus:border-[#4a382d] focus:outline-none"
                                >
                                  {SUPPORTED_WHY_BOOK_ICONS.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Title */}
                            <div className="md:col-span-3">
                              <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                                Badge Title
                              </label>
                              <input
                                type="text"
                                required
                                value={item.title}
                                onChange={(e) =>
                                  handleUpdateWhyBookItem(index, "title", e.target.value)
                                }
                                placeholder="e.g. Secure Booking"
                                className="w-full rounded-lg border border-[#ded5c8] bg-white px-3 py-2 text-xs font-semibold text-[#292722] focus:border-[#4a382d] focus:outline-none"
                              />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-5">
                              <label className="mb-1 block text-[11px] font-medium text-[#4a382d]">
                                Reassurance Description
                              </label>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) =>
                                  handleUpdateWhyBookItem(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g. Designed for a smooth reservation process"
                                className="w-full rounded-lg border border-[#ded5c8] bg-white px-3 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SAVE ACTION BAR */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetWhyBookModal(true)}
                    disabled={savingWhyBook}
                    className="cursor-pointer rounded-lg border border-[#ded5c8] px-4 py-2.5 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1] disabled:opacity-50"
                  >
                    Reset Defaults
                  </button>
                  <button
                    type="submit"
                    disabled={savingWhyBook}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-6 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition disabled:opacity-50"
                  >
                    {savingWhyBook ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        Save Badges Settings
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* LIVE VISUAL PREVIEW MOCKUP */}
            <div className="mt-8 rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs">
              <div className="mb-4 flex items-center justify-between border-b border-[#ded5c8] pb-3">
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-[#a58b72]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#4a382d]">
                    Live Visual Preview (Real-Time Rendering)
                  </h3>
                </div>
                <span className="rounded-full bg-[#f4ede4] px-2.5 py-0.5 text-[10px] font-bold text-[#62594f]">
                  Homepage Trust Bar View
                </span>
              </div>

              {/* RENDER THE WARM TAN STRIP */}
              <div className="rounded-xl border-y border-[#ded5c8] bg-[#eee7dc] py-9 px-6">
                <div className="grid gap-6 md:grid-cols-3 items-start">
                  {(whyBookSettings.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-center text-left"
                    >
                      <div className="flex items-start gap-3.5 max-w-xs w-full">
                        {/* Fixed top logo/icon */}
                        <div className="shrink-0 flex items-center justify-center h-7 w-7 text-[#a58b72]">
                          {renderAdminWhyBookIcon(item.icon, 24, "text-[#a58b72]")}
                        </div>

                        {/* Content: Title fixed at top, description flows downwards */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-medium text-[#4a382d] leading-7">
                            {item.title || "Badge Title"}
                          </h4>
                          <p className="mt-1 text-xs leading-relaxed text-[#777064]">
                            {item.description || "Reassurance description..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* HOSPITALITY DATABASE TABLE MISSING BANNER */}
        {/* ============================================================== */}
        {hospitalityTableMissing && (
          <div className="mt-6 rounded-2xl border border-[#e8d5b5] bg-[#fffaf0] p-6 shadow-xs text-[#7a5827]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <DatabaseIcon className="mt-1 shrink-0 text-[#a87428]" size={24} />
                <div>
                  <h3 className="text-base font-semibold text-[#7a5827]">
                    Database Table `hospitality_settings` Not Installed in Supabase
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#8c652f]">
                    The section is currently operating on default fallback copy. To customize the headline, paragraphs, floating badge, and photo in your database, execute the migration SQL script below in your{" "}
                    <span className="font-semibold">Supabase Dashboard &gt; SQL Editor</span>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    SQL_HOSPITALITY_MIGRATION_SCRIPT,
                    "hospitality-migration",
                    "hospitality-sql"
                  )
                }
                className="cursor-pointer inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#9b6826] px-4 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#7e521c] transition"
              >
                {copiedId === "hospitality-migration" ? (
                  <>
                    <Check size={16} />
                    Copied SQL Script!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy SQL Migration Script
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 8: THE ART OF HOSPITALITY CMS */}
        {/* ============================================================== */}
        {activeTab === "hospitality" && (
          <div className="mt-6 space-y-6">
            {/* TOP HEADER & ACTION BAR */}
            <div className="flex flex-col gap-4 rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4ede4] text-[#4a382d]">
                    <Award size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#4a382d]">
                      Experience Gateway Section (Homepage)
                    </h2>
                    <p className="text-xs text-[#777064]">
                      Edit the homepage Experience Gateway photo, luxury floating badge, headline, narrative paragraphs, and discovery CTA linking to the Experience page.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/#experience"
                  target="_blank"
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs font-medium text-[#4a382d] hover:bg-white hover:border-[#4a382d] transition"
                  title="View live section on homepage"
                >
                  <Eye size={14} />
                  <span>Live Preview</span>
                  <ExternalLink size={12} className="opacity-60" />
                </Link>

                <button
                  type="button"
                  onClick={() => setShowResetHospitalityModal(true)}
                  disabled={savingHospitality || loadingHospitality}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-white px-3.5 py-2 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1] transition disabled:opacity-50"
                  title="Reset to Arundra default copy"
                >
                  <RotateCcw size={14} />
                  <span>Reset Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={fetchHospitalitySettings}
                  disabled={loadingHospitality}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-white px-3.5 py-2 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1] transition disabled:opacity-50"
                  title="Refresh settings"
                >
                  <RefreshCw
                    size={14}
                    className={loadingHospitality ? "animate-spin text-[#4a382d]" : ""}
                  />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {loadingHospitality ? (
              <div className="flex items-center justify-center rounded-2xl border border-[#ded5c8] bg-white p-12 text-[#4a382d]">
                <Loader2 size={24} className="animate-spin text-[#a58b72]" />
                <span className="ml-2 text-xs font-medium">Loading hospitality settings...</span>
              </div>
            ) : (
              <form onSubmit={handleSaveHospitality} className="space-y-6">
                {/* SECTION 1: PHOTO & FLOATING BADGE */}
                <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs">
                  <div className="mb-4 border-b border-[#ded5c8] pb-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#4a382d]">
                      Section Photo & Floating Badge
                    </h3>
                    <p className="mt-0.5 text-xs text-[#777064]">
                      Upload the signature interior photo and configure the luxury badge that floats at the bottom-right corner.
                    </p>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* PHOTO UPLOADER */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-[#4a382d]">
                        Feature Photograph *
                      </label>

                      {hospitalitySettings.image_url ? (
                        <div className="space-y-3">
                          <div className="relative overflow-hidden rounded-xl border border-[#ded5c8] bg-[#f8f6f1]">
                            <img
                              src={hospitalitySettings.image_url}
                              alt="Hospitality interior"
                              className="h-56 w-full object-cover"
                            />

                            {/* Live Badge Preview on Image */}
                            {(hospitalitySettings.badge_line1 || hospitalitySettings.badge_line2) && (
                              <div className="absolute -bottom-1 -right-1 bg-[#e9dfd1] px-4 py-3 shadow-md rounded-tl-lg">
                                {hospitalitySettings.badge_line1 && (
                                  <p className="font-serif text-lg text-[#4a382d] leading-none">
                                    {hospitalitySettings.badge_line1}
                                  </p>
                                )}
                                {hospitalitySettings.badge_line2 && (
                                  <p className="font-serif text-lg italic text-[#a58b72] leading-none mt-1">
                                    {hospitalitySettings.badge_line2}
                                  </p>
                                )}
                              </div>
                            )}

                            {uploadingHospitality && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xs">
                                <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-medium text-[#4a382d] shadow-md">
                                  <Loader2 size={16} className="animate-spin text-[#a58b72]" />
                                  <span>Uploading to Storage...</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-end rounded-lg bg-[#f8f6f1] px-3 py-2 text-[11px] text-[#777064]">
                            <label className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-[#4a382d] hover:underline shrink-0">
                              <Upload size={12} />
                              <span>Change Photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={uploadingHospitality}
                                onChange={handleUploadHospitalityFile}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#ded5c8] bg-white p-8 text-center hover:bg-[#fbf9f5] transition">
                          <ImageIcon size={40} className="text-[#c4aa8c]" />
                          <p className="mt-2 text-xs font-semibold text-[#4a382d]">
                            Upload Feature Photograph
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#777064]">
                            JPG, PNG, WEBP, or AVIF (Recommended: 1200x900 or 1000x800, max 10MB)
                          </p>

                          <label className="cursor-pointer mt-4 inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition">
                            {uploadingHospitality ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Uploading to Storage...</span>
                              </>
                            ) : (
                              <>
                                <Upload size={14} />
                                <span>Choose Photo from Computer</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingHospitality}
                              onChange={handleUploadHospitalityFile}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* FLOATING BADGE INPUTS */}
                    <div className="flex flex-col justify-between space-y-4 rounded-xl border border-[#ded5c8] bg-[#fbf9f5] p-5">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#4a382d] flex items-center gap-1.5">
                          <Crown size={14} className="text-[#a58b72]" />
                          Floating Luxury Badge
                        </h4>
                        <p className="mt-1 text-[11px] leading-5 text-[#777064]">
                          The signature stamp badge displayed on the corner of the hotel photograph.
                        </p>

                        <div className="mt-4 space-y-3">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                              Badge Top Line
                            </label>
                            <input
                              type="text"
                              value={hospitalitySettings.badge_line1 || ""}
                              onChange={(e) =>
                                setHospitalitySettings((prev) => ({
                                  ...prev,
                                  badge_line1: e.target.value,
                                }))
                              }
                              placeholder="e.g. Curated"
                              className="w-full rounded-lg border border-[#ded5c8] bg-white px-3.5 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                              Badge Accent Line (Italic)
                            </label>
                            <input
                              type="text"
                              value={hospitalitySettings.badge_line2 || ""}
                              onChange={(e) =>
                                setHospitalitySettings((prev) => ({
                                  ...prev,
                                  badge_line2: e.target.value,
                                }))
                              }
                              placeholder="e.g. moments."
                              className="w-full rounded-lg border border-[#ded5c8] bg-white px-3.5 py-2 text-xs italic text-[#292722] focus:border-[#4a382d] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg bg-[#e9dfd1]/60 p-3 text-center">
                        <span className="text-[10px] uppercase tracking-wider text-[#777064] block mb-1">
                          Badge Live Look
                        </span>
                        <p className="font-serif text-2xl text-[#4a382d]">
                          {hospitalitySettings.badge_line1 || "Curated"}
                        </p>
                        <p className="font-serif text-2xl italic text-[#a58b72]">
                          {hospitalitySettings.badge_line2 || "moments."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: EDITORIAL COPY & HEADLINES */}
                <div className="rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs">
                  <div className="mb-4 border-b border-[#ded5c8] pb-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#4a382d]">
                      Editorial Copy & Headlines
                    </h3>
                    <p className="mt-0.5 text-xs text-[#777064]">
                      Define the narrative welcoming guests into the Arundra experience.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* EYEBROW */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        Section Eyebrow Tagline
                      </label>
                      <input
                        type="text"
                        value={hospitalitySettings.eyebrow || ""}
                        onChange={(e) =>
                          setHospitalitySettings((prev) => ({
                            ...prev,
                            eyebrow: e.target.value,
                          }))
                        }
                        placeholder="e.g. THE ARUNDRA EXPERIENCE"
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs font-semibold tracking-wider text-[#4a382d] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* HEADLINES */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                          Main Headline (Line 1) *
                        </label>
                        <input
                          type="text"
                          value={hospitalitySettings.title_line1 || ""}
                          onChange={(e) =>
                            setHospitalitySettings((prev) => ({
                              ...prev,
                              title_line1: e.target.value,
                            }))
                          }
                          placeholder="e.g. Crafted for Wonder,"
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                          Main Headline (Line 2)
                        </label>
                        <input
                          type="text"
                          value={hospitalitySettings.title_line2 || ""}
                          onChange={(e) =>
                            setHospitalitySettings((prev) => ({
                              ...prev,
                              title_line2: e.target.value,
                            }))
                          }
                          placeholder="e.g. Curated for You"
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* PARAGRAPHS */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                          Narrative Paragraph 1
                        </label>
                        <textarea
                          rows={4}
                          value={hospitalitySettings.paragraph1 || ""}
                          onChange={(e) =>
                            setHospitalitySettings((prev) => ({
                              ...prev,
                              paragraph1: e.target.value,
                            }))
                          }
                          placeholder="Beyond luxurious accommodations, Arundra Signature invites you into an inspiring world..."
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs leading-5 text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none resize-none"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                          Narrative Paragraph 2
                        </label>
                        <textarea
                          rows={4}
                          value={hospitalitySettings.paragraph2 || ""}
                          onChange={(e) =>
                            setHospitalitySettings((prev) => ({
                              ...prev,
                              paragraph2: e.target.value,
                            }))
                          }
                          placeholder="From refreshing poolside relaxation to full-service spa therapies and bespoke culinary dining..."
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs leading-5 text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    {/* BUTTON */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                          Call to Action Button Text
                        </label>
                        <input
                          type="text"
                          value={hospitalitySettings.button_text || ""}
                          onChange={(e) =>
                            setHospitalitySettings((prev) => ({
                              ...prev,
                              button_text: e.target.value,
                            }))
                          }
                          placeholder="e.g. Discover Our Experience"
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                          Button Target Link (Anchor or URL)
                        </label>
                        <TargetLinkSelect
                          value={hospitalitySettings.button_link || "/experience"}
                          onChange={(val) =>
                            setHospitalitySettings((prev) => ({
                              ...prev,
                              button_link: val,
                            }))
                          }
                          rooms={adminRooms}
                          className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SAVE ACTION BAR */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetHospitalityModal(true)}
                    disabled={savingHospitality}
                    className="cursor-pointer rounded-lg border border-[#ded5c8] px-4 py-2.5 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1] disabled:opacity-50"
                  >
                    Reset Defaults
                  </button>
                  <button
                    type="submit"
                    disabled={savingHospitality}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-6 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition disabled:opacity-50"
                  >
                    {savingHospitality ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        Save Hospitality Settings
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* LIVE VISUAL PREVIEW MOCKUP */}
            <div className="mt-8 rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xs">
              <div className="mb-4 flex items-center justify-between border-b border-[#ded5c8] pb-3">
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-[#a58b72]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#4a382d]">
                    Live Visual Preview (Real-Time Rendering)
                  </h3>
                </div>
                <span className="rounded-full bg-[#f4ede4] px-2.5 py-0.5 text-[10px] font-bold text-[#62594f]">
                  Homepage 2-Column Experience View
                </span>
              </div>

              <div className="rounded-2xl border border-[#ded5c8] bg-[#fcfaf7] p-8 sm:p-12">
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
                  {/* LEFT: PHOTO + FLOATING BADGE */}
                  <div className="relative">
                    <img
                      src={hospitalitySettings.image_url || DEFAULT_HOSPITALITY_SETTINGS.image_url}
                      alt="Hotel interior"
                      className="h-[300px] w-full object-cover sm:h-[360px] shadow-sm"
                    />

                    {(hospitalitySettings.badge_line1 || hospitalitySettings.badge_line2) && (
                      <div className="absolute -bottom-5 -right-3 bg-[#e9dfd1] px-6 py-5 shadow-sm sm:-right-4">
                        {hospitalitySettings.badge_line1 && (
                          <p className="font-serif text-2xl text-[#4a382d]">
                            {hospitalitySettings.badge_line1}
                          </p>
                        )}
                        {hospitalitySettings.badge_line2 && (
                          <p className="font-serif text-2xl italic text-[#a58b72]">
                            {hospitalitySettings.badge_line2}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* RIGHT: EDITORIAL COPY */}
                  <div className="pt-4 lg:pt-0">
                    {hospitalitySettings.eyebrow && (
                      <p className="text-xs font-semibold tracking-[0.3em] text-[#a58b72]">
                        {hospitalitySettings.eyebrow}
                      </p>
                    )}

                    {(hospitalitySettings.title_line1 || hospitalitySettings.title_line2) && (
                      <h3 className="mt-4 text-3xl font-serif leading-tight text-[#4a382d] sm:text-4xl">
                        {hospitalitySettings.title_line1}
                        {hospitalitySettings.title_line1 && hospitalitySettings.title_line2 && <br />}
                        {hospitalitySettings.title_line2}
                      </h3>
                    )}

                    {hospitalitySettings.paragraph1 && (
                      <p className="mt-5 text-xs leading-6 text-[#777064]">
                        {hospitalitySettings.paragraph1}
                      </p>
                    )}

                    {hospitalitySettings.paragraph2 && (
                      <p className="mt-3 text-xs leading-6 text-[#777064]">
                        {hospitalitySettings.paragraph2}
                      </p>
                    )}

                    {hospitalitySettings.button_text && (
                      <div className="mt-6">
                        <span className="inline-flex items-center gap-2 border-b border-[#a58b72] pb-1.5 text-xs font-semibold text-[#4a382d]">
                          {hospitalitySettings.button_text}
                          <ArrowRight size={14} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 10: EXPERIENCE PAGE CMS */}
        {/* ============================================================== */}
        {activeTab === "experience" && (
          <ExperienceCMS showAlert={showAlert} showConfirm={showConfirm} />
        )}

        {/* ============================================================== */}
        {/* TAB 11: OFFERS & PACKAGES CMS */}
        {/* ============================================================== */}
        {activeTab === "offers" && (
          <OffersCMS
            showAlert={showAlert}
            showConfirm={showConfirm}
            rooms={adminRooms}
          />
        )}

        {/* ============================================================== */}
        {/* TAB 12: LOGIN & REGISTER PAGES CMS */}
        {/* ============================================================== */}
        {activeTab === "auth-pages" && (
          <AuthPagesCMS showAlert={showAlert} showConfirm={showConfirm} />
        )}

        {/* ============================================================== */}
        {/* MODAL: RESET FOOTER CONFIRMATION */}
        {/* ============================================================== */}
        {showResetConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#ded5c8] pb-4">
                <div className="flex items-center gap-2.5 text-[#984b3b]">
                  <RotateCcw size={20} />
                  <h3 className="text-base font-semibold text-[#4a382d]">
                    Reset Footer Settings?
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(false)}
                  className="cursor-pointer rounded-lg p-1.5 text-[#777064] hover:bg-[#f8f6f1]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 text-xs leading-5 text-[#777064]">
                Are you sure you want to restore the default Arundra Signature footer settings? All custom address, contacts, and navigation links will be reset to default values.
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(false)}
                  className="cursor-pointer rounded-lg border border-[#ded5c8] px-4 py-2.5 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetFooter}
                  disabled={savingFooter}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#984b3b] px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#7b3a2d] disabled:opacity-50 transition"
                >
                  {savingFooter ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RotateCcw size={14} />
                      Confirm Reset
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: ADD / EDIT ROOM & SUITE */}
        {/* ============================================================== */}
        {showRoomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
            <div className="relative w-full max-w-4xl my-auto rounded-2xl border border-[#ded5c8] bg-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between border-b border-[#ded5c8] px-6 py-4 bg-[#fcfaf7]">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#4a382d] p-2 text-white shadow-xs">
                    <BedDouble size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#4a382d]">
                      {editingRoomId ? `Edit Room: ${roomForm.name || "Untitled"}` : "Add New Room & Suite"}
                    </h3>
                    <p className="text-xs text-[#777064]">
                      {editingRoomId
                        ? "Update accommodation pricing, cover photo, gallery, and amenities"
                        : "Create a new luxury room type with Supabase Storage media"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="cursor-pointer rounded-lg p-2 text-[#777064] hover:bg-[#f8f6f1] hover:text-[#4a382d] transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* MODAL FORM & SCROLLABLE CONTENT */}
              <form onSubmit={handleSaveRoom} className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* BASIC INFO */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        Room Name <span className="text-[#984b3b]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Royal Penthouse Suite"
                        value={roomForm.name || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRoomForm((prev) => ({
                            ...prev,
                            name: val,
                            slug: !editingRoomId
                              ? val
                                  .toLowerCase()
                                  .replace(/[^a-z0-9]+/g, "-")
                                  .replace(/(^-|-$)/g, "")
                              : prev.slug,
                          }));
                        }}
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        URL Slug <span className="text-[#984b3b]">*</span>
                      </label>
                      <div className="flex items-center rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 focus-within:border-[#4a382d] focus-within:bg-white">
                        <span className="text-xs text-[#a58b72] font-mono select-none">/rooms/</span>
                        <input
                          type="text"
                          required
                          placeholder="royal-penthouse-suite"
                          value={roomForm.slug || ""}
                          onChange={(e) =>
                            setRoomForm((prev) => ({
                              ...prev,
                              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                            }))
                          }
                          className="w-full bg-transparent py-2 pl-1 pr-2 text-xs font-mono text-[#292722] focus:outline-none"
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-[#777064]">
                        Unique web address identifier for this room
                      </p>
                    </div>
                  </div>

                  {/* SPECS & PRICING */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        Nightly Rate (IDR) <span className="text-[#984b3b]">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        required
                        value={roomForm.price || 0}
                        onChange={(e) =>
                          setRoomForm((prev) => ({
                            ...prev,
                            price: Number(e.target.value),
                          }))
                        }
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                      <span className="mt-1 block text-[10px] font-medium text-[#a58b72]">
                        {formatPrice(roomForm.price || 0)} / night
                      </span>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        Max Guests <span className="text-[#984b3b]">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        required
                        value={roomForm.guests || 2}
                        onChange={(e) =>
                          setRoomForm((prev) => ({
                            ...prev,
                            guests: Number(e.target.value),
                          }))
                        }
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        Room Size (m²) <span className="text-[#984b3b]">*</span>
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="500"
                        required
                        value={roomForm.size || 32}
                        onChange={(e) =>
                          setRoomForm((prev) => ({
                            ...prev,
                            size: Number(e.target.value),
                          }))
                        }
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        Bed Configuration <span className="text-[#984b3b]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 1 King Bed"
                        value={roomForm.bed || ""}
                        onChange={(e) =>
                          setRoomForm((prev) => ({
                            ...prev,
                            bed: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* DESCRIPTIONS */}
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        Short Card Summary (Overview) <span className="text-[#984b3b]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Brief 1-line impression displayed on room listing cards..."
                        value={roomForm.description || ""}
                        onChange={(e) =>
                          setRoomForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        Full Detailed Description <span className="text-[#984b3b]">*</span>
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Complete accommodation narrative, architectural nuances, atmosphere, and amenities..."
                        value={roomForm.full_description || ""}
                        onChange={(e) =>
                          setRoomForm((prev) => ({
                            ...prev,
                            full_description: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] p-3 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* COVER IMAGE SECTION */}
                  <div className="rounded-xl border border-[#ded5c8] bg-[#fcfaf7] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#4a382d]">
                          Primary Cover Image <span className="text-[#984b3b]">*</span>
                        </h4>
                        <p className="text-[11px] text-[#777064]">
                          Main featured photograph stored in Supabase Storage bucket (`hotel-assets`)
                        </p>
                      </div>

                      {uploadingCover && (
                        <div className="flex items-center gap-1.5 text-xs text-[#9b6826]">
                          <Loader2 size={13} className="animate-spin" />
                          <span>Uploading to Storage...</span>
                        </div>
                      )}
                    </div>

                    {roomForm.cover_image ? (
                      <div className="relative overflow-hidden rounded-lg border border-[#ded5c8] bg-black/5 group">
                        <img
                          src={roomForm.cover_image}
                          alt="Cover preview"
                          className="h-44 w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 group-hover:opacity-100 transition backdrop-blur-xs">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-medium text-[#4a382d] shadow-sm hover:bg-[#f8f6f1]">
                            <Upload size={14} />
                            <span>Replace Cover</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadCoverFile}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setRoomForm((prev) => ({
                                ...prev,
                                cover_image: "",
                                cover_image_path: null,
                              }))
                            }
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-[#984b3b] px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#7b3a2d]"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#ded5c8] bg-white p-6 text-center hover:bg-[#fbf9f5] transition">
                        <ImageIcon size={32} className="text-[#c4aa8c]" />
                        <p className="mt-2 text-xs font-medium text-[#4a382d]">
                          Upload Room Cover Photo
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#777064]">
                          PNG, JPG, or WEBP up to 10MB
                        </p>

                        <label className="cursor-pointer mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#4a382d] px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition">
                          <Upload size={14} />
                          <span>Choose File</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingCover}
                            onChange={handleUploadCoverFile}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}

                    {/* Cover image upload container */}
                  </div>

                  {/* GALLERY IMAGES SECTION */}
                  <div className="rounded-xl border border-[#ded5c8] bg-[#fcfaf7] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#4a382d]">
                          Multi-Photo Gallery ({roomForm.gallery_images?.length || 0} photos)
                        </h4>
                        <p className="text-[11px] text-[#777064]">
                          Additional angles, bathroom, view, and interior photos
                        </p>
                      </div>

                      <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-white border border-[#ded5c8] px-3.5 py-1.5 text-xs font-medium text-[#4a382d] shadow-2xs hover:bg-[#f8f6f1] transition">
                        {uploadingGallery ? (
                          <>
                            <Loader2 size={13} className="animate-spin text-[#9b6826]" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={13} />
                            <span>+ Upload Photos</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={uploadingGallery}
                          onChange={handleUploadGalleryFiles}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* GALLERY GRID */}
                    {roomForm.gallery_images && roomForm.gallery_images.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {roomForm.gallery_images.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="group relative h-24 overflow-hidden rounded-lg border border-[#ded5c8] bg-black/5"
                          >
                            <img
                              src={imgUrl}
                              alt={`Gallery ${idx + 1}`}
                              className="h-full w-full object-cover transition group-hover:scale-105"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(idx)}
                              className="cursor-pointer absolute top-1.5 right-1.5 rounded-full bg-black/70 p-1 text-white hover:bg-[#984b3b] transition"
                              title="Delete photo"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-[#777064] text-center py-4">
                        No additional gallery photos added yet. Click &quot;+ Upload Photos&quot; to add multiple images.
                      </p>
                    )}
                  </div>

                  {/* AMENITIES */}
                  <div className="rounded-xl border border-[#ded5c8] bg-[#fcfaf7] p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#4a382d] mb-1">
                      Room Amenities & Features
                    </h4>
                    <p className="text-[11px] text-[#777064] mb-3">
                      Select preset luxury amenities or enter custom inclusions
                    </p>

                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {[
                        "Air Conditioning",
                        "Complimentary Wi-Fi",
                        "Flat-Screen TV",
                        "Private Bathroom",
                        "Coffee and Tea Maker",
                        "Premium Toiletries",
                        "Work Desk",
                        "Balcony / Terrace",
                        "Bathtub",
                        "Mini Bar",
                        "Safety Deposit Box",
                        "City / Pool View",
                      ].map((preset) => {
                        const isSelected = roomForm.amenities?.includes(preset);
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              isSelected
                                ? handleRemoveAmenity(
                                    (roomForm.amenities || []).indexOf(preset)
                                  )
                                : handleAddAmenity(preset)
                            }
                            className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium border transition ${
                              isSelected
                                ? "bg-[#4a382d] text-white border-[#4a382d]"
                                : "bg-white text-[#777064] border-[#ded5c8] hover:border-[#a58b72]"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {preset}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Amenity Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add custom amenity (e.g. Nespresso Machine, Jacuzzi)..."
                        value={customAmenityInput}
                        onChange={(e) => setCustomAmenityInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddAmenity(customAmenityInput);
                          }
                        }}
                        className="flex-1 rounded-lg border border-[#ded5c8] bg-white px-3 py-1.5 text-xs text-[#292722] focus:border-[#4a382d] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddAmenity(customAmenityInput)}
                        className="cursor-pointer rounded-lg bg-[#4a382d] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#655043]"
                      >
                        Add
                      </button>
                    </div>

                    {/* Active Selected Chips */}
                    {roomForm.amenities && roomForm.amenities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[#ded5c8] pt-3">
                        {roomForm.amenities.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-md bg-white border border-[#ded5c8] px-2.5 py-1 text-xs text-[#4a382d]"
                          >
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAmenity(idx)}
                              className="cursor-pointer text-[#777064] hover:text-[#984b3b]"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PUBLISH & ORDER SETTINGS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-[#ded5c8] bg-[#fcfaf7] p-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a382d]">
                        Display Order Rank
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={roomForm.order_rank || 1}
                        onChange={(e) =>
                          setRoomForm((prev) => ({
                            ...prev,
                            order_rank: Number(e.target.value),
                          }))
                        }
                        className="w-full rounded-lg border border-[#ded5c8] bg-white px-3 py-1.5 text-xs text-[#292722] focus:border-[#4a382d] focus:outline-none"
                      />
                      <p className="mt-1 text-[10px] text-[#777064]">
                        Lower ranks appear first on the rooms list
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex items-center gap-3">
                        <input
                          id="isPublishedCheck"
                          type="checkbox"
                          checked={roomForm.is_published ?? true}
                          onChange={(e) =>
                            setRoomForm((prev) => ({
                              ...prev,
                              is_published: e.target.checked,
                            }))
                          }
                          className="cursor-pointer h-4 w-4 rounded border-[#ded5c8] text-[#4a382d] focus:ring-[#4a382d]"
                        />
                        <label
                          htmlFor="isPublishedCheck"
                          className="cursor-pointer text-xs font-medium text-[#4a382d]"
                        >
                          Publish Room on Public Website
                          <span className="block text-[10px] text-[#777064] font-normal">
                            When checked, guests can view and book this room
                          </span>
                        </label>
                      </div>

                      <div className="flex items-center gap-3 border-t border-[#ded5c8] pt-2">
                        <input
                          id="isFeaturedCheck"
                          type="checkbox"
                          checked={roomForm.is_featured ?? false}
                          onChange={(e) => {
                            const willBeFeatured = e.target.checked;
                            if (willBeFeatured) {
                              const currentFeaturedCount = adminRooms.filter(
                                (r) => r.is_featured && r.id !== editingRoomId
                              ).length;
                              if (currentFeaturedCount >= 3) {
                                showAlert(
                                  "Maximum 3 rooms can be featured on the homepage. Please unfeature one of the existing 3 rooms first.",
                                  "Featured Limit Reached"
                                );
                                return;
                              }
                            }
                            setRoomForm((prev) => ({
                              ...prev,
                              is_featured: willBeFeatured,
                            }));
                          }}
                          className="cursor-pointer h-4 w-4 rounded border-[#ded5c8] text-[#9b6826] focus:ring-[#9b6826]"
                        />
                        <label
                          htmlFor="isFeaturedCheck"
                          className="cursor-pointer text-xs font-medium text-[#4a382d]"
                        >
                          ⭐ Feature on Homepage (3 Max)
                          <span className="block text-[10px] text-[#777064] font-normal">
                            Showcase this room among the 3 featured selections on the homepage
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MODAL FOOTER */}
                <div className="flex items-center justify-end gap-3 border-t border-[#ded5c8] px-6 py-4 bg-[#fcfaf7]">
                  <button
                    type="button"
                    onClick={() => setShowRoomModal(false)}
                    className="cursor-pointer rounded-lg border border-[#ded5c8] px-4 py-2 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingRoom || uploadingCover || uploadingGallery}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-6 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#655043] disabled:opacity-50 transition"
                  >
                    {savingRoom ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Saving Room...
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        {editingRoomId ? "Update Room" : "Publish New Room"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: DELETE ROOM CONFIRMATION */}
        {/* ============================================================== */}
        {showDeleteRoomModal && roomToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#ded5c8] pb-4">
                <div className="flex items-center gap-2.5 text-[#984b3b]">
                  <Trash2 size={20} />
                  <h3 className="text-base font-semibold text-[#4a382d]">
                    Delete Room & Suite?
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteRoomModal(false)}
                  className="cursor-pointer rounded-lg p-1.5 text-[#777064] hover:bg-[#f8f6f1]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 text-xs leading-5 text-[#777064]">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-[#4a382d]">
                  &quot;{roomToDelete.name}&quot;
                </span>
                ? This room listing will be removed from the website and its associated image files stored in Supabase Storage will be purged.
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeleteRoomModal(false)}
                  className="cursor-pointer rounded-lg border border-[#ded5c8] px-4 py-2.5 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteRoom}
                  disabled={deletingRoomId !== null}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#984b3b] px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#7b3a2d] disabled:opacity-50 transition"
                >
                  {deletingRoomId ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: CREATE / EDIT HERO CAROUSEL BANNER */}
        {/* ============================================================== */}
        {showBannerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-hidden">
            <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[#ded5c8] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* FIXED MODAL HEADER - ALWAYS VISIBLE AT TOP */}
              <div className="flex items-center justify-between border-b border-[#ded5c8] px-6 py-4.5 bg-white shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-[#f4ede4] p-2 text-[#4a382d]">
                    <SlidersHorizontal size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#4a382d]">
                      {editingBannerId
                        ? "Edit Hero Carousel Banner"
                        : "Create New Hero Carousel Banner"}
                    </h3>
                    <p className="text-xs text-[#777064]">
                      {editingBannerId
                        ? "Update promotional headline, photos, button action, and order sequence."
                        : "Add a high-resolution luxury promotional banner to the homepage."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="cursor-pointer rounded-lg p-1.5 text-[#777064] hover:bg-[#f8f6f1]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* SCROLLABLE FORM BODY - SCROLLS SMOOTHLY INSIDE MODAL */}
              <form
                id="hero-banner-form"
                onSubmit={handleSaveBanner}
                className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
              >
                {/* PROMO TITLE */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#4a382d]">
                    Promo Headline / Title <span className="text-[#984b3b]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bannerForm.title || ""}
                    onChange={(e) =>
                      setBannerForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="e.g. Experience Serenity & Grandeur"
                    className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-[#777064]">
                    The primary large headline displayed prominently over the carousel slide.
                  </p>
                </div>

                {/* EYEBROW / BADGE */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#4a382d]">
                    Eyebrow / Promotion Tag
                  </label>
                  <input
                    type="text"
                    value={bannerForm.eyebrow || ""}
                    onChange={(e) =>
                      setBannerForm((prev) => ({ ...prev, eyebrow: e.target.value }))
                    }
                    placeholder="e.g. EXCLUSIVE OFFER or SIGNATURE RETREAT"
                    className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none uppercase tracking-wider"
                  />
                  <p className="mt-1 text-[11px] text-[#777064]">
                    Small category badge displayed above the main headline.
                  </p>
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#4a382d]">
                    Promotional Description
                  </label>
                  <textarea
                    rows={3}
                    value={bannerForm.description || ""}
                    onChange={(e) =>
                      setBannerForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="e.g. Escape to unparalleled comfort nestled in the heart of nature. Reserve directly for exclusive benefits and complimentary wellness access."
                    className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                  />
                </div>

                {/* BUTTON LABEL & LINK URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#4a382d]">
                      Call-to-Action Button Label
                    </label>
                    <input
                      type="text"
                      value={bannerForm.button_text || ""}
                      onChange={(e) =>
                        setBannerForm((prev) => ({
                          ...prev,
                          button_text: e.target.value,
                        }))
                      }
                      placeholder="e.g. Reserve Your Suite"
                      className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#4a382d]">
                      Target Link / URL (Destination Page)
                    </label>
                    <TargetLinkSelect
                      value={bannerForm.button_link || "/rooms"}
                      onChange={(val) =>
                        setBannerForm((prev) => ({
                          ...prev,
                          button_link: val,
                        }))
                      }
                      rooms={adminRooms}
                      className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* BACKGROUND PHOTO (UPLOAD ONLY FROM COMPUTER) */}
                <div className="rounded-xl border border-[#ded5c8] bg-[#fbf9f5] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-[#4a382d]">
                        Slide Background Photo <span className="text-[#984b3b]">*</span>
                      </h4>
                      <p className="text-[11px] text-[#777064]">
                        Stored securely in Supabase Storage bucket (`hotel-assets/banners/`)
                      </p>
                    </div>

                    {uploadingBanner && (
                      <div className="flex items-center gap-1.5 text-xs text-[#9b6826]">
                        <Loader2 size={13} className="animate-spin" />
                        <span>Uploading photo...</span>
                      </div>
                    )}
                  </div>

                  {bannerForm.image_url ? (
                    <div className="space-y-2.5">
                      {/* PREVIEW CONTAINER WITH LUXURY OVERLAY */}
                      <div className="relative h-48 w-full rounded-xl overflow-hidden bg-black border border-[#ded5c8] group">
                        <img
                          src={bannerForm.image_url}
                          alt="Slide background preview"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

                        {/* Live Overlay Text */}
                        <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                          {bannerForm.eyebrow && (
                            <span className="inline-block rounded-full bg-white/20 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold tracking-[0.2em] uppercase text-[#fbf3e8] border border-white/30 mb-1">
                              {bannerForm.eyebrow}
                            </span>
                          )}
                          <p className="text-sm font-serif font-bold text-white line-clamp-1 drop-shadow-sm">
                            {bannerForm.title || "Headline preview..."}
                          </p>
                          {bannerForm.button_text && (
                            <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-white/25 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-white border border-white/30">
                              <span>{bannerForm.button_text}</span>
                              <span className="text-[10px]">→</span>
                            </div>
                          )}
                        </div>

                        {/* Hover action overlay */}
                        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 group-hover:opacity-100 transition backdrop-blur-xs">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-medium text-[#4a382d] shadow-sm hover:bg-[#f8f6f1] transition">
                            <Upload size={14} />
                            <span>Replace Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingBanner}
                              onChange={handleUploadBannerFile}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setBannerForm((prev) => ({
                                ...prev,
                                image_url: "",
                                image_path: null,
                              }))
                            }
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-[#984b3b] px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#7b3a2d] transition"
                          >
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        </div>

                        {/* Top Status Badge */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Photo Loaded
                          </span>
                        </div>
                      </div>

                      {/* Controls below image */}
                      <div className="flex items-center justify-end text-xs pt-1">
                        <div className="flex items-center gap-2.5">
                          <label className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-[#4a382d] hover:underline">
                            <Upload size={12} />
                            <span>Change Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingBanner}
                              onChange={handleUploadBannerFile}
                              className="hidden"
                            />
                          </label>
                          <span className="text-[#ded5c8]">|</span>
                          <button
                            type="button"
                            onClick={() =>
                              setBannerForm((prev) => ({
                                ...prev,
                                image_url: "",
                                image_path: null,
                              }))
                            }
                            className="cursor-pointer text-xs font-medium text-[#984b3b] hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#ded5c8] bg-white p-7 text-center hover:bg-[#fbf9f5] transition">
                      <ImageIcon size={38} className="text-[#c4aa8c]" />
                      <p className="mt-2 text-xs font-semibold text-[#4a382d]">
                        Upload Slide Photo from Computer
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#777064]">
                        JPG, PNG, WEBP, or AVIF (Recommended: 1920x1080 Landscape, max 10MB)
                      </p>

                      <label className="cursor-pointer mt-3.5 inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition">
                        {uploadingBanner ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Uploading to Storage...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={14} />
                            <span>Choose Photo from Computer</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingBanner}
                          onChange={handleUploadBannerFile}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* ORDER RANK & ACTIVE CHECKBOX */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#4a382d]">
                      Sequence Order Rank
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={bannerForm.order_rank ?? 1}
                      onChange={(e) =>
                        setBannerForm((prev) => ({
                          ...prev,
                          order_rank: Math.max(1, parseInt(e.target.value) || 1),
                        }))
                      }
                      className="w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none"
                    />
                    <p className="mt-1 text-[11px] text-[#777064]">
                      Slide with rank 1 is shown first on initial page load.
                    </p>
                  </div>

                  <div className="pt-2 sm:pt-4">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bannerForm.is_active ?? true}
                        onChange={(e) =>
                          setBannerForm((prev) => ({
                            ...prev,
                            is_active: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-[#ded5c8] text-[#4a382d] focus:ring-[#4a382d]"
                      />
                      <span className="text-xs font-medium text-[#4a382d]">
                        Active (Visible on Homepage Carousel)
                      </span>
                    </label>
                    <p className="mt-1 text-[11px] text-[#777064] pl-6">
                      Uncheck to temporarily hide this slide without deleting it.
                    </p>
                  </div>
                </div>
              </form>

              {/* FIXED MODAL FOOTER - ALWAYS PINNED AT BOTTOM */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#ded5c8] bg-[#fdfcf9] shrink-0">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="cursor-pointer rounded-lg border border-[#ded5c8] px-4 py-2.5 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="hero-banner-form"
                  disabled={savingBanner || uploadingBanner}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-6 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#655043] transition disabled:opacity-50"
                >
                  {savingBanner ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving Slide...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      {editingBannerId ? "Save Changes" : "Publish Slide"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: DELETE HERO BANNER CONFIRMATION */}
        {/* ============================================================== */}
        {showDeleteBannerModal && bannerToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#ded5c8] pb-4">
                <div className="flex items-center gap-2.5 text-[#984b3b]">
                  <Trash2 size={20} />
                  <h3 className="text-base font-semibold text-[#4a382d]">
                    Delete Hero Carousel Banner?
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteBannerModal(false)}
                  className="cursor-pointer rounded-lg p-1.5 text-[#777064] hover:bg-[#f8f6f1]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 text-xs leading-5 text-[#777064]">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-[#4a382d]">
                  &quot;{bannerToDelete.title}&quot;
                </span>
                ? This slide will be removed from the homepage carousel and any associated background photo stored in Supabase Storage will be purged.
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeleteBannerModal(false)}
                  className="cursor-pointer rounded-lg border border-[#ded5c8] px-4 py-2.5 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteBanner}
                  disabled={deletingBannerId !== null}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#984b3b] px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#7b3a2d] disabled:opacity-50 transition"
                >
                  {deletingBannerId ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ============================================================== */}
        {/* MODAL: RESET THE DIFFERENCE SETTINGS CONFIRMATION */}
        {/* ============================================================== */}
        {showResetDifferenceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#ded5c8] pb-4">
                <div className="flex items-center gap-2.5 text-[#4a382d]">
                  <RotateCcw size={20} className="text-[#a58b72]" />
                  <h3 className="text-base font-semibold text-[#4a382d]">
                    Reset Difference Settings?
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetDifferenceModal(false)}
                  className="cursor-pointer rounded-lg p-1.5 text-[#777064] hover:bg-[#f8f6f1]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 text-xs leading-5 text-[#777064]">
                Are you sure you want to reset &quot;The Arundra Signature Difference&quot; section back to the standard hotel defaults? This will restore the original tagline, headline, and the 3 core hospitality pillars (Refined Comfort, Personalized Service, Memorable Moments).
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowResetDifferenceModal(false)}
                  className="cursor-pointer rounded-lg border border-[#ded5c8] px-4 py-2.5 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetDifference}
                  disabled={savingDifference}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#655043] disabled:opacity-50 transition"
                >
                  {savingDifference ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RotateCcw size={14} />
                      Reset to Defaults
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: RESET ESCAPE SETTINGS CONFIRMATION */}
        {/* ============================================================== */}
        {showResetEscapeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#ded5c8] pb-4">
                <div className="flex items-center gap-2.5 text-[#4a382d]">
                  <RotateCcw size={20} className="text-[#a58b72]" />
                  <h3 className="text-base font-semibold text-[#4a382d]">
                    Reset Escape Banner Settings?
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetEscapeModal(false)}
                  className="cursor-pointer rounded-lg p-1.5 text-[#777064] hover:bg-[#f8f6f1]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 text-xs leading-5 text-[#777064]">
                Are you sure you want to reset the &quot;Your Next Escape Awaits&quot; banner back to hotel defaults? This will restore the original headlines, description, button, and luxury background photo.
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowResetEscapeModal(false)}
                  className="cursor-pointer rounded-lg border border-[#ded5c8] px-4 py-2.5 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetEscape}
                  disabled={savingEscape}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#655043] disabled:opacity-50 transition"
                >
                  {savingEscape ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RotateCcw size={14} />
                      Reset to Defaults
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: RESET WHY BOOK SETTINGS CONFIRMATION */}
        {/* ============================================================== */}
        {showResetWhyBookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#ded5c8] pb-4">
                <div className="flex items-center gap-2.5 text-[#4a382d]">
                  <RotateCcw size={20} className="text-[#a58b72]" />
                  <h3 className="text-base font-semibold text-[#4a382d]">
                    Reset Why Book Badges?
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetWhyBookModal(false)}
                  className="cursor-pointer rounded-lg p-1.5 text-[#777064] hover:bg-[#f8f6f1]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 text-xs leading-5 text-[#777064]">
                Are you sure you want to reset the &quot;Why Book With Us&quot; trust badges back to hotel defaults? This will restore the 3 original badges (Secure Booking, Thoughtful Service, A Welcoming Stay).
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowResetWhyBookModal(false)}
                  className="cursor-pointer rounded-lg border border-[#ded5c8] px-4 py-2.5 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetWhyBook}
                  disabled={savingWhyBook}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#655043] disabled:opacity-50 transition"
                >
                  {savingWhyBook ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RotateCcw size={14} />
                      Reset to Defaults
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: RESET HOSPITALITY SETTINGS CONFIRMATION */}
        {/* ============================================================== */}
        {showResetHospitalityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#ded5c8] pb-4">
                <div className="flex items-center gap-2.5 text-[#4a382d]">
                  <RotateCcw size={20} className="text-[#a58b72]" />
                  <h3 className="text-base font-semibold text-[#4a382d]">
                    Reset Hospitality Section?
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetHospitalityModal(false)}
                  className="cursor-pointer rounded-lg p-1.5 text-[#777064] hover:bg-[#f8f6f1]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 text-xs leading-5 text-[#777064]">
                Are you sure you want to reset &quot;The Art of Hospitality&quot; section back to hotel defaults? This will restore the original photo, &quot;Simply exceptional.&quot; luxury floating badge, headline, and both narrative paragraphs.
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowResetHospitalityModal(false)}
                  className="cursor-pointer rounded-lg border border-[#ded5c8] px-4 py-2.5 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetHospitality}
                  disabled={savingHospitality}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#4a382d] px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#655043] disabled:opacity-50 transition"
                >
                  {savingHospitality ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RotateCcw size={14} />
                      Reset to Defaults
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* UNIVERSAL CONFIRMATION MODAL (Replaces browser confirm) */}
        {/* ============================================================== */}
        {confirmDialog && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl border border-[#ded5c8] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-[#ded5c8] pb-4">
                <div
                  className={`flex items-center gap-2.5 ${
                    confirmDialog.danger ? "text-[#984b3b]" : "text-[#755b43]"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      confirmDialog.danger
                        ? "bg-[#fff5f2] text-[#984b3b]"
                        : "bg-[#f4ede4] text-[#755b43]"
                    }`}
                  >
                    {confirmDialog.danger ? (
                      <Trash2 size={18} />
                    ) : (
                      <CheckCircle size={18} />
                    )}
                  </div>
                  <h3 className="text-base font-serif font-bold text-[#4a382d]">
                    {confirmDialog.title || "Confirm Action"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="cursor-pointer rounded-lg p-1.5 text-[#777064] hover:bg-[#f8f6f1] transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 text-xs leading-relaxed text-[#62594f]">
                {confirmDialog.message}
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="cursor-pointer rounded-lg border border-[#ded5c8] px-4 py-2 text-xs font-medium text-[#777064] hover:bg-[#f8f6f1] transition"
                >
                  {confirmDialog.cancelText || "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const action = confirmDialog.onConfirm;
                    setConfirmDialog(null);
                    action();
                  }}
                  className={`cursor-pointer rounded-lg px-5 py-2 text-xs font-medium text-white transition shadow-xs ${
                    confirmDialog.danger
                      ? "bg-[#984b3b] hover:bg-[#7e3d30]"
                      : "bg-[#4a382d] hover:bg-[#655043]"
                  }`}
                >
                  {confirmDialog.confirmText || "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
