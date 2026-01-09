"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  phone: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  bio?: string;
  phone?: string;
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    bio: "",
    location: "",
    website: "",
    phone: "",
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const nameParts = user.username.split(" ");
      setFormData({
        firstName: nameParts[0] || user.username,
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email,
        username: user.username,
        bio: "I'm a passionate professional looking to connect and collaborate on exciting projects.",
        location: "San Francisco, CA",
        website: "",
        phone: "",
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (formData.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters";
    }

    if (formData.phone && !/^[+]?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profile Settings</h1>
        <p className="text-text-secondary mt-1">
          Manage your account information and preferences
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div
          className={cn(
            "p-4 rounded-xl",
            "bg-success/10 border border-success/20",
            "animate-scale-in"
          )}
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-success flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-success font-medium">
              Profile updated successfully!
            </p>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div
        className={cn(
          "p-6 rounded-2xl",
          "bg-white",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
        )}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div
              className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center",
                "bg-primary text-white text-3xl font-bold",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
              )}
            >
              {formData.firstName.charAt(0).toUpperCase()}
              {formData.lastName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-medium text-text-primary">Profile Photo</h3>
              <p className="text-sm text-text-secondary mb-2">
                JPG, PNG or GIF. Max size 2MB.
              </p>
              <button
                type="button"
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-xl",
                  "bg-background text-text-primary",
                  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                  "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                  "transition-all duration-200 cursor-pointer"
                )}
              >
                Change Photo
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-3 rounded-xl",
                  "bg-background",
                  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                  "text-text-primary placeholder-text-secondary",
                  "outline-none focus:ring-2 focus:ring-primary/20",
                  "transition-all duration-200",
                  errors.firstName && "ring-2 ring-error/50"
                )}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-error">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-3 rounded-xl",
                  "bg-background",
                  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                  "text-text-primary placeholder-text-secondary",
                  "outline-none focus:ring-2 focus:ring-primary/20",
                  "transition-all duration-200",
                  errors.lastName && "ring-2 ring-error/50"
                )}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-error">{errors.lastName}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-3 rounded-xl",
                  "bg-background",
                  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                  "text-text-primary placeholder-text-secondary",
                  "outline-none focus:ring-2 focus:ring-primary/20",
                  "transition-all duration-200",
                  errors.username && "ring-2 ring-error/50"
                )}
                placeholder="johndoe"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-error">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-3 rounded-xl",
                  "bg-background",
                  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                  "text-text-primary placeholder-text-secondary",
                  "outline-none focus:ring-2 focus:ring-primary/20",
                  "transition-all duration-200",
                  errors.email && "ring-2 ring-error/50"
                )}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-3 rounded-xl",
                  "bg-background",
                  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                  "text-text-primary placeholder-text-secondary",
                  "outline-none focus:ring-2 focus:ring-primary/20",
                  "transition-all duration-200",
                  errors.phone && "ring-2 ring-error/50"
                )}
                placeholder="+1 (555) 000-0000"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-error">{errors.phone}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-3 rounded-xl",
                  "bg-background",
                  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                  "text-text-primary placeholder-text-secondary",
                  "outline-none focus:ring-2 focus:ring-primary/20",
                  "transition-all duration-200"
                )}
                placeholder="City, Country"
              />
            </div>

            {/* Website */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-3 rounded-xl",
                  "bg-background",
                  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                  "text-text-primary placeholder-text-secondary",
                  "outline-none focus:ring-2 focus:ring-primary/20",
                  "transition-all duration-200"
                )}
                placeholder="https://yourwebsite.com"
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className={cn(
                  "w-full px-4 py-3 rounded-xl resize-none",
                  "bg-background",
                  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                  "text-text-primary placeholder-text-secondary",
                  "outline-none focus:ring-2 focus:ring-primary/20",
                  "transition-all duration-200",
                  errors.bio && "ring-2 ring-error/50"
                )}
                placeholder="Tell us about yourself..."
              />
              <div className="flex justify-between mt-1">
                {errors.bio && (
                  <p className="text-sm text-error">{errors.bio}</p>
                )}
                <p className="text-xs text-text-secondary ml-auto">
                  {formData.bio.length}/500
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "px-6 py-3 rounded-xl font-medium",
                "bg-primary text-white",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                "hover:bg-primary-hover hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:scale-[1.02]",
                "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] active:scale-[0.98]",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100",
                "transition-all duration-200 cursor-pointer"
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
