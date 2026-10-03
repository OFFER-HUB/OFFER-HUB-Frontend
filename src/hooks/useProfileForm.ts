"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { getProfile, updateProfile, type UpdateProfileData } from "@/lib/api/profile";
import { uploadImage } from "@/lib/api/upload";
import type { ProfileFormData, ProfileFormErrors } from "@/types/profile-form.types";

const MAX_BIO_LENGTH = 500;

const INITIAL_FORM_DATA: ProfileFormData = {
  firstName: "",
  lastName: "",
  username: "",
  dateOfBirth: "",
  professionalTitle: "",
  bio: "",
  location: "",
  timezone: "",
  phone: "",
};

function toProfileFormData(profile: Awaited<ReturnType<typeof getProfile>>): ProfileFormData {
  return {
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    username: profile.username || "",
    dateOfBirth: profile.dateOfBirth || "",
    professionalTitle: profile.professionalTitle || "",
    bio: profile.bio || "",
    location: profile.location || "",
    timezone: profile.timezone || "",
    phone: profile.phone || "",
  };
}

function validateProfileForm(formData: ProfileFormData): ProfileFormErrors {
  const errors: ProfileFormErrors = {};
  if (formData.bio.length > MAX_BIO_LENGTH) {
    errors.bio = `Bio must be less than ${MAX_BIO_LENGTH} characters`;
  }
  return errors;
}

export function useProfileForm() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_FORM_DATA);
  const [loadedProfile, setLoadedProfile] = useState<ProfileFormData | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadKey, setImageUploadKey] = useState(0);
  const [completenessKey, setCompletenessKey] = useState(0);
  const loadRequest = useRef(0);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const loadProfile = useCallback(async () => {
    const request = ++loadRequest.current;
    if (!token) {
      setIsFetching(false);
      setLoadError(null);
      return;
    }

    setIsFetching(true);
    setLoadError(null);
    try {
      const profile = await getProfile(token);
      if (request !== loadRequest.current) return;

      const data = toProfileFormData(profile);
      setFormData(data);
      setLoadedProfile(data);
      setAvatarUrl(profile.avatarUrl?.startsWith("blob:") ? null : profile.avatarUrl);
      setErrors({});
    } catch (error) {
      if (request === loadRequest.current) {
        const message = error instanceof Error ? error.message : "Failed to load profile";
        setLoadError(message);
      }
    } finally {
      if (request === loadRequest.current) setIsFetching(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isHydrated) return;
    void loadProfile();
    return () => { loadRequest.current += 1; };
  }, [isHydrated, loadProfile]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (errors[name as keyof ProfileFormErrors]) {
      setErrors((previous) => ({ ...previous, [name]: undefined }));
    }
  }

  async function handleImageUpload(files: File[]) {
    const file = files[0];
    if (!file) return;
    if (!token) {
      setErrors((previous) => ({
        ...previous,
        submit: "Authentication token not found. Please log in again.",
      }));
      setImageUploadKey((key) => key + 1);
      return;
    }

    const previousAvatarUrl = avatarUrl;
    setIsUploadingImage(true);
    setErrors((previous) => ({ ...previous, submit: undefined }));

    try {
      const result = await uploadImage(file, token, "avatars");
      await updateProfile(token, { avatarUrl: result.url });
      setAvatarUrl(result.url);
      setCompletenessKey((key) => key + 1);
    } catch (error) {
      setAvatarUrl(previousAvatarUrl);
      setErrors((previous) => ({
        ...previous,
        submit: error instanceof Error ? error.message : "Failed to upload image",
      }));
    } finally {
      setImageUploadKey((key) => key + 1);
      setIsUploadingImage(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateProfileForm(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    if (!token) {
      setErrors({ submit: "Authentication token not found. Please log in again." });
      return;
    }

    setIsLoading(true);
    try {
      const updatedFields: UpdateProfileData = {};
      if (formData.firstName !== (loadedProfile?.firstName ?? "")) {
        updatedFields.firstName = formData.firstName;
      }
      if (formData.lastName !== (loadedProfile?.lastName ?? "")) {
        updatedFields.lastName = formData.lastName;
      }
      if (formData.username !== (loadedProfile?.username ?? "")) {
        updatedFields.username = formData.username;
      }
      if (formData.dateOfBirth !== (loadedProfile?.dateOfBirth ?? "")) {
        updatedFields.dateOfBirth = formData.dateOfBirth || null;
      }
      if (formData.professionalTitle !== (loadedProfile?.professionalTitle ?? "")) {
        updatedFields.professionalTitle = formData.professionalTitle;
      }
      if (formData.bio !== (loadedProfile?.bio ?? "")) {
        updatedFields.bio = formData.bio;
      }
      if (formData.location !== (loadedProfile?.location ?? "")) {
        updatedFields.location = formData.location;
      }
      if (formData.timezone !== (loadedProfile?.timezone ?? "")) {
        updatedFields.timezone = formData.timezone;
      }
      if (formData.phone !== (loadedProfile?.phone ?? "")) {
        updatedFields.phone = formData.phone;
      }

      if (Object.keys(updatedFields).length > 0) {
        await updateProfile(token, updatedFields);
        setLoadedProfile(formData);
      }

      setShowSuccess(true);
      setCompletenessKey((key) => key + 1);
      window.setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Failed to update profile" });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    user,
    formData,
    setFormData,
    avatarUrl,
    errors,
    isLoading,
    isFetching,
    loadError,
    showSuccess,
    isUploadingImage,
    imageUploadKey,
    completenessKey,
    handleChange,
    handleImageUpload,
    handleSubmit,
    retryLoad: loadProfile,
  };
}
