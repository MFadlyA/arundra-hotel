export type UserRole = "user" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface AdminInviteKey {
  id: string;
  key: string;
  note?: string | null;
  created_by?: string | null;
  creator?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  is_used: boolean;
  used_by?: string | null;
  used_at?: string | null;
  consumer?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  expires_at?: string | null;
  created_at: string;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterSettings {
  id: string;
  brand_name: string;
  brand_tagline: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  whatsapp?: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  explore_links: FooterLink[];
  instagram_url?: string | null;
  facebook_url?: string | null;
  tiktok_url?: string | null;
  youtube_url?: string | null;
  copyright_text: string;
  bottom_note: string;
  updated_at?: string;
  updated_by?: string | null;
}

export interface DbRoom {
  id: string;
  slug: string;
  name: string;
  description: string;
  full_description: string;
  price: number;
  guests: number;
  size: number;
  bed: string;
  cover_image: string;
  cover_image_path?: string | null;
  gallery_images: string[];
  gallery_image_paths?: string[];
  amenities: string[];
  is_published: boolean;
  is_featured?: boolean;
  order_rank: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbHeroSlide {
  id: string;
  title: string;
  eyebrow?: string | null;
  description: string;
  button_text: string;
  button_link: string;
  image_url: string;
  image_path?: string | null;
  is_active: boolean;
  order_rank: number;
  created_at?: string;
  updated_at?: string;
}

export interface DifferenceItem {
  number: string;
  title: string;
  description: string;
}

export interface DifferenceSettings {
  id: string;
  tagline: string;
  title: string;
  description: string;
  items: DifferenceItem[];
  updated_at?: string;
  updated_by?: string | null;
}

export interface EscapeSettings {
  id: string;
  eyebrow: string;
  title_line1: string;
  title_line2: string;
  description: string;
  button_text: string;
  button_link: string;
  image_url: string;
  image_path?: string | null;
  updated_at?: string;
  updated_by?: string | null;
}

export interface WhyBookItem {
  icon: string;
  title: string;
  description: string;
}

export interface WhyBookSettings {
  id: string;
  items: WhyBookItem[];
  updated_at?: string;
  updated_by?: string | null;
}

export interface HospitalitySettings {
  id: string;
  badge_line1: string;
  badge_line2: string;
  eyebrow: string;
  title_line1: string;
  title_line2: string;
  paragraph1: string;
  paragraph2: string;
  button_text: string;
  button_link: string;
  image_url: string;
  image_path?: string | null;
  updated_at?: string;
  updated_by?: string | null;
}

export interface RoomsHeaderSettings {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  updated_at?: string;
  updated_by?: string | null;
}

// ------------------------------------------------------------------------------
// LOGIN & REGISTER AUTH PAGES TYPES
// ------------------------------------------------------------------------------

export interface AuthPagesSettings {
  id: string;
  // Login Page Settings
  login_brand_title: string;
  login_brand_subtitle: string;
  login_image: string;
  login_image_path?: string | null;
  login_badge: string;
  login_title: string;
  login_description: string;
  login_form_eyebrow: string;
  login_form_title: string;
  login_form_description: string;

  // Register Page Settings
  register_brand_title: string;
  register_brand_subtitle: string;
  register_image: string;
  register_image_path?: string | null;
  register_badge: string;
  register_title: string;
  register_description: string;
  register_form_eyebrow: string;
  register_form_title: string;
  register_form_description: string;

  updated_at?: string;
  updated_by?: string | null;
}

// ------------------------------------------------------------------------------
// OFFERS PAGE TYPES
// ------------------------------------------------------------------------------

export interface OfferItem {
  id: string;
  title: string;
  tagline: string;
  badge: string;
  category: string;
  description: string;
  image: string;
  image_path?: string | null;
  price: string;
  validity: string;
  inclusions: string[];
  terms?: string;
  promo_code?: string;
  show_button?: boolean;
  button_text?: string;
  button_link?: string;
  visible_on_homepage?: boolean;
}

export interface GuaranteeItem {
  icon: string;
  title: string;
  description: string;
}

export interface OffersSettings {
  id?: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_description: string;
  hero_image?: string;
  hero_image_path?: string | null;
  guarantee_eyebrow?: string;
  guarantee_title?: string;
  guarantee_description?: string;
  guarantee_items?: GuaranteeItem[];
  offers_items: OfferItem[];
  updated_at?: string;
  updated_by?: string | null;
}

// ------------------------------------------------------------------------------
// EXPERIENCE PAGE TYPES
// ------------------------------------------------------------------------------

export interface RecreationItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  image_path?: string | null;
  badge?: string;
  timing?: string;
  visible_on_homepage?: boolean;
}

export interface FacilityItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  image_path?: string | null;
  hours: string;
  features: string[];
  visible_on_homepage?: boolean;
}

export interface NearbyPlaceItem {
  id: string;
  name: string;
  category: string;
  distance: string;
  description: string;
  image: string;
  image_path?: string | null;
  visible_on_homepage?: boolean;
}

