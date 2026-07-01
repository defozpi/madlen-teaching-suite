// The essay-grader rubric. Defined once here so the teacher sees exactly the
// same criteria they can toggle, and the model is told to use these exact names.

import type { Lang } from "./schemas";

export type CriterionId = "argument" | "organization" | "clarity" | "mechanics";

export type CriterionDef = { id: CriterionId; tr: string; en: string };

export const CRITERIA: CriterionDef[] = [
  { id: "argument", tr: "Düşünce / Sav", en: "Argument / Ideas" },
  { id: "organization", tr: "Düzen / Yapı", en: "Organization / Structure" },
  { id: "clarity", tr: "Anlatım / Dil", en: "Clarity / Language" },
  { id: "mechanics", tr: "Yazım / Dil bilgisi", en: "Mechanics / Grammar" },
];

export const CRITERION_IDS: CriterionId[] = CRITERIA.map((c) => c.id);

export function criterionLabel(id: CriterionId, lang: Lang): string {
  const c = CRITERIA.find((x) => x.id === id);
  return c ? c[lang] : id;
}
