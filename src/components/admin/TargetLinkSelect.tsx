"use client";

import React, { useMemo, useState } from "react";
import { List, PenLine, Globe } from "lucide-react";

export interface ProjectRouteOption {
  value: string;
  label: string;
}

export interface RouteGroup {
  group: string;
  options: ProjectRouteOption[];
}

export const MAIN_PAGE_ROUTES: ProjectRouteOption[] = [
  { value: "/rooms", label: "Rooms & Suites Catalog (/rooms)" },
  { value: "/offers", label: "Offers & Bespoke Packages (/offers)" },
  { value: "/experience", label: "Experience, Facilities & Location (/experience)" },
  { value: "/booking", label: "Direct Reservation & Booking (/booking)" },
  { value: "/", label: "Homepage (/)" },
];

export const HOMEPAGE_SECTION_ROUTES: ProjectRouteOption[] = [
  { value: "/#rooms", label: "Featured Rooms & Suites (/#rooms)" },
  { value: "/#booking", label: "Quick Reservation Widget (/#booking)" },
  { value: "/#experience", label: "Experience Gateway (/#experience)" },
  { value: "/#hospitality", label: "The Art of Hospitality (/#hospitality)" },
  { value: "/#escape", label: "Private Sanctuary / Escape (/#escape)" },
  { value: "/#why-book", label: "Why Book With Us / Privileges (/#why-book)" },
  { value: "/#offers", label: "Special Offers Section (/#offers)" },
  { value: "/#contact", label: "Contact & Location Section (/#contact)" },
];

export const MEMBER_PORTAL_ROUTES: ProjectRouteOption[] = [
  { value: "/login", label: "Guest / Member Sign In (/login)" },
  { value: "/register", label: "Member Registration (/register)" },
  { value: "/profile", label: "Guest Profile & Preferences (/profile)" },
];

export interface TargetLinkSelectProps {
  value: string;
  onChange: (value: string) => void;
  rooms?: Array<{ slug?: string | null; name: string }>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
}

export default function TargetLinkSelect({
  value,
  onChange,
  rooms = [],
  placeholder,
  className,
  disabled = false,
  id,
  name,
  required = false,
}: TargetLinkSelectProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Compute known values to detect legacy or custom URLs
  const isCustomValue = useMemo(() => {
    if (!value) return false;
    const known = new Set<string>([
      ...MAIN_PAGE_ROUTES.map((r) => r.value),
      ...HOMEPAGE_SECTION_ROUTES.map((r) => r.value),
      ...MEMBER_PORTAL_ROUTES.map((r) => r.value),
      "#rooms",
      "#booking",
      "#contact",
      "#experience",
      "#hospitality",
      "#escape",
      "#why-book",
      "#offers",
    ]);

    rooms.forEach((room) => {
      if (room.slug) {
        known.add(`/rooms/${room.slug}`);
      }
    });

    return !known.has(value);
  }, [value, rooms]);

  const defaultClasses =
    "w-full rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:bg-white focus:outline-none cursor-pointer transition";

  const handleSelectChange = (val: string) => {
    if (val === "__custom__") {
      setIsCustomMode(true);
      if (!isCustomValue) {
        onChange("");
      }
    } else {
      onChange(val);
    }
  };

  // If currently in custom text input mode
  if (isCustomMode) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              id={id}
              name={name}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              required={required}
              placeholder="e.g. https://wa.me/62812... or https://example.com"
              className="w-full rounded-lg border border-[#a58b72] bg-white px-3.5 py-2.5 text-xs text-[#292722] focus:border-[#4a382d] focus:outline-none focus:ring-1 focus:ring-[#4a382d]"
              autoFocus
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setIsCustomMode(false);
              if (isCustomValue || !value) {
                onChange("/rooms");
              }
            }}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-3 py-2.5 text-xs font-medium text-[#755b43] hover:bg-[#eee7dc] hover:text-[#4a382d] transition shrink-0"
            title="Return to page dropdown options"
          >
            <List size={13} />
            <span>Select Page</span>
          </button>
        </div>
        <p className="text-[11px] text-[#777064]">
          Custom URL Mode: Enter a WhatsApp link or external website. Click &quot;Select Page&quot; to choose internal project routes.
        </p>
      </div>
    );
  }

  // Otherwise, render dropdown <select>
  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <select
          id={id}
          name={name}
          value={isCustomValue ? value : value}
          onChange={(e) => handleSelectChange(e.target.value)}
          disabled={disabled}
          required={required}
          className={className || defaultClasses}
        >
          {placeholder && (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          )}

          {/* 1. Main Project Pages */}
          <optgroup label="Main Pages">
            {MAIN_PAGE_ROUTES.map((route) => (
              <option key={route.value} value={route.value}>
                {route.label}
              </option>
            ))}
          </optgroup>

          {/* 2. Individual Room Suites */}
          {rooms && rooms.length > 0 && (
            <optgroup label="Rooms & Suites (Specific Room Details)">
              {rooms
                .filter((room) => Boolean(room.slug))
                .map((room) => (
                  <option key={room.slug} value={`/rooms/${room.slug}`}>
                    {room.name} (/rooms/{room.slug})
                  </option>
                ))}
            </optgroup>
          )}

          {/* 3. Homepage Sections */}
          <optgroup label="Homepage Sections">
            {HOMEPAGE_SECTION_ROUTES.map((route) => (
              <option key={route.value} value={route.value}>
                {route.label}
              </option>
            ))}
          </optgroup>

          {/* 4. Guest & Member Access */}
          <optgroup label="Member Access">
            {MEMBER_PORTAL_ROUTES.map((route) => (
              <option key={route.value} value={route.value}>
                {route.label}
              </option>
            ))}
          </optgroup>

          {/* 5. Legacy Anchors (if currently selected) */}
          {["#rooms", "#booking", "#contact", "#experience", "#hospitality", "#escape", "#why-book", "#offers"].includes(
            value
          ) && (
            <optgroup label="Anchor Section">
              <option value={value}>{value}</option>
            </optgroup>
          )}

          {/* 6. Current Custom or External Link & Option to add new Custom */}
          <optgroup label="Custom / External Link">
            {isCustomValue && (
              <option value={value}>
                {value} (Active Custom URL)
              </option>
            )}
            <option value="__custom__">
              ✍️ + Enter New Custom / External URL...
            </option>
          </optgroup>
        </select>

        {isCustomValue && (
          <button
            type="button"
            onClick={() => setIsCustomMode(true)}
            className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-[#ded5c8] bg-[#fbf9f5] px-2.5 py-2.5 text-xs text-[#755b43] hover:bg-[#eee7dc] hover:text-[#4a382d] transition shrink-0"
            title="Edit this custom URL"
          >
            <PenLine size={13} />
            <span className="hidden sm:inline">Edit URL</span>
          </button>
        )}
      </div>
    </div>
  );
}

