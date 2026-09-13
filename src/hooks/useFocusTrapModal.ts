import { useEffect, useRef, useCallback } from "react";

export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export interface UseFocusTrapModalOptions {
  isOpen: boolean;
  onClose: () => void;
  isBlocking?: boolean;
}

/**
 * Reusable modal accessibility hook managing focus-trap, Tab-cycling,
 * initial focus, and Escape-key closure.
 */
export function useFocusTrapModal<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
  isBlocking = false,
}: UseFocusTrapModalOptions) {
  const dialogRef = useRef<T>(null);

  const handleClose = useCallback(() => {
    if (isBlocking) return;
    onClose();
  }, [isBlocking, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleClose]);

  return {
    dialogRef,
    handleClose,
  };
}
