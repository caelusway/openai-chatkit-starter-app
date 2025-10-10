"use client";

import { useState } from "react";
import { ChatSession } from "@/types/session";

type SidebarProps = {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
};

export function Sidebar({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewChat,
}: SidebarProps) {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const toggleExpand = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
  };

  return (
    <div className="flex h-screen w-80 flex-col border-r border-gray-800 bg-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 p-4">
        <h1 className="text-lg font-semibold text-gray-100">Aubrai Longevity</h1>
        <button
          onClick={onNewChat}
          className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
          aria-label="New chat"
        >
          + New
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No chat sessions yet
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {sessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              const isCurrent = currentSessionId === session.id;

              return (
                <div key={session.id} className="rounded-lg overflow-hidden">
                  <div
                    className={`group w-full rounded-lg p-3 transition-all ${
                      isCurrent
                        ? "bg-gray-900 text-white"
                        : "text-gray-400 hover:bg-gray-900/50 hover:text-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <button
                        onClick={() => onSessionSelect(session.id)}
                        className="flex-1 min-w-0 text-left"
                      >
                        <div className="mb-1 truncate text-sm font-medium">
                          {session.title}
                        </div>
                        {session.lastMessage && (
                          <div className="truncate text-xs opacity-60">
                            {session.lastMessage}
                          </div>
                        )}
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs opacity-40">
                            {formatTimestamp(session.timestamp)}
                          </span>
                          {session.messages.length > 0 && (
                            <span className="text-xs opacity-40">
                              {session.messages.length} messages
                            </span>
                          )}
                        </div>
                      </button>
                      {session.messages.length > 0 && (
                        <button
                          onClick={(e) => toggleExpand(session.id, e)}
                          className="ml-2 text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
                        >
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chat History */}
                  {isExpanded && session.messages.length > 0 && (
                    <div className="bg-gray-950 border-t border-gray-800 px-3 py-2 space-y-2">
                      {session.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`text-xs p-2 rounded ${
                            message.role === "user"
                              ? "bg-gray-900 text-gray-300"
                              : "bg-gray-800 text-gray-400"
                          }`}
                        >
                          <div className="font-medium mb-1 text-gray-500">
                            {message.role === "user" ? "You" : "Assistant"}
                          </div>
                          <div className="line-clamp-3">{message.content}</div>
                          <div className="mt-1 text-[10px] opacity-50">
                            {formatTimestamp(message.timestamp)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 p-4">
        <div className="text-xs text-gray-600">
          Aubrai Longevity Agent
        </div>
        <div className="text-xs text-gray-700 mt-1">
          Powered by OpenAI
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
