"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { getProfile } from "@/lib/api/profile";
import {
  DEFAULT_FREELANCER_AVAILABILITY,
  getFreelancerAvailability,
  updateFreelancerAvailability,
  type FreelancerAvailability,
} from "@/lib/api/availability";

const AUTOSAVE_MS = 500;

export function useAvailabilityForm() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [form, setForm] = useState<FreelancerAvailability>(DEFAULT_FREELANCER_AVAILABILITY);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const u = user?.avatarUrl;
    if (u && !u.startsWith("blob:")) setAvatarUrl(u);
  }, [user?.avatarUrl]);

  // Load effect (fetch effect 1)
  useEffect(() => {
    if (!hydrated || !token) {
      if (hydrated) setIsLoading(false);
      return;
    }

    const authToken = token;
    let cancelled = false;

    async function load(): Promise<void> {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [data, profile] = await Promise.all([
          getFreelancerAvailability(authToken),
          getProfile(authToken).catch(() => null),
        ]);

        if (cancelled) return;

        setForm(data);
        setDirty(false);
        setSaveSucceeded(false);
        setLoaded(true);

        if (profile?.avatarUrl && !profile.avatarUrl.startsWith("blob:")) {
          setAvatarUrl(profile.avatarUrl);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Could not load availability");
          setLoaded(false);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [hydrated, token]);

  // Persist function
  const persist = useCallback(
    async (next: FreelancerAvailability): Promise<void> => {
      if (!token) return;
      setIsSaving(true);
      setSaveError(null);
      try {
        const saved = await updateFreelancerAvailability(token, next);
        setForm(saved);
        setDirty(false);
        setSaveSucceeded(true);
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Save failed");
      } finally {
        setIsSaving(false);
      }
    },
    [token]
  );

  // Autosave effect (fetch/update effect 2)
  useEffect(() => {
    if (!loaded || !dirty || !token) return;

    const t = window.setTimeout(() => {
      void persist(form);
    }, AUTOSAVE_MS);

    return () => window.clearTimeout(t);
  }, [form, dirty, loaded, token, persist]);

  const patchForm = useCallback((partial: Partial<FreelancerAvailability>): void => {
    setForm((prev) => ({ ...prev, ...partial }));
    setDirty(true);
  }, []);

  return {
    form,
    patchForm,
    isSaving,
    isLoading,
    saveError,
    loadError,
    dirty,
    saveSucceeded,
    avatarUrl,
    hydrated,
    token,
    user,
    setForm,
    setDirty,
    setSaveSucceeded,
  };
}
