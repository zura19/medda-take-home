// TODO (Part 5): Design the note view.
// Right now the note is dumped as raw text. Turn it into something a doctor would
// actually like to read and use. The design is up to you. See README.md, Part 5.
export function NoteView({ note }: { note: string }) {
  return <pre className="note-raw">{note}</pre>;
}
