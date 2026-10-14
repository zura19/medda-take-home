"use client";

import { NoteView } from "./components/NoteView";
import { useHomePage } from "../hooks/useHomePage";

export default function Home() {
  const {
    transcripts,
    selectedId,
    selected,
    transcriptTurns,
    noteLanguage,
    note,
    error,
    loading,
    transcriptsLoading,
    transcriptsError,
    selectTranscript,
    changeNoteLanguage,
    generate,
  } = useHomePage();

  return (
    <main className="layout">
      <aside className="sidebar" aria-label="Visit transcripts" tabIndex={0}>
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
                onClick={() => selectTranscript(t)}
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

      <section className="panel" aria-label="Transcript conversation" tabIndex={0} key={selectedId}>
        <h2>Transcript</h2>
        {selected ? (
          <ol className="transcript" lang={selected.language}>
            {transcriptTurns.map((turn, index) => (
              <li className={`transcript-turn ${turn.role}`} key={`${selected.id}-${index}`}>
                {turn.speaker && <span className="transcript-speaker">{turn.speaker}</span>}
                <p>{turn.text}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="muted">No transcript selected.</p>
        )}
      </section>

      <section className="panel note-panel" aria-label="Clinical note" tabIndex={0}>
        <div className="panel-header">
          <h2>Clinical note</h2>
          <label className="language-selector">
            Note language
            <select
              value={noteLanguage}
              disabled={!selectedId}
              onChange={(event) => changeNoteLanguage(event.target.value as "en" | "ka")}
            >
              <option value="en">English</option>
              <option value="ka">Georgian</option>
            </select>
          </label>
          <button
            className="primary"
            onClick={generate}
            disabled={!selectedId || loading}
          >
            {loading ? "Generating…" : "Generate note"}
          </button>
        </div>
        <div className="note-content">
          {error && <p className="error">{error}</p>}
          {note ? (
            <NoteView note={note} />
          ) : (
            !loading && !error && <p className="muted">No note yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
