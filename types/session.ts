export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastMessage?: string;
  timestamp: Date;
};

export type SessionState = {
  sessions: ChatSession[];
  currentSessionId: string | null;
};
