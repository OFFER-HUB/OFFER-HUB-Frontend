"use client";
import Link from "next/link";
import { AvailabilitySettings } from "@/components/profile/AvailabilitySettings";
import { SkillsManager } from "@/components/profile/SkillsManager";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

export default function ProfileEditPage(): React.JSX.Element {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/app/profile"
            className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline mb-1"
          >
            <Icon path={ICON_PATHS.chevronLeft} size="sm" />
            Back to profile
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Edit profile</h1>
          <p className="text-text-secondary text-sm">Availability and work preferences</p>
        </div>
      </div>

      <AvailabilitySettings />

      <section aria-labelledby="skills-heading">
        <h2
          id="skills-heading"
          className="text-xs font-bold uppercase tracking-widest mb-3 mt-2"
          style={{ color: "#6D758F" }}
        >
          Skills &amp; Expertise
        </h2>
        <SkillsManager />
      </section>
    </div>
  );
}