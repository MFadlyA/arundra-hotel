"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { DEFAULT_FOOTER_SETTINGS } from "@/lib/footer-settings";
import type { FooterSettings } from "@/types/database";

interface FooterContextValue {
  settings: FooterSettings;
  updateSettings: (s: FooterSettings) => void;
}

const FooterContext = createContext<FooterContextValue>({
  settings: DEFAULT_FOOTER_SETTINGS,
  updateSettings: () => {},
});

export function FooterProvider({
  initialSettings,
  children,
}: {
  initialSettings?: FooterSettings;
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<FooterSettings>(
    initialSettings || DEFAULT_FOOTER_SETTINGS
  );

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  useEffect(() => {
    // Listen for real-time updates broadcast by Admin Portal
    const handleFooterUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<FooterSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        fetch("/api/footer", { cache: "no-store" })
          .then((res) => res.json())
          .then((data) => data.settings && setSettings(data.settings))
          .catch(() => {});
      }
    };

    window.addEventListener("footer-settings-updated", handleFooterUpdated);
    return () => {
      window.removeEventListener("footer-settings-updated", handleFooterUpdated);
    };
  }, []);

  return (
    <FooterContext.Provider value={{ settings, updateSettings: setSettings }}>
      {children}
    </FooterContext.Provider>
  );
}

export function useFooterSettings() {
  return useContext(FooterContext);
}

