# Process Log

Madlen AI Teaching Suite. Author: Defne Özpunar.

## Which AI tools I used, and for what

- **Claude Code** (agentic coding): the primary build tool. I used it to scaffold the Next.js app, write the API routes and the provider layer, debug production issues, and produce these write-ups. I drove it with specific product decisions rather than "build me an app" prompts.
- **A design-taste skill** (installed as tooling) for the visual direction. It flagged that my first palette was a generic "AI-built" look and I replaced it (see UI decisions below).
- **DeepSeek** (`deepseek-chat`) as the app's runtime model, chosen for cost. The code is provider-agnostic, so Claude or a local model can be swapped in with one environment variable.

## Where I switched tools or direction mid-build, and why

- **Heavier agent stack, then Next.js on Vercel.** I started from a Docker + vector-DB pattern I had used before. Once the requirement "deployed to a public URL (Vercel/Netlify)" was clear, I switched to a plain Next.js app, because the Docker stack cannot deploy there and these three features are pure generation tasks that do not need a vector database.
- **Claude, then DeepSeek as the default.** I first wired Claude, then added an OpenAI-compatible layer and made DeepSeek the default so a public demo costs a fraction of a cent per request instead of Claude prices. Claude stays available.
- **Trusting the model, then constraining it.** Early prompts trusted the model to "calibrate to the grade" and to return JSON. Both leaked (see the prompt-engineering log): I moved to a research-grounded grade profile and to enforced JSON mode with validation and retry.

## What is still rough, and what I would build next

- **Slide visuals.** The lesson planner gives a one-line "visual suggestion" per slide. Next step: turn that into a ready-to-paste image-generation prompt (subject, style, aspect ratio) so a teacher can generate the actual image in an AI image tool without writing the prompt themselves.
- **Grader performance chart.** Madlen's grader shows a radar chart of per-criterion scores. Mine shows bars. A small SVG radar would close most of the visual gap cheaply.
- **Grade-aware grading.** Grade calibration is applied in Lesson Prep and the Chatbot, not in the grader; grading against grade-level expectations is a natural next step.
- **Verified calibration.** Grade calibration is prompt-level. Real verification would be an LLM-as-judge calibrated to teacher ratings, not a shallow readability metric.
- **Deliberately out of scope** for a mini-product (Madlen has these in production): rubric generation, DOCX export, handwriting/file OCR, an "ideal essay" exemplar, and saved history.

## Deliberate UI/UX decisions

- **Anti-generic visual language.** Cool neutral slate base with a single locked emerald accent and Plus Jakarta Sans, deliberately avoiding the warm-cream + burnt-orange + default-font look that reads as AI-generated. Restrained motion with `prefers-reduced-motion` support.
- **Bilingual, Turkish-first**, because the users are Turkish K-12 teachers and students.
- **Honesty in the UI.** The header badge shows the real provider and model ("Live · deepseek-chat") or "Demo mode", and the app runs keyless in demo mode so a reviewer can use every feature without a key or cost.
- **Teacher in control.** The grader is a reviewable draft, not an auto-published grade. Export (copy, Markdown, print/PDF) has plain-language tooltips so a non-technical teacher understands what each does.
- **Calibration that actually applies.** The chatbot resets its context when the grade changes, so a new grade is truly recalibrated instead of the model echoing the previous grade's answer. Practice mode gives one hint at a time and never reveals the answer.
- **Never hard-crash.** Inputs are validated, model output is schema-validated with a retry, and a failed live call degrades to demo output with an honest note instead of an error screen.
