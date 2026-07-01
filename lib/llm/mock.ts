// Deterministic demo provider (no API key, no network).
//
// Same role as orchestra's mock LLM: it is NOT intelligent, it just returns
// well-formed, plausible output so the deployed public URL works end-to-end and
// can be graded without anyone spending on the API. Real quality comes from
// Claude when ANTHROPIC_API_KEY is set.

import { criterionLabel, type CriterionId } from "../criteria";
import type { GradeResult, Lang, LessonPlan } from "../schemas";

const DEMO_NOTE = {
  tr: "Demo modu: örnek çıktı. Gerçek yanıtlar için ANTHROPIC_API_KEY ekleyin.",
  en: "Demo mode: sample output. Add ANTHROPIC_API_KEY for real answers.",
};

export function demoNote(lang: Lang): string {
  return DEMO_NOTE[lang];
}

export function mockLessonPlan(topic: string, grade: string, lang: Lang): LessonPlan {
  const tr = lang === "tr";
  const slide = (n: number, title: string, b: string[], v: string) => ({
    title: `${n}. ${title}`,
    bullets: b,
    visualSuggestion: v,
  });
  return {
    topic,
    gradeLevel: grade,
    objectives: tr
      ? [
          `Öğrenci "${topic}" konusunu kendi cümleleriyle açıklar.`,
          `${topic} ile ilgili temel kavramları örneklerle ilişkilendirir.`,
          `Konuyu günlük hayattan bir durumla bağdaştırır.`,
        ]
      : [
          `Students can explain "${topic}" in their own words.`,
          `Students connect key concepts of ${topic} to examples.`,
          `Students relate the topic to a real-life situation.`,
        ],
    keyConcepts: tr
      ? [`${topic} tanımı`, "temel kavramlar", "örnekler", "günlük hayatla ilişki"]
      : [`definition of ${topic}`, "core concepts", "examples", "real-life links"],
    slides: [
      slide(1, tr ? "Giriş" : "Introduction", tr ? [`${topic} nedir?`, "Neden önemli?"] : [`What is ${topic}?`, "Why it matters"], tr ? "Konuyu çağrıştıran bir kapak görseli" : "A cover image evoking the topic"),
      slide(2, tr ? "Temel Kavramlar" : "Core Concepts", tr ? ["Anahtar terimler", "Basit tanımlar"] : ["Key terms", "Simple definitions"], tr ? "Etiketli bir kavram şeması" : "A labelled concept diagram"),
      slide(3, tr ? "Nasıl Çalışır" : "How It Works", tr ? ["Adım adım süreç", "Örnek üzerinde gösterim"] : ["Step-by-step process", "Worked example"], tr ? "Akış şeması veya adım görseli" : "A flowchart or step illustration"),
      slide(4, tr ? "Günlük Hayat" : "Real Life", tr ? ["Gerçek dünyadan örnekler", "Öğrenci deneyimiyle bağ"] : ["Real-world examples", "Links to student experience"], tr ? "Gerçek hayattan bir fotoğraf" : "A real-world photo"),
      slide(5, tr ? "Özet ve Değerlendirme" : "Summary & Check", tr ? ["Önemli noktalar", "Hızlı kontrol sorusu"] : ["Key takeaways", "Quick check question"], tr ? "Özet infografiği" : "A summary infographic"),
    ],
    discussionQuestions: tr
      ? [`${topic} olmasaydı ne değişirdi?`, `${topic} ile ilgili merak ettiğin bir soru nedir?`]
      : [`What would change without ${topic}?`, `What is one question you still have about ${topic}?`],
  };
}

export function mockChat(question: string, lang: Lang, practiceMode: boolean): string {
  const tr = lang === "tr";
  if (practiceMode) {
    return tr
      ? `İpucu: "${question}" sorusuna doğrudan cevap vermek yerine birlikte düşünelim. İlk adım olarak, soruda verilenleri ve ne istendiğini ayır. Sence ilk hangi bilgiyi kullanmalısın? (Demo modu yanıtı.)`
      : `Hint: instead of the answer to "${question}", let's reason together. First, separate what's given from what's asked. Which piece of information do you think we should use first? (Demo-mode reply.)`;
  }
  return tr
    ? `Güzel soru! Kısaca: "${question}" konusunu seviyene uygun şekilde örneklerle düşünebilirsin. Önce temel fikir, sonra bir örnek işe yarar. Bunu bir arkadaşına nasıl anlatırdın? (Demo modu yanıtı.)`
    : `Great question! In short: think about "${question}" with a simple example at your level. Start with the core idea, then an example. How would you explain it to a friend? (Demo-mode reply.)`;
}

const MOCK_CRIT: Record<CriterionId, { score: number; tr: string; en: string }> = {
  argument: { score: 4, tr: "Ana fikir açık, birkaç yerde daha güçlü kanıt gerekli.", en: "Clear main idea; a few claims need stronger evidence." },
  organization: { score: 4, tr: "Giriş-gelişme-sonuç var; paragraf geçişleri güçlendirilebilir.", en: "Has intro-body-conclusion; transitions could be tighter." },
  clarity: { score: 3, tr: "Bazı cümleler uzun; daha kısa ve net ifadeler önerilir.", en: "Some sentences run long; aim for shorter, clearer phrasing." },
  mechanics: { score: 4, tr: "Birkaç küçük yazım hatası dışında temiz.", en: "Mostly clean aside from a few small typos." },
};

export function mockGrade(essay: string, lang: Lang, criteriaIds: CriterionId[]): GradeResult {
  const tr = lang === "tr";
  const firstSentence =
    essay.trim().split(/(?<=[.!?])\s/)[0]?.slice(0, 120) || essay.trim().slice(0, 80);
  const criteria = criteriaIds.map((id) => ({
    name: criterionLabel(id, lang),
    score: MOCK_CRIT[id].score,
    max: 5 as const,
    comment: tr ? MOCK_CRIT[id].tr : MOCK_CRIT[id].en,
  }));
  const overall = Math.round(
    (criteria.reduce((a, c) => a + c.score, 0) / (criteria.length * 5)) * 100,
  );
  return {
    overall,
    criteria,
    inlineFeedback: [
      {
        quote: firstSentence,
        comment: tr
          ? "İyi bir açılış. Buraya tek cümlelik net bir tez eklersen okuyucu yönünü hemen anlar."
          : "Good opening. Add a one-sentence thesis here so the reader knows your direction right away.",
      },
    ],
    summaryForStudent: tr
      ? "Fikirlerin açık ve konuya hâkimsin. Bir sonraki adımda her ana fikri bir örnekle destekle ve uzun cümleleri böl. Güzel iş! (Demo modu)"
      : "Your ideas are clear and you know the topic. Next, back each main idea with an example and split long sentences. Nice work! (Demo mode)",
  };
}
