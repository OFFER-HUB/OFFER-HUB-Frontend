"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { ConversationList } from "@/components/chat/ConversationList";
import { MOCK_CONVERSATIONS } from "@/data/chat.data";
import { useSidebarStore } from "@/stores/sidebar-store";

export default function ChatPage(): React.JSX.Element {
  const { setCollapsed } = useSidebarStore();

  useEffect(() => {
    setCollapsed(true);
  }, [setCollapsed]);

  return (
    <div className="flex h-full gap-4">
      <div
        className={cn(
          "w-full sm:w-80 lg:w-[340px] flex-shrink-0",
          "bg-white rounded-2xl overflow-hidden",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
        )}
      >
        <ConversationList conversations={MOCK_CONVERSATIONS} />
      </div>

      <div
        className={cn(
          "hidden sm:flex flex-1 flex-col items-center justify-center",
          "bg-white rounded-2xl",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
        )}
      >
        <div
          className={cn(
            "w-24 h-24 mb-6 rounded-full flex items-center justify-center",
            "bg-background",
            "shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]"
          )}
        >
          <Icon path={ICON_PATHS.chat} size="xl" className="text-primary" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">
          Your Messages
        </h2>
        <p className="text-text-secondary text-center max-w-xs text-sm">
          Select a conversation from the list to start messaging
        </p>
      </div>
    </div>
  );
}
