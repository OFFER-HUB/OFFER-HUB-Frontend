"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useModeStore } from "@/stores/mode-store";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import {
  NEUMORPHIC_CARD,
  NEUMORPHIC_INPUT,
  NEUMORPHIC_INSET,
  INPUT_ERROR_STYLES,
  PRIMARY_BUTTON,
} from "@/lib/styles";
import {
  AVAILABILITY_OPTIONS,
  SUGGESTED_SKILLS,
  MOCK_FREELANCER_PROFILE,
} from "@/data/freelancer-profile.data";
import type {
  FreelancerProfileData,
  FreelancerProfileErrors,
} from "@/types/freelancer-profile.types";

const MAX_BIO_LENGTH = 500;
const MOCK_API_DELAY = 1500;
const SUCCESS_MESSAGE_DURATION = 3000;

const SECONDARY_BUTTON_STYLES = cn(
  "px-4 py-2 text-sm font-medium rounded-xl",
  "bg-background text-text-primary",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
  "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
  "transition-all duration-200 cursor-pointer"
);

const AVATAR_STYLES = cn(
  "relative w-20 h-20 rounded-full flex items-center justify-center",
  "bg-primary text-white text-2xl font-bold",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
);

interface FormInputProps {
  label: string;
  name: string;
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
      <label className="block text-sm font-medium text-text-primary mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={cn(NEUMORPHIC_INPUT, error && INPUT_ERROR_STYLES)}
        placeholder={placeholder}
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

interface SkillTagProps {
  skill: string;
  onRemove: () => void;
}

function SkillTag({ skill, onRemove }: SkillTagProps): React.JSX.Element {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
      {skill}
      <button
        type="button"
        onClick={onRemove}
        className="w-4 h-4 rounded-full hover:bg-primary/20 flex items-center justify-center cursor-pointer"
      >
        <Icon path={ICON_PATHS.close} size="sm" />
      </button>
    </span>
  );
}

function validateForm(data: FreelancerProfileData): FreelancerProfileErrors {
  const errors: FreelancerProfileErrors = {};

  if (!data.firstName.trim()) {
    errors.firstName = "First name is required";
  }
  if (!data.lastName.trim()) {
    errors.lastName = "Last name is required";
  }
  if (!data.title.trim()) {
    errors.title = "Professional title is required";
  }
  if (data.bio.length > MAX_BIO_LENGTH) {
    errors.bio = `Bio must be less than ${MAX_BIO_LENGTH} characters`;
  }
  if (data.skills.length === 0) {
    errors.skills = "Add at least one skill";
  }
  if (data.hourlyRate <= 0) {
    errors.hourlyRate = "Hourly rate must be greater than 0";
  }

  return errors;
}

interface AvatarDisplayProps {
  profileImage: string | null;
  firstName: string;
  lastName: string;
}

function AvatarDisplay({ profileImage, firstName, lastName }: AvatarDisplayProps): React.JSX.Element {
  if (profileImage) {
    return (
      <Image
        src={profileImage}
        alt="Profile"
        fill
        className="rounded-full object-cover"
        sizes="(max-width: 768px) 96px, 128px"
        priority
      />
    );
  }
  return (
    <>
      {firstName.charAt(0).toUpperCase()}
      {lastName.charAt(0).toUpperCase()}
    </>
  );
}

