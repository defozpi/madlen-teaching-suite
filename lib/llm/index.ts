// Provider dispatcher with graceful fallback.
//
// Backend selection (cheapest-to-configure wins for a demo):
//   - LLM_PROVIDER env forces a choice ("openai" | "anthropic" | "demo").
//   - else if OPENAI_API_KEY is set -> OpenAI-compatible (DeepSeek/Qwen/Kimi/...).
//   - else if ANTHROPIC_API_KEY is set -> Claude.
//   - else -> deterministic demo (no key, no cost, still works end to end).
// If a live call fails, we fall back to the demo output so the UI never crashes.

import {
  essayGraderPrompt,
  lessonPrepPrompt,
  studentChatGrounding,
  studentChatSystem,
} from "../prompts";
import {
  GradeResultSchema,
  LessonPlanSchema,
  type GradeResult,
  type Lang,
  type LessonPlan,
} from "../schemas";
import type { CriterionId } from "../criteria";
import { anthropicConversation, anthropicJSON } from "./anthropic";
import { demoNote, mockChat, mockGrade, mockLessonPlan } from "./mock";
import { openaiConversation, openaiJSON } from "./openai";
import type { ChatTurn } from "./types";

export type Provider = "anthropic" | "openai" | "demo";

export function providerName(): Provider {
  const forced = process.env.LLM_PROVIDER?.toLowerCase();
  if (forced === "demo") return "demo";
  if (forced === "openai") return "openai";
  if (forced === "anthropic") return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "demo";
}

export function isLive(): boolean {
  return providerName() !== "demo";
}

export type Result<T> = { data: T; provider: Provider; note?: string };

// -- structured helpers route to the active backend ------------------------
function jsonFor(provider: Provider) {
  return provider === "openai" ? openaiJSON : anthropicJSON;
}
function conversationFor(provider: Provider) {
  return provider === "openai" ? openaiConversation : anthropicConversation;
}

export async function getLessonPlan(
  topic: string,
  grade: string,
  lang: Lang,
): Promise<Result<LessonPlan>> {
  const provider = providerName();
  if (provider === "demo") {
    return { data: mockLessonPlan(topic, grade, lang), provider, note: demoNote(lang) };
  }
  try {
    const { system, user } = lessonPrepPrompt(topic, grade, lang);
    const data = await jsonFor(provider)(system, user, LessonPlanSchema);
    return { data, provider };
  } catch (e) {
    return {
      data: mockLessonPlan(topic, grade, lang),
      provider: "demo",
      note: `${demoNote(lang)} (${e instanceof Error ? e.message : "error"})`,
    };
  }
}

export async function gradeEssay(
  essay: string,
  lang: Lang,
  criteria: CriterionId[],
): Promise<Result<GradeResult>> {
  const provider = providerName();
  if (provider === "demo") {
    return { data: mockGrade(essay, lang, criteria), provider, note: demoNote(lang) };
  }
  try {
    const { system, user } = essayGraderPrompt(essay, lang, criteria);
    const data = await jsonFor(provider)(system, user, GradeResultSchema);
    return { data, provider };
  } catch (e) {
    return {
      data: mockGrade(essay, lang, criteria),
      provider: "demo",
      note: `${demoNote(lang)} (${e instanceof Error ? e.message : "error"})`,
    };
  }
}

export async function getChatReply(
  history: ChatTurn[],
  grade: string,
  lang: Lang,
  practiceMode: boolean,
): Promise<Result<string>> {
  const provider = providerName();
  const latest = [...history].reverse().find((m) => m.role === "user")?.content || "";
  if (provider === "demo") {
    return { data: mockChat(latest, lang, practiceMode), provider, note: demoNote(lang) };
  }
  try {
    const grounding = studentChatGrounding(latest);
    const system =
      studentChatSystem(grade, lang, practiceMode) + (grounding ? `\n\n${grounding}` : "");
    const data = await conversationFor(provider)(system, history);
    return { data, provider };
  } catch (e) {
    return {
      data: mockChat(latest, lang, practiceMode),
      provider: "demo",
      note: `${demoNote(lang)} (${e instanceof Error ? e.message : "error"})`,
    };
  }
}
