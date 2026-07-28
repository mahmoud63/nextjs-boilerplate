"use client";

import { useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";

const TOOLBAR = [
  [{ header: [2, 3, false] }],
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "link"],
  ["clean"],
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  // Kept in a ref so the Quill init effect doesn't need onChange as a dependency.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;

    // Quill touches document on import, so it can only load in the browser.
    import("quill").then(({ default: Quill }) => {
      if (cancelled || !containerRef.current || quillRef.current) return;

      const editor = document.createElement("div");
      containerRef.current.appendChild(editor);

      const quill = new Quill(editor, {
        theme: "snow",
        placeholder: placeholder ?? "Add warm-up, block targets, cool-down…",
        modules: { toolbar: TOOLBAR },
      });

      if (value) {
        quill.clipboard.dangerouslyPasteHTML(value, "silent");
      }

      quill.on("text-change", () => {
        const html = quill.getSemanticHTML();
        // Quill reports an empty document as a lone empty paragraph.
        onChangeRef.current(quill.getText().trim().length === 0 ? "" : html);
      });

      quillRef.current = quill;
    });

    return () => {
      cancelled = true;
      quillRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
    // Mounts once per editor instance; `value` is only read for the initial fill.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="rich-text-editor" />;
}
