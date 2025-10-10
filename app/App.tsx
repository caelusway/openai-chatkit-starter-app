"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { ChatKitPanel, type FactAction, type ThreadChangeEvent } from "@/components/ChatKitPanel";
import { Sidebar } from "@/components/Sidebar";
import { DiagnosticInfo } from "@/components/DiagnosticInfo";
import { useColorScheme } from "@/hooks/useColorScheme";
import type { ChatSession, ChatMessage } from "@/types/session";

export default function App() {
  const { setScheme } = useColorScheme();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const currentThreadIdRef = useRef<string | null>(null);

  const handleWidgetAction = useCallback(async (action: FactAction) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[ChatKitPanel] widget action", action);
    }
  }, []);

  const handleResponseEnd = useCallback(() => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[ChatKitPanel] response end");
    }
  }, []);

  // Listen to ChatKit events for real-time message updates
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleChatKitEvent = (event: Event) => {
      const chatKit = document.querySelector("openai-chatkit");
      if (!chatKit || !currentThreadIdRef.current) return;

      // Extract messages from ChatKit
      setTimeout(() => {
        extractMessagesFromChatKit(currentThreadIdRef.current);
      }, 500);
    };

    window.addEventListener("chatkit.response.end", handleChatKitEvent);

    return () => {
      window.removeEventListener("chatkit.response.end", handleChatKitEvent);
    };
  }, []);

  const extractMessagesFromChatKit = useCallback((threadId: string | null) => {
    if (!threadId) return;

    const chatKit = document.querySelector("openai-chatkit");
    if (!chatKit) return;

    try {
      // Try to extract from shadow DOM or use a simpler approach
      const shadowRoot = chatKit.shadowRoot;
      if (shadowRoot) {
        const messages: ChatMessage[] = [];

        // Look for message elements in the shadow DOM
        const messageContainers = shadowRoot.querySelectorAll('[role="article"], [data-message]');

        messageContainers.forEach((el, index) => {
          const textContent = el.textContent?.trim();
          if (textContent && textContent.length > 0) {
            // Heuristic: alternate between user and assistant
            const role = index % 2 === 0 ? "user" : "assistant";
            messages.push({
              id: `msg-${threadId}-${index}`,
              role: role as "user" | "assistant",
              content: textContent.substring(0, 500), // Limit length
              timestamp: new Date(),
            });
          }
        });

        if (messages.length > 0) {
          setSessions((prev) => {
            const existingSession = prev.find((s) => s.id === threadId);
            if (existingSession) {
              return prev.map((s) =>
                s.id === threadId
                  ? {
                      ...s,
                      messages,
                      lastMessage: messages[messages.length - 1]?.content,
                      timestamp: new Date(),
                    }
                  : s
              );
            } else {
              const newSession: ChatSession = {
                id: threadId,
                title: messages[0]?.content.substring(0, 50) || "New Chat",
                messages,
                lastMessage: messages[messages.length - 1]?.content,
                timestamp: new Date(),
              };
              return [newSession, ...prev];
            }
          });
        }
      }
    } catch (error) {
      console.error("Error extracting messages:", error);
    }
  }, []);

  const handleThreadChange = useCallback((event: ThreadChangeEvent) => {
    const threadId = event.threadId;
    currentThreadIdRef.current = threadId;

    if (threadId) {
      setCurrentSessionId(threadId);

      // Check if this thread already exists in sessions
      setSessions((prev) => {
        const exists = prev.find((s) => s.id === threadId);
        if (!exists) {
          const newSession: ChatSession = {
            id: threadId,
            title: "New Chat",
            timestamp: new Date(),
            messages: [],
          };
          return [newSession, ...prev];
        }
        return prev;
      });

      // Extract initial messages
      extractMessagesFromChatKit(threadId);
    }
  }, [extractMessagesFromChatKit]);

  const handleNewChat = useCallback(() => {
    // Reset current thread - ChatKit will create a new one
    currentThreadIdRef.current = null;
    setCurrentSessionId(null);
  }, []);

  const handleSessionSelect = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    currentThreadIdRef.current = sessionId;
  }, []);

  return (
    <div className="flex h-screen bg-black">
      <main className="flex flex-1 flex-col bg-zinc-950">
        <ChatKitPanel
          key={currentSessionId}
          onWidgetAction={handleWidgetAction}
          onResponseEnd={handleResponseEnd}
          onThemeRequest={setScheme}
          onThreadChange={handleThreadChange}
        />
      </main>
      <DiagnosticInfo />
    </div>
  );
}
