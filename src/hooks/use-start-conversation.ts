"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createConversation } from "@/lib/api/chat";

interface StartConversationState {
  /** True while a conversation is being opened because the link carried `?userId=`. */
  isStarting: boolean;
  error: string | null;
}

/**
 * "Open Direct Chat" and "Contact" links point at `/app/chat?userId=<person>`.
 * Nothing used to read that parameter, so the user landed on an empty list. This opens
 * (or finds) the conversation with that person and moves to it.
 */
export function useStartConversation(): StartConversationState {
  const router = useRouter();
  const startedFor = useRef<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = new URLSearchParams(window.location.search).get("userId");
    if (!userId || startedFor.current === userId) return;
    startedFor.current = userId;

    async function start(participantId: string): Promise<void> {
      setIsStarting(true);
      const res = await createConversation({ participantId });
      if (res.ok && res.data) {
        router.replace(`/app/chat/${res.data.id}`);
        return;
      }
      setError(res.message || "We could not open this conversation.");
      setIsStarting(false);
    }

    void start(userId);
  }, [router]);

  return { isStarting, error };
}
