import type { AuthPagesSettings } from "@/types/database";

export const DEFAULT_AUTH_PAGES_SETTINGS: AuthPagesSettings = {
  id: "default",

  // Login Page Settings
  login_brand_title: "Arundra Signature",
  login_brand_subtitle: "HOTEL & RESIDENCE",
  login_image:
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=90",
  login_image_path: null,
  login_badge: "YOUR SIGNATURE STAY, YOUR WAY",
  login_title: "Your next exceptional stay begins here.",
  login_description:
    "Sign in to manage your reservations at Arundra Signature Residence Pondok Indah or access the management portal for personnel.",
  login_form_eyebrow: "YOUR PERSONAL SPACE",
  login_form_title: "Welcome Back",
  login_form_description: "Enter your credentials to access your account.",

  // Register Page Settings
  register_brand_title: "Arundra Signature",
  register_brand_subtitle: "HOTEL & RESIDENCE",
  register_image:
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=90",
  register_image_path: null,
  register_badge: "PONDOK INDAH, SOUTH JAKARTA",
  register_title: "Pengalaman Menginap Istimewa.",
  register_description:
    "Create an account to manage your reservations and experience warm modern elegance at Arundra Signature Residence Pondok Indah.",
  register_form_eyebrow: "BECOME A MEMBER",
  register_form_title: "Create Account",
  register_form_description:
    "Complete your information below to create your account.",
};

export function sanitizeAuthPagesPayload(
  payload: Partial<AuthPagesSettings>
): AuthPagesSettings {
  return {
    id: "default",

    // Login
    login_brand_title:
      typeof payload.login_brand_title === "string" &&
      payload.login_brand_title.trim().length > 0
        ? payload.login_brand_title.trim()
        : DEFAULT_AUTH_PAGES_SETTINGS.login_brand_title,
    login_brand_subtitle:
      typeof payload.login_brand_subtitle === "string" &&
      payload.login_brand_subtitle.trim().length > 0
        ? payload.login_brand_subtitle.trim()
        : DEFAULT_AUTH_PAGES_SETTINGS.login_brand_subtitle,
    login_image:
      typeof payload.login_image === "string" && payload.login_image.trim().length > 0
        ? payload.login_image.trim()
        : DEFAULT_AUTH_PAGES_SETTINGS.login_image,
    login_image_path:
      typeof payload.login_image_path === "string"
        ? payload.login_image_path
        : null,
    login_badge:
      typeof payload.login_badge === "string" && payload.login_badge.trim().length > 0
        ? payload.login_badge.trim()
        : DEFAULT_AUTH_PAGES_SETTINGS.login_badge,
    login_title:
      typeof payload.login_title === "string" && payload.login_title.trim().length > 0
        ? payload.login_title.trim()
        : DEFAULT_AUTH_PAGES_SETTINGS.login_title,
    login_description:
      typeof payload.login_description === "string" &&
      payload.login_description.trim().length > 0
        ? payload.login_description.trim()
        : DEFAULT_AUTH_PAGES_SETTINGS.login_description,
    login_form_eyebrow:
      typeof payload.login_form_eyebrow === "string" &&
      payload.login_form_eyebrow.trim().length > 0
        ? payload.login_form_eyebrow.trim()
        : DEFAULT_AUTH_PAGES_SETTINGS.login_form_eyebrow,
    login_form_title:
      typeof payload.login_form_title === "string" &&
      payload.login_form_title.trim().length > 0
        ? payload.login_form_title.trim()
        : DEFAULT_AUTH_PAGES_SETTINGS.login_form_title,
    login_form_description:
      typeof payload.login_form_description === "string" &&
      payload.login_form_description.trim().length > 0
        ? payload.login_form_description.trim()
        : DEFAULT_AUTH_PAGES_SETTINGS.login_form_description,

    // Register
    register_brand_title:
      typeof payload.register_brand_title === "string" &&
      payload.register_brand_title.trim().length > 0
        ? payload.register_brand_title.trim()
        : DEFAULT_AUTH_PAGES_SETTINGS.register_brand_title,
    register_brand_subtitle:
      typeof payload.register_brand_subtitle === "string" &&
      payload.register_brand_subtitle.trim().length > 0
        ? payload.register_brand_subtitle.trim()
        : DEFAULT_AUTH_PAGES_SETTINGS.register_brand_subtitle,
    register_image:
      typeof payload.register_image === "string" &&
      payload.register_image.trim().length > 0
        ? payload.register_image.trim()
        : DEFAULT_AUTH_PAGES_SETTINGS.register_image,
    register_image_path:
      typeof payload.register_image_path === "string"
        ? payload.register_image_path
        : null,
    register_badge:
      typeof payload.register_badge === "string" &&
      payload.register_badge.trim().length > 0
        ? payload.register_badge.trim()
        : DEFAULT_AUTH_PAGES_SETTINGS.register_badge,
    register_title:
      typeof payload.register_title === "string" &&
      payload.register_title.trim().length > 0
        ? payload.register_title.trim()
        : DEFAULT_AUTH_PAGES_SETTINGS.register_title,
    register_description:
      typeof payload.register_description === "string" &&
      payload.register_description.trim().length > 0
        ? payload.register_description.trim()
        : DEFAULT_AUTH_PAGES_SETTINGS.register_description,
    register_form_eyebrow:
      typeof payload.register_form_eyebrow === "string" &&
      payload.register_form_eyebrow.trim().length > 0
        ? payload.register_form_eyebrow.trim()
        : DEFAULT_AUTH_PAGES_SETTINGS.register_form_eyebrow,
    register_form_title:
      typeof payload.register_form_title === "string" &&
      payload.register_form_title.trim().length > 0
        ? payload.register_form_title.trim()
        : DEFAULT_AUTH_PAGES_SETTINGS.register_form_title,
    register_form_description:
      typeof payload.register_form_description === "string" &&
      payload.register_form_description.trim().length > 0
        ? payload.register_form_description.trim()
        : DEFAULT_AUTH_PAGES_SETTINGS.register_form_description,
  };
}

