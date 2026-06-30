// Minimal bilingual UI dictionary (TR default, EN secondary). Madlen is a
// Turkish K-12 product, so Turkish is first-class; English keeps the demo
// legible to reviewers who do not read Turkish.

import type { Lang } from "./schemas";

export const STRINGS = {
  tr: {
    brand: "Madlen",
    suite: "Yapay Zeka Öğretmen Takımı",
    tagline: "Öğretmenler ve öğrenciler için üç hazır sınıf aracı.",
    demoBadge: "Demo modu (API anahtarı yok)",
    liveBadge: "Canlı (Claude)",
    backHome: "Ana sayfa",
    languageLabel: "Dil",
    // tool cards
    lessonTitle: "Ders Hazırlık Asistanı",
    lessonDesc: "Konu ve sınıf düzeyi girin, kullanıma hazır bir ders planı alın.",
    chatTitle: "Öğrenci Sohbet Botu",
    chatDesc: "Öğrenciye yaş düzeyine uygun, yönlendiren yanıtlar.",
    graderTitle: "Kompozisyon Değerlendirici",
    graderDesc: "Öğrenci metnini yapıştırın, anında yapılandırılmış geri bildirim alın.",
    open: "Aç",
    // lesson prep
    topic: "Konu",
    topicPh: "örn. Fotosentez",
    grade: "Sınıf düzeyi",
    generate: "Ders planı oluştur",
    generating: "Oluşturuluyor...",
    objectives: "Kazanımlar",
    keyConcepts: "Anahtar kavramlar",
    slides: "Slaytlar (5)",
    visual: "Görsel önerisi",
    discussion: "Tartışma soruları",
    copy: "Kopyala",
    copied: "Kopyalandı",
    // chatbot
    chatGrade: "Sınıf düzeyi",
    practiceMode: "Alıştırma modu (doğrudan cevap yerine ipucu)",
    askPh: "Bir soru sor...",
    send: "Gönder",
    thinking: "Düşünüyor...",
    chatIntro: "Merhaba! Bir konu hakkında soru sorabilirsin. Sana seviyene uygun açıklamalar yaparım.",
    // grader
    essayLabel: "Öğrenci kompozisyonu",
    essayPh: "Öğrencinin yazısını buraya yapıştırın...",
    gradeBtn: "Değerlendir",
    grading: "Değerlendiriliyor...",
    overall: "Genel puan",
    criteria: "Ölçütler",
    inline: "Metne özel geri bildirim",
    summary: "Öğrenciyle paylaşılacak özet",
    teacherNote: "Öğretmen onayı: paylaşmadan önce gözden geçirip düzenleyebilirsiniz.",
    errorGeneric: "Bir hata oluştu. Lütfen tekrar deneyin.",
  },
  en: {
    brand: "Madlen",
    suite: "AI Teaching Suite",
    tagline: "Three ready-to-use classroom tools for teachers and students.",
    demoBadge: "Demo mode (no API key)",
    liveBadge: "Live (Claude)",
    backHome: "Home",
    languageLabel: "Language",
    lessonTitle: "Lesson Prep Assistant",
    lessonDesc: "Enter a topic and grade level, get a ready-to-use lesson plan.",
    chatTitle: "Student Chatbot",
    chatDesc: "Age-appropriate, guiding answers for students.",
    graderTitle: "Essay Grader",
    graderDesc: "Paste a student essay, get structured feedback instantly.",
    open: "Open",
    topic: "Topic",
    topicPh: "e.g. Photosynthesis",
    grade: "Grade level",
    generate: "Generate lesson plan",
    generating: "Generating...",
    objectives: "Objectives",
    keyConcepts: "Key concepts",
    slides: "Slides (5)",
    visual: "Visual suggestion",
    discussion: "Discussion questions",
    copy: "Copy",
    copied: "Copied",
    chatGrade: "Grade level",
    practiceMode: "Practice mode (hints instead of direct answers)",
    askPh: "Ask a question...",
    send: "Send",
    thinking: "Thinking...",
    chatIntro: "Hi! Ask me about a topic and I'll explain it at your level.",
    essayLabel: "Student essay",
    essayPh: "Paste the student's writing here...",
    gradeBtn: "Grade essay",
    grading: "Grading...",
    overall: "Overall score",
    criteria: "Criteria",
    inline: "Inline feedback",
    summary: "Summary to share with the student",
    teacherNote: "Teacher in control: review and edit before sharing.",
    errorGeneric: "Something went wrong. Please try again.",
  },
};

export type UIStrings = (typeof STRINGS)["en"];

export function t(lang: Lang): UIStrings {
  return STRINGS[lang];
}

export const GRADE_OPTIONS = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
];
