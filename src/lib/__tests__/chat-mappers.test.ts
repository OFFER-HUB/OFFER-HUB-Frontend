import { describe, expect, it } from "vitest";
import {
  chatDisplayName,
  mapConversation,
  mapConversationsList,
  mapMessage,
  mapMessagesPage,
  unescapeMessageText,
} from "../chat-mappers";
import type { ApiConversation, ApiMessage } from "@/types/chat.types";

const ME = { id: "usr_me", username: "me" };
const OTHER = { id: "usr_other", firstName: "Karen", lastName: "G", professionalTitle: "Designer" };

const message = (over: Partial<ApiMessage> = {}): ApiMessage => ({
  id: "msg_1",
  content: "hello",
  createdAt: "2026-11-21T14:05:00.000Z",
  readAt: null,
  sender: OTHER,
  ...over,
});

describe("chat mappers", () => {
  it("decodes the HTML-escaped text the server stores", () => {
    expect(unescapeMessageText("it&#x27;s &lt;ok&gt; &amp; &quot;fine&quot;")).toBe(`it's <ok> & "fine"`);
  });

  it("names a person by full name, then username, then a fallback", () => {
    expect(chatDisplayName({ id: "1", firstName: "Karen", lastName: "G" })).toBe("Karen G");
    expect(chatDisplayName({ id: "1", username: "karen99" })).toBe("karen99");
    expect(chatDisplayName({ id: "1" })).toBe("User");
  });

  it("maps a message and marks it read when it has a read time", () => {
    expect(mapMessage(message()).isRead).toBe(false);
    const read = mapMessage(message({ readAt: "2026-11-21T14:06:00.000Z" }));
    expect(read).toMatchObject({ isRead: true, status: "read", senderId: "usr_other" });
  });

  it("turns a newest-first page into oldest-first messages", () => {
    const page = mapMessagesPage({
      items: [message({ id: "new", content: "second" }), message({ id: "old", content: "first" })],
      nextCursor: "old",
      hasMore: true,
    });
    expect(page.messages.map((m) => m.id)).toEqual(["old", "new"]);
    expect(page).toMatchObject({ hasMore: true, nextCursor: "old" });
  });

  it("shows the other person in a conversation, never yourself", () => {
    const conversation: ApiConversation = {
      id: "conv_1",
      lastMessageAt: "2026-11-21T14:05:00.000Z",
      lastMessagePreview: "it&#x27;s done",
      createdAt: "2026-11-20T10:00:00.000Z",
      unreadCount: 2,
      participants: [
        { userId: "usr_me", user: ME },
        { userId: "usr_other", user: OTHER },
      ],
    };
    const mapped = mapConversation(conversation, "usr_me");
    expect(mapped.participant).toMatchObject({ id: "usr_other", name: "Karen G", title: "Designer" });
    expect(mapped).toMatchObject({ lastMessage: "it's done", unreadCount: 2 });
    expect(mapConversationsList([conversation], "usr_me")).toMatchObject({ hasMore: false });
  });

  it("survives a conversation with no messages yet", () => {
    const mapped = mapConversation(
      { id: "c", lastMessageAt: null, lastMessagePreview: null, createdAt: "2026-11-20T10:00:00.000Z", unreadCount: 0, participants: [] },
      "usr_me",
    );
    expect(mapped.lastMessage).toBe("");
    expect(mapped.participant.name).toBe("User");
  });
});
