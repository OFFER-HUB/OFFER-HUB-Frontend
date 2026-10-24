"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { getProfile, updateProfile, type UpdateProfileData } from "@/lib/api/profile";
import { uploadImage } from "@/lib/api/upload";

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  username: string;
  dateOfBirth: string;
  professionalTitle: string;
  bio: string;
  location: string;
  timezone: string;
  phone: string;
}

export interface FormErrors {
  firstName?: string;
  lastName?: string;
  username?: string;
  dateOfBirth?: string;
  bio?: string;
  professionalTitle?: string;
  location?: string;
  timezone?: string;
  phone?: string;
  submit?: string;
}

const MAX_BIO_LENGTH = 500;
const SUCCESS_MESSAGE_DURATION = 3000;

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

function validateProfileForm(formData: ProfileFormData): FormErrors {
  const errors: FormErrors = {};

  if (formData.bio.length > MAX_BIO_LENGTH) {
    errors.bio = `Bio must be less than ${MAX_BIO_LENGTH} characters`;
  }

  return errors;
}

export function useProfileForm() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_FORM_DATA);
  const [loadedProfile, setLoadedProfile] = useState<ProfileFormData | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [completenessKey, setCompletenessKey] = useState(0);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!isHydrated || !token) {
        if (isHydrated) {
          setIsFetching(false);
        }
        return;
      }

      try {
        const profile = await getProfile(token);
        const data = {
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

        setFormData(data);
        setLoadedProfile(data);
        setAvatarUrl(profile.avatarUrl?.startsWith("blob:") ? null : profile.avatarUrl);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsFetching(false);
      }
    }

    loadProfile();
  }, [token, isHydrated]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleImageUpload(files: File[]) {
    if (files.length === 0 || !token) return;

    const file = files[0];
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    setIsUploadingImage(true);

    try {
      const result = await uploadImage(file, token, "avatars");
      URL.revokeObjectURL(previewUrl);
      setAvatarUrl(result.url);

      await updateProfile(token, {
        avatarUrl: result.url,
      });

      setCompletenessKey((k) => k + 1);
    } catch (error) {
      console.error("Failed to upload image:", error);
      URL.revokeObjectURL(previewUrl);
      setAvatarUrl(null);
      setErrors({ submit: error instanceof Error ? error.message : "Failed to upload image" });
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validateProfileForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

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
      setCompletenessKey((k) => k + 1);
      setTimeout(() => setShowSuccess(false), SUCCESS_MESSAGE_DURATION);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setErrors({ submit: error instanceof Error ? error.message : "Failed to update profile" });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    formData,
    errors,
    isLoading,
    isFetching,
    showSuccess,
    avatarUrl,
    user,
    completenessKey,
    isUploadingImage,
    handleChange,
    handleImageUpload,
    handleSubmit,
  };
}
