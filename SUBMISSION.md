# Submission

**Name:**
**Level applied for:** Junior / Middle
**Time spent:** about \_\_\_ hours
**LLM used for Parts 3–4 (provider + model):**

## Part 1: Frontend bugs

| #   | Symptom                                  | Cause                              | Fix                                                                                      |
| --- | ---------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | transcript data was fetching infinitely. | useEffect had no dependency array. | Added empty dependency array and now data is fetched only once, once the page is loaded. |

## Part 2: Backend bugs

| #   | Symptom                                                                                                  | Cause                                                                                                | Fix                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Georgian transcripts were unreadable.                                                                    | UTF-8 JSON files were read as Latin-1, corrupting Georgian characters.                               | Read transcript files using `utf8`; verified all 8 transcripts load and match their UTF-8 source files.                             |
| 2   | Clicking Generate note failed to generate a note.                                                        | The frontend sent `transcriptId`, but the backend read `transcript_id`, so transcript lookup failed. | Changed the backend to read `transcriptId`, matching the frontend request.                                                          |
| 3   | Invalid requests and unknown transcripts caused errors during generation instead of clear API responses. | The API did not validate JSON or `transcriptId` and assumed transcript lookup always succeeded.      | Return `400` for malformed JSON or a missing, non-string, or blank `transcriptId`; return `404` when the transcript does not exist. |

## Part 3: Note language selector

How it works (UI → API → generation), and how you validate the language:

Does Georgian → English and English → Georgian work? Any problems you noticed:

## Part 4: Note generation and prompt

Your generation approach (one call, several calls, JSON, self-check...) and why:

Main decisions in your prompt(s):

Failures you saw in the generated notes and how you fixed them:

Anything that still doesn't work well:

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