export interface ExperienceSettings {
  id: string;
  // Hero section
  hero_eyebrow: string;
  hero_title: string;
  hero_description: string;
  hero_image: string;
  hero_image_path?: string | null;

  // 1. Variety of Recreations
  recreations_eyebrow: string;
  recreations_title: string;
  recreations_description: string;
  recreations_items: RecreationItem[];

  // 2. Our Facilities
  facilities_eyebrow: string;
  facilities_title: string;
  facilities_description: string;
  facilities_items: FacilityItem[];

  // 3. Location & Nearby Places
  location_eyebrow: string;
  location_title: string;
  location_description: string;
  location_badge?: string;
  location_hotel_name?: string;
  location_address: string;
  location_maps_url: string;
  location_embed_url?: string;
  location_airport_distance: string;
  location_check_in_info: string;
  nearby_items: NearbyPlaceItem[];

  updated_at?: string;
  updated_by?: string | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string; full_name: string };
        Update: Partial<Profile>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          isOneToOne?: boolean;
          referencedRelation: string;
          referencedColumns: string[];
        }>;
      };
      admin_invite_keys: {
        Row: AdminInviteKey;
        Insert: Partial<AdminInviteKey> & { key: string };
        Update: Partial<AdminInviteKey>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          isOneToOne?: boolean;
          referencedRelation: string;
          referencedColumns: string[];
        }>;
      };
      footer_settings: {
        Row: FooterSettings;
        Insert: Partial<FooterSettings> & { id?: string };
        Update: Partial<FooterSettings>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          isOneToOne?: boolean;
          referencedRelation: string;
          referencedColumns: string[];
        }>;
      };
      rooms: {
        Row: DbRoom;
        Insert: Partial<DbRoom> & { name: string; slug: string; price: number; cover_image: string };
        Update: Partial<DbRoom>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          isOneToOne?: boolean;
          referencedRelation: string;
          referencedColumns: string[];
        }>;
      };
      hero_slides: {
        Row: DbHeroSlide;
        Insert: Partial<DbHeroSlide> & { title: string; image_url: string };
        Update: Partial<DbHeroSlide>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          isOneToOne?: boolean;
          referencedRelation: string;
          referencedColumns: string[];
        }>;
      };
      difference_settings: {
        Row: DifferenceSettings;
        Insert: Partial<DifferenceSettings> & { id?: string };
        Update: Partial<DifferenceSettings>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          isOneToOne?: boolean;
          referencedRelation: string;
          referencedColumns: string[];
        }>;
      };
      escape_settings: {
        Row: EscapeSettings;
        Insert: Partial<EscapeSettings> & { id?: string };
        Update: Partial<EscapeSettings>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          isOneToOne?: boolean;
          referencedRelation: string;
          referencedColumns: string[];
        }>;
      };
      why_book_settings: {
        Row: WhyBookSettings;
        Insert: Partial<WhyBookSettings> & { id?: string };
        Update: Partial<WhyBookSettings>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          isOneToOne?: boolean;
          referencedRelation: string;
          referencedColumns: string[];
        }>;
      };
      hospitality_settings: {
        Row: HospitalitySettings;
        Insert: Partial<HospitalitySettings> & { id?: string };
        Update: Partial<HospitalitySettings>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          isOneToOne?: boolean;
          referencedRelation: string;
          referencedColumns: string[];
        }>;
      };
      experience_settings: {
        Row: ExperienceSettings;
        Insert: Partial<ExperienceSettings> & { id?: string };
        Update: Partial<ExperienceSettings>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          isOneToOne?: boolean;
          referencedRelation: string;
          referencedColumns: string[];
        }>;
      };
      offers_settings: {
        Row: OffersSettings;
        Insert: Partial<OffersSettings> & { id?: string };
        Update: Partial<OffersSettings>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          isOneToOne?: boolean;
          referencedRelation: string;
          referencedColumns: string[];
        }>;
      };
      rooms_header_settings: {
        Row: RoomsHeaderSettings;
        Insert: Partial<RoomsHeaderSettings> & { id?: string };
        Update: Partial<RoomsHeaderSettings>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          isOneToOne?: boolean;
          referencedRelation: string;
          referencedColumns: string[];
        }>;
      };
      auth_pages_settings: {
        Row: AuthPagesSettings;
        Insert: Partial<AuthPagesSettings> & { id?: string };
        Update: Partial<AuthPagesSettings>;
        Relationships: Array<{
          foreignKeyName: string;
          columns: string[];
          isOneToOne?: boolean;
          referencedRelation: string;
          referencedColumns: string[];
        }>;
      };
    };
    Views: Record<string, {
      Row: Record<string, unknown>;
      Relationships: [];
    }>;
    Functions: {
      is_admin: {
        Args: Record<string, unknown>;
        Returns: boolean;
      };
    };
    Enums: Record<string, string>;
    CompositeTypes: Record<string, unknown>;
  };
}
