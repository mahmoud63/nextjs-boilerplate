/**
 * Anton has no tabular figures, so a "1" is narrower than an "8" and a running
 * clock jitters as it counts. Boxing every character at a fixed width pins the
 * digits in place regardless of the font.
 */
export default function FixedDigits({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  return (
    <span className={className} aria-hidden>
      {value.split("").map((char, i) => (
        <span
          key={i}
          className={`inline-block text-center ${
            char === ":" || char === "." ? "w-[0.26em]" : "w-[0.56em]"
          }`}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
