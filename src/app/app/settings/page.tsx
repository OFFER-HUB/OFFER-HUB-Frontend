"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, PRIMARY_BUTTON } from "@/lib/styles";

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  projectUpdates: boolean;
  messageAlerts: boolean;
}

interface PrivacySettings {
  profileVisibility: "public" | "private" | "connections";
  showEmail: boolean;
  showPhone: boolean;
  allowMessages: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  marketingEmails: false,
  projectUpdates: true,
  messageAlerts: true,
};

const INITIAL_PRIVACY: PrivacySettings = {
  profileVisibility: "public",
  showEmail: false,
  showPhone: false,
  allowMessages: true,
};

const TOGGLE_STYLES = cn(
  "relative w-12 h-6 rounded-full transition-all duration-200 cursor-pointer",
  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
);

const TOGGLE_ACTIVE = "bg-primary";
const TOGGLE_INACTIVE = "bg-background";

const TOGGLE_THUMB = cn(
  "absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200",
  "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
  "bg-white"
);

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}

function ToggleSwitch({ enabled, onChange, label, description }: ToggleSwitchProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={cn(TOGGLE_STYLES, enabled ? TOGGLE_ACTIVE : TOGGLE_INACTIVE)}
        role="switch"
        aria-checked={enabled}
        aria-label={label}
      >
        <span className={cn(TOGGLE_THUMB, enabled ? "left-6" : "left-0.5")} />
      </button>
    </div>
  );
}

const MOCK_API_DELAY = 1000;
const SUCCESS_MESSAGE_DURATION = 3000;

export default function SettingsPage(): React.JSX.Element {
  const [notifications, setNotifications] = useState<NotificationSettings>(INITIAL_NOTIFICATIONS);
  const [privacy, setPrivacy] = useState<PrivacySettings>(INITIAL_PRIVACY);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  function toggleNotification(key: keyof NotificationSettings): void {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function togglePrivacy(key: keyof Omit<PrivacySettings, "profileVisibility">): void {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleVisibilityChange(value: PrivacySettings["profileVisibility"]): void {
    setPrivacy((prev) => ({ ...prev, profileVisibility: value }));
  }

  async function handleSave(): Promise<void> {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
    setIsLoading(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), SUCCESS_MESSAGE_DURATION);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary text-sm">Manage your account preferences</p>
        </div>
        {showSuccess && (
          <div
            className={cn(
              "px-4 py-2 rounded-xl",
              "bg-success/10 border border-success/20",
              "animate-scale-in"
            )}
          >
            <div className="flex items-center gap-2">
              <Icon path={ICON_PATHS.check} size="sm" className="text-success flex-shrink-0" />
              <p className="text-sm text-success font-medium">Settings saved!</p>
            </div>
          </div>
        )}
      </div>

      <div className={NEUMORPHIC_CARD}>
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Icon path={ICON_PATHS.bell} size="md" className="text-primary" />
          Notifications
        </h2>
        <div className="divide-y divide-border-light">
          <ToggleSwitch
            enabled={notifications.emailNotifications}
            onChange={() => toggleNotification("emailNotifications")}
            label="Email Notifications"
            description="Receive notifications via email"
          />
          <ToggleSwitch
            enabled={notifications.pushNotifications}
            onChange={() => toggleNotification("pushNotifications")}
            label="Push Notifications"
            description="Receive push notifications in your browser"
          />
          <ToggleSwitch
            enabled={notifications.projectUpdates}
            onChange={() => toggleNotification("projectUpdates")}
            label="Project Updates"
            description="Get notified about project milestones and updates"
          />
          <ToggleSwitch
            enabled={notifications.messageAlerts}
            onChange={() => toggleNotification("messageAlerts")}
            label="Message Alerts"
            description="Receive alerts for new messages"
          />
          <ToggleSwitch
            enabled={notifications.marketingEmails}
            onChange={() => toggleNotification("marketingEmails")}
            label="Marketing Emails"
            description="Receive promotional emails and offers"
          />
        </div>
      </div>

      <div className={NEUMORPHIC_CARD}>
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Icon path={ICON_PATHS.eye} size="md" className="text-primary" />
          Privacy
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Profile Visibility
          </label>
          <div className="flex gap-2">
            {(["public", "connections", "private"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleVisibilityChange(option)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                  privacy.profileVisibility === option
                    ? "bg-primary text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]"
                    : "bg-background text-text-secondary shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                )}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border-light">
          <ToggleSwitch
            enabled={privacy.showEmail}
            onChange={() => togglePrivacy("showEmail")}
            label="Show Email Address"
            description="Allow others to see your email address"
          />
          <ToggleSwitch
            enabled={privacy.showPhone}
            onChange={() => togglePrivacy("showPhone")}
            label="Show Phone Number"
            description="Allow others to see your phone number"
          />
          <ToggleSwitch
            enabled={privacy.allowMessages}
            onChange={() => togglePrivacy("allowMessages")}
            label="Allow Direct Messages"
            description="Let others send you direct messages"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={handleSave} disabled={isLoading} className={cn(PRIMARY_BUTTON, "py-2 px-5")}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner />
              Saving...
            </span>
          ) : (
            "Save Settings"
          )}
        </button>
      </div>
    </div>
  );
}
