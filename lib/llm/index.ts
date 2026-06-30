// Provider dispatcher with graceful fallback.
//
// If ANTHROPIC_API_KEY is set we use Claude; otherwise (or if a live call
// fails) we fall back to the deterministic demo provider so the app never hard-
// crashes for a user. Every result carries which provider produced it, so the
// UI can show an honest badge.

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
import {
  anthropicConversation,
  anthropicJSON,
  type ChatTurn,
} from "./anthropic";
import { demoNote, mockChat, mockGrade, mockLessonPlan } from "./mock";

export type Provider = "anthropic" | "demo";

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function providerName(): Provider {
  return hasApiKey() ? "anthropic" : "demo";
}

export type Result<T> = { data: T; provider: Provider; note?: string };

export async function getLessonPlan(
  topic: string,
  grade: string,
  lang: Lang,
): Promise<Result<LessonPlan>> {
  if (!hasApiKey()) {
    return { data: mockLessonPlan(topic, grade, lang), provider: "demo", note: demoNote(lang) };
  }
  try {
    const { system, user } = lessonPrepPrompt(topic, grade, lang);
    const data = await anthropicJSON(system, user, LessonPlanSchema);
    return { data, provider: "anthropic" };
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
): Promise<Result<GradeResult>> {
  if (!hasApiKey()) {
    return { data: mockGrade(essay, lang), provider: "demo", note: demoNote(lang) };
  }
  try {
    const { system, user } = essayGraderPrompt(essay, lang);
    const data = await anthropicJSON(system, user, GradeResultSchema);
    return { data, provider: "anthropic" };
  } catch (e) {
    return {
      data: mockGrade(essay, lang),
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
  const latest = [...history].reverse().find((m) => m.role === "user")?.content || "";
  if (!hasApiKey()) {
    return { data: mockChat(latest, lang, practiceMode), provider: "demo", note: demoNote(lang) };
  }
  try {
    const grounding = studentChatGrounding(latest);
    const system =
      studentChatSystem(grade, lang, practiceMode) +
      (grounding ? `\n\n${grounding}` : "");
    const data = await anthropicConversation(system, history);
    return { data, provider: "anthropic" };
  } catch (e) {
    return {
      data: mockChat(latest, lang, practiceMode),
      provider: "demo",
      note: `${demoNote(lang)} (${e instanceof Error ? e.message : "error"})`,
    };
  }
}
