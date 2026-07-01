import type { Lang } from "./schemas";

// A human-readable band for the 0-100 overall score, so teachers and students
// see meaning, not just a number.
export function scoreLabel(overall: number, lang: Lang): string {
  const tr = lang === "tr";
  if (overall >= 85) return tr ? "Çok güçlü" : "Excellent";
  if (overall >= 70) return tr ? "Güçlü" : "Strong";
  if (overall >= 55) return tr ? "Gelişmekte" : "Developing";
  return tr ? "Geliştirilmeli" : "Needs work";
}
