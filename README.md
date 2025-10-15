# Aubrai Longevity Agent - BioAgent with ChatKit

This is a specialized longevity and health AI assistant built with [OpenAI Agents SDK (AgentKit)](https://github.com/openai/openai-agents-js) and [ChatKit](http://openai.github.io/chatkit-js/). The application focuses on providing evidence-based information about longevity, anti-aging therapies, cellular health, and wellness optimization.

## Architecture Overview

The application combines two powerful frameworks:

- **Frontend**: [ChatKit](http://openai.github.io/chatkit-js/) for a polished chat interface with streaming, theming, and accessibility
- **Backend**: [OpenAI Agents SDK (AgentKit)](https://github.com/openai/openai-agents-js) for building multi-agent workflows with tools, handoffs, and guardrails
- **Focus**: Bioagent specializing in longevity science, anti-aging research, and health optimization

## What You Get

- Next.js app with `<openai-chatkit>` web component and theming controls
- OpenAI Agents SDK integration for building custom agent workflows
- API endpoint for ChatKit session management at [`app/api/create-session/route.ts`](app/api/create-session/route.ts)
- Bioagent-focused starter prompts for longevity and health queries
- Example tools and agent configurations for extending functionality
- Support for multi-agent workflows, tool calling, and agent handoffs

## Key Features

### BioAgent Capabilities
- Evidence-based longevity and anti-aging information
- Cellular health and mitochondrial optimization guidance
- NAD+ boosters and supplement recommendations
- Senescent cell interventions and senolytic therapies
- Personalized health and wellness strategies

### Technical Features
- **Multi-Agent Workflows**: Compose specialized agents for different domains
- **Tool Integration**: Execute functions and API calls from agent responses
- **Agent Handoffs**: Transfer control between agents dynamically
- **Streaming Responses**: Real-time agent output streaming
- **Session Management**: Persistent conversation state with ChatKit
- **Extensible Architecture**: Easy to add new tools and agents

## Getting Started

Follow every step below to run the app locally and configure it for your preferred backend.

### 1. Install dependencies

```bash
npm install
```

This installs:
- `@openai/chatkit-react` - ChatKit React components
- `@openai/agents` - OpenAI Agents SDK for building agent workflows
- `zod` - Schema validation for tool parameters
- Next.js, React, and other dependencies

### 2. Create your environment file

Copy the example file and fill in the required values:

```bash
cp .env.example .env.local
```

### 3. Configure environment variables

Update `.env.local` with the following variables:

#### For ChatKit Integration (Agent Builder)
- `OPENAI_API_KEY` — API key created **within the same org & project as your Agent Builder**
- `NEXT_PUBLIC_CHATKIT_WORKFLOW_ID` — the workflow you created in [Agent Builder](https://platform.openai.com/agent-builder)
- (optional) `CHATKIT_API_BASE` - customizable base URL for the ChatKit API endpoint

#### For Direct Agents SDK Usage (Alternative)
If you want to bypass Agent Builder and use the Agents SDK directly:
- `OPENAI_API_KEY` — Your OpenAI API key for direct agent runs
- Custom agent endpoints can be created in `app/api/` directory

### 4. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000` and start chatting. Use the prompts on the start screen to explore longevity and health topics.

### 5. Build for production (optional)

```bash
npm run build
npm start
```

## Project Structure

```
openai-chatkit-starter-app/
├── app/
│   ├── api/
│   │   ├── create-session/     # ChatKit session endpoint
│   │   └── agents/
│   │       ├── chat/           # Direct agent execution (NEW)
│   │       └── stream/         # Streaming responses (NEW)
│   ├── App.tsx                 # Main app component
│   └── layout.tsx              # Root layout
├── components/
│   └── ChatKitPanel.tsx        # ChatKit integration component
├── lib/
│   ├── config.ts               # App configuration & prompts
│   └── agents.ts               # Agent definitions with tools (NEW)
├── openai-agents-js/           # OpenAI Agents SDK documentation & examples
├── API.md                      # Complete API documentation
└── package.json
```

## Available Agents

The application includes four specialized agents:

| Agent ID | Name | Purpose | Tools |
|----------|------|---------|-------|
| `main` | Aubrai Longevity Assistant | Main coordinator, handles general questions and routes to specialists | None (uses handoffs) |
| `research` | Research Specialist | Searches scientific literature | `search_pubmed` |
| `health-data` | Health Data Analyst | Analyzes biomarkers and calculates dosages | `analyze_biomarkers`, `calculate_dosage` |
| `general` | General Information Agent | Provides general longevity information | `get_weather` (demo) |

### Example Tools

1. **search_pubmed** - Search PubMed for scientific research papers
2. **analyze_biomarkers** - Analyze NAD+, telomere length, inflammation markers
3. **calculate_dosage** - Calculate personalized supplement dosages based on body weight and goals
4. **get_weather** - Demo tool for testing tool calling

## API Endpoints

The application provides three main API endpoints:

### 1. `POST /api/create-session`
Creates a ChatKit session for Agent Builder workflows.

**Use Case:** ChatKit integration with Agent Builder
**Documentation:** [See API.md](API.md#post-apicreate-session)

**Quick Example:**
```bash
curl -X POST http://localhost:3000/api/create-session \
  -H "Content-Type: application/json" \
  -d '{"workflow": {"id": "workflow_abc123"}}'
```

### 2. `POST /api/agents/chat`
Run custom agent workflows directly using the Agents SDK.

**Use Case:** Direct agent execution with conversation history
**Features:** Multi-turn conversations, tool calling, agent handoffs, human-in-the-loop
**Documentation:** [See API.md](API.md#post-apiagentschat)

**Quick Example:**
```bash
curl -X POST http://localhost:3000/api/agents/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What are NAD+ boosters?"}],
    "agentId": "main"
  }'
```

### 3. `POST /api/agents/stream`
Stream agent responses in real-time using Server-Sent Events (SSE).

**Use Case:** Real-time streaming for better UX
**Features:** Live text streaming, tool call events, agent handoff notifications
**Documentation:** [See API.md](API.md#post-apiagentsstream)

**Quick Example:**
```bash
curl -X POST http://localhost:3000/api/agents/stream \
  -H "Content-Type: application/json" \
  -N \
  -d '{
    "messages": [{"role": "user", "content": "Explain cellular senescence"}],
    "agentId": "main"
  }'
```

### API Details

All three endpoints accept JSON payloads and return JSON responses. They support:
- **Error handling** with appropriate HTTP status codes
- **Input validation** for required parameters
- **Type safety** with TypeScript
- **Conversation state** management (chat endpoint)
- **Real-time streaming** (stream endpoint)

## Testing the Endpoints

### Quick Test: Chat Endpoint

```bash
# Start the development server
npm run dev

# In another terminal, test the chat endpoint
curl -X POST http://localhost:3000/api/agents/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What are NAD+ boosters and how do they work?"}],
    "agentId": "main"
  }'
```

### Quick Test: Streaming Endpoint

```bash
curl -X POST http://localhost:3000/api/agents/stream \
  -H "Content-Type: application/json" \
  -N \
  -d '{
    "messages": [{"role": "user", "content": "Explain cellular senescence"}],
    "agentId": "main"
  }'
```

### Test with Agent Handoff

```bash
# Ask a question that triggers research agent handoff
curl -X POST http://localhost:3000/api/agents/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Search for recent research on NMN and longevity"}],
    "agentId": "main"
  }'
```

## Customization Guide

### Updating Starter Prompts

Edit [`lib/config.ts`](lib/config.ts) to customize the bioagent prompts:

```typescript
export const STARTER_PROMPTS: StartScreenPrompt[] = [
  {
    label: "Your custom prompt",
    prompt: "The full prompt text",
    icon: "sparkle", // or "circle-question", "atom", "lightbulb"
  },
];
```

### Creating Custom Agents

The Agents SDK allows you to build sophisticated multi-agent workflows. Example structure:

```typescript
// lib/agents.ts
import { Agent, tool } from '@openai/agents';
import { z } from 'zod';

// Define tools
const researchTool = tool({
  name: 'research_longevity',
  description: 'Research longevity interventions',
  parameters: z.object({
    topic: z.string(),
  }),
  execute: async ({ topic }) => {
    // Your implementation
    return `Research results for ${topic}`;
  },
});

// Create specialized agent
export const longevityAgent = new Agent({
  name: 'Longevity Specialist',
  instructions: 'You are an expert in longevity science...',
  tools: [researchTool],
});
```

### Adding New Tools

Tools extend agent capabilities. Common tool types for bioagents:

1. **Research Tools**: PubMed search, clinical trial lookup
2. **Calculation Tools**: Dosage calculators, biomarker analyzers
3. **Data Tools**: Supplement interactions, drug databases
4. **Integration Tools**: Health tracking APIs, wearable data

Example tool:

```typescript
const pubmedSearchTool = tool({
  name: 'search_pubmed',
  description: 'Search PubMed for scientific research',
  parameters: z.object({
    query: z.string().describe('Search query'),
    maxResults: z.number().optional().default(5),
  }),
  execute: async ({ query, maxResults }) => {
    // Call PubMed API
    const results = await fetch(`https://pubmed.api/search?q=${query}`);
    return results;
  },
});
```

### Customizing the UI

- **Theme**: Edit theme properties in [`components/ChatKitPanel.tsx`](components/ChatKitPanel.tsx)
- **Greeting**: Update `GREETING` in [`lib/config.ts`](lib/config.ts)
- **Placeholder**: Update `PLACEHOLDER_INPUT` in [`lib/config.ts`](lib/config.ts)
- **Styling**: Modify Tailwind classes in component files

## Agent Workflows

The Agents SDK supports various workflow patterns:

### Single Agent (Current)
Simple question-answering with the bioagent.

### Multi-Agent Handoffs
Transfer between specialized agents:
- **Longevity Agent**: General anti-aging queries
- **Supplement Agent**: Dosage and interaction advice
- **Research Agent**: Deep dives into scientific literature

### Tool-Enhanced Agents
Agents that can:
- Search scientific databases (PubMed, ClinicalTrials.gov)
- Calculate personalized recommendations
- Integrate with health tracking services
- Access real-time supplement databases

### Human-in-the-Loop
For sensitive health recommendations, require human approval before executing certain actions.

## Development Tips

### Testing Agents Locally

Use the examples in `openai-agents-js/examples/` for reference:

```bash
# Navigate to the agents SDK
cd openai-agents-js

# Install dependencies
pnpm install

# Run basic example
pnpm examples:basic

# Run other examples
pnpm examples:tools
pnpm examples:handoffs
```

### Debugging

- Check browser console for ChatKit events
- Enable debug logging in environment: `NODE_ENV=development`
- Use the Agents SDK tracing UI (when available)

### Adding Custom Endpoints

Create new API routes in `app/api/`:

```typescript
// app/api/agents/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Runner } from '@openai/agents';
import { longevityAgent } from '@/lib/agents';

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const runner = new Runner();
  const result = await runner.run(longevityAgent, messages);

  return NextResponse.json({
    response: result.finalOutput,
    history: result.history,
  });
}
```

## References & Documentation

### Primary Resources
- [OpenAI Agents SDK Documentation](https://openai.github.io/openai-agents-js/)
- [ChatKit JavaScript Library](http://openai.github.io/chatkit-js/)
- [Agent Builder](https://platform.openai.com/agent-builder)

### Additional Resources
- [OpenAI Agents SDK GitHub](https://github.com/openai/openai-agents-js)
- [Advanced ChatKit Self-Hosting](https://github.com/openai/openai-chatkit-advanced-samples)
- [Next.js Documentation](https://nextjs.org/docs)


## Next Steps

1. **Test Endpoints** - Run the development server and test all three API endpoints
2. **Add Real Integrations** - Connect to actual PubMed API, health databases
3. **Implement Database** - Replace in-memory storage with Redis/PostgreSQL for production
4. **Add Authentication** - Implement API key or JWT authentication
5. **Rate Limiting** - Add rate limiting middleware
6. **Monitoring & Logging** - Add structured logging and tracing
7. **Frontend Integration** - Connect ChatKit UI to the new agent endpoints
8. **Deploy** - Deploy to production (Vercel, Railway, etc.)

## Contributing

Feel free to extend the bioagent with:
- New longevity-focused tools
- Additional health databases (supplements, clinical trials, etc.)
- Research paper integrations (PubMed, bioRxiv, etc.)
- Personalized recommendation engines
- Wearable device integrations (Oura, Whoop, etc.)
- Biometric analysis tools

## Troubleshooting

### Build Errors

If you encounter build errors:
1. Make sure `node_modules` is installed: `npm install`
2. Check that `openai-agents-js` folder is excluded in `tsconfig.json`
3. Ensure optional Zod fields use `.nullable().optional()` for OpenAI API compatibility

### Runtime Errors

- **Missing OPENAI_API_KEY**: Set the environment variable in `.env.local`
- **Agent not found**: Check the `agentId` parameter matches available agents (`main`, `research`, `health-data`, `general`)
- **Tool execution fails**: Verify tool parameter schemas match expected input

## License

See the individual license files for ChatKit and the OpenAI Agents SDK.
