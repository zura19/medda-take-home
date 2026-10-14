"use client";

import { useMemo, useState } from "react";
import { parseNote } from "../../helpers/note";

export function NoteView({ note }: { note: string }) {
  const [copyResult, setCopyResult] = useState<{
    note: string;
    message: string;
  } | null>(null);
  const [copying, setCopying] = useState(false);
  const { language, sections, structured, missingPhrase, missingCount } =
    useMemo(() => parseNote(note), [note]);

  async function copyNote() {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(note);
      setCopyResult({ note, message: "Copied to clipboard." });
    } catch {
      setCopyResult({
        note,
        message: "Could not copy. Select the note text and copy it manually.",
      });
    } finally {
      setTimeout(() => setCopyResult(null), 3000);
      setCopying(false);
    }
  }

  return (
    <div className="note-view">
      <div className="note-toolbar">
        <span className="note-meta">
          {structured
            ? `9 sections${missingCount ? ` · ${missingCount} with missing information` : ""}`
            : "Original note"}
        </span>
        <button className="copy-note" onClick={copyNote} disabled={copying}>
          {copying ? "Copying…" : "Copy note"}
        </button>
      </div>
      <p className="copy-status" role="status">
        {copyResult?.note === note ? copyResult.message : ""}
      </p>
      {structured ? (
        <div className="note-sections" lang={language}>
          {sections.map((section, index) => {
            const text = section.text.trim();
            const missing = text === missingPhrase || !text;
            return (
              <section
                className={`note-section${index === 8 ? " patient-summary" : ""}${missing ? " missing-information" : ""}`}
                key={section.heading}
              >
                <h3>{section.heading}</h3>
                <p>
                  {text ||
                    (language === "en"
                      ? "Section is empty in the generated note."
                      : "გენერირებულ ჩანაწერში სექცია ცარიელია.")}
                </p>
              </section>
            );
          })}
        </div>
      ) : (
        <>
          <p className="note-format-message">
            The section format could not be recognized. Showing the complete
            original note.
          </p>
          <pre className="note-raw">{note}</pre>
        </>
      )}
    </div>
  );
}
