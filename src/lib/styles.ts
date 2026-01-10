import { cn } from "@/lib/cn";

export const NEUMORPHIC_CARD = cn(
  "p-6 rounded-2xl",
  "bg-white",
  "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
);

export const NEUMORPHIC_BUTTON = cn(
  "flex items-center gap-3 px-6 py-4 rounded-xl",
  "bg-white",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
  "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
  "transition-all duration-200"
);

export const NEUMORPHIC_INSET = cn(
  "bg-background",
  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
);

export const NEUMORPHIC_INPUT = cn(
  "w-full px-4 py-3 rounded-xl",
  "bg-background",
  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
  "text-text-primary placeholder-text-secondary",
  "outline-none focus:ring-2 focus:ring-primary/20",
  "transition-all duration-200"
);

export const ICON_BUTTON = cn(
  "w-10 h-10 rounded-xl flex items-center justify-center",
  "bg-white",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
  "transition-all duration-200"
);

export const ICON_CONTAINER = "w-12 h-12 rounded-xl flex items-center justify-center";

export const INPUT_ERROR_STYLES = "ring-2 ring-error/50";

export const PRIMARY_BUTTON = cn(
  "px-6 py-3 rounded-xl font-medium",
  "bg-primary text-white",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
  "hover:bg-primary-hover hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:scale-[1.02]",
  "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] active:scale-[0.98]",
  "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100",
  "transition-all duration-200 cursor-pointer"
);

export const USER_AVATAR_BUTTON = cn(
  "w-10 h-10 rounded-full flex items-center justify-center cursor-pointer",
  "bg-primary text-white font-bold",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
  "active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]",
  "transition-all duration-200"
);

export const DROPDOWN_MENU = cn(
  "absolute right-0 top-full mt-2 w-48 py-2 rounded-xl",
  "bg-white",
  "shadow-[4px_4px_10px_rgba(0,0,0,0.1)]",
  "border border-border-light z-50"
);

export const DROPDOWN_ITEM = cn(
  "flex items-center gap-3 px-4 py-2.5 text-sm",
  "text-text-primary hover:bg-background transition-colors"
);

export const DROPDOWN_ITEM_DANGER = cn(
  "flex items-center gap-3 w-full px-4 py-2.5 text-sm",
  "text-error hover:bg-background transition-colors cursor-pointer"
);

export const ACTION_BUTTON_BASE = cn(
  "flex items-center gap-2 w-full px-4 py-3 rounded-xl",
  "font-medium transition-colors"
);

export const ACTION_BUTTON_DEFAULT = cn(
  ACTION_BUTTON_BASE,
  "text-text-primary bg-background hover:bg-gray-100"
);

export const ACTION_BUTTON_WARNING = cn(
  ACTION_BUTTON_BASE,
  "text-warning bg-warning/10 hover:bg-warning/20 cursor-pointer"
);

export const ACTION_BUTTON_DANGER = cn(
  ACTION_BUTTON_BASE,
  "text-error bg-error/10 hover:bg-error/20 cursor-pointer"
);

export const ACTION_BUTTON_SUBTLE = cn(
  ACTION_BUTTON_BASE,
  "text-text-secondary hover:bg-background"
);
