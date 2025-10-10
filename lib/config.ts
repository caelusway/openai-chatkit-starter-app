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
    label: "What are the most promising anti-aging therapies currently being explored, and how do they work at a cellular level?",
    prompt: "What are the most promising anti-aging therapies currently being explored, and how do they work at a cellular level?",
    icon: "sparkle",
  },
  {
    label: "How does cellular senescence contribute to aging, and what interventions can target senescent cells?",
    prompt: "How does cellular senescence contribute to aging, and what interventions can target senescent cells?",
    icon: "circle-question",
  },
  {
    label: "What is the role of NAD+ in aging, and how can NAD+ boosters potentially extend healthspan?",
    prompt: "What is the role of NAD+ in aging, and how can NAD+ boosters potentially extend healthspan?",
    icon: "atom",
  },
  {
    label: "How does mitochondrial dysfunction impact aging, and what strategies can optimize mitochondrial health?",
    prompt: "How does mitochondrial dysfunction impact aging, and what strategies can optimize mitochondrial health?",
    icon: "lightbulb",
  },
];

export const PLACEHOLDER_INPUT = "Ask about longevity, health, and wellness...";

export const GREETING = "Welcome to Aubrai Longevity Agent!";
