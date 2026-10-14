import { complete } from "./llm";
import { buildNotePrompt } from "../prompts/note-prompt";
import type { Language, Transcript } from "./transcripts";

/**
 * Generates a clinical note for a transcript, in the requested note language.
 *
 * TODO (Parts 3 and 4): This is only a minimal starting point, and it ignores `language`.
 * Design the generation however you think is best: one LLM call or several, JSON output
 * that you render to text in code, a self-check step, etc. Whatever you do inside,
 * the function must return the note as plain text that follows NOTE_SPEC.md, in `language`.
 */
export async function generateNote(transcript: Transcript, language: Language): Promise<string> {
  return complete(buildNotePrompt(transcript));
}
