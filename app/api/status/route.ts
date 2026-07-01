import { providerName } from "@/lib/llm";

export const runtime = "nodejs";
// Must read env at request time, not be prerendered at build (when no key exists).
export const dynamic = "force-dynamic";

// Lets the client show an honest "Live (Claude)" vs "Demo mode" badge without
// ever exposing the key itself.
export async function GET() {
  return Response.json({ provider: providerName() });
}
