import DOMPurify from "isomorphic-dompurify";

// Day descriptions are authored as rich text and travel between accounts through the
// marketplace, so any HTML that gets stored or rendered has to be scrubbed first.
const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "blockquote",
  "h1", "h2", "h3", "h4",
  "ul", "ol", "li",
  "a", "code", "pre", "span", "hr",
];

const ALLOWED_ATTR = ["href", "target", "rel", "class"];

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty ?? "", {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#)/i,
    FORBID_ATTR: ["style", "srcset"],
  });
}

/** True when the string carries markup rather than being legacy plain text. */
export function isHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value ?? "");
}

/** Legacy descriptions were plain text; wrap them so rendering is uniform. */
export function toHtml(value: string): string {
  if (!value) return "";
  if (isHtml(value)) return sanitizeHtml(value);
  const escaped = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<p>${escaped.replace(/\n/g, "<br />")}</p>`;
}

/** Plain-text version, for previews and line-clamped summaries. */
export function toPlainText(value: string): string {
  if (!value) return "";
  if (!isHtml(value)) return value;
  return sanitizeHtml(value)
    .replace(/<li>/gi, " • ")
    .replace(/<\/(p|h[1-4]|li|blockquote)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
