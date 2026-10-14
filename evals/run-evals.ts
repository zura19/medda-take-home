/**
 * Eval runner for generated clinical notes.
 *
 * Usage:
 *   npm run eval                 # generate notes with the current prompt, then check them
 *   npm run eval -- --cached     # re-check the notes already saved in outputs/ (no LLM calls)
 *   npm run eval -- --only en-01 # run a single transcript
 *
 * Generated notes are saved to outputs/<id>.txt so you can read them.
 */
import fs from "node:fs";
import path from "node:path";
import { loadEnvFile } from "node:process";
import { loadTranscripts, type Language, type Transcript } from "../src/lib/transcripts";
import { generateNote } from "../src/lib/notes";

const OUTPUT_DIR = path.join(process.cwd(), "outputs");
const EXPECTED_DIR = path.join(process.cwd(), "evals", "expected");

export const HEADINGS: Record<Language, string[]> = {
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

export const NOT_MENTIONED: Record<Language, string> = {
  en: "Not mentioned",
  ka: "არ არის აღნიშნული",
};

/** What we expect inside one section of the note. */
export type SectionExpectation = {
  /** Each string must appear in the section (case-insensitive). */
  mustInclude?: string[];
  /** None of these strings may appear in the section (case-insensitive). */
  mustNotInclude?: string[];
  /** The section must be exactly the "not mentioned" phrase for the note's language. */
  notMentioned?: boolean;
};

/** Contents of evals/expected/<id>.json. Section keys are headings in the transcript's language. */
export type Expected = {
  id: string;
  sections: Record<string, SectionExpectation>;
};

export type CheckResult = {
  name: string;
  passed: boolean;
  detail?: string;
};

// ---------------------------------------------------------------------------
// Example check (already implemented): the note is written in the right language.
// ---------------------------------------------------------------------------
export function checkLanguage(note: string, language: Language): CheckResult {
  const georgian = (note.match(/[ა-ჿ]/g) ?? []).length;
  const latin = (note.match(/[A-Za-z]/g) ?? []).length;
  const letters = georgian + latin;
  const georgianShare = letters === 0 ? 0 : georgian / letters;

  const passed = letters > 0 && (language === "ka" ? georgianShare > 0.8 : georgianShare < 0.05);
  return {
    name: "language",
    passed,
    detail: `${Math.round(georgianShare * 100)}% Georgian letters, expected ${language}`,
  };
}

// ---------------------------------------------------------------------------
// Section, structure, and content checks.
// ---------------------------------------------------------------------------

/**
 * Split a note into sections.
 * Returns an object keyed by heading (as written in HEADINGS[language]) whose
 * value is the trimmed text of that section. Headings that are missing from
 * the note should simply be missing from the result.
 */
export function parseSections(note: string, language: Language): Record<string, string> {
  const lines = note.replace(/\r\n/g, "\n").split("\n");
  const headings = lines.flatMap((line, index) =>
    HEADINGS[language].includes(line) ? [{ heading: line, index }] : [],
  );
  return Object.fromEntries(headings.map(({ heading, index }, i) => [
    heading,
    lines.slice(index + 1, headings[i + 1]?.index).join("\n").trim(),
  ]));
}

/**
 * Structure check: all 9 headings are present, in the right order, and the note
 * contains no Markdown (see NOTE_SPEC.md).
 * You may return several CheckResults if that makes failures easier to read.
 */
export function checkStructure(note: string, language: Language): CheckResult[] {
  const text = note.replace(/\r\n/g, "\n").trim();
  const headings = HEADINGS[language];
  const found = text.split("\n").filter((line) => headings.includes(line));
  const sections = parseSections(text, language);
  const reconstructed = headings.map((heading) => `${heading}\n${sections[heading] ?? ""}`).join("\n\n");
  const markdown = /(^\s*(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|>|```|~~~|\|))|\*\*|__|`|\[[^\]]+\]\([^)]+\)/m;
  return [
    { name: "headings", passed: found.length === headings.length && found.every((heading, i) => heading === headings[i]), detail: "Expected all 9 exact headings once, in order" },
    { name: "section content", passed: headings.every((heading) => Boolean(sections[heading])), detail: "Every section must have text" },
    { name: "spacing", passed: text === reconstructed, detail: "Expected section text below each heading, one empty line between sections, and no preamble" },
    { name: "plain text", passed: !markdown.test(text), detail: "Markdown formatting is not allowed" },
  ];
}

/**
 * Content check against evals/expected/<id>.json.
 * Return one CheckResult per rule, with a `detail` that explains what failed,
 * e.g. `PLAN should not include "amoxicillin"`.
 */
export function checkExpectations(
  sections: Record<string, string>,
  expected: Expected,
  language: Language,
): CheckResult[] {
  return Object.entries(expected.sections).flatMap(([heading, rules]) => {
    const content = sections[heading];
    const lower = content?.toLowerCase();
    const results: CheckResult[] = [];
    for (const phrase of rules.mustInclude ?? []) {
      results.push({ name: "must include", passed: Boolean(lower?.includes(phrase.toLowerCase())), detail: `${heading} should include "${phrase}"` });
    }
    for (const phrase of rules.mustNotInclude ?? []) {
      results.push({ name: "must not include", passed: Boolean(content) && !lower?.includes(phrase.toLowerCase()), detail: `${heading} must exist and should not include "${phrase}"` });
    }
    if (rules.notMentioned) {
      results.push({ name: "not mentioned", passed: content === NOT_MENTIONED[language], detail: `${heading} should be exactly "${NOT_MENTIONED[language]}"` });
    }
    return results;
  });
}

// ---------------------------------------------------------------------------
// Runner (you may change this, but you shouldn't need to).
// ---------------------------------------------------------------------------

function loadExpected(id: string): Expected | null {
  const file = path.join(EXPECTED_DIR, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as Expected;
}

async function getNote(t: Transcript, cached: boolean): Promise<string> {
  const file = path.join(OUTPUT_DIR, `${t.id}.txt`);
  if (cached) {
    if (!fs.existsSync(file)) throw new Error(`No cached note at ${file}. Run without --cached first.`);
    return fs.readFileSync(file, "utf8");
  }
  const note = await generateNote(t, t.language);
  fs.writeFileSync(file, note, "utf8");
  return note;
}

function runCheck(name: string, fn: () => CheckResult | CheckResult[]): CheckResult[] {
  try {
    const result = fn();
    return Array.isArray(result) ? result : [result];
  } catch (err) {
    return [{ name, passed: false, detail: `check crashed: ${(err as Error).message}` }];
  }
}

async function main() {
  if (fs.existsSync(".env.local")) loadEnvFile(".env.local");
  const args = process.argv.slice(2);
  const cached = args.includes("--cached");
  const onlyIndex = args.indexOf("--only");
  const only = onlyIndex >= 0 ? args[onlyIndex + 1] : null;

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const transcripts = loadTranscripts().filter((t) => !only || t.id === only);
  if ((onlyIndex >= 0 && !only) || transcripts.length === 0) throw new Error("No matching transcript. Check --only <id>.");

  let total = 0;
  let passed = 0;

  for (const t of transcripts) {
    let note = "";
    let noteFailed = false;
    try {
      note = await getNote(t, cached);
    } catch (err) {
      console.log(`\n✗ ${t.id}  could not get note: ${(err as Error).message}`);
      noteFailed = true;
    }

    const results: CheckResult[] = [
      ...runCheck("language", () => checkLanguage(note, t.language)),
      ...runCheck("structure", () => checkStructure(note, t.language)),
    ];

    const expected = loadExpected(t.id);
    if (expected) {
      results.push(
        ...runCheck("expectations", () =>
          checkExpectations(parseSections(note, t.language), expected, t.language),
        ),
      );
    } else {
      results.push({ name: "expectations", passed: false, detail: `missing evals/expected/${t.id}.json` });
    }

    if (noteFailed) {
      results.forEach((result) => {
        result.passed = false;
        result.detail = "Could not evaluate: no note available";
      });
    }
    const ok = results.filter((r) => r.passed).length;
    total += results.length;
    passed += ok;

    console.log(`\n${ok === results.length ? "✓" : "✗"} ${t.id} (${t.title})  ${ok}/${results.length}`);
    for (const r of results.filter((r) => !r.passed)) {
      console.log(`    ✗ ${r.name}${r.detail ? `: ${r.detail}` : ""}`);
    }
  }

  const rate = total === 0 ? 0 : Math.round((passed / total) * 100);
  console.log(`\nPassed ${passed}/${total} checks (${rate}%)`);
  if (passed < total) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((err) => {
    console.error((err as Error).message);
    process.exitCode = 1;
  });
}
