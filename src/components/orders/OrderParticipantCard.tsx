import { NEUMORPHIC_CARD } from "@/lib/styles";
import type { OrderParticipant } from "@/types/order.types";

const UNKNOWN_PARTICIPANT_LABEL = "Unknown";
const UNKNOWN_INITIAL = "?";

/** Best available display name: full name, then handle, then the email local part. */
function resolveDisplayName(participant: OrderParticipant | undefined): string {
  return (
    participant?.name ||
    participant?.username ||
    participant?.email?.split("@")[0] ||
    UNKNOWN_PARTICIPANT_LABEL
  );
}

/** First character of whatever identifies the participant, for the avatar fallback. */
function resolveInitial(participant: OrderParticipant | undefined): string {
  return (
    (participant?.name || participant?.username)?.charAt(0) ||
    participant?.email?.charAt(0) ||
    UNKNOWN_INITIAL
  );
}

interface OrderParticipantCardProps {
  /** Heading above the participant — "Freelancer" or "Client". */
  title: string;
  participant: OrderParticipant | undefined;
}

/**
 * The other side of the order: avatar, display name and email.
 */
export function OrderParticipantCard({
  title,
  participant,
}: OrderParticipantCardProps): React.JSX.Element {
  return (
    <div className={NEUMORPHIC_CARD}>
      <h2 className="text-lg font-semibold text-text-primary mb-4">{title}</h2>
      <div className="flex items-center gap-3">
        {participant?.avatar ? (
          <img
            src={participant.avatar}
            alt={participant.name || "User"}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
            {resolveInitial(participant)}
          </div>
        )}
        <div>
          <p className="font-medium text-text-primary">{resolveDisplayName(participant)}</p>
          <p className="text-sm text-text-secondary">{participant?.email}</p>
        </div>
      </div>
    </div>
  );
}
