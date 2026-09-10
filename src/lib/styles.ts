import { cn } from "@/lib/cn";

export const NEUMORPHIC_CARD = cn(
  "p-6 rounded-2xl",
  "bg-white",
  "shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]"
);

export const NEUMORPHIC_BUTTON = cn(
  "flex items-center gap-3 px-6 py-4 rounded-xl",
  "bg-white",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0a0f1a,-4px_-4px_8px_#1e2a4a]",
  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] dark:hover:shadow-[2px_2px_4px_#0a0f1a,-2px_-2px_4px_#1e2a4a]",
  "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]",
  "transition-all duration-200"
);

export const NEUMORPHIC_INSET = cn(
  "bg-background",
  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]"
);

export const NEUMORPHIC_INPUT = cn(
  "w-full px-4 py-3 rounded-xl",
  "bg-background",
  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0a0f1a,inset_-2px_-2px_4px_#1e2a4a]",
  "text-text-primary placeholder-text-secondary",
  "outline-none focus:ring-2 focus:ring-primary/20",
  "transition-all duration-200"
);

export const ICON_BUTTON = cn(
  "w-10 h-10 rounded-xl flex items-center justify-center",
  "bg-white",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0a0f1a,-4px_-4px_8px_#1e2a4a]",
  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] dark:hover:shadow-[2px_2px_4px_#0a0f1a,-2px_-2px_4px_#1e2a4a]",
  "transition-all duration-200"
);

export const ICON_CONTAINER = "w-12 h-12 rounded-xl flex items-center justify-center";

export const INPUT_ERROR_STYLES = "ring-2 ring-error/50";

export const PRIMARY_BUTTON = cn(
  "px-6 py-3 rounded-xl font-medium",
  "bg-background text-primary",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0a0f1a,-4px_-4px_8px_#1e2a4a]",
  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] dark:hover:shadow-[2px_2px_4px_#0a0f1a,-2px_-2px_4px_#1e2a4a]",
  "active:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#0a0f1a,inset_-3px_-3px_6px_#1e2a4a]",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "transition-all duration-200 cursor-pointer",
  "flex items-center gap-2"
);

export const DANGER_BUTTON = cn(
  "px-6 py-3 rounded-xl font-medium",
  "bg-background text-error",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0a0f1a,-4px_-4px_8px_#1e2a4a]",
  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] dark:hover:shadow-[2px_2px_4px_#0a0f1a,-2px_-2px_4px_#1e2a4a]",
  "active:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#0a0f1a,inset_-3px_-3px_6px_#1e2a4a]",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "transition-all duration-200 cursor-pointer",
  "flex items-center gap-2"
);

export const USER_AVATAR_BUTTON = cn(
  "w-10 h-10 rounded-full flex items-center justify-center cursor-pointer",
  "bg-background text-primary font-bold",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
  "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
  "transition-all duration-200"
);

export const DROPDOWN_MENU = cn(
  "absolute right-[-4px] top-[calc(100%+0.5rem)] w-64 py-3 rounded-2xl",
  "bg-white/95 backdrop-blur-md",
  "shadow-[20px_20px_60px_rgba(0,0,0,0.08),-10px_-10px_40px_#ffffff]",
  "border border-white/60 z-50",
  "animate-scale-in origin-top-right"
);

export const DROPDOWN_ITEM = cn(
  "group flex items-center justify-between px-4 py-3 text-sm font-medium",
  "text-text-secondary transition-all duration-300 rounded-xl mx-2 my-1",
  "hover:text-primary hover:bg-background",
  "hover:shadow-[inset_4px_4px_8px_#d1e4e5,inset_-4px_-4px_8px_#ffffff]",
  "hover:scale-[1.02]",
  "active:scale-95 active:shadow-[inset_6px_6px_12px_#d1e4e5,inset_-6px_-6px_12px_#ffffff]"
);

export const DROPDOWN_ITEM_DANGER = cn(
  "group flex items-center justify-between w-[calc(100%-1rem)] px-4 py-3 text-sm font-medium mx-2 my-1",
  "text-error/70 transition-all duration-300 rounded-xl",
  "hover:text-error hover:bg-error/5",
  "hover:shadow-[inset_4px_4px_8px_#fecaca,inset_-4px_-4px_8px_#ffffff]",
  "hover:scale-[1.02]",
  "active:scale-95 active:shadow-[inset_6px_6px_12px_#fecaca,inset_-6px_-6px_12px_#ffffff] cursor-pointer"
);

export const NEUMORPHIC_CARD_INTERACTIVE = cn(
  NEUMORPHIC_CARD,
  "transition-all duration-300 hover:shadow-[10px_10px_20px_#d1d5db,-10px_-10px_20px_#ffffff] hover:-translate-y-1"
);

export const ACTION_BUTTON_BASE = cn(
  "flex items-center gap-2 w-full px-4 py-3 rounded-xl",
  "font-medium bg-white",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
  "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1)]",
  "transition-all duration-200"
);

export const ACTION_BUTTON_DEFAULT = cn(
  ACTION_BUTTON_BASE,
  "text-primary"
);

export const ACTION_BUTTON_WARNING = cn(
  ACTION_BUTTON_BASE,
  "text-warning cursor-pointer"
);

export const ACTION_BUTTON_DANGER = cn(
  ACTION_BUTTON_BASE,
  "text-error cursor-pointer"
);

export const ACTION_BUTTON_SUBTLE = cn(
  ACTION_BUTTON_BASE,
  "text-text-secondary"
);

export const SCROLLABLE_CONTAINER = cn(
  "h-full min-h-0 overflow-y-auto",
  "bg-white rounded-2xl p-6",
  "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
);
