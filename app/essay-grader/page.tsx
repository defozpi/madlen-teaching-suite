"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import { useLang } from "@/components/useLang";
import { CRITERIA, CRITERION_IDS, type CriterionId } from "@/lib/criteria";
import { t } from "@/lib/i18n";
import { mdToSafeHtml } from "@/lib/markdown";
import type { GradeResult } from "@/lib/schemas";
import { scoreLabel } from "@/lib/score";

const MIN_CHARS = 150;

export default function EssayGraderPage() {
  const { lang } = useLang();
  const s = t(lang);

  const [essay, setEssay] = useState("");
  const [selected, setSelected] = useState<CriterionId[]>([...CRITERION_IDS]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<GradeResult | null>(null);
  const [copied, setCopied] = useState(false);

  const len = essay.trim().length;
  const canGrade = len >= MIN_CHARS && selected.length >= 1 && !loading;

  function toggle(id: CriterionId) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function grade() {
    if (len < MIN_CHARS) {
      setError(s.minCharsNote);
      return;
    }
    if (selected.length < 1) {
      setError(s.selectAtLeastOne);
      return;
    }
    setLoading(true);
    setError("");
    setNote("");
    setResult(null);
    try {
      // preserve the canonical criterion order
      const ordered = CRITERION_IDS.filter((id) => selected.includes(id));
      const res = await fetch("/api/grade-essay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ essay, lang, criteria: ordered }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || s.errorGeneric);
      setResult(data.data);
      if (data.note) setNote(data.note);
    } catch (e) {
      setError(e instanceof Error ? e.message : s.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  function feedbackMarkdown(): string {
    if (!result) return "";
    return [
      `# ${s.graderTitle}`,
      `**${s.overall}:** ${result.overall}/100 (${scoreLabel(result.overall, lang)})`,
      "",
      `## ${s.criteria}`,
      ...result.criteria.map((c) => `- **${c.name}** ${c.score}/${c.max}: ${c.comment}`),
      "",
      `## ${s.inline}`,
      ...result.inlineFeedback.map((n) => `- "${n.quote}": ${n.comment}`),
      "",
      `## ${s.summary}`,
      result.summaryForStudent,
      "",
    ].join("\n");
  }

  function copyFeedback() {
    if (!result) return;
    navigator.clipboard.writeText(feedbackMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadFeedback() {
    if (!result) return;
    const blob = new Blob([feedbackMarkdown()], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "degerlendirme.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function printFeedback() {
    if (!result) return;
    const esc = (x: string) =>
      x.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string);
    const crit = result.criteria
      .map(
        (c) =>
          `<li><b>${esc(c.name)}</b> ${c.score}/${c.max} &mdash; ${esc(c.comment)}</li>`,
      )
      .join("");
    const inline = result.inlineFeedback
      .map((n) => `<div class="q">&ldquo;${esc(n.quote)}&rdquo;<br><span>${esc(n.comment)}</span></div>`)
      .join("");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>${esc(s.graderTitle)}</title>` +
        `<style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111;max-width:720px;margin:32px auto;padding:0 24px;line-height:1.55}` +
        `h1{font-size:22px}h2{font-size:12px;text-transform:uppercase;letter-spacing:.07em;color:#666;margin-top:24px}` +
        `.q{border-left:3px solid #0d9268;padding:6px 12px;margin:8px 0;background:#f5f7f8;border-radius:0 8px 8px 0}` +
        `.q span{color:#555;font-size:13px}</style></head><body>` +
        `<h1>${esc(s.graderTitle)}</h1>` +
        `<p><b>${esc(s.overall)}:</b> ${result.overall}/100 (${esc(scoreLabel(result.overall, lang))})</p>` +
        `<h2>${esc(s.criteria)}</h2><ul>${crit}</ul>` +
        `<h2>${esc(s.inline)}</h2>${inline}` +
        `<h2>${esc(s.summary)}</h2><p>${esc(result.summaryForStudent)}</p>` +
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
          <span className="num">3</span>
          <h2>{s.graderTitle}</h2>
        </div>
        <p className="tool-sub">{s.graderDesc}</p>

        <div className="panel">
          <div className="field" style={{ marginBottom: 6 }}>
            <label htmlFor="essay">{s.essayLabel}</label>
            <textarea
              id="essay"
              value={essay}
              placeholder={s.essayPh}
              onChange={(e) => setEssay(e.target.value)}
            />
          </div>
          <div
            className="muted"
            style={{ fontSize: 12.5, marginBottom: 16, color: len < MIN_CHARS ? "var(--muted)" : "var(--accent-strong)" }}
          >
            {len} / {MIN_CHARS} {s.chars}
            {len < MIN_CHARS ? ` · ${s.minCharsNote}` : ""}
          </div>

          <div className="field">
            <label>{s.gradingCriteria}</label>
            <span className="muted" style={{ fontSize: 12.5, marginBottom: 4 }}>
              {s.criteriaHint}
            </span>
            <div className="row" style={{ gap: "10px 18px" }}>
              {CRITERIA.map((c) => (
                <label key={c.id} className="checkbox">
                  <input
                    type="checkbox"
                    checked={selected.includes(c.id)}
                    onChange={() => toggle(c.id)}
                  />
                  {lang === "tr" ? c.tr : c.en}
                </label>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" onClick={grade} disabled={!canGrade}>
            {loading ? (
              <>
                <span className="spinner" />
                {s.grading}
              </>
            ) : (
              s.gradeBtn
            )}
          </button>
          {error && <p className="error">{error}</p>}
          {note && <p className="note">{note}</p>}
        </div>

        {result && (
          <div className="panel">
            <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="section-title">{s.overall}</div>
                <div className="score-ring">
                  <span className="big">{result.overall}</span>
                  <span className="muted">/ 100</span>
                  <span className="badge live" style={{ marginLeft: 8 }}>
                    {scoreLabel(result.overall, lang)}
                  </span>
                </div>
              </div>
              <div className="btn-group" style={{ marginTop: 18 }}>
                <span className="tip" data-tip={s.copyTip}>
                  <button className="btn btn-ghost btn-sm" onClick={copyFeedback} aria-label={s.copyTip}>
                    {copied ? s.copied : s.copy}
                  </button>
                </span>
                <span className="tip" data-tip={s.mdTip}>
                  <button className="btn btn-ghost btn-sm" onClick={downloadFeedback} aria-label={s.mdTip}>
                    {s.downloadMd}
                  </button>
                </span>
                <span className="tip" data-tip={s.printTip}>
                  <button className="btn btn-ghost btn-sm" onClick={printFeedback} aria-label={s.printTip}>
                    {s.printPdf}
                  </button>
                </span>
              </div>
            </div>

            <div className="section-title">{s.criteria}</div>
            {result.criteria.map((c, i) => (
              <div key={i}>
                <div className="crit">
                  <span className="name">{c.name}</span>
                  <span className="bar">
                    <span style={{ width: `${(c.score / c.max) * 100}%` }} />
                  </span>
                  <span className="val">
                    {c.score}/{c.max}
                  </span>
                </div>
                <p className="crit-comment rich" dangerouslySetInnerHTML={{ __html: mdToSafeHtml(c.comment) }} />
              </div>
            ))}

            <div className="section-title">{s.inline}</div>
            {result.inlineFeedback.map((n, i) => (
              <div className="inline-note" key={i}>
                <div className="quote">“{n.quote}”</div>
                <div className="cmt rich" dangerouslySetInnerHTML={{ __html: mdToSafeHtml(n.comment) }} />
              </div>
            ))}

            <div className="section-title">{s.summary}</div>
            <div className="callout rich" dangerouslySetInnerHTML={{ __html: mdToSafeHtml(result.summaryForStudent) }} />
            <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
              {s.teacherNote}
            </p>
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
