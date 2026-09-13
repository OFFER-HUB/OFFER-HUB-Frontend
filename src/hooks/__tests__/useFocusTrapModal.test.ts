import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFocusTrapModal } from "../useFocusTrapModal";

describe("useFocusTrapModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles Escape key to close modal when not blocking", () => {
    const onClose = vi.fn();
    renderHook(() => useFocusTrapModal({ isOpen: true, onClose, isBlocking: false }));

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not call onClose on Escape when isBlocking is true", () => {
    const onClose = vi.fn();
    renderHook(() => useFocusTrapModal({ isOpen: true, onClose, isBlocking: true }));

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not attach listener when isOpen is false", () => {
    const onClose = vi.fn();
    renderHook(() => useFocusTrapModal({ isOpen: false, onClose, isBlocking: false }));

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onClose).not.toHaveBeenCalled();
  });
});
