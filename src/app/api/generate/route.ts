import { NextResponse } from "next/server";
import { getTranscript } from "../../../lib/transcripts";
import { generateNote } from "../../../lib/notes";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { transcriptId } = await req.json();
    const transcript = getTranscript(transcriptId)!;
    // TODO (Part 3): use the note language chosen in the UI instead of the transcript's language.
    const note = await generateNote(transcript, transcript.language);
    return NextResponse.json({ note });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message });
  }
}
