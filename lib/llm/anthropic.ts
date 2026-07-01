// Anthropic Claude calls. Two entry points: free-form text (chatbot) and
// validated JSON (lesson plan, grading). The JSON path embodies the harness
// idea: parse, validate against a zod schema, and retry once with the error fed
// back if the model returns something malformed.

import Anthropic from "@anthropic-ai/sdk";
import type { ZodType } from "zod";
import { extractJSON } from "./json";
import type { ChatTurn } from "./types";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

function client(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function anthropicText(
  system: string,
  user: string,
  maxTokens = 1024,
): Promise<string> {
  const msg = await client().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  return msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
}

export async function anthropicConversation(
  system: string,
  messages: ChatTurn[],
  maxTokens = 800,
): Promise<string> {
  const msg = await client().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  return msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
}

export async function anthropicJSON<T>(
  system: string,
  user: string,
  schema: ZodType<T>,
): Promise<T> {
  let prompt = user;
  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await anthropicText(system, prompt, 2048);
    try {
      const parsed = schema.safeParse(extractJSON(raw));
      if (parsed.success) return parsed.data;
      lastError = parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
    prompt =
      user +
      `\n\nYour previous response was invalid: ${lastError.slice(0, 300)}.\n` +
      "Return corrected JSON only, matching the required shape exactly.";
  }
  throw new Error(`Claude returned invalid structured output: ${lastError}`);
}
