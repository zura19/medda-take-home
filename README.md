# Medda take-home: clinical notes from visit transcripts

Thanks for taking the time to do this task.

At Medda we turn doctor–patient conversations into structured clinical notes. This repo is a small, simplified version of that product. It **half works**: there are bugs in the frontend and backend, the prompt is weak, and the eval script is unfinished. Your job is to get it into good shape.

All transcripts in `data/transcripts/` are **fictional**. There is no real patient data in this repo. Four are in English and four in Georgian.

## Time

Plan for **5–7 hours**. You don't have to finish everything. We'd much rather see some parts done well than everything done badly. If you run out of time, write down what you would do next.

## Setup

Requirements: Node.js 20+.

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

**LLM access.** Parts 1, 2 and 5 need no API key: `LLM_PROVIDER=mock` returns a canned response. For Parts 3, 4 and 6 you need a real model. Use any provider you have access to (Claude, OpenAI, Gemini through its OpenAI-compatible endpoint, a local model, etc.). See `.env.example`. Running all 8 transcripts with a small model costs very little, and several providers have free tiers that are enough for this task.

## The task

### Part 1: Frontend bugs (`src/app/`)

There are **at least 4 bugs** in the frontend. Testers reported, among other things:

- "My laptop fan spins up when the app is open, and the network tab never stops moving."
- "The language labels next to the transcripts look wrong."

Find and fix as many bugs as you can. For each one, write down the cause and your fix in `SUBMISSION.md`.

### Part 2: Backend bugs (`src/app/api/`, `src/lib/`)

There are **at least 4 bugs** in the backend. Testers reported, among other things:

- "Clicking 'Generate note' never shows a note."
- "The Georgian transcripts are unreadable."

Also make sure the API returns sensible HTTP status codes and error messages when something goes wrong (bad input, unknown transcript, LLM failure).

Same as Part 1: fix them and document each one in `SUBMISSION.md`.

### Part 3: Feature: note language selector (full stack)

Doctors sometimes need the note in a different language than the visit, for example a Georgian visit documented in English for a specialist abroad.

Build it end to end:

- **UI:** a selector next to "Generate note" with English and Georgian. It defaults to the selected transcript's language.
- **API:** send the chosen language to `/api/generate`, validate it, and return a clear error for invalid values.
- **Generation:** the note comes back in the chosen language, with the matching headings from `NOTE_SPEC.md`. A Georgian transcript → English note must work, and the other way round.

### Part 4: Note generation and prompt (`src/lib/notes.ts`, `src/prompts/`)

Read `NOTE_SPEC.md`. It defines what information a note must contain, how it is structured, and the content rules.

**How** you generate the note is up to you. `generateNote` is only a minimal starting point with a weak prompt. You could use one well-written prompt, several LLM calls, JSON output that you turn into text in code, a self-check step, or something else. The only contract is that `generateNote(transcript, language)` returns plain text that follows the spec.

The transcripts contain a few traps on purpose, so read them carefully. In `SUBMISSION.md`, explain your approach, the main decisions in your prompt(s), and which failures you saw and fixed.

### Part 5: Note view design (`src/app/components/NoteView.tsx`)

Right now the note is dumped as raw text. Design how it should look and work for a doctor. This part is about your ideas: there is no single right answer.

Things worth thinking about: making sections easy to scan, making missing information visible, the patient summary vs. the clinical part, copying the note, Georgian text, small screens. You can parse the note text into sections for display. Plain CSS is enough; a small UI library is fine if you explain why.

You can do this part without an API key: in mock mode the API returns a sample note in the spec format.

Add a screenshot of your design to `SUBMISSION.md`.

### Part 6: Evals (`evals/`)

`evals/run-evals.ts` generates a note for every transcript (in the transcript's language) and checks it. One check is implemented as an example (`checkLanguage`). You need to:

1. Implement `parseSections`, `checkStructure` and `checkExpectations`.
2. Write `evals/expected/<id>.json` for the 4 transcripts that don't have one yet (`en-02`, `en-03`, `ka-01`, `ka-03`). Look at the existing 4 for the format. Choose expectations that would actually catch a bad note.
3. Run the evals with the **original** prompt and with **your** prompt, and report both pass rates in `SUBMISSION.md`.

```bash
npm run eval                  # generate notes + check
npm run eval -- --cached      # re-check saved notes without calling the LLM
npm run eval -- --only ka-02  # one transcript
```

### Extra for Middle-level candidates

- Add at least one more check of your own to the evals. For example: every number in the note (doses, temperatures, blood pressure) must appear in the transcript, or the PATIENT SUMMARY must be 3–5 sentences. Explain why you picked it.
- Add a `--lang en|ka` option to the eval runner to test cross-language notes (e.g. Georgian transcript → English note). Explain how you handled the expected files.
- Run each transcript 3 times. Are the results stable? What would you change to make them more stable?
- In `SUBMISSION.md`, describe how you would add a second LLM step that **reviews** each generated note against the transcript and flags mistakes before a doctor sees it. You don't need to build it, but you can if you have time.

## Rules

- You may use AI coding tools (Claude Code, Copilot, ChatGPT, etc.). Tell us in `SUBMISSION.md` how you used them. In the follow-up call you'll walk us through your changes, so make sure you understand everything you submit.
- Keep the stack as it is (Next.js, TypeScript). Small dependencies are fine if you explain why.
- Don't commit API keys. `.env.local` is already in `.gitignore`.

## Submitting

1. Fill in `SUBMISSION.md`.
2. Send us a link to a private Git repository (or a zip **without** `node_modules` and `.env.local`).
3. Include the `outputs/*.txt` notes from your final eval run, so we can see what your prompt produced.

After that we'll schedule a ~30-minute call to go through your work together.

Good luck, and have fun with it!
