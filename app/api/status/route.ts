import { providerName, type Provider } from "@/lib/llm";

export const runtime = "nodejs";
// Must read env at request time, not be prerendered at build (when no key exists).
export const dynamic = "force-dynamic";
export const revalidate = 0;

function activeModel(p: Provider): string | null {
  if (p === "openai") return process.env.OPENAI_MODEL || "deepseek-chat";
  if (p === "anthropic") return process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  return null;
}

// Lets the client show an honest "Live · <model>" vs "Demo mode" badge without
// ever exposing the key itself. no-store so neither the CDN nor the browser
// serves a stale value after a key is added.
export async function GET() {
  const provider = providerName();
  return Response.json(
    { provider, model: activeModel(provider) },
    { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } },
  );
}
