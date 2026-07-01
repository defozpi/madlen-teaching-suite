// Tiny, safe Markdown renderer for chat replies.
//
// Models return Markdown (**bold**, `code`, bullet lists, ### headings). The chat
// bubble was showing that raw, so the literal ** leaked into the UI. This renders
// the common subset. Security: we HTML-escape the whole string first, then inject
// only a fixed set of known-safe tags, so model output can never inject markup.

export function mdToSafeHtml(md: string): string {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // inline code `x`
  html = html.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  // bold **x** / __x__
  html = html.replace(/\*\*([^\n]+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^\n]+?)__/g, "<strong>$1</strong>");
  // headings (### x) -> bold line
  html = html.replace(/^#{1,6}\s*(.+)$/gm, "<strong>$1</strong>");
  // bullet markers at line start (- x / * x) -> bullet dot
  html = html.replace(/^\s*[-*]\s+/gm, "• ");
  // italic *x* / _x_ (after bold and bullets are handled)
  html = html.replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");
  html = html.replace(/(^|[\s(])_([^_\n]+?)_/g, "$1<em>$2</em>");

  return html;
}
