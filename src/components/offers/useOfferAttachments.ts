'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface OfferAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
  isExisting?: boolean;
}

export interface UseOfferAttachmentsOptions {
  initialAttachments?: OfferAttachment[];
  maxSizeBytes?: number;
  accepted?: string[];
  onError?: (error: string) => void;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function useOfferAttachments(options: UseOfferAttachmentsOptions = {}) {
  const {
    initialAttachments = [],
    maxSizeBytes = DEFAULT_MAX_SIZE,
    accepted,
    onError,
  } = options;

  const [attachments, setAttachments] = useState<OfferAttachment[]>(initialAttachments);
  const objectUrlsRef = useRef<Set<string>=(new Set());

  const revokeUrl = useCallback((url?: string) => {
    if (!url) return;
    if (objectUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      objectUrlsRef.current.delete(url);
    }
  }, []);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files as ArrayLike<File>);
      if (incoming.length === 0) return;

      const valid: OfferAttachment[] = [];
      for (const file of incoming) {
        if (file.size > maxSizeBytes) {
          onError?.(
            `File "${file.name}" exceeds the maximum size of ${Math.round(maxSizeBytes / (1024 * 1024))}MB.`,
          );
          continue;
        }
        if (accepted && file.type && !accepted.split(',').some((t) => file.type.includes(t.trim().replace('/*', '')))) {
          onError?.(`File "${file.name}" has an unsupported type.`);
          continue;
        }
        const url = URL.createObjectURL(file);
        objectUrlsRef.current.add(url);
        valid.push({
          id: `queue-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          url,
          file,
          isExisting: false,
        });
      }

      if (valid.length > 0) {
        setAttachments((prev) => [...prev, ...valid]);
      }
    },
    [accepted, maxSizeBytes, onError],
  );

  const removeAttachment = useCallback(
    (id: string) => {
      setAttachments((prev) => {
        const target = prev.find((a) => a.id === id);
        if (target) {
          revokeUrl(target.url);
        }
        return prev.filter((a) => a.id !== id);
      });
    },
    [revokeUrl],
  );

  const clear = useCallback(() => {
    setAttachments((prev) => {
      for (const att of prev) {
        if (!att.isExisting) revokeUrl(att.url);
      }
      return [];
    });
  }, [revokeUrl]);

  useEffect(() => {
    return () => {
      for (const url of objectUrlsRef.current) {
        URL.revokeObjectURL(url);
      }
      objectUrlsRef.current.clear();
    };
  }, []);

  const newFiles = attachments.filter((a) => !a.isExisting && a.file).map((a) => a.file as File);

  return {
    attachments,
    newFiles,
    addFiles,
    removeAttachment,
    clear,
  };
}
