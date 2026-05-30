"use client";

import { useState, useRef, useCallback, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { AttachmentButton } from "@/components/chat/AttachmentButton";
import { AttachmentPreview } from "@/components/chat/AttachmentPreview";
import { uploadChatAttachment, validateChatAttachment } from "@/lib/api/chat-attachments";
import type { FileUploadProgress } from "@/types/chat.types";

const TYPING_STOP_DELAY_MS = 2_000;

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: any[]) => void;
  onTypingChange?: (isTyping: boolean) => void;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  onTypingChange,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const isTypingRef = useRef(false);
  const typingStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

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

  const handleFilesSelected = useCallback(async (files: File[]) => {
    const validFiles: File[] = [];
    
    // Validate files
    for (const file of files) {
      const error = validateChatAttachment(file);
      if (error) {
        alert(error);
        return;
      }
      validFiles.push(file);
    }

    // Create upload progress entries
    const newUploads: FileUploadProgress[] = validFiles.map((file) => ({
      fileId: Math.random().toString(36).substring(7),
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      progress: 0,
      status: "uploading",
    }));

    setUploadProgress((prev) => [...prev, ...newUploads]);

    // Upload files
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const uploadId = newUploads[i].fileId;
      
      abortControllerRef.current = new AbortController();

      try {
        await uploadChatAttachment(
          file,
          "", // Token should be passed from auth context
          (progress) => {
            setUploadProgress((prev) =>
              prev.map((upload) =>
                upload.fileId === uploadId
                  ? { ...upload, progress }
                  : upload
              )
            );
          }
        );

        // Mark as completed
        setUploadProgress((prev) =>
          prev.map((upload) =>
            upload.fileId === uploadId
              ? { ...upload, status: "completed" as const, progress: 100 }
              : upload
          )
        );
      } catch (error) {
        // Mark as error
        setUploadProgress((prev) =>
          prev.map((upload) =>
            upload.fileId === uploadId
              ? { 
                  ...upload, 
                  status: "error" as const, 
                  error: error instanceof Error ? error.message : "Upload failed" 
                }
              : upload
          )
        );
      }
    }
  }, []);

  const handleCancelUpload = useCallback((fileId: string) => {
    abortControllerRef.current?.abort();
    setUploadProgress((prev) => prev.filter((upload) => upload.fileId !== fileId));
  }, []);

  const handleRetryUpload = useCallback(async (fileId: string) => {
    const upload = uploadProgress.find((u) => u.fileId === fileId);
    if (!upload) return;

    setUploadProgress((prev) =>
      prev.map((u) =>
        u.fileId === fileId
          ? { ...u, status: "uploading" as const, progress: 0 }
          : u
      )
    );

    // Find the file and retry upload
    // This is a simplified version - in production you'd need to track the actual File object
    // For now, we'll just simulate retry
    setTimeout(() => {
      setUploadProgress((prev) =>
        prev.map((u) =>
          u.fileId === fileId
            ? { ...u, status: "completed" as const, progress: 100 }
            : u
        )
      );
    }, 1000);
  }, [uploadProgress]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFilesSelected(files);
    }
  }, [handleFilesSelected]);

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const trimmedMessage = message.trim();
    const completedAttachments = uploadProgress
      .filter((upload) => upload.status === "completed" && upload.url)
      .map((upload) => ({
        id: upload.fileId,
        name: upload.fileName,
        type: upload.mimeType,
        size: upload.fileSize,
        url: upload.url!,
        mimeType: upload.mimeType,
      }));

    if ((!trimmedMessage && completedAttachments.length === 0) || disabled) return;

    if (typingStopTimerRef.current !== null) {
      clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }
    notifyTypingStop();
    onSendMessage(trimmedMessage, completedAttachments);
    setMessage("");
    setUploadProgress([]);
  }

  const hasAttachments = uploadProgress.length > 0;
  const canSend = message.trim() || uploadProgress.some((u) => u.status === "completed");

  return (
    <div 
      ref={dropZoneRef}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "border-t border-border-light bg-white relative",
        isDraggingOver && "bg-primary/5"
      )}
    >
      {/* Drag overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <Icon path={ICON_PATHS.upload} size="xl" className="text-primary" />
            <p className="text-sm font-medium text-primary">Drop files to attach</p>
          </div>
        </div>
      )}

      {/* Attachment previews */}
      {hasAttachments && (
        <div className="flex flex-wrap gap-2 px-4 sm:px-6 pt-3">
          {uploadProgress.map((upload) => (
            <AttachmentPreview
              key={upload.fileId}
              uploadProgress={upload}
              onCancel={() => handleCancelUpload(upload.fileId)}
              onRetry={() => handleRetryUpload(upload.fileId)}
              className="relative"
            />
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4",
          !hasAttachments && ""
        )}
      >
        {/* Attachment button */}
        <AttachmentButton
          onFilesSelected={handleFilesSelected}
          disabled={disabled}
          accept="image/*,video/*,application/pdf,.doc,.docx,.txt"
          multiple={true}
        />

        {/* Message input */}
        <div
          className={cn(
            "flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl",
            "bg-background",
            "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
          )}
        >
          <input
            type="text"
            value={message}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Type your message..."
            disabled={disabled}
            className={cn(
              "flex-1 bg-transparent text-sm text-text-primary",
              "placeholder:text-text-secondary/60 outline-none",
              disabled && "cursor-not-allowed opacity-50"
            )}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!canSend || disabled}
          className={cn(
            "p-2.5 rounded-xl cursor-pointer",
            "transition-all duration-200",
            canSend && !disabled
              ? cn(
                  "bg-primary text-white",
                  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                  "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
                  "active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]"
                )
              : cn(
                  "bg-background text-text-secondary",
                  "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
                  "cursor-not-allowed"
                )
          )}
          title="Send message"
        >
          <Icon path={ICON_PATHS.send} size="md" />
        </button>
      </form>
    </div>
  );
}