export const SQL_AUTH_PAGES_MIGRATION_SCRIPT = `-- ==============================================================================
-- ARUNDRA SIGNATURE HOTEL: LOGIN & REGISTER PAGES CMS SETTINGS
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.auth_pages_settings (
  id text PRIMARY KEY DEFAULT 'default',

  -- Login Page
  login_brand_title text NOT NULL DEFAULT 'Arundra Signature',
  login_brand_subtitle text NOT NULL DEFAULT 'HOTEL & RESIDENCE',
  login_image text NOT NULL DEFAULT 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=90',
  login_image_path text,
  login_badge text NOT NULL DEFAULT 'YOUR SIGNATURE STAY, YOUR WAY',
  login_title text NOT NULL DEFAULT 'Your next exceptional stay begins here.',
  login_description text NOT NULL DEFAULT 'Sign in to manage your reservations at Arundra Signature Residence Pondok Indah or access the management portal for personnel.',
  login_form_eyebrow text NOT NULL DEFAULT 'YOUR PERSONAL SPACE',
  login_form_title text NOT NULL DEFAULT 'Welcome Back',
  login_form_description text NOT NULL DEFAULT 'Enter your credentials to access your account.',

  -- Register Page
  register_brand_title text NOT NULL DEFAULT 'Arundra Signature',
  register_brand_subtitle text NOT NULL DEFAULT 'HOTEL & RESIDENCE',
  register_image text NOT NULL DEFAULT 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=90',
  register_image_path text,
  register_badge text NOT NULL DEFAULT 'PONDOK INDAH, SOUTH JAKARTA',
  register_title text NOT NULL DEFAULT 'Pengalaman Menginap Istimewa.',
  register_description text NOT NULL DEFAULT 'Create an account to manage your reservations and experience warm modern elegance at Arundra Signature Residence Pondok Indah.',
  register_form_eyebrow text NOT NULL DEFAULT 'BECOME A MEMBER / STAFF',
  register_form_title text NOT NULL DEFAULT 'Create Account',
  register_form_description text NOT NULL DEFAULT 'Select your role and complete your information below.',

  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Upgrade columns if table already existed previously
ALTER TABLE public.auth_pages_settings ADD COLUMN IF NOT EXISTS login_brand_title text NOT NULL DEFAULT 'Arundra Signature';
ALTER TABLE public.auth_pages_settings ADD COLUMN IF NOT EXISTS login_brand_subtitle text NOT NULL DEFAULT 'HOTEL & RESIDENCE';
ALTER TABLE public.auth_pages_settings ADD COLUMN IF NOT EXISTS register_brand_title text NOT NULL DEFAULT 'Arundra Signature';
ALTER TABLE public.auth_pages_settings ADD COLUMN IF NOT EXISTS register_brand_subtitle text NOT NULL DEFAULT 'HOTEL & RESIDENCE';

-- Seed initial default row
INSERT INTO public.auth_pages_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.auth_pages_settings ENABLE ROW LEVEL SECURITY;

-- 1. Everyone can read auth pages settings (Public & Guests)
DROP POLICY IF EXISTS "Auth pages settings are viewable by everyone" ON public.auth_pages_settings;
CREATE POLICY "Auth pages settings are viewable by everyone"
  ON public.auth_pages_settings
  FOR SELECT
  USING (true);

-- 2. Only authenticated admins can update auth pages settings
DROP POLICY IF EXISTS "Only admins can update auth pages settings" ON public.auth_pages_settings;
CREATE POLICY "Only admins can update auth pages settings"
  ON public.auth_pages_settings
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Only authenticated admins can insert auth pages settings
DROP POLICY IF EXISTS "Only admins can insert auth pages settings" ON public.auth_pages_settings;
CREATE POLICY "Only admins can insert auth pages settings"
  ON public.auth_pages_settings
  FOR INSERT
  WITH CHECK (public.is_admin());
`;
