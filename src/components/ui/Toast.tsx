"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "./Icon";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

const TOAST_STYLES = {
  success: "bg-success/10 border-success/20 text-success",
  error: "bg-error/10 border-error/20 text-error",
  info: "bg-primary/10 border-primary/20 text-primary",
};

const TOAST_ICONS = {
  success: ICON_PATHS.check,
  error: ICON_PATHS.close,
  info: ICON_PATHS.chat,
};

export function Toast({
  message,
  type = "success",
  duration = 3000,
  onClose,
}: ToastProps): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "px-4 py-3 rounded-xl border",
        "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
        "flex items-center gap-3",
        "transition-all duration-300",
        TOAST_STYLES[type],
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      <Icon path={TOAST_ICONS[type]} size="md" />
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <Icon path={ICON_PATHS.close} size="sm" />
      </button>
    </div>
  );
}
