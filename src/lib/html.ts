/**
 * Dependency-free HTML helpers. Kept separate from sanitize.ts so client bundles
 * that only need to flatten markup don't pull the sanitizer in with them.
 */

/** True when the string carries markup rather than being legacy plain text. */
export function isHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value ?? "");
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Plain-text version, for previews and line-clamped summaries.
 *
 * Safe without sanitising because the result is rendered as text — React escapes
 * it — never fed back into dangerouslySetInnerHTML.
 */
export function toPlainText(value: string): string {
  if (!value) return "";
  if (!isHtml(value)) return value;
  return value
    .replace(/<li[^>]*>/gi, " • ")
    .replace(/<\/(p|h[1-6]|li|blockquote|div)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
