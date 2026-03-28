import { API_URL } from "@/config/api";
import {
  MOCK_ADMIN_DISPUTES,
  getAdminDisputeById as getMockById,
} from "@/data/admin-disputes.data";
import type {
  AdminDispute,
  ResolveDisputePayload,
  AddDisputeNotePayload,
  UpdateDisputeStatusPayload,
  AdminDisputeNote,
} from "@/types/admin.types";
import type { DisputeStatus } from "@/types/dispute.types";

const API_BASE_URL = API_URL;

/**
 * Set to false when real admin dispute API endpoints are available on the backend.
 * When true, all functions resolve against the local mock dataset.
 */
const USE_MOCK = true;

// ─── In-memory mock store ─────────────────────────────────────────────────────
const mockStore: AdminDispute[] = structuredClone(MOCK_ADMIN_DISPUTES);

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getAdminDisputes(_token: string): Promise<AdminDispute[]> {
  if (USE_MOCK) {
    await simulateDelay(600);
    return structuredClone(mockStore);
  }

  const response = await fetch(`${API_BASE_URL}/admin/disputes`, {
    headers: { Authorization: `Bearer ${_token}`, "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to fetch disputes");
  }

  const data = await response.json();
  return data.data as AdminDispute[];
}

export async function getAdminDisputeById(
  _token: string,
  disputeId: string
): Promise<AdminDispute> {
  if (USE_MOCK) {
    await simulateDelay(400);
    const found = getMockById(disputeId) ?? mockStore.find((d) => d.id === disputeId);
    if (!found) throw new Error("Dispute not found");
    return structuredClone(found);
  }

  const response = await fetch(`${API_BASE_URL}/admin/disputes/${disputeId}`, {
    headers: { Authorization: `Bearer ${_token}`, "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to fetch dispute");
  }

  const data = await response.json();
  return data.data as AdminDispute;
}

export async function updateDisputeStatus(
  _token: string,
  disputeId: string,
  payload: UpdateDisputeStatusPayload
): Promise<AdminDispute> {
  if (USE_MOCK) {
    await simulateDelay(400);
    const idx = mockStore.findIndex((d) => d.id === disputeId);
    if (idx === -1) throw new Error("Dispute not found");

    mockStore[idx] = {
      ...mockStore[idx],
      status: payload.status,
      updatedAt: new Date().toISOString(),
      events: [
        ...mockStore[idx].events,
        {
          id: `ev-${Date.now()}`,
          type: "status_changed",
          description: `Status changed to ${payload.status.replace("_", " ")}`,
          timestamp: new Date().toISOString(),
          actor: "admin_root",
          actorRole: "admin",
        },
      ],
    };

    return structuredClone(mockStore[idx]);
  }

  const response = await fetch(`${API_BASE_URL}/admin/disputes/${disputeId}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${_token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to update dispute status");
  }

  const data = await response.json();
  return data.data as AdminDispute;
}

export async function resolveDispute(
  _token: string,
  disputeId: string,
  payload: ResolveDisputePayload
): Promise<AdminDispute> {
  if (USE_MOCK) {
    await simulateDelay(500);
    const idx = mockStore.findIndex((d) => d.id === disputeId);
    if (idx === -1) throw new Error("Dispute not found");

    mockStore[idx] = {
      ...mockStore[idx],
      status: "resolved" as DisputeStatus,
      resolution: payload.resolution,
      resolutionOutcome: payload.outcome,
      resolvedAt: new Date().toISOString(),
      resolvedBy: "admin_root",
      updatedAt: new Date().toISOString(),
      events: [
        ...mockStore[idx].events,
        {
          id: `ev-${Date.now()}`,
          type: "resolved",
          description: `Dispute resolved: ${payload.outcome.replace("_", " ")}`,
          timestamp: new Date().toISOString(),
          actor: "admin_root",
          actorRole: "admin",
        },
      ],
    };

    return structuredClone(mockStore[idx]);
  }

  const response = await fetch(`${API_BASE_URL}/admin/disputes/${disputeId}/resolve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${_token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to resolve dispute");
  }

  const data = await response.json();
  return data.data as AdminDispute;
}

export async function addInternalNote(
  _token: string,
  disputeId: string,
  payload: AddDisputeNotePayload
): Promise<AdminDispute> {
  if (USE_MOCK) {
    await simulateDelay(300);
    const idx = mockStore.findIndex((d) => d.id === disputeId);
    if (idx === -1) throw new Error("Dispute not found");

    const newNote: AdminDisputeNote = {
      id: `note-${Date.now()}`,
      content: payload.content,
      adminUsername: "admin_root",
      createdAt: new Date().toISOString(),
    };

    mockStore[idx] = {
      ...mockStore[idx],
      internalNotes: [...mockStore[idx].internalNotes, newNote],
      updatedAt: new Date().toISOString(),
    };

    return structuredClone(mockStore[idx]);
  }

  const response = await fetch(`${API_BASE_URL}/admin/disputes/${disputeId}/notes`, {
    method: "POST",
    headers: { Authorization: `Bearer ${_token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to add note");
  }

  const data = await response.json();
  return data.data as AdminDispute;
}

export async function addAdminComment(
  _token: string,
  disputeId: string,
  content: string
): Promise<AdminDispute> {
  if (USE_MOCK) {
    await simulateDelay(300);
    const idx = mockStore.findIndex((d) => d.id === disputeId);
    if (idx === -1) throw new Error("Dispute not found");

    mockStore[idx] = {
      ...mockStore[idx],
      comments: [
        ...mockStore[idx].comments,
        {
          id: `comment-${Date.now()}`,
          content,
          author: "Support Team",
          authorRole: "admin",
          timestamp: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    return structuredClone(mockStore[idx]);
  }

  const response = await fetch(`${API_BASE_URL}/admin/disputes/${disputeId}/comments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to add comment");
  }

  const data = await response.json();
  return data.data as AdminDispute;
}
