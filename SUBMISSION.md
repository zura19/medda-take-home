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
