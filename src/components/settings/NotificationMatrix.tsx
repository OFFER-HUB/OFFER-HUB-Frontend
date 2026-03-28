import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_INPUT } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type {
  NotificationChannel,
  NotificationFrequency,
  NotificationPreferenceSectionMeta,
  NotificationPreferenceType,
  NotificationPreferences,
} from "@/types/notification-preferences.types";

interface NotificationMatrixProps {
  sections: NotificationPreferenceSectionMeta[];
  preferences: NotificationPreferences;
  onToggleChannel: (type: NotificationPreferenceType, channel: NotificationChannel) => void;
  onChangeFrequency: (type: NotificationPreferenceType, frequency: NotificationFrequency) => void;
  onToggleMuteAll: () => void;
}

const FREQUENCY_OPTIONS: Array<{ value: NotificationFrequency; label: string }> = [
  { value: "instant", label: "Instant" },
  { value: "daily_digest", label: "Daily digest" },
  { value: "off", label: "Off" },
];

const CHANNEL_LABELS: Array<{ key: NotificationChannel; label: string }> = [
  { key: "email", label: "Email" },
  { key: "inApp", label: "In-app" },
  { key: "push", label: "Push" },
];

const FREQUENCY_SELECT_STYLES = cn(
  NEUMORPHIC_INPUT,
  "h-11 w-full appearance-none cursor-pointer pl-4 pr-12 py-2 text-sm leading-5"
);

function getFrequencyLabel(value: NotificationFrequency): string {
  return FREQUENCY_OPTIONS.find((option) => option.value === value)?.label ?? "Instant";
}

function ChannelToggle({
  label,
  enabled,
  onClick,
  disabled,
}: {
  label: string;
  enabled: boolean;
  onClick: () => void;
  disabled: boolean;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative h-6 w-12 rounded-full transition-all duration-200",
        "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
        enabled ? "bg-primary" : "bg-background",
        disabled && "cursor-not-allowed opacity-60"
      )}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-200",
          "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
          enabled ? "left-6" : "left-0.5"
        )}
      />
    </button>
  );
}

function FrequencyDropdown({
  value,
  onChange,
  disabled,
  align = "left",
  direction = "down",
}: {
  value: NotificationFrequency;
  onChange: (value: NotificationFrequency) => void;
  disabled: boolean;
  align?: "left" | "right";
  direction?: "down" | "up";
}): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full max-w-full min-w-0", isOpen ? "z-[90]" : "z-10")}
    >
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setIsOpen((current) => !current);
          }
        }}
        disabled={disabled}
        className={cn(
          FREQUENCY_SELECT_STYLES,
          "flex items-center justify-between text-left",
          disabled && "cursor-not-allowed opacity-60"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate pr-3">{getFrequencyLabel(value)}</span>
        <span className="pointer-events-none absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-background/90 shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]">
          <Icon
            path={ICON_PATHS.chevronDown}
            size="sm"
            className={cn("text-text-secondary transition-transform", isOpen && "rotate-180")}
          />
        </span>
      </button>

      {isOpen && !disabled && (
        <ul
          className={cn(
            "absolute z-[100] max-h-56 w-full overflow-y-auto rounded-xl border border-border-light bg-white p-1 shadow-[10px_10px_24px_rgba(15,23,42,0.14)]",
            direction === "up" ? "bottom-[calc(100%+0.5rem)]" : "top-[calc(100%+0.5rem)]",
            align === "right" ? "right-0" : "left-0"
          )}
          role="listbox"
        >
          {FREQUENCY_OPTIONS.map((option) => {
            const isSelected = option.value === value;

            return (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    isSelected
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-text-primary hover:bg-background"
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span>{option.label}</span>
                  {isSelected && <Icon path={ICON_PATHS.check} size="sm" className="text-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

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
