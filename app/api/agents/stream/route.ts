import { NextRequest } from 'next/server';
import { Runner } from '@openai/agents';
import type { AgentInputItem } from '@openai/agents';
import { getAgentById } from '@/lib/agents';

/**
 * Generate a unique conversation ID
 */
function generateConversationId(): string {
  return `conv_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;
}

/**
 * POST /api/agents/stream
 *
 * Stream agent responses in real-time using Server-Sent Events (SSE).
 * This endpoint provides real-time streaming of agent outputs, tool calls, and events.
 *
 * Request Body:
 * {
 *   messages: Array<{ role: string, content: string }> - Conversation messages
 *   agentId?: string - Which agent to use (default: 'main')
 *   maxTurns?: number - Maximum agent loop iterations (default: 20)
 * }
 *
 * Response: Server-Sent Events (text/event-stream)
 * Events:
 * - start: { conversationId, agent, timestamp }
 * - chunk: { content: string } - Streaming text content
 * - tool_call: { tool: string, parameters: object } - Tool being called
 * - tool_result: { tool: string, result: any } - Tool execution result
 * - agent_handoff: { from: string, to: string } - Agent handoff event
 * - complete: { response: string, history: array } - Final response
 * - error: { error: string } - Error occurred
 */
export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const data = await req.json() as {
          messages?: AgentInputItem[];
          agentId?: string;
          maxTurns?: number;
        };

        const {
          messages = [],
          agentId = 'main',
          maxTurns = 20,
        } = data;

        // Validate required fields
        if (!Array.isArray(messages)) {
          const errorData = JSON.stringify({
            event: 'error',
            data: { error: 'messages must be an array' },
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
          return;
        }

        // Generate conversation ID
        const conversationId = generateConversationId();

        // Send start event
        const startEvent = JSON.stringify({
          event: 'start',
          data: {
            conversationId,
            agent: agentId,
            timestamp: new Date().toISOString(),
          },
        });
        controller.enqueue(encoder.encode(`data: ${startEvent}\n\n`));

        // Get the appropriate agent
        const agent = getAgentById(agentId);

        // Create a runner
        const runner = new Runner({
          groupId: conversationId,
          traceMetadata: {
            agentId,
            timestamp: new Date().toISOString(),
          },
        });

        // Run the agent with streaming enabled
        // Based on official docs: https://openai.github.io/openai-agents-js/guides/streaming
        const streamedResult = await runner.run(agent, messages, {
          stream: true,
          maxTurns,
        });

        // Process the stream - iterate over all events
        for await (const event of streamedResult) {
          // Forward all events to the client
          // The event structure matches the official SDK event types

          // Handle raw model stream events (includes text deltas)
          if (event.type === 'raw_model_stream_event') {
            // Send simplified chunk events for text deltas
            if (event.data.type === 'output_text_delta') {
              const chunkEvent = JSON.stringify({
                event: 'chunk',
                data: { content: event.data.delta },
              });
              controller.enqueue(encoder.encode(`data: ${chunkEvent}\n\n`));
            }

            // Also send the complete raw event
            const rawEvent = JSON.stringify({
              event: 'raw_model_event',
              data: event.data,
            });
            controller.enqueue(encoder.encode(`data: ${rawEvent}\n\n`));
          }

          // Handle run item stream events (tool calls, handoffs, etc.)
          if (event.type === 'run_item_stream_event') {
            // Send the complete event with item details
            const itemEvent = JSON.stringify({
              event: 'run_item',
              data: {
                eventName: event.name,
                itemType: event.item.type,
                item: event.item,
              },
            });
            controller.enqueue(encoder.encode(`data: ${itemEvent}\n\n`));

            // Send simplified events based on item type
            if (event.item.type === 'tool_call_item') {
              const toolEvent = JSON.stringify({
                event: 'tool_call',
                data: {
                  itemType: event.item.type,
                  eventName: event.name,
                },
              });
              controller.enqueue(encoder.encode(`data: ${toolEvent}\n\n`));
            }

            if (event.item.type === 'tool_call_output_item') {
              const resultEvent = JSON.stringify({
                event: 'tool_result',
                data: {
                  output: event.item.output,
                },
              });
              controller.enqueue(encoder.encode(`data: ${resultEvent}\n\n`));
            }

            if (event.item.type === 'handoff_call_item') {
              const handoffEvent = JSON.stringify({
                event: 'agent_handoff',
                data: {
                  itemType: event.item.type,
                },
              });
              controller.enqueue(encoder.encode(`data: ${handoffEvent}\n\n`));
            }
          }

          // Handle agent updated events
          if (event.type === 'agent_updated_stream_event') {
            const agentEvent = JSON.stringify({
              event: 'agent_updated',
              data: {
                agentName: event.agent.name,
              },
            });
            controller.enqueue(encoder.encode(`data: ${agentEvent}\n\n`));
          }
        }

        // Wait for the stream to complete
        await streamedResult.completed;

        // Send completion event
        const completeEvent = JSON.stringify({
          event: 'complete',
          data: {
            conversationId,
            timestamp: new Date().toISOString(),
          },
        });
        controller.enqueue(encoder.encode(`data: ${completeEvent}\n\n`));
      } catch (error) {
        console.error('[/api/agents/stream] Error:', error);

        // Send error event
        const errorEvent = JSON.stringify({
          event: 'error',
          data: {
            error: error instanceof Error ? error.message : 'Internal server error',
          },
        });
        controller.enqueue(encoder.encode(`data: ${errorEvent}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * GET /api/agents/stream
 *
 * Get information about the streaming endpoint
 */
export async function GET() {
  return Response.json({
    endpoint: '/api/agents/stream',
    description: 'Stream agent responses in real-time using Server-Sent Events',
    eventTypes: [
      {
        event: 'start',
        description: 'Stream started',
        data: { conversationId: 'string', agent: 'string', timestamp: 'string' },
      },
      {
        event: 'chunk',
        description: 'Text content chunk',
        data: { content: 'string' },
      },
      {
        event: 'tool_call',
        description: 'Tool being called',
        data: { tool: 'string', parameters: 'object', callId: 'string' },
      },
      {
        event: 'tool_result',
        description: 'Tool execution result',
        data: { tool: 'string', result: 'any', callId: 'string' },
      },
      {
        event: 'agent_handoff',
        description: 'Agent handoff occurred',
        data: { from: 'string', to: 'string', reason: 'string' },
      },
      {
        event: 'complete',
        description: 'Stream completed',
        data: { response: 'string', history: 'array', conversationId: 'string' },
      },
      {
        event: 'error',
        description: 'Error occurred',
        data: { error: 'string' },
      },
    ],
    exampleRequest: {
      messages: [
        { role: 'user', content: 'What are NAD+ boosters?' },
      ],
      agentId: 'main',
      maxTurns: 20,
    },
    usage: {
      javascript: `
const response = await fetch('/api/agents/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello' }],
    agentId: 'main'
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      console.log(data.event, data.data);
    }
  }
}
      `,
      curl: `
curl -X POST http://localhost:3000/api/agents/stream \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [{"role": "user", "content": "What are NAD+ boosters?"}],
    "agentId": "main"
  }'
      `,
    },
  });
}
