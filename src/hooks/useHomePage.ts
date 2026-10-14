"use client";

import { useEffect, useRef, useState } from "react";
import type { Language, Transcript } from "../lib/transcripts";

function getTranscriptTurns(transcript: string) {
  return transcript.split(/\r?\n(?=(?:Doctor|Patient|ექიმი|პაციენტი):)/).map((turn) => {
    const match = turn.match(/^(Doctor|Patient|ექიმი|პაციენტი):\s*([\s\S]*)$/);
    const speaker = match?.[1] ?? "";
    return {
      speaker,
      text: match?.[2] ?? turn,
      role: speaker === "Doctor" || speaker === "ექიმი" ? "doctor" : speaker ? "patient" : "unknown",
    };
  });
}

export function useHomePage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteLanguage, setNoteLanguage] = useState<Language>("en");
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
        body: JSON.stringify({ transcriptId: selectedId, language: noteLanguage }),
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

  function selectTranscript(transcript: Transcript) {
    generationId.current++;
    setLoading(false);
    setSelectedId(transcript.id);
    setNoteLanguage(transcript.language);
    setNote("");
    setError(null);
  }

  function changeNoteLanguage(language: Language) {
    generationId.current++;
    setLoading(false);
    setNote("");
    setError(null);
    setNoteLanguage(language);
  }

  return {
    transcripts,
    selectedId,
    selected,
    transcriptTurns: selected ? getTranscriptTurns(selected.transcript) : [],
    noteLanguage,
    note,
    error,
    loading,
    transcriptsLoading,
    transcriptsError,
    selectTranscript,
    changeNoteLanguage,
    generate,
  };
}
