/**
 * Essay-grader evaluation harness.
 *
 * Carries over the orchestra evaluation mindset to this project. It checks two
 * things that matter for a grading tool:
 *   1. Structural validity: every result has 4 criteria, an in-range overall
 *      score, inline feedback, and a student summary (the zod schema already
 *      enforces shape; this asserts the product-level expectations).
 *   2. Consistency (a pass^k style check): grade each essay twice and require
 *      the overall scores to stay within a tolerance, since an unstable grader
 *      is not trustworthy.
 *
 * Runs against Claude if ANTHROPIC_API_KEY is set, otherwise the deterministic
 * demo provider (where consistency is exact).
 *
 * Usage:  npm run eval
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gradeEssay } from "../lib/llm";
import type { Lang } from "../lib/schemas";

type Case = { id: string; lang: Lang; essay: string };

const TOLERANCE = 15; // max allowed gap between two runs' overall scores

async function run() {
  const cases: Case[] = JSON.parse(
    readFileSync(join(process.cwd(), "eval", "cases.json"), "utf8"),
  );

  let passed = 0;
  console.log("\n=== Madlen essay-grader eval ===");

  for (const c of cases) {
    const a = await gradeEssay(c.essay, c.lang);
    const b = await gradeEssay(c.essay, c.lang);

    const structureOk =
      a.data.criteria.length === 4 &&
      a.data.overall >= 0 &&
      a.data.overall <= 100 &&
      a.data.inlineFeedback.length >= 1 &&
      a.data.summaryForStudent.trim().length > 0;

    const gap = Math.abs(a.data.overall - b.data.overall);
    const consistentOk = gap <= TOLERANCE;

    const ok = structureOk && consistentOk;
    if (ok) passed++;

    console.log(
      `[${ok ? "PASS" : "FAIL"}] ${c.id.padEnd(24)} ` +
        `provider=${a.provider} overall=${a.data.overall}/${b.data.overall} ` +
        `gap=${gap} structure=${structureOk} consistent=${consistentOk}`,
    );
  }

  console.log("-".repeat(60));
  console.log(`${passed}/${cases.length} cases passed\n`);
  if (passed !== cases.length) process.exitCode = 1;
}

run().catch((e) => {
  console.error("eval failed:", e);
  process.exit(1);
});
