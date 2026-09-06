import "server-only";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface AssistantTurnResult {
  reply: string;
}

const OPENAI_KEY = process.env.OPENAI_API_KEY;

export const aiConfigured = Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY);

/**
 * Runs one assistant turn with OpenAI-style function-calling, looping until
 * the model stops requesting tools. `executeTool` is the ONLY bridge between
 * the model and the database — see lib/whatsapp/tools for what it's allowed
 * to call.
 *
 * Only OpenAI is wired up as a concrete example (raw fetch, no SDK
 * dependency needed); ANTHROPIC_API_KEY / GEMINI_API_KEY are recognized by
 * `aiConfigured` for the integrations dashboard, but plugging in Claude or
 * Gemini here means adding an equivalent branch that maps their tool-call
 * format to the same `executeTool` bridge — the surrounding architecture
 * (tools, system prompt, conversation storage) doesn't change.
 *
 * Returns null when no AI provider is configured, so the caller (see
 * lib/whatsapp/agent.ts) can fall back to the rule-based responder.
 */
export async function runAssistantTurn(
  systemPrompt: string,
  history: ChatMessage[],
  tools: ToolDefinition[],
  executeTool: (call: ToolCall) => Promise<unknown>,
): Promise<AssistantTurnResult | null> {
  if (!OPENAI_KEY) return null;

  const messages: Array<Record<string, unknown>> = [
    { role: "system", content: systemPrompt },
    ...history,
  ];

  const openaiTools = tools.map((t) => ({
    type: "function",
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));

  for (let round = 0; round < 4; round++) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        tools: openaiTools,
        tool_choice: "auto",
      }),
    });

    if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    const choice = data.choices[0];
    const message = choice.message;

    if (!message.tool_calls?.length) {
      return { reply: message.content ?? "" };
    }

    messages.push({ role: "assistant", content: message.content, tool_calls: message.tool_calls });

    for (const call of message.tool_calls) {
      const args = JSON.parse(call.function.arguments || "{}");
      const result = await executeTool({ id: call.id, name: call.function.name, arguments: args });
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
    }
  }

  return { reply: "Dame un momento, permíteme consultarlo con un asesor." };
}
