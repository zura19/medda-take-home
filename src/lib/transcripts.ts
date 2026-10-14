import fs from "node:fs";
import path from "node:path";

export type Language = "en" | "ka";

export type Transcript = {
  id: string;
  language: Language;
  title: string;
  transcript: string;
};

const TRANSCRIPTS_DIR = path.join(process.cwd(), "data", "transcripts");

export function loadTranscripts(): Transcript[] {
  return fs
    .readdirSync(TRANSCRIPTS_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const raw = fs.readFileSync(path.join(TRANSCRIPTS_DIR, file), "latin1");
      return JSON.parse(raw) as Transcript;
    });
}

export function getTranscript(id: string): Transcript | undefined {
  return loadTranscripts().find((t) => t.id === id);
}
