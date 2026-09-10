"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { OrderParticipant } from "@/types/order.types";

const UNKNOWN_PARTICIPANT_LABEL = "Specialist";
const UNKNOWN_INITIAL = "?";

function resolveDisplayName(participant: OrderParticipant | undefined): string {
  return (
    participant?.name ||
    participant?.username ||
    participant?.email?.split("@")[0] ||
    UNKNOWN_PARTICIPANT_LABEL
  );
}

function resolveInitial(participant: OrderParticipant | undefined): string {
  return (
    (participant?.name || participant?.username)?.charAt(0) ||
    participant?.email?.charAt(0) ||
    UNKNOWN_INITIAL
  ).toUpperCase();
}

interface OrderParticipantCardProps {
  title: string;
  participant: OrderParticipant | undefined;
}

export function OrderParticipantCard({
  title,
  participant,
}: OrderParticipantCardProps): React.JSX.Element {
  const displayName = resolveDisplayName(participant);
  const handle = participant?.username ? `@${participant.username}` : null;
  const initial = resolveInitial(participant);

  return (
    <div className={cn(NEUMORPHIC_CARD, "p-6 sm:p-7 flex flex-col justify-between")}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            {title}
          </span>
          <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
            {title === "Freelancer" ? "Specialist" : "Buyer"}
          </span>
        </div>

        <div className="flex items-center gap-3.5 mb-5">
          {participant?.avatar ? (
            <img
              src={participant.avatar}
              alt={displayName}
              className="w-14 h-14 rounded-2xl object-cover shadow-[2px_2px_6px_#cbd5e1]"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-extrabold text-lg shadow-[3px_3px_8px_#cbd5e1]">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base text-[#111827] truncate">{displayName}</h3>
            {handle && <p className="text-xs text-text-secondary">{handle}</p>}
            <p className="text-xs text-text-secondary truncate mt-0.5">{participant?.email}</p>
          </div>
        </div>
      </div>

      {participant?.id && (
        <div className="pt-2 border-t border-black/5">
          <Link
            href={`/app/chat?userId=${participant.id}`}
            className={cn(
              "w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2",
              "bg-background text-text-primary font-semibold text-xs",
              "shadow-[3px_3px_8px_#d1d5db,-3px_-3px_8px_#ffffff]",
              "hover:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_5px_#ffffff]",
              "transition-all duration-200"
            )}
          >
            <Icon path={ICON_PATHS.chat} size="sm" className="text-primary" />
            <span>Open Direct Chat</span>
          </Link>
        </div>
      )}
    </div>
  );
}
