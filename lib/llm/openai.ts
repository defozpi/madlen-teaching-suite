// OpenAI-compatible provider.
//
// DeepSeek, Qwen (DashScope), Kimi/Moonshot, OpenRouter, Together, Groq, and
// many others all speak the OpenAI Chat Completions API. So a single client,
// pointed at a configurable base URL, unlocks all of them, which is how we keep
// the bill tiny. Choose the backend with three env vars:
//   OPENAI_API_KEY   - the provider's key
//   OPENAI_BASE_URL  - e.g. https://api.deepseek.com  (default)
//   OPENAI_MODEL     - e.g. deepseek-chat             (default)

import OpenAI from "openai";
import type { ZodType } from "zod";
import { extractJSON } from "./json";
import type { ChatTurn } from "./types";

function config() {
  return {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.deepseek.com",
    model: process.env.OPENAI_MODEL || "deepseek-chat",
  };
}

function client(): OpenAI {
  const { apiKey, baseURL } = config();
  return new OpenAI({ apiKey, baseURL });
}

export async function openaiConversation(
  system: string,
  messages: ChatTurn[],
  maxTokens = 800,
): Promise<string> {
  const { model } = config();
  const res = await client().chat.completions.create({
    model,
    max_tokens: maxTokens,
    temperature: 0.5,
    messages: [{ role: "system", content: system }, ...messages],
  });
  return (res.choices[0]?.message?.content ?? "").trim();
}

export async function openaiText(
  system: string,
  user: string,
  maxTokens = 2048,
): Promise<string> {
  return openaiConversation(system, [{ role: "user", content: user }], maxTokens);
}

export async function openaiJSON<T>(
  system: string,
  user: string,
  schema: ZodType<T>,
): Promise<T> {
  const jsonSystem =
    system + "\n\nReturn ONLY a single valid JSON object. No markdown, no code fences.";
  let prompt = user;
  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await openaiText(jsonSystem, prompt, 2048);
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
  throw new Error(`Model returned invalid structured output: ${lastError}`);
}
