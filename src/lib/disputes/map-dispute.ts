import type {
  Dispute,
  DisputeEvidence,
  DisputeEvent,
  DisputeReason,
  DisputeStatus,
} from "@/types/dispute.types";

/** Raw dispute shape returned by the API (with nested order). */
export interface ApiDispute {
  id: string;
  orderId: string;
  openedBy: string;
  reason: string;
  evidence?: unknown;
  status: string;
  resolutionDecision?: string | null;
  decisionNote?: string | null;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: string;
    title?: string;
    description?: string | null;
    serviceId?: string | null;
    buyerId?: string;
    sellerId?: string;
    buyer?: { id: string; email?: string | null };
    seller?: { id: string; email?: string | null };
    service?: { id: string; title?: string } | null;
  };
}

const STATUS_MAP: Record<string, DisputeStatus> = {
  OPEN: "open",
  UNDER_REVIEW: "under_review",
  RESOLVED: "resolved",
};

const REASON_MAP: Record<string, DisputeReason> = {
  NOT_DELIVERED: "deadline_missed",
  QUALITY_ISSUE: "quality_issues",
  OTHER: "other",
};

/** Maps frontend dispute reason to API enum value. */
export function toApiDisputeReason(reason: DisputeReason): "NOT_DELIVERED" | "QUALITY_ISSUE" | "OTHER" {
  switch (reason) {
    case "quality_issues":
      return "QUALITY_ISSUE";
    case "deadline_missed":
      return "NOT_DELIVERED";
    default:
      return "OTHER";
  }
}

/** Maps frontend status filter to API enum value. */
export function toApiDisputeStatus(status?: string): string | undefined {
  if (!status) return undefined;
  const map: Record<string, string> = {
    open: "OPEN",
    under_review: "UNDER_REVIEW",
    resolved: "RESOLVED",
    closed: "RESOLVED",
  };
  return map[status.toLowerCase()] ?? status.toUpperCase();
}

function unwrapPayload<T>(json: unknown): T {
  let current: unknown = json;
  while (
    current !== null &&
    typeof current === "object" &&
    "data" in (current as object)
  ) {
    const inner = (current as { data: unknown }).data;
    if (
      inner !== null &&
      typeof inner === "object" &&
      "success" in inner &&
      "data" in inner
    ) {
      current = (inner as { data: unknown }).data;
      continue;
    }
    return inner as T;
  }
  return current as T;
}

export function unwrapApiResponse<T>(json: unknown): T {
  return unwrapPayload<T>(json);
}

function displayName(user?: { email?: string | null; id?: string }): string {
  if (!user) return "Unknown";
  return user.email?.split("@")[0] ?? user.id ?? "Unknown";
}

function mapEvidence(
  evidence: unknown,
  fallbackDate: string
): DisputeEvidence[] {
  if (!evidence) return [];
  const items = Array.isArray(evidence) ? evidence : [];
  return items.map((item, index) => {
    if (typeof item === "string") {
      const name = item.split("/").pop() ?? `evidence-${index + 1}`;
      return {
        id: `ev-${index}`,
        name,
        type: "application/octet-stream",
        size: 0,
        uploadedAt: fallbackDate,
        url: item,
      };
    }
    if (item && typeof item === "object") {
      const record = item as Record<string, unknown>;
      return {
        id: String(record.id ?? `ev-${index}`),
        name: String(record.name ?? record.filename ?? `evidence-${index + 1}`),
        type: String(record.type ?? record.mimeType ?? "application/octet-stream"),
        size: Number(record.size ?? 0),
        uploadedAt: String(record.uploadedAt ?? record.createdAt ?? fallbackDate),
        description: record.description ? String(record.description) : undefined,
        url: record.url ? String(record.url) : undefined,
      };
    }
    return {
      id: `ev-${index}`,
      name: `evidence-${index + 1}`,
      type: "application/octet-stream",
      size: 0,
      uploadedAt: fallbackDate,
    };
  });
}

function buildEvents(api: ApiDispute, status: DisputeStatus): DisputeEvent[] {
  const createdAt =
    typeof api.createdAt === "string"
      ? api.createdAt
      : new Date(api.createdAt).toISOString();
  const updatedAt =
    typeof api.updatedAt === "string"
      ? api.updatedAt
      : new Date(api.updatedAt).toISOString();
  const opener =
    api.openedBy === "SELLER"
      ? "freelancer"
      : api.openedBy === "BUYER"
        ? "client"
        : "admin";
  const openerLabel =
    opener === "freelancer" ? "Freelancer" : opener === "client" ? "Client" : "Support";

  const events: DisputeEvent[] = [
    {
      id: `${api.id}-created`,
      type: "created",
      description: `Dispute opened by ${openerLabel.toLowerCase()}`,
      timestamp: createdAt,
      actor: openerLabel,
      actorRole: opener,
    },
  ];

  if (status === "under_review" || status === "resolved") {
    events.unshift({
      id: `${api.id}-review`,
      type: "status_changed",
      description: "Dispute status changed to Under Review",
      timestamp: updatedAt,
      actor: "Support",
      actorRole: "admin",
    });
  }

  if (status === "resolved") {
    events.unshift({
      id: `${api.id}-resolved`,
      type: "resolved",
      description:
        api.decisionNote ??
        (api.resolutionDecision
          ? `Dispute resolved (${api.resolutionDecision})`
          : "Dispute resolved"),
      timestamp: updatedAt,
      actor: "Support",
      actorRole: "admin",
    });
  }

  const evidence = mapEvidence(api.evidence, createdAt);
  if (evidence.length > 0) {
    events.splice(1, 0, {
      id: `${api.id}-evidence`,
      type: "evidence_added",
      description: `${evidence.length} evidence file(s) attached`,
      timestamp: createdAt,
      actor: openerLabel,
      actorRole: opener,
    });
  }

  return events;
}

export function mapApiDisputeToDispute(
  api: ApiDispute,
  currentUserId?: string
): Dispute {
  const order = api.order;
  const status = STATUS_MAP[api.status] ?? "open";
  const reason = REASON_MAP[api.reason] ?? "other";
  const createdAt =
    typeof api.createdAt === "string"
      ? api.createdAt
      : new Date(api.createdAt).toISOString();
  const updatedAt =
    typeof api.updatedAt === "string"
      ? api.updatedAt
      : new Date(api.updatedAt).toISOString();

  const isSeller =
    currentUserId && order?.sellerId
      ? order.sellerId === currentUserId
      : api.openedBy === "SELLER";

  return {
    id: api.id,
    offerId: order?.serviceId ?? order?.service?.id ?? order?.id ?? api.orderId,
    offerTitle: order?.service?.title ?? order?.title ?? "Order dispute",
    reason,
    description: order?.description ?? api.decisionNote ?? "",
    status,
    evidence: mapEvidence(api.evidence, createdAt),
    events: buildEvents(api, status),
    comments: [],
    createdAt,
    updatedAt,
    resolution: api.decisionNote ?? undefined,
    freelancerName: isSeller ? undefined : displayName(order?.seller),
    clientName: isSeller ? displayName(order?.buyer) : undefined,
  };
}

export function mapApiDisputesToDisputes(
  items: ApiDispute[],
  currentUserId?: string
): Dispute[] {
  return items.map((item) => mapApiDisputeToDispute(item, currentUserId));
}
