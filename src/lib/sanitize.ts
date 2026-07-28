import sanitize from "sanitize-html";
import { escapeHtml, isHtml } from "./html";

// Day descriptions are authored as rich text and travel between accounts through
// the marketplace, so any HTML that gets stored or rendered has to be scrubbed.
//
// sanitize-html parses with htmlparser2 and needs no DOM. The previous choice,
// isomorphic-dompurify, dragged jsdom into the server bundle, and jsdom's
// html-encoding-sniffer CommonJS-requires the now ESM-only @exodus/bytes — which
// crashed every route on Vercel with ERR_REQUIRE_ESM.
const OPTIONS: sanitize.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "u", "s", "blockquote",
    "h1", "h2", "h3", "h4",
    "ul", "ol", "li",
    "a", "code", "pre", "span", "hr",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    "*": ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href"],
  disallowedTagsMode: "discard",
  transformTags: {
    // Author-supplied links open elsewhere; never hand them the opener window.
    a: sanitize.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
  },
};

export function sanitizeHtml(dirty: string): string {
  return sanitize(dirty ?? "", OPTIONS);
}

/** Legacy descriptions were plain text; wrap them so rendering is uniform. */
export function toHtml(value: string): string {
  if (!value) return "";
  if (isHtml(value)) return sanitizeHtml(value);
  return `<p>${escapeHtml(value).replace(/\n/g, "<br />")}</p>`;
}

export { isHtml, toPlainText } from "./html";
