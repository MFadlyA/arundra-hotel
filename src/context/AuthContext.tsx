"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/types/database";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  isAdmin: false,
  isLoading: true,
  isConfigured: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({
  initialUser = null,
  initialProfile = null,
  children,
}: {
  initialUser?: User | null;
  initialProfile?: Profile | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [profile, setProfile] = useState<Profile | null>(initialProfile ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const isConfigured = isSupabaseConfigured();

  // Keep state synchronized with server-passed session
  useEffect(() => {
    setUser(initialUser ?? null);
    setProfile(initialProfile ?? null);
  }, [initialUser, initialProfile]);

  const fetchProfile = useCallback(async (userId: string, currentUser?: User) => {
    if (!isConfigured) return null;
    const supabase = createClient();

    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        const loadedProfile = data as Profile;
        const metaPhone =
          currentUser?.user_metadata?.phone ||
          currentUser?.user_metadata?.phone_number;

        if (!loadedProfile.phone && metaPhone) {
          loadedProfile.phone = String(metaPhone).trim();
          (supabase.from("profiles") as any)
            .update({ phone: loadedProfile.phone })
            .eq("id", userId)
            .then(() => {});
        }

        setProfile(loadedProfile);
        return loadedProfile;
      }

      setProfile(null);
      return null;
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setProfile(null);
      return null;
    }
  }, [isConfigured]);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    await fetchProfile(user.id, user);
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    let isMounted = true;

    // Listen to client-side auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === "SIGNED_OUT" || !session?.user) {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const authUser = session.user;
      setUser(authUser);
      setIsLoading(false);
      fetchProfile(authUser.id, authUser);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isConfigured, fetchProfile]);

  const signOut = async () => {
    setUser(null);
    setProfile(null);

    if (isConfigured) {
      const supabase = createClient();
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch (e) {
        console.error("SignOut error:", e);
      }
    }
    router.refresh();
  };

  // Rely on database profiles table or tamper-proof app_metadata (never trust client-writable user_metadata)
  const role: UserRole | null =
    profile?.role ??
    ((user?.app_metadata?.role as UserRole) || null) ??
    null;
  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        isLoading,
        isConfigured,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
