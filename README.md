# Madlen AI Teaching Suite

Three small, fully functional AI classroom tools, built for the Madlen case study and deployable to a public URL with one click on Vercel. The interface is bilingual (Turkish and English) with a language toggle.

1. **Lesson Prep Assistant** (teacher): enter a topic and grade level, get a ready-to-use lesson plan with objectives, key concepts, a 5-slide structure (title, bullets, and a visual suggestion per slide), and 2 to 3 discussion questions. Export the plan by copying it, downloading Markdown, or printing to PDF, each with a plain-language tooltip for non-technical teachers.
2. **Student Chatbot**: a student asks questions and gets grade-calibrated, age-appropriate answers, rendered with proper formatting. A "practice mode" gives hints and guiding questions instead of the direct answer, and it only credits the student for what they actually wrote.
3. **Essay Grader** (teacher): paste a student essay and get scores across teacher-selected criteria (1 to 4), inline feedback that quotes the essay, an overall score with a plain-language label, and a summary the teacher can review and export (copy, Markdown, print/PDF) before sharing. A live character counter enforces a sensible minimum length.

## How it maps to the case study

| Requirement | How it is met |
| --- | --- |
| Three tools, each fully functional | Each has its own page, API route, and (for two of them) validated structured output. |
| Usable by a real teacher or student | Clean, polished bilingual UI, grade calibration, export options, a teacher-review step. |
| Works end to end without errors | Inputs are validated, model output is schema-validated with a retry, and there is a graceful fallback so the UI never hard-crashes. |
| Deployed to a public URL | Standard Next.js app, one-click deploy on Vercel (see below). |

## Write-ups (case-study deliverables)

- [Process log](docs/PROCESS.md): AI tools used, where I switched direction, deliberate UI/UX decisions, and what I would build next.
- [Prompt engineering log](docs/PROMPT-ENGINEERING-LOG.md): the actual prompts, how each evolved, and what failed (e.g. practice-mode revealing answers; DeepSeek returning malformed JSON).
- [Decisions log](docs/DECISIONS.md): the reasoning behind each commit.

Roadmap highlights (details in the process log): turn each slide's "visual suggestion" into a ready-to-paste AI image-generation prompt so teachers can create the image directly; a grader radar chart; grade-aware grading.

## Engineering principles

- **Provider-agnostic with graceful fallback.** The backend auto-selects: `OPENAI_API_KEY` uses a cheap OpenAI-compatible provider (DeepSeek by default; also Qwen, Kimi, OpenRouter), else `ANTHROPIC_API_KEY` uses Claude, else a deterministic demo provider so the public URL always works without a key or cost. The header badge honestly shows "Live · &lt;model&gt;" or "Demo mode".
- **Structured, validated output.** The lesson plan and the grade are not free text. They are parsed and validated against a `zod` schema, and the model is asked to correct itself once if the output is malformed. See [`lib/schemas.ts`](lib/schemas.ts) and [`lib/llm/`](lib/llm).
- **One job per tool.** Each tool has its own focused, grade-aware, language-aware prompt in [`lib/prompts.ts`](lib/prompts.ts).
- **Grade-level calibration grounded in research** (see next section).
- **Teacher in control (human in the loop).** The grader produces a draft summary the teacher reviews and edits before sharing, rather than auto-publishing.
- **Light grounding instead of heavy RAG.** These are pure generation tasks, so there is no vector database. A small curriculum reference in [`lib/curriculum.ts`](lib/curriculum.ts) is injected when the topic matches, keeping the app deployable to Vercel and avoiding a dependency the tasks do not need.
- **Evaluation.** [`eval/grader-eval.ts`](eval/grader-eval.ts) checks the grader for structural validity and run-to-run score consistency.

## Grade-level calibration

The Lesson Prep and Student Chatbot prompts calibrate to the selected grade using a profile grounded in established educational-science frameworks rather than ad-hoc guesses ([`lib/grade.ts`](lib/grade.ts)):

