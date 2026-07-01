# Prompt Engineering Log

The actual prompts behind the three tools, how each evolved, and what failed along the way. Prompts live in [`lib/prompts.ts`](../lib/prompts.ts) and [`lib/grade.ts`](../lib/grade.ts).

---

## 1. Lesson Prep: grade calibration

**Goal:** a topic + grade level should produce a lesson plan whose vocabulary, abstraction, and cognitive demand match the grade.

**v1 (what I tried first):** a single line in the system prompt:

```
Calibrate vocabulary, depth, and examples to grade {grade}.
```

**What it produced:** answers changed only a little between, say, grade 3 and grade 9. "Grade 6" is a bare number the model interprets loosely, so calibration was weak and inconsistent.

**v2 (what I changed and why):** I replaced the bare number with a per-band **grade profile** grounded in real educational-science frameworks rather than my own guesses, so the model gets concrete, consistent anchors ([`lib/grade.ts`](../lib/grade.ts)):

- Reading level: CCSS recalibrated Lexile bands (grades 2-3: 420-820L, 6-8: 925-1185L, 11-CCR: 1185-1385L).
- Cognitive stage: Piaget (concrete operational ~7-11 vs. formal operational ~11+).
- Cognitive demand: Bloom's revised taxonomy (remember/understand/apply then analyze/evaluate/create).

Example of the injected profile for grade 3 vs grade 11:

```
Grade-level calibration for grade 3 (band 2-3).
Target reading level: CCSS/Lexile 420-820L.
- Short sentences (about 8-12 words), mostly everyday words...
- Piaget concrete operational: reason with concrete, hands-on examples...
- Bloom emphasis: understand and apply...
```
```
Grade-level calibration for grade 11 (band 11-12).
Target reading level: CCSS/Lexile 1185-1385L...
- Sophisticated sentences and abstraction; expect nuance...
- Piaget formal operational (advanced): full abstract and hypothetical reasoning.
- Bloom emphasis: evaluate and create...
```

**What I deliberately did NOT do:** add a shallow readability check (e.g. "grade 3 sentences must be shorter than grade 11") as verification. It gives false confidence; genuine verification would be an LLM judge calibrated to teacher ratings.

---

## 2. Student Chatbot: practice mode

**Goal:** in practice mode the tutor should guide the student to the answer, never hand it over.

**v1:**

```
PRACTICE MODE IS ON. The student is working a practice problem. Do NOT give
the final answer. Give one small hint or a guiding question at a time, and ask
them to try the next step. Only confirm once they reach it themselves.
```

**What failed (a real observed bug):** when the student asked a follow-up question (not an answer), the model treated it as if the student had answered correctly, praised them ("looks like you got my hint"), and then revealed the answer. The prompt did not stop the model from assuming the student's answer or from being "helpful" by giving it away.

**v2 (what I changed and why):** I made the model classify the student's message first, and forbade crediting anything the student did not actually write:

```
PRACTICE MODE IS ON. Your goal is to guide the student to discover the answer
themselves. You NEVER state the answer.
Before replying, silently classify the student's LAST message as one of:
(a) an ATTEMPT at the answer, (b) a QUESTION or request for help,
(c) 'I don't know' / confusion.
Hard rules:
- Treat something as the student's answer ONLY if their own words explicitly
  contain it. Asking a question is NOT an answer. Never assume, complete,
  rephrase, or invent the student's answer, and never say they are correct
  unless their message truly stated the correct answer.
- If (b) or (c): give exactly ONE small hint or guiding sub-question ... WITHOUT
  naming the answer or any part of it.
- ...
- Ask exactly ONE question, then stop and wait.
```

**A second, related fix (not a prompt, a harness fix):** switching the grade mid-conversation still echoed the previous grade's answer, because the whole chat history was sent. I made the chat reset when grade or mode changes, so the new grade profile actually drives the reply.

---

## 3. Essay Grader: structured output and reliability

**Goal:** paste an essay, get scores across the teacher-selected criteria, inline feedback that quotes the essay, and a student-facing summary, as strict JSON.

**Prompt (current, criteria are injected from the teacher's selection):**

```
You are an experienced, fair teacher giving structured feedback on a student's essay.
Write ALL output text in {language}.
Grade across EXACTLY these {n} criteria, each scored 0-5, using these exact names
in order: {selected criterion labels}.
Be specific and kind. Inline feedback MUST quote short excerpts taken verbatim
from the student's essay and comment on each.
The summary is addressed TO the student: encouraging, naming 1-2 strengths and
1-2 concrete next steps.
Return ONLY a single JSON object (no markdown, no code fences) with EXACTLY this shape:
{ "overall": number, "criteria": [ { "name", "score", "max": 5, "comment" } ],
  "inlineFeedback": [ { "quote", "comment" } ], "summaryForStudent": string }
```

**What failed (real):** on DeepSeek, the larger grader output intermittently came back as malformed or truncated JSON ("Expected ',' or '}' ... position 1800"). The app fell back to demo output with an honest note, so it never crashed, but the result was not real.

**What I changed and why:**
1. Enabled the provider's **JSON mode** (`response_format: { type: "json_object" }`) for OpenAI-compatible providers, which forces valid JSON, with a plain-call fallback for providers that do not support it.
2. Raised the token budget to 4096 so long outputs are not truncated.
3. Kept the **parse -> validate against a zod schema -> retry once with the error fed back** loop as the safety net.

---

## The harness principle behind all three

Model output is never trusted raw. For the two structured tools the flow is: ask, extract the JSON, validate it against a `zod` schema, and if it is malformed, retry once with the specific error appended to the prompt. If it still fails, degrade to a deterministic demo result with an honest note rather than showing an error. This is why the app can use a cheap model and still behave predictably.
