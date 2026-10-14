# Submission

**Name:**
**Level applied for:** Junior / Middle
**Time spent:** about \_\_\_ hours
**LLM used for Parts 3–4 (provider + model):**

## Part 1: Frontend bugs

| #   | Symptom                                                             | Cause                                                | Fix                                                                                                       |
| --- | ------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | transcript data was fetching infinitely.                            | `useEffect` hook had no dependency array.            | Added empty dependency array and now data is fetched only once, once the page is loaded.                  |
| 2   | Generation errors appeared as empty results.                        | The frontend did not check the HTTP response status. | Check `res.ok` and display the API error message, with a fallback message.                                |
| 3   | The Generate note button could remain stuck after a failed request. | Loading was reset only on success.                   | Reset loading in `finally` for successful requests, API errors, and network or response-parsing failures. |
| 4 | Transcript language badges were reversed. | The Georgian condition displayed EN and the English condition displayed KA. | Display KA for Georgian and EN for English. |
| 5 | Loading transcripts had no progress or failure feedback. | The initial fetch did not check HTTP errors or handle rejected requests. | Added loading, error, and empty states; abort the fetch on cleanup and show reload instructions on failure. |
| 6 | A generated note could appear under a different selected visit. | An earlier generation request could update state after the visit changed. | Track generation requests with a ref; invalidate them on selection changes and cleanup, and ignore stale results, errors, and loading updates. |
| 7 | Transcript dialogue ran together. | Normal HTML whitespace collapsed the source line breaks. | Use `white-space: pre-wrap` on the transcript. |

## Part 2: Backend bugs

| #   | Symptom                                                                                                  | Cause                                                                                                | Fix                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Georgian transcripts were unreadable.                                                                    | UTF-8 JSON files were read as Latin-1, corrupting Georgian characters.                               | Read transcript files using `utf8`; verified all 8 transcripts load and match their UTF-8 source files.                             |
| 2   | Clicking Generate note failed to generate a note.                                                        | The frontend sent `transcriptId`, but the backend read `transcript_id`, so transcript lookup failed. | Changed the backend to read `transcriptId`, matching the frontend request.                                                          |
| 3   | Invalid requests and unknown transcripts caused errors during generation instead of clear API responses. | The API did not validate JSON or `transcriptId` and assumed transcript lookup always succeeded.      | Return `400` for malformed JSON or a missing, non-string, or blank `transcriptId`; return `404` when the transcript does not exist. |

## Part 3: Note language selector

How it works (UI → API → generation), and how you validate the language:

The note-language selector offers English and Georgian and defaults to each selected transcript's language. The UI sends `language` with `transcriptId`. The API accepts only `en` or `ka`, returning HTTP 400 for other supplied values; omitted language defaults to the transcript's language. `generateNote` passes the choice to the prompt, which requests translated content, exact matching headings, and localized missing-information phrases. Changing the language clears the note/error and invalidates in-flight results. The original prompt is preserved as `buildOriginalNotePrompt` for the later baseline comparison.

Does Georgian → English and English → Georgian work? Any problems you noticed:

Manual tests with Gemini confirmed Georgian → English using `ka-01` and English → Georgian using `en-01`. A Georgian → Georgian test with `ka-01` also succeeded. The supplied results used the selected language and all 9 matching headings in the correct order. These examples confirm the language-selection flow; they do not establish consistent clinical accuracy across all transcripts.

Prompt-quality issues observed in these Part 3 results include numbers written as words, inconsistent temperature-unit formatting, inferred assessments or causal claims not explicitly stated in the transcript, and patient summaries that sometimes use third person or omit follow-up instructions or warning signs. Part 4 adds explicit rules targeting these issues; new live outputs still need verification.

Local checks also pass for both language directions, both same-language combinations, invalid values, omitted-language defaults, selector state, and stale responses. TypeScript checking passes. Mock mode still returns the fixed English sample; actual translation was tested with Gemini.

## Part 4: Note generation and prompt

Your generation approach (one call, several calls, JSON, self-check...) and why:

One model call returns the plain-text note directly. The system prompt contains the formatting and clinical content rules, and the user message contains the transcript as JSON source data. This keeps the implementation simple without dependencies, a second model call, or a separate rendering pipeline. A final checking instruction asks the same model to correct mistakes before returning only the note; this is not an independent verifier. `buildOriginalNotePrompt` remains unchanged for the Part 6 baseline.

Main decisions in your prompt(s):

- Require the selected output language, all 9 exact headings in order, plain text, and one blank line between sections.
- Distinguish missing information from explicitly absent allergies or medications, using exact localized phrases without added punctuation.
- Prohibit inferred diagnoses and causal claims; preserve uncertainty, negation, and the distinction between ordered tests and results. An unstated assessment uses the missing-information phrase.
- Separate current medication doses, previously stopped medications, and new prescriptions or changes. Exclude rejected treatment options from the plan and preserve every stated prescription detail.
- Use digits and abbreviated units throughout, including the patient summary; distinguish historical and current measurements.
- Require a 3–5 sentence patient summary addressed as “you” or “თქვენ”, using plain language and including both stated follow-up conditions and urgent warning signs without adding advice.

Failures you saw in the generated notes and how you fixed them:

The earlier Gemini results for ka-01 inferred uncontrolled hypertension and, in Georgian, claimed the blood pressure caused the symptoms. The English summary used third person and clinical jargon and omitted follow-up and warning signs. The en-01 Georgian summary omitted conditional follow-up. Outputs also used number words and added punctuation to exact absence phrases. The revised prompt adds explicit instructions for each of these observed failures. These are implemented prompt changes, not yet confirmed improvements in live output.

Anything that still doesn't work well:

Post-change Gemini outputs and measured improvement have not yet been verified. Local checks can verify prompt construction and generation wiring but cannot prove model compliance. The previously observed language-selection tests used the earlier prompt. Manual retesting should cover ka-01 in both languages and en-01 in Georgian, followed by all transcripts during Part 6. Prompt-only checks may still miss unsupported claims or omissions; no independent verifier or automatic retry is implemented. Mock mode remains a fixed English sample and cannot validate this prompt.

Validation: TypeScript checking passed. With Gemini responses stubbed locally, all 8 transcripts in both output languages passed generation-wiring checks, including exact heading order, transcript preservation, and the unchanged original prompt. No real model calls were made for these checks.

## Part 5: Note view design

Screenshot:

Your design decisions and why:

## Part 6: Evals

| Prompt   | Checks passed | Pass rate |
| -------- | ------------- | --------- |
| Original |               |           |
| Mine     |               |           |

How you chose the expectations for en-02, en-03, ka-01, ka-03:

Weaknesses of these evals (what could pass the checks but still be a bad note?):

## Middle-level extras (if applicable)

Your extra check(s) and why:

Cross-language evals (`--lang`):

Stability across 3 runs:

How you would add a review/verification step:

## Use of AI tools

## What you would do with more time
