"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ChatMessage } from "@/types/chat.types";
import { useChatStore } from "@/stores/chat-store";

interface UseMarkAsReadOptions {
  conversationId: string;
  currentUserId?: string;
}

interface UseMarkAsReadResult {
  getMessageRef: (message: ChatMessage) => (node: HTMLDivElement | null) => void;
}

export function useMarkAsRead({
  conversationId,
  currentUserId,
}: UseMarkAsReadOptions): UseMarkAsReadResult {
  const queueMarkAsRead = useChatStore((s) => s.queueMarkAsRead);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const nodeToMessageIdRef = useRef<WeakMap<Element, string>>(new WeakMap());

  useEffect(() => {
    seenMessageIdsRef.current.clear();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const messageId = nodeToMessageIdRef.current.get(entry.target);
          if (!messageId || seenMessageIdsRef.current.has(messageId)) continue;

          seenMessageIdsRef.current.add(messageId);
          queueMarkAsRead(conversationId, messageId);
          observerRef.current?.unobserve(entry.target);
        }
      },
      {
        root: null,
        threshold: 0.7,
      }
    );

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [conversationId, queueMarkAsRead]);

  const getMessageRef = useCallback(
    (message: ChatMessage) => {
      return (node: HTMLDivElement | null) => {
        if (!node || !observerRef.current) return;

        const isIncoming = message.senderId !== currentUserId;
        if (!isIncoming) return;

        nodeToMessageIdRef.current.set(node, message.id);
        observerRef.current.observe(node);
      };
    },
    [currentUserId]
  );

  return { getMessageRef };
}
