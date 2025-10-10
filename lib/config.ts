import { StartScreenPrompt } from "@openai/chatkit";

export const WORKFLOW_ID = process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID?.trim() ?? "";

// Log for debugging
if (typeof window !== "undefined") {
  console.log("🔍 WORKFLOW_ID loaded:", WORKFLOW_ID ? "✓ SET" : "✗ NOT SET");
  console.log("🔍 Full WORKFLOW_ID:", WORKFLOW_ID);
}

export const CREATE_SESSION_ENDPOINT = "/api/create-session";

export const STARTER_PROMPTS: StartScreenPrompt[] = [
  {
    label: "What can you do?",
    prompt: "What can you do?",
    icon: "circle-question",
  },
];

export const PLACEHOLDER_INPUT = "Ask anything...";

export const GREETING = "How can I help you today?";
