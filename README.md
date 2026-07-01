# Madlen AI Teaching Suite

Three small, fully functional AI classroom tools, built for the Madlen case study and deployable to a public URL with one click on Vercel.

1. **Lesson Prep Assistant** (teacher): enter a topic and grade level, get a ready-to-use lesson plan with objectives, key concepts, a 5-slide structure (each slide has a title, bullets, and a visual suggestion), and 2 to 3 discussion questions.
2. **Student Chatbot**: a student asks questions and gets age-appropriate, grade-calibrated answers. A "practice mode" gives hints and guiding questions instead of the direct answer.
3. **Essay Grader** (teacher): paste a student essay and get a score across 4 criteria, inline feedback that quotes the essay, and a short summary the teacher can review and share with the student.

The interface is bilingual (Turkish and English) with a language toggle.

## How it maps to the case study

| Requirement | How it is met |
| --- | --- |
| Three tools, each fully functional | Each has its own page, API route, and structured output. |
| Usable by a real teacher or student | Clean bilingual UI, grade calibration, copy-to-clipboard, teacher review step. |
| Works end to end without errors | Inputs are validated, model output is schema-validated with a retry, and there is a graceful fallback so the UI never hard-crashes. |
| Deployed to a public URL | Standard Next.js app, one-click deploy on Vercel (see below). |

## Engineering principles (carried over from a previous agent project)

- **Provider abstraction with graceful fallback.** Claude is the real engine. If no API key is set, or a live call fails, the app falls back to a deterministic demo provider so the public URL still works end to end and can be reviewed without anyone spending on the API. The UI shows an honest "Live (Claude)" vs "Demo mode" badge.
- **Structured, validated output (the harness idea).** The lesson plan and the grade are not free text. They are parsed and validated against a `zod` schema, and the model is asked to correct itself once if the output is malformed. See [`lib/schemas.ts`](lib/schemas.ts) and [`lib/llm/anthropic.ts`](lib/llm/anthropic.ts).
- **One job per tool ("skills").** Each tool has its own focused, grade-aware, language-aware prompt in [`lib/prompts.ts`](lib/prompts.ts).
- **Teacher in control (human in the loop).** The grader produces a draft summary the teacher reviews and edits before sharing, rather than auto-publishing.
- **Light grounding instead of heavy RAG.** These are pure generation tasks, so there is no vector database. A small curriculum reference in [`lib/curriculum.ts`](lib/curriculum.ts) is injected into prompts when the topic matches, which keeps the app deployable to Vercel and avoids a dependency the tasks do not need.
- **Evaluation.** [`eval/grader-eval.ts`](eval/grader-eval.ts) checks the grader for structural validity and run-to-run score consistency.

## Design direction

The interface deliberately avoids the generic "AI-built" look: no warm cream and
burnt-orange template palette, no default system font. It uses a cool neutral
slate base with a single locked emerald accent, Plus Jakarta Sans loaded via
`next/font`, a tightened type scale, and restrained motion. The direction was
guided by an anti-slop design-taste skill (installed separately as tooling), then
applied by hand in [`app/globals.css`](app/globals.css).

## Tech stack

Next.js (App Router, TypeScript), React, plain CSS (no UI framework), the Anthropic SDK, and `zod`. No database, no Docker. Serverless API routes call Claude on the server so the key is never exposed to the browser.

## Run locally

Requires Node 18.17+ .

```bash
npm install
cp .env.example .env.local   # optional: add ANTHROPIC_API_KEY for real answers
npm run dev                  # http://localhost:3000
```

With no key it runs in demo mode. Add `ANTHROPIC_API_KEY` to `.env.local` for real Claude output.

## Deploy to a public URL (Vercel)

1. Push this folder to a GitHub repository.
2. Go to https://vercel.com/new , import the repository, and click Deploy. No configuration is needed.
3. (Optional, for real answers) In the Vercel project, go to Settings, Environment Variables, and add `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`). Redeploy.

You will get a public `*.vercel.app` URL that works immediately. Without the key it serves demo mode, which is safe to share publicly (no cost, no key exposure).

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | (empty) | Enables real Claude answers. Empty means demo mode. |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-6` | Swap to `claude-haiku-4-5` to spend less, or `claude-opus-4-8` for top quality. |

## Project layout

```
madlen/
├── app/
│   ├── page.tsx                 # home: the three tool cards
│   ├── lesson-prep/page.tsx     # Tool 1 UI
│   ├── chatbot/page.tsx         # Tool 2 UI
│   ├── essay-grader/page.tsx    # Tool 3 UI
│   └── api/
│       ├── lesson-prep/route.ts
│       ├── chat/route.ts
│       ├── grade-essay/route.ts
│       └── status/route.ts      # provider badge (no secrets exposed)
├── lib/
│   ├── llm/                     # provider dispatcher, Anthropic client, demo mock
│   ├── prompts.ts               # per-tool prompts (grade + language aware)
│   ├── schemas.ts               # zod output contracts
│   ├── curriculum.ts            # light grounding reference
│   └── i18n.ts                  # bilingual UI strings
├── components/                  # Header + language store
└── eval/                        # grader evaluation harness
```

## License

MIT.
