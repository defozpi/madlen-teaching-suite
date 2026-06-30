"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import { useLang } from "@/components/useLang";
import { GRADE_OPTIONS, t } from "@/lib/i18n";
import type { LessonPlan } from "@/lib/schemas";

export default function LessonPrepPage() {
  const { lang } = useLang();
  const s = t(lang);

  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("6");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setNote("");
    setPlan(null);
    try {
      const res = await fetch("/api/lesson-prep", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic, grade, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || s.errorGeneric);
      setPlan(data.data);
      if (data.note) setNote(data.note);
    } catch (e) {
      setError(e instanceof Error ? e.message : s.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  function copyPlan() {
    if (!plan) return;
    const lines = [
      `${plan.topic} (${plan.gradeLevel})`,
      "",
      `${s.objectives}:`,
      ...plan.objectives.map((o) => `- ${o}`),
      "",
      `${s.keyConcepts}: ${plan.keyConcepts.join(", ")}`,
      "",
      ...plan.slides.flatMap((sl) => [
        sl.title,
        ...sl.bullets.map((b) => `  - ${b}`),
        `  (${s.visual}: ${sl.visualSuggestion})`,
      ]),
      "",
      `${s.discussion}:`,
      ...plan.discussionQuestions.map((q) => `- ${q}`),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <Header />
      <main className="container tool">
        <div className="tool-head">
          <span className="num">1</span>
          <h2>{s.lessonTitle}</h2>
        </div>
        <p className="tool-sub">{s.lessonDesc}</p>

        <div className="panel">
          <div className="row">
            <div className="field grow">
              <label htmlFor="topic">{s.topic}</label>
              <input
                id="topic"
                value={topic}
                placeholder={s.topicPh}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
              />
            </div>
            <div className="field">
              <label htmlFor="grade">{s.grade}</label>
              <select id="grade" value={grade} onChange={(e) => setGrade(e.target.value)}>
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={generate} disabled={loading || !topic.trim()}>
            {loading ? (
              <>
                <span className="spinner" />
                {s.generating}
              </>
            ) : (
              s.generate
            )}
          </button>
          {error && <p className="error">{error}</p>}
          {note && <p className="note">{note}</p>}
        </div>

        {plan && (
          <div className="panel">
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>
                {plan.topic} · {plan.gradeLevel}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={copyPlan}>
                {copied ? s.copied : s.copy}
              </button>
            </div>

            <div className="section-title">{s.objectives}</div>
            <ul className="bullets">
              {plan.objectives.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>

            <div className="section-title">{s.keyConcepts}</div>
            <ul className="bullets">
              {plan.keyConcepts.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>

            <div className="section-title">{s.slides}</div>
            {plan.slides.map((sl, i) => (
              <div className="slide" key={i}>
                <h4>{sl.title}</h4>
                <ul className="bullets">
                  {sl.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
                <div className="visual">
                  <b>{s.visual}:</b> {sl.visualSuggestion}
                </div>
              </div>
            ))}

            <div className="section-title">{s.discussion}</div>
            <ul className="bullets">
              {plan.discussionQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="foot">
          <Link href="/" className="muted">
            ← {s.backHome}
          </Link>
        </p>
      </main>
    </>
  );
}
