"use client";

import { useEffect, useRef, useState } from "react";
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
  const [transcriptsLoading, setTranscriptsLoading] = useState(true);
  const [transcriptsError, setTranscriptsError] = useState<string | null>(null);
  const generationId = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadTranscripts() {
      try {
        const res = await fetch("/api/transcripts", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load transcripts");

        const data = await res.json();
        if (!controller.signal.aborted) setTranscripts(data);
      } catch {
        if (!controller.signal.aborted) {
          setTranscriptsError(
            "Failed to load transcripts. Please reload the page to try again.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setTranscriptsLoading(false);
      }
    }

    loadTranscripts();
    return () => {
      controller.abort();
      generationId.current++;
    };
  }, []);

  const selected = transcripts.find((t) => t.id === selectedId);

  async function generate() {
    if (!selectedId) return;
    const requestId = ++generationId.current;
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
      if (requestId !== generationId.current) return;
      if (!res.ok) {
        setError(
          data.error || "Failed to generate the note. Please try again.",
        );
        return;
      }
      setNote(data.note);
    } catch {
      if (requestId === generationId.current) {
        setError("Failed to generate the note. Please try again.");
      }
    } finally {
      if (requestId === generationId.current) setLoading(false);
    }
  }

  return (
    <main className="layout">
      <aside className="sidebar">
        <h1>Medda Notes</h1>
        <p className="muted">Pick a visit transcript</p>
        {transcriptsLoading && (
          <p className="muted" role="status">
            Loading transcripts…
          </p>
        )}
        {transcriptsError && (
          <p className="error" role="alert">
            {transcriptsError}
          </p>
        )}
        {!transcriptsLoading &&
          !transcriptsError &&
          transcripts.length === 0 && (
            <p className="muted">No transcripts available.</p>
          )}
        <ul className="list">
          {transcripts.map((t) => (
            <li key={t.id}>
              <button
                className={t.id === selectedId ? "item active" : "item"}
                onClick={() => {
                  generationId.current++;
                  setLoading(false);
                  setSelectedId(t.id);
                  setNote("");
                  setError(null);
                }}
              >
                <span className="badge">
                  {t.language === "ka" ? "KA" : "EN"}
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
          !loading && !error && <p className="muted">No note yet.</p>
        )}
      </section>
    </main>
  );
}