- **Reading level:** CCSS recalibrated "stretch" Lexile bands (e.g. grades 2-3: 420-820L; 6-8: 925-1185L; 11-CCR: 1185-1385L).
- **Cognitive stage:** Piaget, concrete operational (~ages 7-11) vs. formal operational (~11+), which sets how concrete vs. abstract the explanations are.
- **Cognitive demand:** Bloom's revised taxonomy, shifting from remember/understand/apply in early grades to analyze/evaluate/create later.

Calibration is deliberately at the prompt level (the model applies the profile); it is not a shallow readability check, which would give false confidence.

## Design direction

The interface deliberately avoids the generic "AI-built" look: no warm cream and burnt-orange template palette, no default system font. It uses a cool neutral slate base with a single locked emerald accent, Plus Jakarta Sans loaded via `next/font`, a tightened type scale, `prefers-reduced-motion` support, and restrained motion. The direction was guided by an anti-slop design-taste skill (installed separately as tooling), then applied by hand in [`app/globals.css`](app/globals.css).

## Tech stack

Next.js (App Router, TypeScript), React, plain CSS (no UI framework), the Anthropic and OpenAI SDKs, and `zod`. No database, no Docker. Serverless API routes call the model on the server, so the key is never exposed to the browser.

## Configuration

The backend is provider-agnostic and auto-selected. Because DeepSeek, Qwen, Kimi, OpenRouter and others all speak the OpenAI Chat Completions API, you can point at whichever is cheapest with three variables.

| Variable | Default | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | (empty) | Key for a cheap OpenAI-compatible provider. Setting it selects this backend. |
| `OPENAI_BASE_URL` | `https://api.deepseek.com` | Provider endpoint (DeepSeek, Qwen, Kimi, OpenRouter, ...). |
| `OPENAI_MODEL` | `deepseek-chat` | Model id for that provider. |
| `ANTHROPIC_API_KEY` | (empty) | Use Claude instead (higher quality, pricier). |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-6` | Claude model when using Anthropic. |
| `LLM_PROVIDER` | (auto) | Force a backend: `openai`, `anthropic`, or `demo`. |

Cheap presets (see `.env.example`): DeepSeek (`deepseek-chat`), Qwen (`qwen-turbo`), Kimi (`kimi-k2-0711-preview`), or OpenRouter with a `:free` model for zero cost. DeepSeek is recommended: reliable and a fraction of a cent per request.

## Run locally

Requires Node 18.17+ .

```bash
npm install
cp .env.example .env.local   # optional: add a key for real answers
npm run dev                  # http://localhost:3000
npm run eval                 # run the grader evaluation
```

With no key it runs in demo mode. Add `OPENAI_API_KEY` (DeepSeek) or `ANTHROPIC_API_KEY` to `.env.local` for real output.

## Deploy to a public URL (Vercel)

1. Push this folder to a GitHub repository.
2. Go to https://vercel.com/new , import the repository, and click Deploy. No configuration is needed.
3. For real, cheap answers: in the Vercel project, Settings, Environment Variables, add `OPENAI_API_KEY` (your DeepSeek key), then redeploy.

You get a public `*.vercel.app` URL that works immediately. Without a key it serves demo mode, which is safe to share (no cost, no key exposure).

## Project layout

```
madlen/
├── app/
│   ├── page.tsx                 # home: the three tool cards
│   ├── lesson-prep/page.tsx     # Tool 1 UI (with export)
│   ├── chatbot/page.tsx         # Tool 2 UI (Markdown-rendered, resets on grade change)
│   ├── essay-grader/page.tsx    # Tool 3 UI
│   └── api/
│       ├── lesson-prep/route.ts
│       ├── chat/route.ts
│       ├── grade-essay/route.ts
│       └── status/route.ts      # provider/model badge (no secrets exposed)
├── lib/
│   ├── llm/                     # provider dispatcher + Anthropic, OpenAI-compatible, and demo clients
│   ├── prompts.ts               # per-tool prompts (grade + language aware)
│   ├── grade.ts                 # research-grounded grade-level calibration profile
│   ├── schemas.ts               # zod output contracts
│   ├── curriculum.ts            # light grounding reference
│   ├── markdown.ts              # tiny XSS-safe Markdown renderer for chat
│   └── i18n.ts                  # bilingual UI strings
├── components/                  # Header + language store
└── eval/                        # grader evaluation harness
```

## License

MIT.
