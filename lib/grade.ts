// Grade-level calibration, grounded in established educational-science frameworks
// rather than ad-hoc guesses. Each band translates three literatures into
// concrete instructions the model can act on:
//
//  1. Reading level  - CCSS recalibrated "stretch" Lexile text-complexity bands.
//       Lexile/CCSS: https://lexile.com/using-lexile/lexile-measures-and-the-ccssi/
//                    text-complexity-grade-bands-and-lexile-ranges/
//       achievethecore.org CCSS grade bands (2015 update).
//  2. Cognitive stage - Piaget: concrete operational (~7-11) vs. formal
//       operational (~11+). simplypsychology.org/piaget.html
//  3. Cognitive demand - Bloom's revised taxonomy (Anderson & Krathwohl, 2001):
//       remember/understand/apply -> analyze/evaluate/create across grades.
//  Vocabulary tiers reference Beck, McKeown & Kucan (Tier 1 everyday, Tier 2
//  cross-domain academic, Tier 3 domain-specific).
//
// Used by the Lesson Prep and Student Chatbot prompts only.

type Band = {
  grades: string;
  lexile: string;
  guidance: string[];
};

const BANDS: { max: number; band: Band }[] = [
  {
    max: 1,
    band: {
      grades: "1 (early reader)",
      lexile: "Beginning Reader, roughly BR-300L",
      guidance: [
        "Very short sentences (about 5-8 words). Use only the most common everyday (Tier 1) words; if a new word is unavoidable, explain it with a simple, picturable example.",
        "Piaget preoperational/early-concrete: keep everything concrete and visible, one idea at a time; avoid abstract or hypothetical framing.",
        "Bloom emphasis: remember and understand (name, point to, describe, match).",
      ],
    },
  },
  {
    max: 3,
    band: {
      grades: "2-3",
      lexile: "420-820L",
      guidance: [
        "Short sentences (about 8-12 words), mostly everyday words. Introduce a few key terms and define each in plain language.",
        "Piaget concrete operational: reason with concrete, hands-on examples the student can picture; avoid abstract generalization and hypotheticals.",
        "Bloom emphasis: understand and apply (explain in own words, give an example, sort, solve a simple problem).",
      ],
    },
  },
  {
    max: 5,
    band: {
      grades: "4-5",
      lexile: "740-1010L",
      guidance: [
        "Medium-length sentences. Introduce academic (Tier 2) vocabulary with brief definitions.",
        "Piaget concrete operational (later): concrete examples, but simple multi-step reasoning and cause-and-effect are appropriate.",
        "Bloom emphasis: apply and begin to analyze (compare, categorize, explain why).",
      ],
    },
  },
  {
    max: 8,
    band: {
      grades: "6-8",
      lexile: "925-1185L",
      guidance: [
        "Fuller sentences. Use subject-specific (Tier 3) vocabulary, still defining genuinely new terms.",
        "Piaget transition to formal operational: begin abstract and hypothetical reasoning; introduce 'what if' and generalizations gradually.",
        "Bloom emphasis: analyze and start to evaluate (compare and contrast, justify with evidence).",
      ],
    },
  },
  {
    max: 10,
    band: {
      grades: "9-10",
      lexile: "1050-1335L",
      guidance: [
        "Complex sentences. Discipline vocabulary is expected; define only specialized terms.",
        "Piaget formal operational: abstract, hypothetical, and deductive reasoning are appropriate.",
        "Bloom emphasis: analyze, evaluate, and create (argue, critique, synthesize).",
      ],
    },
  },
  {
    max: 12,
    band: {
      grades: "11-12",
      lexile: "1185-1385L (approaching college/career readiness)",
      guidance: [
        "Sophisticated sentences and abstraction; expect nuance and multiple perspectives.",
        "Piaget formal operational (advanced): full abstract and hypothetical reasoning.",
        "Bloom emphasis: evaluate and create (construct and defend arguments, weigh evidence, design or synthesize).",
      ],
    },
  },
];

export function gradeProfile(gradeRaw: string): string {
  const n = Math.min(12, Math.max(1, parseInt(gradeRaw, 10) || 6));
  const entry = BANDS.find((b) => n <= b.max) ?? BANDS[BANDS.length - 1];
  const b = entry.band;
  return [
    `Grade-level calibration for grade ${n} (band ${b.grades}).`,
    `Target reading level: CCSS/Lexile ${b.lexile}.`,
    ...b.guidance.map((g) => `- ${g}`),
  ].join("\n");
}
