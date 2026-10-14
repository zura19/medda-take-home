export const HEADINGS = {
  en: [
    "CHIEF COMPLAINT",
    "HISTORY OF PRESENT ILLNESS",
    "CURRENT MEDICATIONS",
    "ALLERGIES",
    "VITALS AND EXAM",
    "ASSESSMENT",
    "PLAN",
    "FOLLOW-UP",
    "PATIENT SUMMARY",
  ],
  ka: [
    "მთავარი ჩივილი",
    "ანამნეზი",
    "მიმდინარე მედიკამენტები",
    "ალერგია",
    "ვიტალური მაჩვენებლები და გასინჯვა",
    "შეფასება",
    "გეგმა",
    "განმეორებითი ვიზიტი",
    "შეჯამება პაციენტისთვის",
  ],
};

export function parseNote(note: string) {
  const text = note.replace(/\r\n/g, "\n").trim();
  const lines = text.split("\n");
  const language = lines.some((line) => HEADINGS.ka.includes(line.trim()))
    ? "ka"
    : "en";
  const headings = HEADINGS[language];
  const headingPattern = new RegExp(
    `^[\\t ]*(${headings.join("|")})[\\t ]*$`,
    "gm",
  );
  const matches = [...text.matchAll(headingPattern)];
  // Each section runs from its heading to the next heading (or the end).
  const sections = matches.map((match, index) => ({
    heading: match[1],
    text: text
      .slice(
        match.index + match[0].length,
        matches[index + 1]?.index ?? text.length,
      )
      .trim(),
  }));
  const preamble = text.slice(0, matches[0]?.index ?? text.length).trim();
  const structured =
    !preamble &&
    sections.length === headings.length &&
    sections.every((section, index) => section.heading === headings[index]);

  const missingPhrase =
    language === "en" ? "Not mentioned" : "არ არის აღნიშნული";

  const missingCount = sections.filter(
    (section) => section.text === missingPhrase || !section.text,
  ).length;

  return { language, sections, structured, missingPhrase, missingCount };
}
