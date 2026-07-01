// Per-tool prompts. Each tool is treated like an orchestra "skill": one job,
// a focused system prompt, explicit output contract, and grade/language
// calibration. Grounding from the curriculum reference is injected when present.

import { criterionLabel, type CriterionId } from "./criteria";
import { groundingFor } from "./curriculum";
import { gradeProfile } from "./grade";
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
    gradeProfile(grade),
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
    gradeProfile(grade),
    practiceMode
      ? [
          "PRACTICE MODE IS ON. Your goal is to guide the student to discover the answer themselves. You NEVER state the answer.",
          "Before replying, silently classify the student's LAST message as one of: (a) an ATTEMPT at the answer, (b) a QUESTION or request for help, (c) 'I don't know' / confusion.",
          "Hard rules:",
          "- Treat something as the student's answer ONLY if their own words explicitly contain it. Asking a question is NOT an answer. Never assume, complete, rephrase, or invent the student's answer, and never say they are correct unless their message truly stated the correct answer.",
          "- If (b) or (c): give exactly ONE small hint or guiding sub-question that points toward the idea WITHOUT naming the answer or any part of it.",
          "- If (a) and correct: briefly confirm what THEY said, then take one step further.",
          "- If (a) and partly right or wrong: acknowledge the correct part, gently flag what to reconsider, and invite another try, still without giving the answer.",
          "- Ask exactly ONE question, then stop and wait for their reply. Keep it short and warm. Do not stack multiple questions.",
        ].join("\n")
      : "Answer the student's question clearly and directly, then offer a quick check-for-understanding question.",
    "Stay strictly on educational topics. If asked something unsafe or off-topic, gently redirect to learning. Be warm and brief.",
  ].join("\n");
}

export function studentChatGrounding(topic: string): string {
  return groundingFor(topic);
}

// --- Tool 3: Essay Grader -------------------------------------------------
export function essayGraderPrompt(essay: string, lang: Lang, criteriaIds: CriterionId[]) {
  const labels = criteriaIds.map((id) => criterionLabel(id, lang));
  const n = labels.length;
  const system = [
    "You are an experienced, fair teacher giving structured feedback on a student's essay.",
    langLine(lang),
    `Grade across EXACTLY these ${n} criteria, each scored 0-5, using these exact names in order: ${labels
      .map((l) => `"${l}"`)
      .join(", ")}.`,
    "Be specific and kind. Inline feedback MUST quote short excerpts taken verbatim from the student's essay and comment on each.",
    "The summary is addressed TO the student: encouraging, naming 1-2 strengths and 1-2 concrete next steps.",
    "Return ONLY a single JSON object (no markdown, no code fences) with EXACTLY this shape:",
    `{
  "overall": number,        // 0-100, roughly the average of the criteria scores scaled to 100
  "criteria": [             // EXACTLY ${n} items, one per criterion named above
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
