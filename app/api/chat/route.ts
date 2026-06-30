import { getChatReply } from "@/lib/llm";
import { LangSchema } from "@/lib/schemas";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
  grade: z.string().min(1).max(20),
  lang: LangSchema,
  practiceMode: z.boolean().default(false),
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
  const { messages, grade, lang, practiceMode } = parsed.data;
  const result = await getChatReply(messages, grade, lang, practiceMode);
  return Response.json({ reply: result.data, provider: result.provider, note: result.note });
}
