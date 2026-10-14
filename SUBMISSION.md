# Submission

**Name:**
**Level applied for:** Junior / Middle
**Time spent:** about ___ hours
**LLM used for Parts 3–4 (provider + model):**

## Part 1: Frontend bugs

| # | Symptom | Cause | Fix |
|---|---|---|---|
| 1 | | | |

## Part 2: Backend bugs

| # | Symptom | Cause | Fix |
|---|---|---|---|
| 1 | Georgian transcripts were unreadable. | UTF-8 JSON files were read as Latin-1, corrupting Georgian characters. | Read transcript files using `utf8`; verified all 8 transcripts load and match their UTF-8 source files. |
| 2 | Clicking Generate note failed to generate a note. | The frontend sent `transcriptId`, but the backend read `transcript_id`, so transcript lookup failed. | Changed the backend to read `transcriptId`, matching the frontend request. |

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

| Prompt | Checks passed | Pass rate |
|---|---|---|
| Original | | |
| Mine | | |

How you chose the expectations for en-02, en-03, ka-01, ka-03:

Weaknesses of these evals (what could pass the checks but still be a bad note?):

## Middle-level extras (if applicable)

Your extra check(s) and why:

Cross-language evals (`--lang`):

Stability across 3 runs:

How you would add a review/verification step:

## Use of AI tools

## What you would do with more time
