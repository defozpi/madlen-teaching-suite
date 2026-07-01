# Decisions Log

The reasoning behind each commit, in order. This is the thinking trail, not just a changelog.

| # | Commit | Decision and why |
| --- | --- | --- |
| 1 | `4ee168b` Initial commit | Chose **Next.js on Vercel** over a Docker/vector-DB stack, because the brief requires a public URL on Vercel/Netlify and these three tools are pure generation tasks that do not need a database. Set up provider-agnostic LLM, structured output with zod, and a demo fallback so the app runs keyless. |
| 2 | `1b41ca5` Refine UI/UX | A design-taste review flagged my first palette (warm cream + burnt-orange + default font) as a generic "AI-built" look. Switched to a **cool neutral + single emerald accent + Plus Jakarta Sans**, tighter type, restrained motion. Design is a graded signal, so this was worth doing early. |
| 3 | `4a1d1d8` Cheap providers | Added an **OpenAI-compatible layer (DeepSeek default; Qwen/Kimi/OpenRouter)** so a public demo costs a fraction of a cent per request. Kept Claude available. Rationale: right tool for the context, and cost control for a shared URL. |
| 4 | `a57840b` Fix live/demo badge | The badge only counted Claude as "live", so a DeepSeek key showed as "Demo". Made any non-demo provider "live" and had the badge show the **actual model**, so cost and provider are transparent. |
| 5 | `381417b` Practice-mode fix | Observed the tutor treating a student's question as a correct answer and revealing it. Rewrote the prompt to **classify the message and credit only what the student actually wrote** (see prompt log). A pedagogy bug, not a cosmetic one. |
| 6 | `de20d34` Lesson export | Teachers live in their own tools, so added **copy / Markdown / print-PDF** with plain-language tooltips (chose export over an in-app library, which would need accounts and a database that a demo should not add). |
| 7 | `d9b233e` Grade profile | Replaced "calibrate to grade N" with a **profile grounded in CCSS Lexile bands, Piaget, and Bloom**, so calibration is concrete and consistent rather than the model's loose guess. Researched the frameworks first instead of inventing them. |
| 8 | `ddfb1b4` Reset chat on grade change | The chat sent full history, so switching grade echoed the old answer. Reset the conversation on grade/mode change so calibration truly applies. A harness fix, not a prompt fix. |
| 9 | `f10e752` Render Markdown in chat | The model returns Markdown; the bubble showed raw `**`. Added a tiny **XSS-safe Markdown renderer**. Not a model or version issue, a rendering one. |
| 10 | `1e1f883` README update | Kept the repo's front page honest and current as features landed. |
| 11 | `0f4c5d7` Home copy | Reframed the eyebrow to "Plan / Teach / Assess" (mirrors the three tools and Madlen's teaching-lifecycle positioning) and set the byline. Made it read like a product, not homework. |
| 12 | `b901ee2` Grader upgrade | Added **selectable criteria** (teacher picks 1-4; overall scales), a **150-char minimum with a live counter**, full-feedback **export**, **Markdown-rendered** comments, and a **score label**. Deliberately excluded in-text highlighting and editable feedback to avoid scope creep. |
| 13 | `5dc2704` Grader JSON reliability | DeepSeek returned malformed JSON on the larger grader output. Enabled the provider's **JSON mode** plus a bigger token budget, keeping the validate-and-retry safety net. Cheap model, reliable structure. |

## Recurring principles

- Use the lightest tool that fits; do not add a dependency (database, framework, feature) the task does not need.
- Do not trust raw model output: validate, retry, and degrade gracefully.
- Ground decisions (design, grade calibration) in real references, not vibes.
- Be honest in the UI about what is live vs demo.
- Match scope to a "mini product"; capture the rest as a roadmap instead of building it.
