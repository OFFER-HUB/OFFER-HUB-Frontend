import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useStartConversation } from "../use-start-conversation";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const createConversation = vi.fn();
vi.mock("@/lib/api/chat", () => ({ createConversation: (...a: unknown[]) => createConversation(...a) }));

function visit(search: string): void {
  window.history.pushState({}, "", `/app/chat${search}`);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useStartConversation", () => {
  it("opens the conversation with the person in the link and moves to it", async () => {
    visit("?userId=usr_freelancer");
    createConversation.mockResolvedValue({ ok: true, data: { id: "conv_7" } });

    renderHook(() => useStartConversation());

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/app/chat/conv_7"));
    expect(createConversation).toHaveBeenCalledWith({ participantId: "usr_freelancer" });
  });

  it("does nothing when the link has no person", () => {
    visit("");
    renderHook(() => useStartConversation());
    expect(createConversation).not.toHaveBeenCalled();
  });

  it("reports why it could not open the conversation", async () => {
    visit("?userId=usr_me");
    createConversation.mockResolvedValue({ ok: false, data: null, message: "Cannot create a conversation with yourself" });

    const { result } = renderHook(() => useStartConversation());

    await waitFor(() => expect(result.current.error).toBe("Cannot create a conversation with yourself"));
    expect(replace).not.toHaveBeenCalled();
  });
});
