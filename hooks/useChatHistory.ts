"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types/session";

export function useChatHistory(
  onMessageUpdate: (threadId: string, messages: ChatMessage[]) => void
) {
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const processMessages = () => {
      const chatKit = document.querySelector("openai-chatkit");
      if (!chatKit) return;

      // Use MutationObserver to watch for DOM changes in the chat
      if (!observerRef.current) {
        observerRef.current = new MutationObserver(() => {
          // Extract messages from the ChatKit shadow DOM
          const shadowRoot = chatKit.shadowRoot;
          if (!shadowRoot) return;

          const messageElements = shadowRoot.querySelectorAll(
            '[data-role="user"], [data-role="assistant"]'
          );

          const messages: ChatMessage[] = [];
          messageElements.forEach((el, index) => {
            const role = el.getAttribute("data-role") as "user" | "assistant";
            const content = el.textContent?.trim() || "";

            if (content) {
              messages.push({
                id: `msg-${Date.now()}-${index}`,
                role,
                content,
                timestamp: new Date(),
              });
            }
          });

          if (messages.length > 0) {
            onMessageUpdate("current", messages);
          }
        });

        observerRef.current.observe(chatKit, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }
    };

    // Initial process
    processMessages();

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [onMessageUpdate]);
}
