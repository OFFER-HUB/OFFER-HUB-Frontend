"use client";

import { Suspense } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  INPUT_ERROR_STYLES,
  NEUMORPHIC_CARD,
  NEUMORPHIC_INPUT,
  PRIMARY_BUTTON,
} from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { FormInput } from "@/components/ui/FormInput";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ConnectedAccounts } from "@/components/profile/ConnectedAccounts";
import { ProfileCompleteness } from "@/components/profile/ProfileCompleteness";
import { useProfileForm } from "@/hooks/useProfileForm";

export function ProfileForm() {
  const {
    user,
    formData,
    avatarUrl,
    errors,
    isLoading,
    isFetching,
    loadError,
    showSuccess,
    imageUploadKey,
    completenessKey,
    handleChange,
    handleImageUpload,
    handleSubmit,
    retryLoad,
  } = useProfileForm();

  if (isFetching)
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  if (loadError)
    return (
      <div className="space-y-3 rounded-xl p-6">
        <p className="text-error">{loadError}</p>
        <button type="button" onClick={() => void retryLoad()} className={PRIMARY_BUTTON}>
          Retry
        </button>
      </div>
    );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profile Settings</h1>
        <p className="text-sm text-text-secondary">Manage your account information</p>
        <Link
          href="/app/profile/edit"
          className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
        >
          Availability settings
        </Link>
      </div>
      <ProfileCompleteness refreshKey={completenessKey} />
      <div className={NEUMORPHIC_CARD}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            key={imageUploadKey}
            variant="single"
            label="Profile Photo"
            currentImage={avatarUrl || undefined}
            onUpload={handleImageUpload}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            <FormInput
              label="Username"
              name="username"
              value={formData.username}
              placeholder="e.g. jane_dev"
              error={errors.username}
              onChange={handleChange}
            />
            <div>
              <label htmlFor="dateOfBirth" className="mb-2 block text-sm font-medium">
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={cn(NEUMORPHIC_INPUT, errors.dateOfBirth && INPUT_ERROR_STYLES)}
              />
              {errors.dateOfBirth && <p className="text-sm text-error">{errors.dateOfBirth}</p>}
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
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className={cn(NEUMORPHIC_INPUT, "cursor-not-allowed opacity-65")}
              />
              <p className="text-xs text-text-secondary">Email address cannot be changed.</p>
            </div>
            <FormInput
              label="Location"
              name="location"
              value={formData.location}
              placeholder="e.g. San José, Costa Rica"
              error={errors.location}
              onChange={handleChange}
            />
            <FormInput
              label="Timezone"
              name="timezone"
              value={formData.timezone}
              placeholder="e.g. America/Costa_Rica"
              error={errors.timezone}
              onChange={handleChange}
            />
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
              <label htmlFor="bio" className="mb-2 block text-sm font-medium">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className={cn(NEUMORPHIC_INPUT, "resize-none", errors.bio && INPUT_ERROR_STYLES)}
                placeholder="Tell us about your professional background, skills, and experience..."
              />
              <div className="flex justify-between">
                <p className="text-xs text-error">{errors.bio}</p>
                <p className="ml-auto text-xs text-text-secondary">{formData.bio.length}/500</p>
              </div>
            </div>
          </div>
          {errors.submit && (
            <div className="rounded-xl bg-error/10 p-3 text-sm text-error">{errors.submit}</div>
          )}
          <div className="flex justify-end">
            <button type="submit" disabled={isLoading} className={cn(PRIMARY_BUTTON, "px-5 py-2")}>
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        <ConnectedAccounts />
      </Suspense>
      {showSuccess && (
        <div className="fixed left-1/2 top-8 z-50 -translate-x-1/2 rounded-xl bg-success/10 px-4 py-2.5 text-success">
          <Icon path={ICON_PATHS.check} size="sm" /> Profile updated!
        </div>
      )}
    </div>
  );
}
