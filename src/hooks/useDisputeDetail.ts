"use client";

import { useCallback, useEffect, useState } from "react";
import { useModeStore } from "@/stores/mode-store";
import { useAuthStore } from "@/stores/auth-store";
import { addDisputeComment, cancelDispute, getDisputeById } from "@/lib/api/disputes";
import type { Dispute } from "@/types/dispute.types";

export interface UseDisputeDetailOptions {
  disputeId: string;
  mode: "client" | "freelancer";
}

export interface UseDisputeDetailResult {
  dispute: Dispute | null;
  isLoading: boolean;
  error: string | null;
  newComment: string;
  setNewComment: (value: string) => void;
  commentError: string | null;
  isSubmitting: boolean;
  isCancelling: boolean;
  refetch: () => Promise<void>;
  handleSubmitComment: (e: React.FormEvent) => Promise<void>;
  handleCancelDispute: () => Promise<void>;
}

/** Shared dispute-detail fetching, comment submission and cancellation for the client and freelancer detail pages. */
export function useDisputeDetail({
  disputeId,
  mode,
}: UseDisputeDetailOptions): UseDisputeDetailResult {
  const { setMode } = useModeStore();
  const token = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.user?.id);

  const [mounted, setMounted] = useState(false);
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMode(mode);
  }, [setMode, mode]);

  const refetch = useCallback(async (): Promise<void> => {
    if (!mounted) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDisputeById(token, disputeId, userId);
      setDispute(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dispute");
    } finally {
      setIsLoading(false);
    }
  }, [mounted, token, disputeId, userId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const handleSubmitComment = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      if (!newComment.trim() || !dispute) return;

      setIsSubmitting(true);
      setCommentError(null);
      try {
        const updated = await addDisputeComment(token, dispute.id, newComment.trim(), userId);
        setDispute(updated);
        setNewComment("");
      } catch (err) {
        setCommentError(err instanceof Error ? err.message : "Failed to add comment");
      } finally {
        setIsSubmitting(false);
      }
    },
    [newComment, dispute, token, userId]
  );

  const handleCancelDispute = useCallback(async (): Promise<void> => {
    if (!token || !dispute) return;
    setIsCancelling(true);
    try {
      const updated = await cancelDispute(token, dispute.id, userId);
      setDispute(updated);
    } catch (err) {
      console.error("Failed to cancel dispute:", err);
    } finally {
      setIsCancelling(false);
    }
  }, [token, dispute, userId]);

  return {
    dispute,
    isLoading,
    error,
    newComment,
    setNewComment,
    commentError,
    isSubmitting,
    isCancelling,
    refetch,
    handleSubmitComment,
    handleCancelDispute,
  };
}