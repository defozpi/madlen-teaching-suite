"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/schemas";

const KEY = "madlen.lang";
const EVENT = "madlen-lang-change";

// Tiny localStorage-backed language store kept in sync across the header and
// pages via a custom window event. Defaults to Turkish (Madlen's market).
export function useLang(): { lang: Lang; setLang: (l: Lang) => void } {
  const [lang, setLangState] = useState<Lang>("tr");

  useEffect(() => {
    const stored = (localStorage.getItem(KEY) as Lang | null) ?? "tr";
    setLangState(stored);
    const handler = () => setLangState((localStorage.getItem(KEY) as Lang | null) ?? "tr");
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  const setLang = (l: Lang) => {
    localStorage.setItem(KEY, l);
    setLangState(l);
    window.dispatchEvent(new Event(EVENT));
  };

  return { lang, setLang };
}
