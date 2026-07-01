"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import { useLang } from "@/components/useLang";
import { GRADE_OPTIONS, t } from "@/lib/i18n";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatbotPage() {
  const { lang } = useLang();
  const s = t(lang);

  const [grade, setGrade] = useState("6");
  const [practice, setPractice] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, loading]);

  // A different grade or mode is a new tutoring context. Reset the conversation
  // so the new grade profile actually drives the reply instead of the model
  // echoing the previous grade's answer from the message history.
  useEffect(() => {
    setMessages([]);
    setError("");
  }, [grade, practice]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next, grade, lang, practiceMode: practice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || s.errorGeneric);
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : s.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="container tool">
        <div className="tool-head">
          <span className="num">2</span>
          <h2>{s.chatTitle}</h2>
        </div>
        <p className="tool-sub">{s.chatDesc}</p>

        <div className="panel">
          <div className="row" style={{ alignItems: "flex-end" }}>
            <div className="field">
              <label htmlFor="cgrade">{s.chatGrade}</label>
              <select id="cgrade" value={grade} onChange={(e) => setGrade(e.target.value)}>
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <label className="checkbox" style={{ marginBottom: 14 }}>
              <input type="checkbox" checked={practice} onChange={(e) => setPractice(e.target.checked)} />
              {s.practiceMode}
            </label>
          </div>

          <div className="chat-log" ref={logRef}>
            <div className="msg assistant">{s.chatIntro}</div>
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="msg assistant">
                <span className="spinner" />
                {s.thinking}
              </div>
            )}
          </div>

          <div className="composer">
            <input
              value={input}
              placeholder={s.askPh}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()}>
              {s.send}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </div>

        <p className="foot">
          <Link href="/" className="muted">
            ← {s.backHome}
          </Link>
        </p>
      </main>
    </>
  );
}
