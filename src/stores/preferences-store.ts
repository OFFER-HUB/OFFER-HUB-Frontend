"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getPreferences, updatePreferences } from "@/lib/api/preferences";
import { DEFAULT_PREFERENCES, detectBrowserPreferences } from "@/lib/preferences";
import type { SavePreferencesResult, UserPreferences } from "@/types/preferences.types";

interface PreferencesState {
  preferences: UserPreferences;
  hasInitialized: boolean;
  hasLoadedRemote: boolean;
  initializePreferences: () => void;
  hydrateFromRemote: (token: string) => Promise<void>;
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  replacePreferences: (preferences: UserPreferences) => void;
  savePreferences: (token: string | null) => Promise<SavePreferencesResult>;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      preferences: DEFAULT_PREFERENCES,
      hasInitialized: false,
      hasLoadedRemote: false,
      initializePreferences: () => {
        if (get().hasInitialized) {
          return;
        }

        const currentPreferences = get().preferences;
        const hasSavedPreferences =
          JSON.stringify(currentPreferences) !== JSON.stringify(DEFAULT_PREFERENCES);

        set({
          preferences: hasSavedPreferences ? currentPreferences : detectBrowserPreferences(),
          hasInitialized: true,
        });
      },
      hydrateFromRemote: async (token) => {
        if (get().hasLoadedRemote) {
          return;
        }

        try {
          const remotePreferences = await getPreferences(token);
          set({
            preferences: remotePreferences,
            hasInitialized: true,
            hasLoadedRemote: true,
          });
        } catch {
          set({ hasLoadedRemote: true });
        }
      },
      setPreference: (key, value) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: value,
          },
        })),
      replacePreferences: (preferences) => set({ preferences }),
      savePreferences: async (token) => {
        const currentPreferences = get().preferences;

        if (!token) {
          return {
            savedRemotely: false,
            message: "Preferences saved on this device",
          };
        }

        const savedPreferences = await updatePreferences(token, currentPreferences);
        set({ preferences: savedPreferences });

        return {
          savedRemotely: true,
          message: "Preferences synced successfully",
        };
      },
    }),
    {
      name: "preferences-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        hasInitialized: state.hasInitialized,
      }),
    }
  )
);
