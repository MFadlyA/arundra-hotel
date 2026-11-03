"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ShieldCheck, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (
      href.startsWith("/#") &&
      typeof window !== "undefined" &&
      window.location.pathname === "/"
    ) {
      const targetId = href.replace("/#", "");
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", href);
      }
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Rooms & Suites", href: "/#rooms" },
    { label: "Experience", href: "/experience" },
    { label: "Offers", href: "/offers" },
    { label: "Contact", href: "/#contact" },
  ];

  // Auth UI logic: synchronous from cached state to eliminate split-second flicker
  const showUser = Boolean(user);
  const showAdmin = Boolean(isAdmin);

  return (
    <header className="relative z-50 border-b border-[#ded5c8] bg-[#f8f6f1]">
      <nav className="container-custom flex h-[82px] items-center justify-between gap-4">
        {/* BRAND LOGO */}
        <Link href="/" className="flex flex-col shrink-0">
          <span className="text-2xl font-semibold tracking-[0.12em] text-[#4a382d]">
            Arundra Signature
          </span>
          <span className="text-[9px] tracking-[0.42em] text-[#a58b72]">
            HOTEL & RESIDENCE
          </span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm text-[#62594f] transition hover:text-[#a58b72]"
            >
              {link.label}
            </Link>
          ))}
          {showAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-full bg-[#fbf3e8] px-3 py-1 text-xs font-semibold text-[#9b6826] border border-[#f0decc] hover:bg-[#f6ebd9] transition"
            >
              <ShieldCheck size={14} />
              Admin Portal
            </Link>
          )}
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-5 lg:flex shrink-0">
          {showUser ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="cursor-pointer flex items-center gap-2 text-xs group transition rounded-lg py-1 px-2 hover:bg-[#eee7dc]/60"
                title="View & Edit Profile"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4a382d] text-xs font-semibold text-white shrink-0 group-hover:scale-105 transition-transform">
                  {profile?.full_name ? (
                    profile.full_name[0].toUpperCase()
                  ) : (
                    <UserIcon size={14} />
                  )}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[#4a382d] max-w-[130px] truncate group-hover:text-[#a58b72] transition-colors">
                    {profile?.full_name || user?.email?.split("@")[0]}
                  </p>
                  <p className="text-[10px] text-[#a58b72]">
                    {isAdmin ? "Arundra Admin" : "Hotel Guest"}
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="cursor-pointer flex items-center gap-1 text-xs text-[#777064] hover:text-[#984b3b] transition"
                title="Sign Out"
              >
                <LogOut size={15} />
                <span className="hidden xl:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-[#4a382d] hover:text-[#a58b72] transition"
            >
              Sign In
            </Link>
          )}

          {/* Book Your Stay - hidden for administrators */}
          {!showAdmin && (
            <Link
              href="/#booking"
              className="cursor-pointer rounded-lg bg-[#4a382d] px-6 py-3 text-sm font-medium text-white hover:bg-[#655043] transition shrink-0 shadow-sm"
            >
              Book Your Stay
            </Link>
          )}
        </div>

        {/* MOBILE & TABLET CONTROLS */}
        <div className="flex items-center gap-3 lg:hidden">
          {!showAdmin && (
            <Link
              href="/#booking"
              className="cursor-pointer rounded-lg bg-[#4a382d] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#655043] transition"
            >
              Book Stay
            </Link>
          )}

          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMenuOpen(!menuOpen)}
            className="cursor-pointer text-[#4a382d] p-1.5 focus:outline-none"
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* MOBILE DROPDOWN MENU */}
      {menuOpen && (
        <div className="absolute left-0 top-full w-full border-b border-[#ded5c8] bg-[#f8f6f1] px-6 py-5 shadow-xl lg:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  setMenuOpen(false);
                  handleNavClick(e, link.href);
                }}
                className="cursor-pointer text-sm font-medium text-[#4a382d] hover:text-[#a58b72]"
              >
                {link.label}
              </Link>
            ))}

            {showAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-[#fbf3e8] p-2.5 text-xs font-semibold text-[#9b6826] border border-[#f0decc]"
              >
                <ShieldCheck size={16} />
                Admin Portal Management
              </Link>
            )}

            <div className="my-1 border-t border-[#ded5c8]" />

            {showUser ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="cursor-pointer flex items-center justify-between p-2 rounded-xl hover:bg-[#eee7dc]/60 transition"
                  title="View & Edit Profile"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4a382d] text-xs font-semibold text-white">
                      {profile?.full_name ? (
                        profile.full_name[0].toUpperCase()
                      ) : (
                        <UserIcon size={14} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#4a382d]">
                        {profile?.full_name || user?.email}
                      </p>
                      <p className="text-xs text-[#a58b72]">
                        {isAdmin ? "Arundra Admin" : "Hotel Guest"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[#a58b72] hover:underline">
                    Edit Profile →
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={async () => {
                    setMenuOpen(false);
                    await handleSignOut();
                  }}
                  className="cursor-pointer flex items-center gap-2 text-sm text-[#984b3b] font-medium"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-[#4a382d] hover:text-[#a58b72]"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-[#a58b72] hover:text-[#4a382d]"
                >
                  Create an Account
                </Link>
              </div>
            )}

            {!showAdmin && (
              <Link
                href="/#booking"
                onClick={() => setMenuOpen(false)}
                className="cursor-pointer mt-2 rounded-lg bg-[#4a382d] px-5 py-3 text-center text-sm font-medium text-white hover:bg-[#655043] transition"
              >
                Book Your Stay
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}