"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { useLang } from "@/components/useLang";
import { t } from "@/lib/i18n";

export default function Home() {
  const { lang } = useLang();
  const s = t(lang);

  const tools = [
    { n: 1, href: "/lesson-prep", title: s.lessonTitle, desc: s.lessonDesc },
    { n: 2, href: "/chatbot", title: s.chatTitle, desc: s.chatDesc },
    { n: 3, href: "/essay-grader", title: s.graderTitle, desc: s.graderDesc },
  ];

  return (
    <>
      <Header />
      <main className="container">
        <section className="hero">
          <h1>{s.suite}</h1>
          <p>{s.tagline}</p>
        </section>
        <section className="grid">
          {tools.map((tool) => (
            <Link key={tool.n} href={tool.href} className="card link">
              <span className="num">{tool.n}</span>
              <h3>{tool.title}</h3>
              <p>{tool.desc}</p>
              <span className="open">{s.open} →</span>
            </Link>
          ))}
        </section>
        <footer className="foot">
          {lang === "tr"
            ? "Madlen vaka çalışması için geliştirildi. Claude destekli, anahtar yoksa demo modunda çalışır."
            : "Built for the Madlen case study. Powered by Claude, runs in demo mode when no key is set."}
        </footer>
      </main>
    </>
  );
}
