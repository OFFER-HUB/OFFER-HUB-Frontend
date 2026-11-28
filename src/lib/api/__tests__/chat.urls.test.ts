import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/config/api", () => ({ API_URL: "https://api.example.com/api/v1" }));
vi.mock("@/lib/chat-mappers", () => ({
  mapConversationsList: (list: unknown) => list,
  mapMessage: (message: unknown) => message,
  mapMessagesPage: (page: unknown) => page,
}));
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: { getState: () => ({ token: "tok", user: { id: "usr_me" } }) },
}));

import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getChatSSEUrl,
} from "../chat";

const fetchMock = vi.fn();

function lastUrl(): string {
  return String(fetchMock.mock.calls.at(-1)?.[0]);
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers({ "content-type": "application/json" }),
    json: () => Promise.resolve({ data: { id: "conv_1", data: [], hasMore: false } }),
    text: () => Promise.resolve(""),
  });
  vi.stubGlobal("fetch", fetchMock);
});

describe("chat API URLs", () => {
  it("lists conversations under the API base exactly once", async () => {
    await getConversations();
    expect(lastUrl()).toBe("https://api.example.com/api/v1/conversations");
  });

  it("creates a conversation under the API base", async () => {
    await createConversation({ participantId: "usr_other" } as never);
    expect(lastUrl()).toBe("https://api.example.com/api/v1/conversations");
  });

  it("reads and sends messages under the API base", async () => {
    await getMessages("conv_1");
    expect(lastUrl()).toBe("https://api.example.com/api/v1/conversations/conv_1/messages?limit=30");

    await sendMessage("conv_1", "hola");
    expect(lastUrl()).toBe("https://api.example.com/api/v1/conversations/conv_1/messages");

    await markMessagesAsRead("conv_1");
    expect(lastUrl()).toBe("https://api.example.com/api/v1/conversations/conv_1/read");
  });

  it("keeps the absolute SSE URL, which does not go through the http client", () => {
    expect(getChatSSEUrl("conv_1", "a b")).toBe(
      "https://api.example.com/api/v1/conversations/conv_1/stream?token=a%20b"
    );
  });
});
