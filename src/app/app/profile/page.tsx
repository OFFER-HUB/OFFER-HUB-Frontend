"use client";

import { useState, useEffect, Suspense } from "react";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import {
  NEUMORPHIC_CARD,
  NEUMORPHIC_INPUT,
  INPUT_ERROR_STYLES,
  PRIMARY_BUTTON,
} from "@/lib/styles";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { getProfile, updateProfile, type UpdateProfileData } from "@/lib/api/profile";
import { uploadImage } from "@/lib/api/upload";
import Link from "next/link";
import { ConnectedAccounts } from "@/components/profile/ConnectedAccounts";

interface ProfileFormData {
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

interface FormErrors {
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

interface FormInputProps {
  label: string;
  name: keyof ProfileFormData;
  type?: string;
  value: string;
  placeholder: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

function FormInput({
  label,
  name,
  type = "text",
  value,
  placeholder,
  error,
  onChange,
  className,
}: FormInputProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={cn(NEUMORPHIC_INPUT, error && INPUT_ERROR_STYLES)}
        placeholder={placeholder}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
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

export default function ProfilePage() {
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

  // Wait for Zustand to hydrate from localStorage
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

        // Set avatar URL, but filter out invalid blob URLs from database
        setAvatarUrl(profile.avatarUrl?.startsWith("blob:") ? null : profile.avatarUrl);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsFetching(false);
      }
    }

    loadProfile();
  }, [token, isHydrated]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleImageUpload(files: File[]) {
    if (files.length === 0 || !token) return;

    const file = files[0];

    // Create a local preview URL for immediate feedback
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    setIsUploadingImage(true);

    try {
      // Upload image to Cloudinary via backend
      const result = await uploadImage(file, token, "avatars");

      // Replace preview URL with the actual uploaded URL
      URL.revokeObjectURL(previewUrl);
      setAvatarUrl(result.url);

      console.log("Image uploaded successfully:", result.url);

      // Immediately save the avatar URL to the database
      await updateProfile(token, {
        avatarUrl: result.url,
      });

      console.log("Avatar URL saved to profile");
    } catch (error) {
      console.error("Failed to upload image:", error);

      // Revert to previous avatar on error
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
      setTimeout(() => setShowSuccess(false), SUCCESS_MESSAGE_DURATION);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setErrors({ submit: error instanceof Error ? error.message : "Failed to update profile" });
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner />
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Profile Settings</h1>
          <p className="text-text-secondary text-sm">
            Manage your account information
          </p>
          <Link
            href="/app/profile/edit"
            className="inline-block mt-2 text-sm font-medium text-primary hover:underline"
          >
            Availability settings
          </Link>
        </div>
      </div>

      <div className={NEUMORPHIC_CARD}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            variant="single"
            label="Profile Photo"
            currentImage={avatarUrl || undefined}
            onUpload={handleImageUpload}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              name="firstName"
              value={formData.firstName}
              placeholder="e.g. Jane"
              error={errors.firstName}
              onChange={handleChange}
            />

            <FormInput
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              placeholder="e.g. Doe"
              error={errors.lastName}
              onChange={handleChange}
            />

            <div>
              <FormInput
                label="Username"
                name="username"
                value={formData.username}
                placeholder="e.g. jane_dev"
                error={errors.username}
                onChange={handleChange}
              />
              <p className="mt-1 text-[11px] text-text-secondary pl-1">This is your public handle</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={cn(NEUMORPHIC_INPUT, errors.dateOfBirth && INPUT_ERROR_STYLES)}
              />
              {errors.dateOfBirth && <p className="mt-1 text-sm text-error">{errors.dateOfBirth}</p>}
            </div>

            <FormInput
              label="Professional Title"
              name="professionalTitle"
              value={formData.professionalTitle}
              placeholder="e.g. Full Stack Developer"
              error={errors.professionalTitle}
              onChange={handleChange}
            />

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Email Address</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className={cn(
                  NEUMORPHIC_INPUT,
                  "opacity-65 cursor-not-allowed bg-gray-50/20 shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]"
                )}
                placeholder="email@example.com"
              />
              <p className="mt-1 text-[11px] text-text-secondary">Email address cannot be changed.</p>
            </div>

            <FormInput
              label="Location"
              name="location"
              value={formData.location}
              placeholder="e.g. San José, Costa Rica"
              error={errors.location}
              onChange={handleChange}
            />

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Timezone</label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className={cn(NEUMORPHIC_INPUT, "pr-10 appearance-none bg-no-repeat bg-right")}
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "1.25em 1.25em",
                }}
              >
                <option value="">Select timezone...</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New York</option>
                <option value="America/Chicago">America/Chicago</option>
                <option value="America/Denver">America/Denver</option>
                <option value="America/Los_Angeles">America/Los Angeles</option>
                <option value="America/Bogota">America/Bogota</option>
                <option value="America/Costa_Rica">America/Costa Rica</option>
                <option value="America/Mexico_City">America/Mexico City</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Madrid">Europe/Madrid</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </select>
              {errors.timezone && <p className="mt-1 text-sm text-error">{errors.timezone}</p>}
            </div>

            <FormInput
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              placeholder="e.g. +506 8888-8888"
              error={errors.phone}
              onChange={handleChange}
              className="md:col-span-2"
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className={cn(NEUMORPHIC_INPUT, "resize-none", errors.bio && INPUT_ERROR_STYLES)}
                placeholder="Tell us about your professional background, skills, and experience..."
              />
              <div className="flex justify-between mt-1">
                {errors.bio ? (
                  <p className="text-xs text-error">{errors.bio}</p>
                ) : (
                  <p className="text-xs text-text-secondary">
                    Brief description for your profile (max 500 characters).
                  </p>
                )}
                <p className="text-xs text-text-secondary ml-auto">
                  {formData.bio.length}/500
                </p>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="p-3 rounded-xl bg-error/10 text-error text-sm">
              {errors.submit}
            </div>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={isLoading} className={cn(PRIMARY_BUTTON, "py-2 px-5")}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Connected Accounts Section */}
      <Suspense fallback={<div className="p-6 rounded-2xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] flex items-center justify-center"><LoadingSpinner className="text-primary" /></div>}>
        <ConnectedAccounts />
      </Suspense>

      {/* Floating Success Toast (Top-Center, Fixed & Minimal) */}
      {showSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-scale-in">
          <div
            className={cn(
              "px-4 py-2.5 rounded-xl shadow-md",
              "bg-success/10 border border-success/20 backdrop-blur-md",
              "flex items-center gap-2"
            )}
          >
            <Icon path={ICON_PATHS.check} size="sm" className="text-success flex-shrink-0 animate-bounce" />
            <p className="text-sm text-success font-medium">Profile updated!</p>
          </div>
        </div>
      )}
    </div>
  );
}
