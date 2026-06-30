import { getLessonPlan } from "@/lib/llm";
import { LangSchema } from "@/lib/schemas";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const BodySchema = z.object({
  topic: z.string().min(1).max(200),
  grade: z.string().min(1).max(20),
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
  const { topic, grade, lang } = parsed.data;
  const result = await getLessonPlan(topic, grade, lang);
  return Response.json(result);
}
