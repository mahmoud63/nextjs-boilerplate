import { toHtml } from "@/lib/sanitize";

/** Renders a stored description, handling both rich text and legacy plain strings. */
export default function RichText({
  html,
  className = "",
}: {
  html?: string | null;
  className?: string;
}) {
  if (!html) return null;
  return (
    <div
      className={`rich-text ${className}`}
      dangerouslySetInnerHTML={{ __html: toHtml(html) }}
    />
  );
}
