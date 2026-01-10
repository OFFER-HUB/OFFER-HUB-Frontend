export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  title?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participant: ChatUser;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isTyping?: boolean;
}

export interface ChatThread {
  id: string;
  participant: ChatUser;
  messages: ChatMessage[];
}

export interface SharedFile {
  id: string;
  name: string;
  type: "document" | "image" | "video" | "other";
  size: string;
  count?: number;
}
