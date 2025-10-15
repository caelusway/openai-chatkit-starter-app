import { NextRequest, NextResponse } from 'next/server';
import { Runner, RunState, Agent } from '@openai/agents';
import type { AgentInputItem, RunToolApprovalItem } from '@openai/agents';
import { getAgentById } from '@/lib/agents';

/**
 * In-memory storage for conversation states
 * In production, use a proper database (Redis, PostgreSQL, etc.)
 */
const conversationStore = new Map<string, string>();

/**
 * Generate a unique conversation ID
 */
function generateConversationId(): string {
  return `conv_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;
}

/**
 * POST /api/agents/chat
 *
 * Run agent workflows directly using the OpenAI Agents SDK.
 * Supports multi-turn conversations, tool calling, and agent handoffs.
 *
 * Request Body:
 * {
 *   messages: Array<{ role: string, content: string }> - Conversation messages
 *   conversationId?: string - Optional conversation ID for continuity
 *   agentId?: string - Which agent to use (default: 'main')
 *   maxTurns?: number - Maximum agent loop iterations (default: 20)
 *   decisions?: Record<string, 'approved' | 'rejected'> - Tool approval decisions
 * }
 *
 * Response:
 * {
 *   response: string - The agent's final output
 *   history: Array - Full conversation history
 *   conversationId: string - Conversation ID for follow-ups
 *   agent: string - Which agent responded
 *   approvals?: Array - Pending tool approvals (if any)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json() as {
      messages?: AgentInputItem[];
      conversationId?: string;
      agentId?: string;
      maxTurns?: number;
      decisions?: Record<string, 'approved' | 'rejected'>;
    };

    const {
      messages = [],
      conversationId: providedConversationId,
      agentId = 'main',
      maxTurns = 20,
      decisions = {},
    } = data;

    // Validate required fields
    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'messages must be an array' },
        { status: 400 }
      );
    }

    // Generate or use existing conversation ID
    const conversationId = providedConversationId || generateConversationId();

    // Get the appropriate agent
    const agent = getAgentById(agentId);

    // Create a runner for this conversation
    const runner = new Runner({
      groupId: conversationId,
      traceMetadata: {
        agentId,
        timestamp: new Date().toISOString(),
      },
    });

    // Prepare input for the agent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let input: AgentInputItem[] | RunState<unknown, Agent<any, any>>;

    // Check if we're continuing a conversation with pending approvals
    if (Object.keys(decisions).length > 0 && providedConversationId) {
      const stateString = conversationStore.get(providedConversationId);

      if (!stateString) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      // Deserialize the state to continue the run
      const state = await RunState.fromString(agent, stateString);
      const interruptions = state.getInterruptions();

      // Process approval decisions
      interruptions.forEach((item: RunToolApprovalItem) => {
        if (item.type === 'tool_approval_item' && 'callId' in item.rawItem) {
          const callId = item.rawItem.callId as string;

          if (decisions[callId] === 'approved') {
            state.approve(item);
          } else if (decisions[callId] === 'rejected') {
            state.reject(item);
          }
        }
      });

      input = state;
    } else {
      // New conversation or continuation without approvals
      input = messages;
    }

    // Run the agent
    const result = await runner.run(agent, input, {
      maxTurns,
    });

    // Check if there are interruptions (e.g., tool approvals needed)
    if (result.interruptions && result.interruptions.length > 0) {
      // Store the state for later continuation
      conversationStore.set(conversationId, JSON.stringify(result.state));

      return NextResponse.json({
        conversationId,
        approvals: result.interruptions
          .filter((item): item is RunToolApprovalItem => item.type === 'tool_approval_item')
          .map((item) => item.toJSON()),
        history: result.history,
        agent: agentId,
        message: 'Tool approvals required',
      });
    }

    // Clean up stored state if conversation is complete
    if (providedConversationId) {
      conversationStore.delete(providedConversationId);
    }

    // Return successful response
    return NextResponse.json({
      response: result.finalOutput,
      history: result.history,
      conversationId,
      agent: agentId,
      metadata: {
        turns: result.history?.length || 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[/api/agents/chat] Error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('OPENAI_API_KEY')) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 500 }
        );
      }

      if (error.message.includes('MaxTurnsExceededError')) {
        return NextResponse.json(
          {
            error: 'Agent exceeded maximum turns',
            message: 'The agent loop ran too many iterations. Try simplifying your request.',
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agents/chat
 *
 * Get information about available agents
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/agents/chat',
    description: 'Run agent workflows using the OpenAI Agents SDK',
    availableAgents: [
      {
        id: 'main',
        name: 'Aubrai Longevity Assistant',
        description: 'Main coordinator agent for longevity and health questions',
      },
      {
        id: 'research',
        name: 'Research Specialist',
        description: 'Searches scientific literature and provides evidence-based information',
      },
      {
        id: 'health-data',
        name: 'Health Data Analyst',
        description: 'Analyzes biomarkers and calculates personalized recommendations',
      },
      {
        id: 'general',
        name: 'General Information Agent',
        description: 'Provides general longevity and health information',
      },
    ],
    exampleRequest: {
      messages: [
        { role: 'user', content: 'What are NAD+ boosters?' },
      ],
      agentId: 'main',
      maxTurns: 20,
    },
  });
}
