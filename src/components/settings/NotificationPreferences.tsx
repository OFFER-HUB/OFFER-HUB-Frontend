"use client";

import { useEffect, useRef, useState } from "react";
import { NotificationMatrix } from "@/components/settings/NotificationMatrix";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/api/notification-preferences";
import { cn } from "@/lib/cn";
import { MOCK_API_DELAY } from "@/lib/constants";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import { useAuthStore } from "@/stores/auth-store";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_PREFERENCE_SECTIONS,
} from "@/types/notification-preferences.types";
import type {
  NotificationChannel,
  NotificationFrequency,
  NotificationPreferenceType,
  NotificationPreferences,
} from "@/types/notification-preferences.types";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const SAVE_STATUS_MESSAGE: Record<Exclude<SaveStatus, "idle">, string> = {
  saving: "Saving notification preferences...",
  saved: "Notification preferences saved",
  error: "Could not sync preferences. Local changes are still kept.",
};

function cloneNotificationPreferences(
  value: NotificationPreferences
): NotificationPreferences {
  return {
    muteAll: value.muteAll,
    preferences: {
      orderLifecycle: {
        channels: { ...value.preferences.orderLifecycle.channels },
        frequency: value.preferences.orderLifecycle.frequency,
      },
      offerUpdates: {
        channels: { ...value.preferences.offerUpdates.channels },
        frequency: value.preferences.offerUpdates.frequency,
      },
      newMessages: {
        channels: { ...value.preferences.newMessages.channels },
        frequency: value.preferences.newMessages.frequency,
      },
      paymentActivity: {
        channels: { ...value.preferences.paymentActivity.channels },
        frequency: value.preferences.paymentActivity.frequency,
      },
      disputeStatus: {
        channels: { ...value.preferences.disputeStatus.channels },
        frequency: value.preferences.disputeStatus.frequency,
      },
      reviewActivity: {
        channels: { ...value.preferences.reviewActivity.channels },
        frequency: value.preferences.reviewActivity.frequency,
      },
      securityAlerts: {
        channels: { ...value.preferences.securityAlerts.channels },
        frequency: value.preferences.securityAlerts.frequency,
      },
      platformAnnouncements: {
        channels: { ...value.preferences.platformAnnouncements.channels },
        frequency: value.preferences.platformAnnouncements.frequency,
      },
    },
  };
}

export function NotificationPreferences(): React.JSX.Element {
  const token = useAuthStore((state) => state.token);
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    cloneNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES)
  );
  const [isHydrating, setIsHydrating] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState(
    "Notifications are enabled based on your defaults"
  );

  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function hydratePreferences(): Promise<void> {
      if (!token) {
        if (isMounted) {
          setIsHydrating(false);
        }
        return;
      }

      try {
        const remotePreferences = await getNotificationPreferences(token);

        if (!isMounted) {
          return;
        }

        setPreferences(cloneNotificationPreferences(remotePreferences));
      } catch {
        if (!isMounted) {
          return;
        }
      } finally {
        if (isMounted) {
          setIsHydrating(false);
        }
      }
    }

    void hydratePreferences();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  async function persistPreferences(nextPreferences: NotificationPreferences): Promise<void> {
    try {
      if (token) {
        const savedPreferences = await updateNotificationPreferences(token, nextPreferences);
        setPreferences(cloneNotificationPreferences(savedPreferences));
      } else {
        await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
      }

      setSaveStatus("saved");
      setSaveMessage(SAVE_STATUS_MESSAGE.saved);
    } catch {
      setSaveStatus("error");
      setSaveMessage(SAVE_STATUS_MESSAGE.error);
    }
  }

  function queueAutosave(nextPreferences: NotificationPreferences): void {
    setSaveStatus("saving");
    setSaveMessage(SAVE_STATUS_MESSAGE.saving);

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      void persistPreferences(nextPreferences);
    }, 600);
  }

  function updatePreference(
    mutator: (current: NotificationPreferences) => NotificationPreferences
  ): void {
    setPreferences((current) => {
      const next = mutator(current);
      queueAutosave(next);
      return next;
    });
  }

  function handleToggleChannel(type: NotificationPreferenceType, channel: NotificationChannel): void {
    updatePreference((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        [type]: {
          ...current.preferences[type],
          channels: {
            ...current.preferences[type].channels,
            [channel]: !current.preferences[type].channels[channel],
          },
        },
      },
    }));
  }

  function handleFrequencyChange(
    type: NotificationPreferenceType,
    frequency: NotificationFrequency
  ): void {
    updatePreference((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        [type]: {
          ...current.preferences[type],
          frequency,
        },
      },
    }));
  }

  function handleMuteAllToggle(): void {
    updatePreference((current) => {
      if (!current.muteAll) {
        const next = cloneNotificationPreferences(current);

        Object.keys(next.preferences).forEach((key) => {
          const typedKey = key as NotificationPreferenceType;
          next.preferences[typedKey] = {
            channels: { email: false, inApp: false, push: false },
            frequency: "off",
          };
        });

        return {
          muteAll: true,
          preferences: next.preferences,
        };
      }

      return cloneNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    });
  }

  const statusTone =
    saveStatus === "error"
      ? "text-error"
      : saveStatus === "saved"
        ? "text-success"
        : "text-text-primary";

  return (
    <div className="space-y-4 sm:space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-primary/95 to-secondary/95 p-4 text-white shadow-lg shadow-primary/10 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-xl font-bold sm:text-2xl">Notification preferences</h1>
            <p className="mt-1 text-sm leading-6 text-white/85 sm:text-[15px]">
              Choose which updates you receive, where to receive them, and how frequently they are
              delivered.
            </p>
          </div>

          <div className="w-full rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm sm:max-w-sm xl:w-auto">
            <div className="flex items-start gap-2 sm:items-center">
              {saveStatus === "saving" && <LoadingSpinner size="sm" className="text-white" />}
              {saveStatus === "saved" && (
                <Icon path={ICON_PATHS.check} size="sm" className="text-white" />
              )}
              {saveStatus === "error" && (
                <Icon path={ICON_PATHS.alertCircle} size="sm" className="text-white" />
              )}
              {saveStatus === "idle" && (
                <Icon path={ICON_PATHS.bell} size="sm" className="text-white" />
              )}
              <p className="text-sm font-medium leading-5">
                {saveStatus === "idle" ? "No changes pending" : saveMessage}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className={NEUMORPHIC_CARD}>
        {isHydrating ? (
          <div className="flex items-center gap-2 text-text-secondary">
            <LoadingSpinner size="sm" />
            <p className="text-sm">Loading notification preferences...</p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Icon path={ICON_PATHS.settings} size="md" className="text-primary" />
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Notification matrix</h2>
                <p className="text-sm text-text-secondary">
                  Toggle channels per notification type and set delivery cadence for each one.
                </p>
              </div>
            </div>

            <NotificationMatrix
              sections={NOTIFICATION_PREFERENCE_SECTIONS}
              preferences={preferences}
              onToggleChannel={handleToggleChannel}
              onChangeFrequency={handleFrequencyChange}
              onToggleMuteAll={handleMuteAllToggle}
            />
          </>
        )}
      </section>

      {saveStatus !== "idle" && (
        <div
          className={cn(
            "rounded-xl border px-4 py-3 text-sm font-medium leading-6",
            saveStatus === "error"
              ? "border-error/30 bg-error/10"
              : saveStatus === "saved"
                ? "border-success/30 bg-success/10"
                : "border-primary/20 bg-primary/10",
            statusTone
          )}
        >
          {saveMessage}
        </div>
      )}
    </div>
  );
}
