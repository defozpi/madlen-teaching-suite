// Structured-output contracts. The "harness" idea carried over from orchestra:
// we never trust raw model text. Every tool must return data that validates
// against one of these zod schemas, or the call is retried / rejected.

import { z } from "zod";

export const LangSchema = z.enum(["tr", "en"]);
export type Lang = z.infer<typeof LangSchema>;

// --- Tool 1: Lesson Prep Assistant ----------------------------------------
export const SlideSchema = z.object({
  title: z.string().min(1),
  bullets: z.array(z.string().min(1)).min(2).max(6),
  visualSuggestion: z.string().min(1),
});

export const LessonPlanSchema = z.object({
  topic: z.string().min(1),
  gradeLevel: z.string().min(1),
  objectives: z.array(z.string().min(1)).min(2).max(6),
  keyConcepts: z.array(z.string().min(1)).min(2).max(8),
  slides: z.array(SlideSchema).min(4).max(6),
  discussionQuestions: z.array(z.string().min(1)).min(2).max(4),
});
export type LessonPlan = z.infer<typeof LessonPlanSchema>;

// --- Tool 3: Essay Grader -------------------------------------------------
export const CriterionScoreSchema = z.object({
  name: z.string().min(1),
  score: z.number().min(0).max(5),
  max: z.literal(5),
  comment: z.string().min(1),
});

export const InlineNoteSchema = z.object({
  quote: z.string().min(1), // an excerpt from the student's essay
  comment: z.string().min(1), // specific feedback about that excerpt
});

export const GradeResultSchema = z.object({
  overall: z.number().min(0).max(100),
  criteria: z.array(CriterionScoreSchema).min(3).max(4),
  inlineFeedback: z.array(InlineNoteSchema).min(1).max(6),
  summaryForStudent: z.string().min(1),
});
export type GradeResult = z.infer<typeof GradeResultSchema>;
