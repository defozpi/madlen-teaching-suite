"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import type { Provider } from "@/lib/llm";
import { useLang } from "./useLang";

export default function Header() {
  const { lang, setLang } = useLang();
  const s = t(lang);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [model, setModel] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setProvider(d.provider);
        setModel(d.model ?? null);
      })
      .catch(() => setProvider(null));
  }, []);

  const isLive = provider !== null && provider !== "demo";

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          <span className="brand-dot" />
          {s.brand} <small>{s.suite}</small>
        </Link>
        <div className="spacer" />
        {provider && (
          <span className={`badge ${isLive ? "live" : "demo"}`}>
            {isLive ? `${s.liveBadge}${model ? ` · ${model}` : ""}` : s.demoBadge}
          </span>
        )}
        <div className="lang-toggle" role="group" aria-label={s.languageLabel}>
          <button className={lang === "tr" ? "active" : ""} onClick={() => setLang("tr")}>
            TR
          </button>
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
