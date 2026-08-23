const trustedAnnouncement = "<strong>Scheduled maintenance:</strong> Sunday at 02:00 UTC";

export function SafeAnnouncement() {
  return <aside dangerouslySetInnerHTML={{ __html: trustedAnnouncement }} />;
}
