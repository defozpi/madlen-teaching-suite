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

  function planMarkdown(): string {
    if (!plan) return "";
    return [
      `# ${plan.topic} (${plan.gradeLevel})`,
      "",
      `## ${s.objectives}`,
      ...plan.objectives.map((o) => `- ${o}`),
      "",
      `## ${s.keyConcepts}`,
      ...plan.keyConcepts.map((c) => `- ${c}`),
      "",
      `## ${s.slides}`,
      ...plan.slides.flatMap((sl) => [
        `### ${sl.title}`,
        ...sl.bullets.map((b) => `- ${b}`),
        `_${s.visual}: ${sl.visualSuggestion}_`,
        "",
      ]),
      `## ${s.discussion}`,
      ...plan.discussionQuestions.map((q) => `- ${q}`),
      "",
    ].join("\n");
  }

  function copyPlan() {
    if (!plan) return;
    navigator.clipboard.writeText(planMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function fileSlug(): string {
    return (plan?.topic || "ders-plani")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9ğüşıöç-]/gi, "")
      .slice(0, 40);
  }

  function downloadMarkdown() {
    if (!plan) return;
    const blob = new Blob([planMarkdown()], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileSlug()}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function printPlan() {
    if (!plan) return;
    const esc = (x: string) =>
      x.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string);
    const slides = plan.slides
      .map(
        (sl) =>
          `<div class="slide"><h3>${esc(sl.title)}</h3><ul>${sl.bullets
            .map((b) => `<li>${esc(b)}</li>`)
            .join("")}</ul><p class="v"><b>${esc(s.visual)}:</b> ${esc(
            sl.visualSuggestion,
          )}</p></div>`,
      )
      .join("");
    const li = (arr: string[]) => `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>${esc(plan.topic)}</title>` +
        `<style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111;max-width:720px;margin:32px auto;padding:0 24px;line-height:1.55}` +
        `h1{font-size:24px;margin-bottom:4px}h2{font-size:12px;text-transform:uppercase;letter-spacing:.07em;color:#666;margin-top:26px}` +
        `.slide{border:1px solid #e5e5e5;border-radius:8px;padding:12px 14px;margin:8px 0}.slide h3{margin:0 0 6px;font-size:15px}` +
        `.v{color:#555;font-size:13px;margin:8px 0 0}</style></head><body>` +
        `<h1>${esc(plan.topic)} (${esc(plan.gradeLevel)})</h1>` +
        `<h2>${esc(s.objectives)}</h2>${li(plan.objectives)}` +
        `<h2>${esc(s.keyConcepts)}</h2>${li(plan.keyConcepts)}` +
        `<h2>${esc(s.slides)}</h2>${slides}` +
        `<h2>${esc(s.discussion)}</h2>${li(plan.discussionQuestions)}` +
        `</body></html>`,
    );
    w.document.close();
    w.focus();
    w.print();
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
              <div className="btn-group">
                <span className="tip" data-tip={s.copyTip}>
                  <button className="btn btn-ghost btn-sm" onClick={copyPlan} aria-label={s.copyTip}>
                    {copied ? s.copied : s.copy}
                  </button>
                </span>
                <span className="tip" data-tip={s.mdTip}>
                  <button className="btn btn-ghost btn-sm" onClick={downloadMarkdown} aria-label={s.mdTip}>
                    {s.downloadMd}
                  </button>
                </span>
                <span className="tip" data-tip={s.printTip}>
                  <button className="btn btn-ghost btn-sm" onClick={printPlan} aria-label={s.printTip}>
                    {s.printPdf}
                  </button>
                </span>
              </div>
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
