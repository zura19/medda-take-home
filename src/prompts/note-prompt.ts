import type { Prompt } from "../lib/llm";
import type { Transcript } from "../lib/transcripts";

// TODO (Part 4): Rewrite this prompt so the generated note follows NOTE_SPEC.md.
// Change the signature, add a system prompt, split it into several prompts, add examples...
// It's up to you. Keep prompt text in this folder.
export function buildNotePrompt(t: Transcript): Prompt {
  return {
    user: `Summarize this conversation between a doctor and a patient.\n\n${t.transcript}`,
  };
}
