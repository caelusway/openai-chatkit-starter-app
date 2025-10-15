import { Agent, tool } from '@openai/agents';
import { z } from 'zod';

/**
 * Example tool: Get weather information
 * This demonstrates a simple tool with external API integration
 */
const getWeatherTool = tool({
  name: 'get_weather',
  description: 'Get the weather for a given city',
  parameters: z.object({
    city: z.string().describe('The city to get weather for'),
  }),
  execute: async ({ city }) => {
    // In production, integrate with a real weather API
    return `The weather in ${city} is sunny with a temperature of 72°F.`;
  },
});

/**
 * Example tool: Search PubMed for longevity research
 * This demonstrates a bioagent-specific research tool
 */
const searchPubMedTool = tool({
  name: 'search_pubmed',
  description: 'Search PubMed database for scientific research papers on longevity and health',
  parameters: z.object({
    query: z.string().describe('The search query for PubMed'),
    maxResults: z.number().default(5).describe('Maximum number of results to return'),
  }),
  execute: async ({ query, maxResults }) => {
    // In production, integrate with PubMed E-utilities API
    // https://www.ncbi.nlm.nih.gov/home/develop/api/
    return `Found ${maxResults} research papers on "${query}". In production, this would return actual PubMed results with titles, abstracts, and DOIs.`;
  },
});

/**
 * Example tool: Calculate supplement dosage
 * This demonstrates a calculation tool for health recommendations
 */
const calculateDosageTool = tool({
  name: 'calculate_dosage',
  description: 'Calculate personalized supplement dosage based on body weight and health goals',
  parameters: z.object({
    supplement: z.string().describe('Name of the supplement'),
    bodyWeight: z.number().describe('Body weight in kg'),
    goal: z.enum(['maintenance', 'therapeutic', 'performance']).describe('Health goal'),
  }),
  execute: async ({ supplement, bodyWeight, goal }) => {
    // In production, use evidence-based dosage calculation algorithms
    const baseMultiplier = goal === 'maintenance' ? 1 : goal === 'therapeutic' ? 1.5 : 2;
    const dosage = Math.round(bodyWeight * 10 * baseMultiplier);
    return `Recommended ${supplement} dosage: ${dosage}mg per day for ${goal} goals. Always consult with a healthcare provider before starting any supplement regimen.`;
  },
});

/**
 * Example tool: Analyze biomarkers
 * This demonstrates a health data analysis tool
 */
const analyzeBiomarkersTool = tool({
  name: 'analyze_biomarkers',
  description: 'Analyze health biomarkers and provide insights for longevity optimization',
  parameters: z.object({
    biomarkers: z.object({
      nad: z.number().nullable().optional().describe('NAD+ levels (μM)'),
      telomereLength: z.number().nullable().optional().describe('Telomere length (kb)'),
      inflammationMarkers: z.number().nullable().optional().describe('CRP levels (mg/L)'),
    }),
  }),
  execute: async ({ biomarkers }) => {
    // In production, use clinical reference ranges and AI analysis
    const insights: string[] = [];

    if (biomarkers.nad && biomarkers.nad < 50) {
      insights.push('NAD+ levels are below optimal range. Consider NAD+ precursors like NMN or NR.');
    }

    if (biomarkers.telomereLength && biomarkers.telomereLength < 7) {
      insights.push('Telomere length indicates accelerated aging. Focus on stress reduction and antioxidants.');
    }

    if (biomarkers.inflammationMarkers && biomarkers.inflammationMarkers > 3) {
      insights.push('Elevated inflammation detected. Consider anti-inflammatory interventions.');
    }

    return insights.length > 0
      ? `Biomarker Analysis:\n${insights.join('\n')}`
      : 'All biomarkers are within optimal ranges for longevity.';
  },
});

/**
 * Research Agent
 * Specializes in searching scientific literature and providing evidence-based information
 */
export const researchAgent = new Agent({
  name: 'Research Specialist',
  instructions: `You are a research specialist focused on longevity science and anti-aging research.
You can search scientific databases like PubMed to find the latest research.
Always cite your sources and provide evidence-based information.
When discussing interventions, mention both benefits and potential risks.`,
  handoffDescription: 'Use this agent when you need to search scientific literature or find research papers',
  tools: [searchPubMedTool],
});

/**
 * Health Data Agent
 * Specializes in analyzing biomarkers and providing personalized recommendations
 */
export const healthDataAgent = new Agent({
  name: 'Health Data Analyst',
  instructions: `You are a health data analyst specializing in longevity biomarkers.
You can analyze biomarkers, calculate supplement dosages, and provide personalized insights.
Always emphasize the importance of consulting healthcare providers.
Base recommendations on evidence and individual health data.`,
  handoffDescription: 'Use this agent when you need to analyze biomarkers or calculate dosages',
  tools: [analyzeBiomarkersTool, calculateDosageTool],
});

/**
 * General Information Agent
 * Provides general information about longevity and health
 */
export const generalInfoAgent = new Agent({
  name: 'General Information Agent',
  instructions: `You are a general information agent for longevity and health topics.
Provide clear, evidence-based information about anti-aging therapies, cellular health, and wellness.
When questions require deeper research or data analysis, hand off to the appropriate specialist.`,
  handoffDescription: 'Use this agent for general longevity and health questions',
  tools: [getWeatherTool], // Example tool for demonstration
});

/**
 * Main Longevity Agent (Coordinator)
 * This is the main entry point that can hand off to specialized agents
 */
export const mainLongevityAgent = new Agent({
  name: 'Aubrai Longevity Assistant',
  instructions: `You are Aubrai, an AI assistant specializing in longevity, anti-aging science, and health optimization.

Your core expertise includes:
- Anti-aging therapies and interventions
- Cellular senescence and senolytics
- NAD+ boosters and mitochondrial health
- Telomere biology and epigenetic aging
- Supplement recommendations and health optimization
- Evidence-based longevity research

When users ask questions:
1. For general information about longevity topics, answer directly with evidence-based information
2. For research questions requiring scientific literature, hand off to the Research Specialist
3. For biomarker analysis or dosage calculations, hand off to the Health Data Analyst

Always:
- Provide evidence-based information
- Mention both benefits and risks
- Emphasize consulting healthcare providers for medical decisions
- Be clear about what is proven vs. experimental
- Stay current with the latest longevity research`,
  handoffs: [researchAgent, healthDataAgent],
});

/**
 * Export all agents for use in API endpoints
 */
export const agents = {
  main: mainLongevityAgent,
  research: researchAgent,
  healthData: healthDataAgent,
  general: generalInfoAgent,
};

/**
 * Helper to get agent by ID
 */
export function getAgentById(agentId: string): Agent {
  switch (agentId) {
    case 'main':
    case 'longevity':
      return mainLongevityAgent;
    case 'research':
      return researchAgent;
    case 'health-data':
      return healthDataAgent;
    case 'general':
      return generalInfoAgent;
    default:
      return mainLongevityAgent;
  }
}
