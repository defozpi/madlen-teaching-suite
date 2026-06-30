"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import { useLang } from "@/components/useLang";
import { t } from "@/lib/i18n";
import type { GradeResult } from "@/lib/schemas";

export default function EssayGraderPage() {
  const { lang } = useLang();
  const s = t(lang);

  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<GradeResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function grade() {
    if (essay.trim().length < 20) {
      setError(s.errorGeneric);
      return;
    }
    setLoading(true);
    setError("");
    setNote("");
    setResult(null);
    try {
      const res = await fetch("/api/grade-essay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ essay, lang }),
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

  function copySummary() {
    if (!result) return;
    navigator.clipboard.writeText(result.summaryForStudent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
          <div className="field">
            <label htmlFor="essay">{s.essayLabel}</label>
            <textarea
              id="essay"
              value={essay}
              placeholder={s.essayPh}
              onChange={(e) => setEssay(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={grade} disabled={loading || essay.trim().length < 20}>
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
            <div className="section-title">{s.overall}</div>
            <div className="score-ring">
              <span className="big">{result.overall}</span>
              <span className="muted">/ 100</span>
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
                <p className="crit-comment">{c.comment}</p>
              </div>
            ))}

            <div className="section-title">{s.inline}</div>
            {result.inlineFeedback.map((n, i) => (
              <div className="inline-note" key={i}>
                <div className="quote">“{n.quote}”</div>
                <div className="cmt">{n.comment}</div>
              </div>
            ))}

            <div className="section-title">{s.summary}</div>
            <div className="callout">{result.summaryForStudent}</div>
            <div className="row" style={{ marginTop: 12, justifyContent: "space-between", alignItems: "center" }}>
              <span className="muted" style={{ fontSize: 13 }}>
                {s.teacherNote}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={copySummary}>
                {copied ? s.copied : s.copy}
              </button>
            </div>
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
