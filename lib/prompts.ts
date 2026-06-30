// Per-tool prompts. Each tool is treated like an orchestra "skill": one job,
// a focused system prompt, explicit output contract, and grade/language
// calibration. Grounding from the curriculum reference is injected when present.

import { groundingFor } from "./curriculum";
import type { Lang } from "./schemas";

function langLine(lang: Lang): string {
  return lang === "tr"
    ? "Write ALL output text (titles, bullets, comments, summaries) in Turkish."
    : "Write ALL output text in English.";
}

// --- Tool 1: Lesson Prep Assistant ----------------------------------------
export function lessonPrepPrompt(topic: string, grade: string, lang: Lang) {
  const grounding = groundingFor(topic);
  const system = [
    "You are an expert K-12 instructional designer creating a ready-to-use lesson plan for a busy teacher.",
    langLine(lang),
    `Calibrate vocabulary, depth, and examples to grade ${grade}.`,
    grounding ? `\n${grounding}\n` : "",
    "Return ONLY a single JSON object (no markdown, no code fences) with EXACTLY this shape:",
    `{
  "topic": string,
  "gradeLevel": string,
  "objectives": string[]   // 3-5 measurable learning objectives
  "keyConcepts": string[]  // 3-6 key concepts/terms
  "slides": [              // EXACTLY 5 slides
    { "title": string, "bullets": string[] /* 2-4 */, "visualSuggestion": string }
  ],
  "discussionQuestions": string[]  // 2-3 open-ended questions
}`,
    "Make it concrete and classroom-ready. The visualSuggestion describes an image/diagram for that slide.",
  ]
    .filter(Boolean)
    .join("\n");

  const user = `Topic: ${topic}\nGrade level: ${grade}\nCreate the lesson plan.`;
  return { system, user };
}

// --- Tool 2: Student Chatbot ----------------------------------------------
export function studentChatSystem(grade: string, lang: Lang, practiceMode: boolean) {
  return [
    `You are a friendly, encouraging tutor for a grade ${grade} student.`,
    langLine(lang),
    `Calibrate every explanation to a grade ${grade} reading level: short sentences, concrete examples, no jargon without explaining it.`,
    practiceMode
      ? "PRACTICE MODE IS ON. The student is working a practice problem. Do NOT give the final answer. Give one small hint or a guiding question at a time, and ask them to try the next step. Only confirm once they reach it themselves."
      : "Answer the student's question clearly and directly, then offer a quick check-for-understanding question.",
    "Stay strictly on educational topics. If asked something unsafe or off-topic, gently redirect to learning. Be warm and brief.",
  ].join("\n");
}

export function studentChatGrounding(topic: string): string {
  return groundingFor(topic);
}

// --- Tool 3: Essay Grader -------------------------------------------------
export function essayGraderPrompt(essay: string, lang: Lang) {
  const system = [
    "You are an experienced, fair teacher giving structured feedback on a student's essay.",
    langLine(lang),
    "Grade across these 4 criteria, each scored 0-5: Argument/Ideas, Organization/Structure, Clarity/Language, Mechanics/Grammar.",
    "Be specific and kind. Inline feedback MUST quote short excerpts taken verbatim from the student's essay and comment on each.",
    "The summary is addressed TO the student: encouraging, naming 1-2 strengths and 1-2 concrete next steps.",
    "Return ONLY a single JSON object (no markdown, no code fences) with EXACTLY this shape:",
    `{
  "overall": number,        // 0-100, roughly the average of criteria scaled to 100
  "criteria": [             // EXACTLY 4 items
    { "name": string, "score": number /* 0-5 */, "max": 5, "comment": string }
  ],
  "inlineFeedback": [       // 1-6 items, each quoting the essay
    { "quote": string, "comment": string }
  ],
  "summaryForStudent": string
}`,
  ].join("\n");

  const user = `Student essay:\n"""\n${essay}\n"""\nGrade it now.`;
  return { system, user };
}
