"use client";

import { useEffect } from "react";
import { resolveTheme } from "@/lib/preferences";
import { useAuthStore } from "@/stores/auth-store";
import { usePreferencesStore } from "@/stores/preferences-store";

export function PreferencesProvider(): React.JSX.Element | null {
  const token = useAuthStore((state) => state.token);
  const preferences = usePreferencesStore((state) => state.preferences);
  const hasInitialized = usePreferencesStore((state) => state.hasInitialized);
  const hasLoadedRemote = usePreferencesStore((state) => state.hasLoadedRemote);
  const initializePreferences = usePreferencesStore((state) => state.initializePreferences);
  const hydrateFromRemote = usePreferencesStore((state) => state.hydrateFromRemote);

  useEffect(() => {
    initializePreferences();
  }, [initializePreferences]);

  useEffect(() => {
    if (!token || hasLoadedRemote === true) {
      return;
    }

    void hydrateFromRemote(token);
  }, [token, hasLoadedRemote, hydrateFromRemote]);

  useEffect(() => {
    if (!hasInitialized || typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    const resolvedTheme = resolveTheme(preferences.theme);

    root.lang = preferences.language;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.dataset.theme = resolvedTheme;
    root.dataset.timezone = preferences.timezone;
    root.dataset.currency = preferences.currency;
    root.dataset.dateFormat = preferences.dateFormat;
    root.dataset.timeFormat = preferences.timeFormat;
  }, [hasInitialized, preferences]);

  return null;
}
