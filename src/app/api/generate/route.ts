import { NextResponse } from "next/server";
import { getTranscript } from "../../../lib/transcripts";
import { generateNote } from "../../../lib/notes";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const transcriptId = body?.transcriptId;
  const requestedLanguage = body?.language;
  if (typeof transcriptId !== "string" || !transcriptId.trim()) {
    return NextResponse.json(
      { error: "transcriptId must be a non-empty string." },
      { status: 400 },
    );
  }

  if (requestedLanguage !== undefined && requestedLanguage !== "en" && requestedLanguage !== "ka") {
    return NextResponse.json(
      { error: 'language must be "en" or "ka".' },
      { status: 400 },
    );
  }

  try {
    const transcript = getTranscript(transcriptId);
    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript not found." },
        { status: 404 },
      );
    }
    const note = await generateNote(transcript, requestedLanguage ?? transcript.language);
    return NextResponse.json({ note });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error: "An error occurred while generating the note.",
      },
      { status: 500 },
    );
  }
}
