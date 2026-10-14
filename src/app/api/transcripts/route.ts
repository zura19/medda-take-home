import { NextResponse } from "next/server";
import { loadTranscripts } from "../../../lib/transcripts";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(loadTranscripts());
}
