// A light curriculum reference for grounding (no vector DB needed).
//
// These are short, MEB-flavored topic outlines for a handful of common K-12
// subjects. When a request's topic matches one of them, the matching outline is
// injected into the prompt so the lesson plan / chatbot answer stays anchored to
// real curricular framing instead of free-floating. This is the lightweight,
// deployable alternative to RAG for a focused task like this.

export type CurriculumEntry = {
  keywords: string[]; // matched against the user's topic (TR + EN cues)
  subject: string;
  gradeBand: string;
  outline: string; // a couple of sentences of grounding context
};

export const CURRICULUM: CurriculumEntry[] = [
  {
    keywords: ["fotosentez", "photosynthesis", "bitki", "plant", "kloroplast"],
    subject: "Fen Bilimleri / Science",
    gradeBand: "6-9",
    outline:
      "Photosynthesis: plants convert light energy, water, and carbon dioxide into glucose and oxygen, mainly in the chloroplasts of leaves. Core ideas: reactants vs. products, the role of chlorophyll/sunlight, and why the process matters for the food chain and oxygen supply.",
  },
  {
    keywords: ["kesir", "fraction", "fractions", "payda", "pay"],
    subject: "Matematik / Mathematics",
    gradeBand: "3-6",
    outline:
      "Fractions: a fraction represents part of a whole; numerator over denominator. Core ideas: equivalent fractions, comparing fractions, and adding/subtracting with like and unlike denominators using a common denominator.",
  },
  {
    keywords: ["newton", "kuvvet", "force", "hareket", "motion", "yasa", "law"],
    subject: "Fen Bilimleri / Physics",
    gradeBand: "8-11",
    outline:
      "Newton's laws of motion: (1) inertia, an object keeps its state unless acted on by a net force; (2) F = m·a; (3) every action has an equal and opposite reaction. Core ideas: distinguishing the three laws and applying them to everyday examples.",
  },
  {
    keywords: ["cumhuriyet", "atatürk", "ataturk", "republic", "ottoman", "osmanlı", "tarih", "history"],
    subject: "Sosyal Bilgiler / Social Studies",
    gradeBand: "7-11",
    outline:
      "Founding of the Turkish Republic (1923): transition from the Ottoman Empire, the War of Independence, and Atatürk's reforms. Core ideas: causes and consequences, key reforms (alphabet, secularism, education), and their lasting effects.",
  },
  {
    keywords: ["paragraf", "paragraph", "essay", "kompozisyon", "writing", "yazma", "anlatım"],
    subject: "Türkçe / Language Arts",
    gradeBand: "5-10",
    outline:
      "Paragraph and essay writing: a clear thesis/topic sentence, supporting ideas with evidence or examples, logical transitions, and a conclusion. Core ideas: unity, coherence, and adapting tone to audience and purpose.",
  },
];

export function findCurriculum(topic: string): CurriculumEntry | null {
  const t = topic.toLowerCase();
  for (const entry of CURRICULUM) {
    if (entry.keywords.some((k) => t.includes(k))) return entry;
  }
  return null;
}

export function groundingFor(topic: string): string {
  const entry = findCurriculum(topic);
  if (!entry) return "";
  return `Curriculum context (${entry.subject}, grades ${entry.gradeBand}):\n${entry.outline}`;
}
