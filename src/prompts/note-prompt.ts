import type { Prompt } from "../lib/llm";
import type { Language, Transcript } from "../lib/transcripts";

// Preserve the original prompt for the Part 6 baseline comparison.
export function buildOriginalNotePrompt(t: Transcript): Prompt {
  return {
    user: `Summarize this conversation between a doctor and a patient.\n\n${t.transcript}`,
  };
}

// TODO (Part 4): Improve clinical content rules beyond language and structure.
export function buildNotePrompt(t: Transcript, language: Language): Prompt {
  const headings = language === "en"
    ? ["CHIEF COMPLAINT", "HISTORY OF PRESENT ILLNESS", "CURRENT MEDICATIONS", "ALLERGIES", "VITALS AND EXAM", "ASSESSMENT", "PLAN", "FOLLOW-UP", "PATIENT SUMMARY"]
    : ["მთავარი ჩივილი", "ანამნეზი", "მიმდინარე მედიკამენტები", "ალერგია", "ვიტალური მაჩვენებლები და გასინჯვა", "შეფასება", "გეგმა", "განმეორებითი ვიზიტი", "შეჯამება პაციენტისთვის"];
  return {
    system: `Write a clinical note entirely in ${language === "en" ? "English" : "Georgian"}, regardless of the transcript's language. Translate the content, not just the headings. Use only facts stated in the transcript.
Return plain text without Markdown or introductory text. Use these exact headings in order, each on its own line, followed by its content. Separate sections with one blank line:
${headings.join("\n")}
If information for a section is absent, write exactly "${language === "en" ? "Not mentioned" : "არ არის აღნიშნული"}".
For explicitly absent allergies use "${language === "en" ? "No known allergies" : "ალერგია არ აქვს"}"; for explicitly absent current medications use "${language === "en" ? "None" : "არ იღებს"}".`,
    user: buildOriginalNotePrompt(t).user,
  };
}
