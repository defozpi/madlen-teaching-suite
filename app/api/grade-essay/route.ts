import { gradeEssay } from "@/lib/llm";
import { LangSchema } from "@/lib/schemas";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const BodySchema = z.object({
  essay: z.string().min(20, "Please paste a longer essay (at least 20 characters).").max(12000),
  lang: LangSchema,
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const { essay, lang } = parsed.data;
  const result = await gradeEssay(essay, lang);
  return Response.json(result);
}
