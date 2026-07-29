/**
 * Joins class names, dropping falsy entries.
 *
 * Deliberately not tailwind-merge: the primitives own their own base classes and
 * accept `className` only for layout (margin, width, grid placement), so there is
 * nothing to de-conflict. Keeping it dependency-free avoids shipping 40kb to a PWA
 * for string concatenation.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
