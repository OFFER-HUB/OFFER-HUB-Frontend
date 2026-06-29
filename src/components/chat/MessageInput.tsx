"use client";

import { useState, useRef, useCallback, useEffect, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { AttachmentButton } from "@/components/chat/AttachmentButton";
import { AttachmentPreviewList } from "@/components/chat/AttachmentPreviewList";
import { createFileAttachment, validateFiles } from "@/lib/attachment-utils";
import { uploadAttachment } from "@/services/attachment-api";
import type { FileAttachment } from "@/types/attachment.types";

const TYPING_STOP_DELAY_MS = 2_000;

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: FileAttachment[]) => void;
  onTypingChange?: (isTyping: boolean) => void;
  disabled?: boolean;
  conversationId: string;
}

export function MessageInput({
  onSendMessage,
  onTypingChange,
  disabled = false,
  conversationId,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const isTypingRef = useRef(false);
  const typingStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  const POPULAR_EMOJIS = [
    "😀", "😂", "😍", "👍", "🎉", "🔥", "❤️", "🚀",
    "🤔", "👏", "🙌", "✨", "💯", "😎", "💡", "😢"
  ];

  // Close picker on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Clear validation error after 3 seconds
  useEffect(() => {
    if (validationError) {
      const timer = setTimeout(() => setValidationError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [validationError]);

  const notifyTypingStop = useCallback(() => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingChange?.(false);
    }
  }, [onTypingChange]);

  const handleChange = useCallback(
    (value: string) => {
      setMessage(value);
      if (!onTypingChange) return;

      if (typingStopTimerRef.current !== null) {
        clearTimeout(typingStopTimerRef.current);
      }

      if (value.trim()) {
        if (!isTypingRef.current) {
          isTypingRef.current = true;
          onTypingChange(true);
        }
        typingStopTimerRef.current = setTimeout(notifyTypingStop, TYPING_STOP_DELAY_MS);
      } else {
        notifyTypingStop();
      }
    },
    [onTypingChange, notifyTypingStop]
  );

  const handleAddEmoji = (emoji: string) => {
    const newVal = message + emoji;
    handleChange(newVal);
  };

  // ─── Attachment Handlers ─────────────────────────────────────────────────

  const handleFilesSelected = useCallback((files: FileList) => {
    const fileArray = Array.from(files);
    const validation = validateFiles(fileArray);
    
    if (!validation.valid) {
      setValidationError(validation.error || "Invalid files");
      return;
    }

    const newAttachments = fileArray.map(createFileAttachment);
    setAttachments((prev) => [...prev, ...newAttachments]);
    setValidationError(null);
  }, []);

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment?.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
      // Abort any in-progress upload
      const controller = abortControllersRef.current.get(id);
      if (controller) {
        controller.abort();
        abortControllersRef.current.delete(id);
      }
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const handleCancelUpload = useCallback((id: string) => {
    const controller = abortControllersRef.current.get(id);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(id);
    }
    setAttachments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "error", error: "Cancelled" } : a))
    );
  }, []);

  const handleRetryUpload = useCallback((id: string) => {
    setAttachments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "pending", progress: 0, error: undefined } : a))
    );
  }, []);

  const uploadAllAttachments = useCallback(async (): Promise<FileAttachment[]> => {
    const pendingAttachments = attachments.filter((a) => a.status === "pending");
    if (pendingAttachments.length === 0) return attachments;

    const updatedAttachments = [...attachments];

    for (const attachment of pendingAttachments) {
      const controller = new AbortController();
      abortControllersRef.current.set(attachment.id, controller);

      // Update status to uploading
      setAttachments((prev) =>
        prev.map((a) => (a.id === attachment.id ? { ...a, status: "uploading" } : a))
      );

      try {
        const response = await uploadAttachment(
          attachment,
          conversationId,
          (progress) => {
            setAttachments((prev) =>
              prev.map((a) => (a.id === attachment.id ? { ...a, progress } : a))
            );
          },
          controller.signal
        );

        // Update with uploaded URL
        setAttachments((prev) =>
          prev.map((a) =>
            a.id === attachment.id
              ? { ...a, status: "uploaded", url: response.url, progress: 100 }
              : a
          )
        );

        const idx = updatedAttachments.findIndex((a) => a.id === attachment.id);
        if (idx !== -1) {
          updatedAttachments[idx] = {
            ...updatedAttachments[idx],
            status: "uploaded",
            url: response.url,
            progress: 100,
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        setAttachments((prev) =>
          prev.map((a) =>
            a.id === attachment.id
              ? { ...a, status: "error", error: errorMessage }
              : a
          )
        );

        const idx = updatedAttachments.findIndex((a) => a.id === attachment.id);
        if (idx !== -1) {
          updatedAttachments[idx] = {
            ...updatedAttachments[idx],
            status: "error",
            error: errorMessage,
          };
        }
      } finally {
        abortControllersRef.current.delete(attachment.id);
      }
    }

    return updatedAttachments;
  }, [attachments, conversationId]);

  // ─── Drag & Drop ───────────────────────────────────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFilesSelected(files);
      }
    },
    [handleFilesSelected]
  );

  // ─── Submit ──────────────────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const trimmedMessage = message.trim();
    const hasAttachments = attachments.length > 0;

    if ((!trimmedMessage && !hasAttachments) || disabled) return;

    // Check for errors
    const hasErrors = attachments.some((a) => a.status === "error");
    if (hasErrors) {
      setValidationError("Please fix or remove failed attachments before sending.");
      return;
    }

    if (typingStopTimerRef.current !== null) {
      clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }
    notifyTypingStop();

    // Upload attachments first
    const uploadedAttachments = await uploadAllAttachments();
    const successfulAttachments = uploadedAttachments.filter((a) => a.status === "uploaded");

    // Send message with attachments
    onSendMessage(trimmedMessage, successfulAttachments);

    // Cleanup
    setMessage("");
    setShowEmojiPicker(false);
    setAttachments([]);
    setValidationError(null);
  }

  const hasContent = message.trim().length > 0 || attachments.length > 0;
  const isUploading = attachments.some((a) => a.status === "uploading");

  return (
    <div
      className={cn(
        "relative",
        dragOver && "after:absolute after:inset-0 after:bg-primary/5 after:border-2 after:border-primary after:border-dashed after:rounded-lg after:z-10 after:pointer-events-none"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay hint */}
      {dragOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg">
            <p className="text-sm font-medium text-primary">Drop files here to attach</p>
          </div>
        </div>
      )}

      {/* Validation Error Toast */}
      {validationError && (
        <div className="px-4 sm:px-6 pt-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
            <Icon path={ICON_PATHS.alert} size="sm" />
            <span>{validationError}</span>
          </div>
        </div>
      )}

      {/* Attachment Previews */}
      <AttachmentPreviewList
        attachments={attachments}
        onRemove={handleRemoveAttachment}
        onCancel={handleCancelUpload}
        onRetry={handleRetryUpload}
      />

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4",
          "border-t border-border-light",
          "bg-white"
        )}
      >
        {/* Attachment Button */}
        <AttachmentButton
          onFilesSelected={handleFilesSelected}
          disabled={disabled || isUploading}
        />

        {/* Message input container */}
        <div
          className={cn(
            "flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl relative",
            "bg-background",
            "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
          )}
        >
          {/* Emoji Selector button */}
          <div ref={emojiPickerRef} className="relative flex items-center">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className={cn(
                "text-text-secondary hover:text-primary transition-colors p-1 rounded-lg cursor-pointer",
                showEmojiPicker && "text-primary",
                disabled && "cursor-not-allowed opacity-50"
              )}
              title="Add emoji"
            >
              <Icon path={ICON_PATHS.emoji} size="md" />
            </button>

            {/* Emoji Picker Popup */}
            {showEmojiPicker && (
              <div
                className={cn(
                  "absolute bottom-full left-0 mb-3 p-3 rounded-2xl bg-white border border-border-light z-50 flex flex-wrap gap-2 w-64",
                  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
                )}
              >
                {POPULAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleAddEmoji(emoji)}
                    className="text-xl hover:scale-125 transition-transform cursor-pointer p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            value={message}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={attachments.length > 0 ? "Add a message (optional)..." : "Type a message..."}
            disabled={disabled}
            className={cn(
              "flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none",
              disabled && "cursor-not-allowed"
            )}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || (!hasContent && attachments.length === 0) || isUploading}
          className={cn(
            "p-2.5 sm:p-3 rounded-xl transition-all duration-200 flex items-center justify-center",
            hasContent
              ? "bg-primary text-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] hover:bg-primary-hover"
              : "bg-background text-text-tertiary shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
            (disabled || isUploading) && "cursor-not-allowed opacity-50"
          )}
          aria-label="Send message"
        >
          {isUploading ? (
            <Icon path={ICON_PATHS.spinner} size="md" className="animate-spin" />
          ) : (
            <Icon path={ICON_PATHS.send} size="md" />
          )}
        </button>
      </form>
    </div>
  );
}