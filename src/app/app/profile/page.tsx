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

type FormFieldName = keyof ProfileFormData;

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  bio?: string;
  phone?: string;
}

const INPUT_BASE_STYLES = cn(
  "w-full px-4 py-3 rounded-xl",
  "bg-background",
  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
  "text-text-primary placeholder-text-secondary",
  "outline-none focus:ring-2 focus:ring-primary/20",
  "transition-all duration-200"
);

const INPUT_ERROR_STYLES = "ring-2 ring-error/50";

interface FormInputProps {
  label: string;
  name: FormFieldName;
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
}: FormInputProps): React.JSX.Element {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-text-primary mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={cn(INPUT_BASE_STYLES, error && INPUT_ERROR_STYLES)}
        placeholder={placeholder}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s-()]+$/;
const MIN_USERNAME_LENGTH = 3;
const MAX_BIO_LENGTH = 500;
const MOCK_API_DELAY = 1500;
const SUCCESS_MESSAGE_DURATION = 3000;

const INITIAL_FORM_DATA: ProfileFormData = {
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  bio: "",
  location: "",
  website: "",
  phone: "",
};

function validateProfileForm(formData: ProfileFormData): FormErrors {
  const errors: FormErrors = {};

  if (!formData.firstName.trim()) {
    errors.firstName = "First name is required";
  }

  if (!formData.lastName.trim()) {
    errors.lastName = "Last name is required";
  }

  if (!formData.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(formData.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!formData.username.trim()) {
    errors.username = "Username is required";
  } else if (formData.username.length < MIN_USERNAME_LENGTH) {
    errors.username = `Username must be at least ${MIN_USERNAME_LENGTH} characters`;
  }

  if (formData.bio.length > MAX_BIO_LENGTH) {
    errors.bio = `Bio must be less than ${MAX_BIO_LENGTH} characters`;
  }

  if (formData.phone && !PHONE_REGEX.test(formData.phone)) {
    errors.phone = "Please enter a valid phone number";
  }

  return errors;
}

export default function ProfilePage(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_FORM_DATA);

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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();

    const validationErrors = validateProfileForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
    setIsLoading(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), SUCCESS_MESSAGE_DURATION);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profile Settings</h1>
        <p className="text-text-secondary mt-1">
          Manage your account information and preferences
        </p>
      </div>

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

      <div
        className={cn(
          "p-6 rounded-2xl",
          "bg-white",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
        )}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              name="firstName"
              value={formData.firstName}
              placeholder="John"
              error={errors.firstName}
              onChange={handleChange}
            />
            <FormInput
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              placeholder="Doe"
              error={errors.lastName}
              onChange={handleChange}
            />
            <FormInput
              label="Username"
              name="username"
              value={formData.username}
              placeholder="johndoe"
              error={errors.username}
              onChange={handleChange}
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              placeholder="john@example.com"
              error={errors.email}
              onChange={handleChange}
            />
            <FormInput
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              placeholder="+1 (555) 000-0000"
              error={errors.phone}
              onChange={handleChange}
            />
            <FormInput
              label="Location"
              name="location"
              value={formData.location}
              placeholder="City, Country"
              onChange={handleChange}
            />
            <FormInput
              label="Website"
              name="website"
              type="url"
              value={formData.website}
              placeholder="https://yourwebsite.com"
              onChange={handleChange}
              className="md:col-span-2"
            />

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
                  INPUT_BASE_STYLES,
                  "resize-none",
                  errors.bio && INPUT_ERROR_STYLES
                )}
                placeholder="Tell us about yourself..."
              />
              <div className="flex justify-between mt-1">
                {errors.bio && (
                  <p className="text-sm text-error">{errors.bio}</p>
                )}
                <p className="text-xs text-text-secondary ml-auto">
                  {formData.bio.length}/{MAX_BIO_LENGTH}
                </p>
              </div>
            </div>
          </div>

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
