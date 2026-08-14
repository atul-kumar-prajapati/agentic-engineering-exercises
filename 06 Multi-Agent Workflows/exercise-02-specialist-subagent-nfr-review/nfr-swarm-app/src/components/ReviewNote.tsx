interface ReviewNoteProps {
  note: string;
}

export function ReviewNote({ note }: ReviewNoteProps) {
  return <div className="request-note" dangerouslySetInnerHTML={{ __html: note }} />;
}
