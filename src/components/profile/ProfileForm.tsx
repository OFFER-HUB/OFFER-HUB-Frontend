"use client";

import { Suspense } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import {
  NEUMORPHIC_CARD,
  NEUMORPHIC_INPUT,
  INPUT_ERROR_STYLES,
  PRIMARY_BUTTON,
} from "@/lib/styles";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { FormInput } from "@/components/ui/FormInput";
import Link from "next/link";
import { ConnectedAccounts } from "@/components/profile/ConnectedAccounts";
import { ProfileCompleteness } from "@/components/profile/ProfileCompleteness";
import { useProfileForm } from "@/hooks/useProfileForm";

export function ProfileForm() {
  const {
    formData,
    errors,
    isLoading,
    isFetching,
    showSuccess,
    avatarUrl,
    user,
    completenessKey,
    handleChange,
    handleImageUpload,
    handleSubmit,
  } = useProfileForm();

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
          <p className="text-text-secondary text-sm">Manage your account information</p>
          <Link
            href="/app/profile/edit"
            className="inline-block mt-2 text-sm font-medium text-primary hover:underline"
          >
            Availability settings
          </Link>
        </div>
      </div>

      <ProfileCompleteness refreshKey={completenessKey} />

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
              <p className="mt-1 text-[11px] text-text-secondary pl-1">
                This is your public handle
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={cn(NEUMORPHIC_INPUT, errors.dateOfBirth && INPUT_ERROR_STYLES)}
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-error">{errors.dateOfBirth}</p>
              )}
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
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email Address
              </label>
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
              <p className="mt-1 text-[11px] text-text-secondary">
                Email address cannot be changed.
              </p>
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
                <p className="text-xs text-text-secondary ml-auto">{formData.bio.length}/500</p>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="p-3 rounded-xl bg-error/10 text-error text-sm">{errors.submit}</div>
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
      <Suspense
        fallback={
          <div className="p-6 rounded-2xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] flex items-center justify-center">
            <LoadingSpinner className="text-primary" />
          </div>
        }
      >
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
            <Icon
              path={ICON_PATHS.check}
              size="sm"
              className="text-success flex-shrink-0 animate-bounce"
            />
            <p className="text-sm text-success font-medium">Profile updated!</p>
          </div>
        </div>
      )}
    </div>
  );
}
