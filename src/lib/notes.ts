import { complete } from "./llm";
import { buildNotePrompt } from "../prompts/note-prompt";
import type { Language, Transcript } from "./transcripts";

/**
 * Generates a clinical note for a transcript, in the requested note language.
 * Uses one model call with the format and content rules from NOTE_SPEC.md.
 */
export async function generateNote(
  transcript: Transcript,
  language: Language,
): Promise<string> {
  return complete(buildNotePrompt(transcript, language));
}