export default function FreelancerProfilePage(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const { setMode } = useModeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<FreelancerProfileErrors>({});
  const [formData, setFormData] = useState<FreelancerProfileData>(MOCK_FREELANCER_PROFILE);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    setMode("freelancer");
    if (user) {
      const nameParts = user.username.split(" ");
      setFormData((prev) => ({
        ...prev,
        firstName: nameParts[0] || user.username,
        lastName: nameParts.slice(1).join(" ") || prev.lastName,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "hourlyRate" ? Number(value) : value }));
    if (errors[name as keyof FreelancerProfileErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleAddSkill(skill: string): void {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, skill.trim()] }));
      setNewSkill("");
      if (errors.skills) {
        setErrors((prev) => ({ ...prev, skills: undefined }));
      }
    }
  }

  function handleRemoveSkill(skillToRemove: string): void {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  }

  function handlePhotoClick(): void {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const validationErrors = validateForm(formData);
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

  const availabilityOption = AVAILABILITY_OPTIONS.find((opt) => opt.value === formData.availability);

  if (showPreview) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Public Profile Preview</h1>
          <button onClick={() => setShowPreview(false)} className={SECONDARY_BUTTON_STYLES}>
            Back to Edit
          </button>
        </div>

        <div className={NEUMORPHIC_CARD}>
          <div className="flex items-start gap-6">
            <div className={AVATAR_STYLES}>
              <AvatarDisplay
                profileImage={formData.profileImage}
                firstName={formData.firstName}
                lastName={formData.lastName}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-text-primary">
                  {formData.firstName} {formData.lastName}
                </h2>
                <span className={cn("px-2 py-1 rounded-full text-xs text-white", availabilityOption?.color)}>
                  {availabilityOption?.label}
                </span>
              </div>
              <p className="text-text-secondary">{formData.title}</p>
              <p className="text-sm text-text-secondary mt-1">{formData.location}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">${formData.hourlyRate}</p>
              <p className="text-sm text-text-secondary">per hour</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-text-primary mb-2">About</h3>
            <p className="text-text-secondary">{formData.bio}</p>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-text-primary mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span key={skill} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {formData.website && (
            <div className="mt-6">
              <h3 className="font-semibold text-text-primary mb-2">Website</h3>
              <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {formData.website}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Freelancer Profile</h1>
          <p className="text-text-secondary text-sm">Showcase your skills and attract clients</p>
        </div>
        <div className="flex items-center gap-3">
          {showSuccess && (
            <div className={cn("px-4 py-2 rounded-xl", "bg-success/10 border border-success/20", "animate-scale-in")}>
              <div className="flex items-center gap-2">
                <Icon path={ICON_PATHS.check} size="sm" className="text-success" />
                <p className="text-sm text-success font-medium">Profile saved!</p>
              </div>
            </div>
          )}
          <button onClick={() => setShowPreview(true)} className={SECONDARY_BUTTON_STYLES}>
            Preview Profile
          </button>
        </div>
      </div>

      <div className={NEUMORPHIC_CARD}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-4">
            <div className={AVATAR_STYLES}>
              <AvatarDisplay
                profileImage={formData.profileImage}
                firstName={formData.firstName}
                lastName={formData.lastName}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-text-primary text-sm">Profile Photo</h3>
              <p className="text-xs text-text-secondary">JPG, PNG or GIF. Max 2MB.</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button type="button" onClick={handlePhotoClick} className={SECONDARY_BUTTON_STYLES}>
              Change Photo
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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
              label="Professional Title"
              name="title"
              value={formData.title}
              placeholder="Full Stack Developer"
              error={errors.title}
              onChange={handleChange}
            />
            <FormInput
              label="Location"
              name="location"
              value={formData.location}
              placeholder="San Francisco, CA"
              onChange={handleChange}
            />
            <FormInput
              label="Website"
              name="website"
              type="url"
              value={formData.website}
              placeholder="https://yourwebsite.com"
              onChange={handleChange}
            />
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Hourly Rate ($)</label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                min="1"
                className={cn(NEUMORPHIC_INPUT, errors.hourlyRate && INPUT_ERROR_STYLES)}
              />
              {errors.hourlyRate && <p className="mt-1 text-xs text-error">{errors.hourlyRate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Availability</label>
            <div className="flex gap-3">
              {AVAILABILITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, availability: option.value }))}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer",
                    formData.availability === option.value ? NEUMORPHIC_INSET : SECONDARY_BUTTON_STYLES
                  )}
                >
                  <span className={cn("w-2 h-2 rounded-full", option.color)} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skills.map((skill) => (
                <SkillTag key={skill} skill={skill} onRemove={() => handleRemoveSkill(skill)} />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill(newSkill))}
                className={cn(NEUMORPHIC_INPUT, "flex-1")}
                placeholder="Add a skill..."
              />
              <button
                type="button"
                onClick={() => handleAddSkill(newSkill)}
                className={cn(PRIMARY_BUTTON, "px-4")}
              >
                Add
              </button>
            </div>
            {errors.skills && <p className="mt-1 text-xs text-error">{errors.skills}</p>}
            <div className="mt-2 flex flex-wrap gap-1">
              {SUGGESTED_SKILLS.filter((s) => !formData.skills.includes(s))
                .slice(0, 6)
                .map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleAddSkill(skill)}
                    className="text-xs px-2 py-1 rounded-full bg-gray-100 text-text-secondary hover:bg-gray-200 cursor-pointer"
                  >
                    + {skill}
                  </button>
                ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className={cn(NEUMORPHIC_INPUT, "resize-none", errors.bio && INPUT_ERROR_STYLES)}
              placeholder="Tell clients about your experience and expertise..."
            />
            <div className="flex justify-between mt-1">
              {errors.bio && <p className="text-xs text-error">{errors.bio}</p>}
              <p className="text-xs text-text-secondary ml-auto">
                {formData.bio.length}/{MAX_BIO_LENGTH}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              href="/app/freelancer/portfolio"
              className="text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
            >
              <Icon path={ICON_PATHS.briefcase} size="sm" />
              Manage Portfolio
            </Link>
            <button type="submit" disabled={isLoading} className={cn(PRIMARY_BUTTON, "py-2 px-6")}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner />
                  Saving...
                </span>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
