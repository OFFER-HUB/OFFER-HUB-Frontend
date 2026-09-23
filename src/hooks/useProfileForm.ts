import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { getProfile, updateProfile, type UpdateProfileData } from "@/lib/api/profile";
import { uploadImage } from "@/lib/api/upload";

export type ProfileFormValues = { firstName: string; lastName: string; username: string; dateOfBirth: string; professionalTitle: string; bio: string; location: string; timezone: string; phone: string };
const EMPTY: ProfileFormValues = { firstName: "", lastName: "", username: "", dateOfBirth: "", professionalTitle: "", bio: "", location: "", timezone: "", phone: "" };

export function useProfileForm() {
  const token = useAuthStore((state) => state.token);
  const [values, setValues] = useState<ProfileFormValues>(EMPTY);
  const [loaded, setLoaded] = useState<ProfileFormValues | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!token) { setIsFetching(false); return; } void getProfile(token).then((profile) => { const next = Object.fromEntries(Object.keys(EMPTY).map((key) => [key, profile[key as keyof typeof profile] ?? ""])) as ProfileFormValues; setValues(next); setLoaded(next); setAvatarUrl(profile.avatarUrl?.startsWith("blob:") ? null : profile.avatarUrl ?? null); }).catch((cause) => setError(cause instanceof Error ? cause.message : "Failed to load profile")).finally(() => setIsFetching(false)); }, [token]);
  const setField = (name: keyof ProfileFormValues, value: string) => setValues((current) => ({ ...current, [name]: value }));
  const submit = async (fields: UpdateProfileData = {}) => { if (!token) throw new Error("Authentication token not found. Please log in again."); setIsSubmitting(true); try { const changed = Object.fromEntries(Object.entries(values).filter(([key, value]) => value !== (loaded?.[key as keyof ProfileFormValues] ?? ""))); await updateProfile(token, { ...changed, ...fields }); setLoaded(values); } finally { setIsSubmitting(false); } };
  const uploadAvatar = async (file: File) => { if (!token) return; const preview = URL.createObjectURL(file); setAvatarUrl(preview); try { const result = await uploadImage(file, token, "avatars"); URL.revokeObjectURL(preview); setAvatarUrl(result.url); await updateProfile(token, { avatarUrl: result.url }); } catch (cause) { URL.revokeObjectURL(preview); setAvatarUrl(null); throw cause; } };
  return { values, setValues, setField, loaded, avatarUrl, setAvatarUrl, isFetching, isSubmitting, error, submit, uploadAvatar };
}
