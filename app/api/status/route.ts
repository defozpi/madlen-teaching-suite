import { providerName } from "@/lib/llm";

export const runtime = "nodejs";

// Lets the client show an honest "Live (Claude)" vs "Demo mode" badge without
// ever exposing the key itself.
export async function GET() {
  return Response.json({ provider: providerName() });
}
