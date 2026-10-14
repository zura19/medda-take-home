"use client";

import { useEffect, useState } from "react";
import { NoteView } from "./components/NoteView";

type TranscriptItem = {
  id: string;
  language: "en" | "ka";
  title: string;
  transcript: string;
};

export default function Home() {
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/transcripts")
      .then((res) => res.json())
      .then(setTranscripts);
  }, []);

  const selected = transcripts.find((t) => t.id === selectedId);

  async function generate() {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    setNote("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcriptId: selectedId }),
      });
      const data = await res.json();
      setNote(data.note);
      setLoading(false);
    } catch {
      setError("Failed to generate the note. Please try again.");
    }
  }

  return (
    <main className="layout">
      <aside className="sidebar">
        <h1>Medda Notes</h1>
        <p className="muted">Pick a visit transcript</p>
        <ul className="list">
          {transcripts.map((t) => (
            <li key={t.id}>
              <button
                className={t.id === selectedId ? "item active" : "item"}
                onClick={() => {
                  setSelectedId(t.id);
                  setNote("");
                  setError(null);
                }}
              >
                <span className="badge">
                  {t.language === "ka" ? "EN" : "KA"}
                </span>
                <span>{t.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="panel">
        <h2>Transcript</h2>
        {selected ? (
          <div className="transcript">{selected.transcript}</div>
        ) : (
          <p className="muted">No transcript selected.</p>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Clinical note</h2>
          {/* TODO (Part 3): add a note language selector (English / Georgian) */}
          <button
            className="primary"
            onClick={generate}
            disabled={!selectedId || loading}
          >
            {loading ? "Generating…" : "Generate note"}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {note ? (
          <NoteView note={note} />
        ) : (
          !loading && <p className="muted">No note yet.</p>
        )}
      </section>
    </main>
  );
}
