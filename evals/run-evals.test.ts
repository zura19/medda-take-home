import { HEADINGS } from "../src/helpers/note";
import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { NOT_MENTIONED, checkLanguage, checkStructure, checkPatientSummary, checkExpectations, parseSections, type Expected } from "./run-evals";

for (const language of ["en", "ka"] as const) {
  const note = HEADINGS[language].map((heading) => `${heading}\n${NOT_MENTIONED[language]}`).join("\n\n");
  test(`${language}: valid sections and Windows line endings`, () => {
    assert.equal(Object.keys(parseSections(note, language)).length, 9);
    assert.equal(parseSections(note, language)[HEADINGS[language][0]], NOT_MENTIONED[language]);
    assert.ok(checkStructure(note.replace(/\n/g, "\r\n"), language).every((r) => r.passed));
    assert.ok(checkLanguage(note, language).passed);
  });
  test(`${language}: missing, duplicated, reordered, empty, or Markdown sections fail`, () => {
    const blocks = note.split("\n\n");
    const broken = [
      blocks.slice(1).join("\n\n"),
      `${note}\n\n${blocks[0]}`,
      [...blocks].reverse().join("\n\n"),
      note.replace(`${HEADINGS[language][0]}\n${NOT_MENTIONED[language]}`, HEADINGS[language][0]),
      note.replace(NOT_MENTIONED[language], `**${NOT_MENTIONED[language]}**`),
      `Introduction\n${note}`,
      note.replace("\n\n", "\n"),
    ];
    for (const value of broken) assert.ok(checkStructure(value, language).some((r) => !r.passed));
    assert.equal(checkLanguage("", language).passed, false);
    assert.equal(checkLanguage("123", language).passed, false);
    const expected = { id: "test", sections: { [HEADINGS[language][0]]: { notMentioned: true } } };
    assert.ok(checkExpectations(parseSections(note, language), expected, language)[0].passed);
    assert.equal(checkExpectations({ [HEADINGS[language][0]]: `${NOT_MENTIONED[language]}.` }, expected, language)[0].passed, false);
  });
  test(`${language}: patient summary needs 3–5 sentences, including decimal measurements`, () => {
    const sentences = language === "en"
      ? ["Your temperature is 38.4 °C.", "Take your medicine!", "Can you return in 2 weeks?", "Drink fluids.", "Rest at home.", "Call tomorrow."]
      : ["თქვენი ტემპერატურაა 38.4 °C.", "მიიღეთ წამალი!", "მოხვალთ 2 კვირაში?", "მიიღეთ სითხე.", "დაისვენეთ სახლში.", "დარეკეთ ხვალ."];
    const withSummary = (summary: string) => note.replace(`${HEADINGS[language][8]}\n${NOT_MENTIONED[language]}`, `${HEADINGS[language][8]}\n${summary}`);
    for (const count of [2, 3, 5, 6]) {
      const result = checkPatientSummary(withSummary(sentences.slice(0, count).join("\r\n")), language);
      assert.equal(result.passed, count >= 3 && count <= 5);
      assert.ok(result.detail?.includes(`${count} sentences`));
    }
    for (const summary of ["", "  ", "... ! ?", NOT_MENTIONED[language], sentences.join(" ").replace(/[.!?]/g, "")]) {
      assert.equal(checkPatientSummary(withSummary(summary), language).passed, false);
    }
    assert.equal(checkPatientSummary(note.split("\n\n").slice(0, -1).join("\n\n"), language).passed, false);
  });
}

test("content rules are case-insensitive and missing sections cannot pass exclusions", () => {
  const expected = { id: "test", sections: { PLAN: { mustInclude: ["500 mg"], mustNotInclude: ["amoxicillin"] } } };
  assert.ok(checkExpectations({ PLAN: "AZITHROMYCIN 500 MG" }, expected, "en").every((r) => r.passed));
  assert.ok(checkExpectations({}, expected, "en").every((r) => !r.passed));
  assert.ok(checkExpectations({ PLAN: "Amoxicillin" }, expected, "en").every((r) => !r.passed));
});

test("all eight transcripts have expectations using valid headings", () => {
  const files = fs.readdirSync("data/transcripts").filter((file) => file.endsWith(".json"));
  assert.equal(files.length, 8);
  for (const file of files) {
    const transcript = JSON.parse(fs.readFileSync(path.join("data/transcripts", file), "utf8"));
    const expected: Expected = JSON.parse(fs.readFileSync(path.join("evals/expected", file), "utf8"));
    assert.equal(expected.id, transcript.id);
    const headings = HEADINGS[transcript.language as "en" | "ka"];
    assert.ok(Object.keys(expected.sections).every((heading) => headings.includes(heading)));
    assert.ok(checkExpectations({}, expected, transcript.language).length > 0);
  }
});

test("antibiotic deferral allows only complete approved statements", () => {
  const expected: Expected = JSON.parse(fs.readFileSync("evals/expected/ka-03.json", "utf8"));
  const planRules = expected.sections["გეგმა"];
  const rules: Expected = { id: "test", sections: { "გეგმა": {
    mustNotInclude: planRules.mustNotInclude,
    allowedMentions: planRules.allowedMentions,
  } } };
  const passes = (text: string) => checkExpectations({ "გეგმა": text }, rules, "ka")[0].passed;
  assert.ok(passes("გულმკერდის რენტგენოგრაფია."));
  for (const statement of planRules.allowedMentions!["ანტიბიოტიკ"]) {
    assert.ok(passes(`${statement}.`));
  }
  assert.equal(passes("დაიწყეთ ანტიბიოტიკი დღეს."), false);
  assert.equal(passes("ანტიბიოტიკოთერაპია გადადებულია რენტგენის პასუხამდე. დაიწყეთ ანტიბიოტიკი დღეს."), false);
  assert.equal(passes("ანტიბიოტიკი ჯერ არ ინიშნება, მაგრამ დაიწყეთ ანტიბიოტიკი დღეს."), false);
  assert.equal(passes("ანტიბიოტიკოთერაპია გადადებულია რენტგენის პასუხამდე არასწორია."), false);
  assert.equal(passes(""), false);
  assert.equal(checkExpectations({}, rules, "ka")[0].passed, false);
});
