// Shared helper: pull a JSON object out of a model's text response, tolerating
// stray prose or code fences. Used by every provider's structured-output path.
export function extractJSON(raw: string): unknown {
  const fenced = raw.replace(/```(?:json)?/gi, "");
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("no JSON object found in model output");
  }
  return JSON.parse(fenced.slice(start, end + 1));
}
