import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { HEADINGS, NOT_MENTIONED, checkLanguage, checkStructure, checkExpectations, parseSections, type Expected } from "./run-evals";

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
