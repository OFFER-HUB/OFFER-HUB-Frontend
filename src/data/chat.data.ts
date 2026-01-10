import type { Conversation, ChatThread, ChatUser, SharedFile } from "@/types/chat.types";

export const MOCK_USERS: Record<string, ChatUser> = {
  "1": {
    id: "1",
    name: "Sarah Chen",
    avatar: "SC",
    isOnline: true,
    title: "UI/UX Designer",
  },
  "2": {
    id: "2",
    name: "Marcus Johnson",
    avatar: "MJ",
    isOnline: false,
    title: "Full Stack Developer",
  },
  "3": {
    id: "3",
    name: "Elena Rodriguez",
    avatar: "ER",
    isOnline: true,
    title: "Content Writer",
  },
  "4": {
    id: "4",
    name: "David Kim",
    avatar: "DK",
    isOnline: false,
    title: "Mobile Developer",
  },
  "5": {
    id: "5",
    name: "Anna Williams",
    avatar: "AW",
    isOnline: true,
    title: "Project Manager",
  },
};

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    participant: MOCK_USERS["1"],
    lastMessage: "Thanks for reaching out! I'd love to discuss your project in more detail.",
    lastMessageTime: "2m ago",
    unreadCount: 2,
    isTyping: true,
  },
  {
    id: "2",
    participant: MOCK_USERS["2"],
    lastMessage: "The designs are ready for review. Let me know what you think!",
    lastMessageTime: "1h ago",
    unreadCount: 0,
  },
  {
    id: "3",
    participant: MOCK_USERS["3"],
    lastMessage: "I'll send the document soon. Just finishing up the final edits.",
    lastMessageTime: "3h ago",
    unreadCount: 1,
  },
  {
    id: "4",
    participant: MOCK_USERS["4"],
    lastMessage: "Are you going to the business meetup next week?",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
  },
  {
    id: "5",
    participant: MOCK_USERS["5"],
    lastMessage: "We need to start a new project planning session.",
    lastMessageTime: "2 days ago",
    unreadCount: 0,
  },
];

export const MOCK_CHAT_THREADS: Record<string, ChatThread> = {
  "1": {
    id: "1",
    participant: MOCK_USERS["1"],
    messages: [
      {
        id: "m1",
        senderId: "1",
        content: "Hi! I saw your project posting and I'm very interested.",
        timestamp: "10:15 AM",
        isRead: true,
      },
      {
        id: "m2",
        senderId: "current",
        content: "Great to hear! Can you tell me more about your experience with similar projects?",
        timestamp: "10:18 AM",
        isRead: true,
      },
      {
        id: "m3",
        senderId: "1",
        content: "Of course! I've worked on several e-commerce redesigns. I recently completed a project for a fashion brand that increased their conversion rate by 40%.",
        timestamp: "10:22 AM",
        isRead: true,
      },
      {
        id: "m4",
        senderId: "1",
        content: "I can share my portfolio if you'd like to see some examples.",
        timestamp: "10:23 AM",
        isRead: true,
      },
      {
        id: "m5",
        senderId: "current",
        content: "That sounds impressive! Yes, I'd love to see your portfolio.",
        timestamp: "10:30 AM",
        isRead: true,
      },
      {
        id: "m6",
        senderId: "1",
        content: "Thanks for reaching out! I'd love to discuss your project in more detail.",
        timestamp: "10:45 AM",
        isRead: false,
      },
    ],
  },
  "2": {
    id: "2",
    participant: MOCK_USERS["2"],
    messages: [
      {
        id: "m1",
        senderId: "2",
        content: "I've finished the backend API for the user authentication system.",
        timestamp: "Yesterday, 2:30 PM",
        isRead: true,
      },
      {
        id: "m2",
        senderId: "current",
        content: "Awesome! Did you include the password reset functionality?",
        timestamp: "Yesterday, 2:45 PM",
        isRead: true,
      },
      {
        id: "m3",
        senderId: "2",
        content: "Yes, everything is implemented. I also added email verification.",
        timestamp: "Yesterday, 3:00 PM",
        isRead: true,
      },
      {
        id: "m4",
        senderId: "2",
        content: "The designs are ready for review. Let me know what you think!",
        timestamp: "Today, 9:15 AM",
        isRead: true,
      },
    ],
  },
  "3": {
    id: "3",
    participant: MOCK_USERS["3"],
    messages: [
      {
        id: "m1",
        senderId: "current",
        content: "Hi Elena! How's the blog content coming along?",
        timestamp: "Yesterday, 11:00 AM",
        isRead: true,
      },
      {
        id: "m2",
        senderId: "3",
        content: "It's going well! I've completed 3 out of 5 articles.",
        timestamp: "Yesterday, 11:30 AM",
        isRead: true,
      },
      {
        id: "m3",
        senderId: "3",
        content: "I'll send the document soon. Just finishing up the final edits.",
        timestamp: "Today, 8:00 AM",
        isRead: false,
      },
    ],
  },
};

export const MOCK_SHARED_FILES: SharedFile[] = [
  { id: "f1", name: "Documents", type: "document", size: "193MB", count: 126 },
  { id: "f2", name: "Photos", type: "image", size: "321MB", count: 53 },
  { id: "f3", name: "Videos", type: "video", size: "210MB", count: 3 },
  { id: "f4", name: "Other", type: "other", size: "194MB", count: 49 },
];

export function getConversationById(id: string): Conversation | undefined {
  return MOCK_CONVERSATIONS.find((c) => c.id === id);
}

export function getChatThreadById(id: string): ChatThread | undefined {
  return MOCK_CHAT_THREADS[id];
}
