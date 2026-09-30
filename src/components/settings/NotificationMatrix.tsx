import React from "react";
import { cn } from "@/lib/cn";
import type {
  NotificationChannel,
  NotificationFrequency,
  NotificationPreferenceSectionMeta,
  NotificationPreferenceType,
  NotificationPreferences,
} from "@/types/notification-preferences.types";
import { ChannelToggle } from "@/components/settings/ChannelToggle";
import { FrequencyDropdown } from "@/components/settings/FrequencyDropdown";

interface NotificationMatrixProps {
  sections: NotificationPreferenceSectionMeta[];
  preferences: NotificationPreferences;
  onToggleChannel: (type: NotificationPreferenceType, channel: NotificationChannel) => void;
  onChangeFrequency: (type: NotificationPreferenceType, frequency: NotificationFrequency) => void;
  onToggleMuteAll: () => void;
}

const CHANNEL_LABELS: Array<{ key: NotificationChannel; label: string }> = [
  { key: "email", label: "Email" },
  { key: "inApp", label: "In-app" },
  { key: "push", label: "Push" },
];

export function NotificationMatrix({
  sections,
  preferences,
  onToggleChannel,
  onChangeFrequency,
  onToggleMuteAll,
}: NotificationMatrixProps): React.JSX.Element {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="rounded-2xl border border-border-light bg-background/80 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-text-primary">Quick controls</p>
            <p className="text-xs leading-5 text-text-secondary sm:text-sm">
              Use mute all to silence everything instantly, then re-enable only what matters.
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleMuteAll}
            className={cn(
              "w-full rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 sm:w-auto",
              "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              preferences.muteAll
                ? "bg-success/10 text-success"
                : "bg-white text-text-primary hover:text-primary"
            )}
          >
            {preferences.muteAll ? "Unmute all" : "Mute all"}
          </button>
        </div>
      </div>

      {sections.map((section) => (
        <section key={section.id} className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-text-primary">{section.title}</h2>
            <p className="max-w-3xl text-sm leading-6 text-text-secondary">{section.description}</p>
          </div>

          <div className="hidden overflow-visible rounded-2xl border border-border-light xl:block">
            <div className="grid grid-cols-[minmax(230px,1.7fr)_minmax(180px,1fr)_96px_96px_96px_170px] bg-background px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">
              <span>Notification</span>
              <span>Includes</span>
              <span className="text-center">Email</span>
              <span className="text-center">In-app</span>
              <span className="text-center">Push</span>
              <span>Frequency</span>
            </div>

            {section.items.map((item, index) => {
              const itemPreference = preferences.preferences[item.key];
              const isLast = index === section.items.length - 1;
              const shouldOpenUp = index >= section.items.length - 1;
              const rowBorder = isLast ? "" : "border-b border-border-light";

              return (
                <div
                  key={item.key}
                  className={cn(
                    "relative grid grid-cols-[minmax(230px,1.7fr)_minmax(180px,1fr)_96px_96px_96px_170px] items-center gap-3 px-4 py-4",
                    "bg-white",
                    rowBorder,
                    preferences.muteAll && "opacity-60"
                  )}
                >
                  <p className="font-semibold text-text-primary">{item.title}</p>
                  <p className="text-sm text-text-secondary">{item.description}</p>

                  <div className="flex justify-center">
                    <ChannelToggle
                      label={`${item.title} email`}
                      enabled={itemPreference.channels.email}
                      disabled={preferences.muteAll}
                      onClick={() => onToggleChannel(item.key, "email")}
                    />
                  </div>

                  <div className="flex justify-center">
                    <ChannelToggle
                      label={`${item.title} in-app`}
                      enabled={itemPreference.channels.inApp}
                      disabled={preferences.muteAll}
                      onClick={() => onToggleChannel(item.key, "inApp")}
                    />
                  </div>

                  <div className="flex justify-center">
                    <ChannelToggle
                      label={`${item.title} push`}
                      enabled={itemPreference.channels.push}
                      disabled={preferences.muteAll}
                      onClick={() => onToggleChannel(item.key, "push")}
                    />
                  </div>

                  <FrequencyDropdown
                    value={itemPreference.frequency}
                    onChange={(frequency) => onChangeFrequency(item.key, frequency)}
                    disabled={preferences.muteAll}
                    align="right"
                    direction={shouldOpenUp ? "up" : "down"}
                  />
                </div>
              );
            })}
          </div>

          <div className="grid gap-3 xl:hidden sm:gap-4">
            {section.items.map((item, index) => {
              const itemPreference = preferences.preferences[item.key];
              const shouldOpenUp = index >= section.items.length - 1;

              return (
                <article
                  key={item.key}
                  className={cn(
                    "relative rounded-2xl border border-border-light bg-white p-4 sm:p-5",
                    preferences.muteAll && "opacity-60"
                  )}
                >
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,1fr)] lg:items-start">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary sm:text-base">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-text-secondary">{item.description}</p>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
                        {CHANNEL_LABELS.map((channel) => (
                          <div
                            key={channel.key}
                            className="flex items-center justify-between gap-3 rounded-xl bg-background/70 px-3 py-3 min-[480px]:flex-col min-[480px]:items-center"
                          >
                            <span className="text-xs font-medium uppercase tracking-[0.06em] text-text-secondary">
                              {channel.label}
                            </span>
                            <ChannelToggle
                              label={`${item.title} ${channel.label}`}
                              enabled={itemPreference.channels[channel.key]}
                              disabled={preferences.muteAll}
                              onClick={() => onToggleChannel(item.key, channel.key)}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="w-full max-w-full min-w-0">
                        <label className="mb-1 block text-xs font-medium uppercase tracking-[0.06em] text-text-secondary">
                          Frequency
                        </label>
                        <FrequencyDropdown
                          value={itemPreference.frequency}
                          onChange={(frequency) => onChangeFrequency(item.key, frequency)}
                          disabled={preferences.muteAll}
                          direction={shouldOpenUp ? "up" : "down"}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
