"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * CSS selector that matches all keyboard-focusable elements.
 * Excludes elements explicitly removed from the tab order via tabindex="-1".
 */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export interface UseFocusTrapModalOptions {
  /** Whether the modal is currently open. The hook is a no-op when false. */
  isOpen: boolean;
  /**
   * Called when the user presses Escape (unless `isBlocking` is true).
   * Pass the same handler you use for the backdrop click / close button.
   */
  onClose: () => void;
  /**
   * When true (e.g. a signing operation is in flight), Escape is suppressed
   * so the user cannot accidentally dismiss a blocking modal.
   */
  isBlocking?: boolean;
}

export interface UseFocusTrapModalReturn {
  /**
   * Attach this ref to the outermost focusable container of the modal dialog
   * (the element with `role="dialog"`). The hook uses it to:
   * - Focus the dialog on open so screen readers announce it immediately.
   * - Query focusable descendants for Tab-cycling.
   */
  dialogRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Provides keyboard accessibility for portal-rendered modal dialogs:
 *
 * - **Focus on open** — moves focus into the dialog container so screen
 *   readers announce the dialog and keyboard users can immediately interact.
 * - **Escape to close** — unless `isBlocking` is true (e.g. a signing
 *   operation is in flight).
 * - **Tab cycling** — Tab and Shift+Tab wrap within the dialog, preventing
 *   focus from escaping to the page behind the backdrop.
 *
 * @example
 * ```tsx
 * const { dialogRef } = useFocusTrapModal({ isOpen, onClose, isBlocking });
 *
 * return createPortal(
 *   <div ref={dialogRef} role="dialog" aria-modal="true" tabIndex={-1}>
 *     …
 *   </div>,
 *   document.body
 * );
 * ```
 */
export function useFocusTrapModal({
  isOpen,
  onClose,
  isBlocking = false,
}: UseFocusTrapModalOptions): UseFocusTrapModalReturn {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Stable close callback that respects the blocking flag.
  const handleClose = useCallback(() => {
    if (isBlocking) return;
    onClose();
  }, [isBlocking, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Move focus into the dialog so screen readers announce it and keyboard
    // users are immediately inside the trap.
    dialogRef.current?.focus();

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
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleClose]);

  return { dialogRef };
}
