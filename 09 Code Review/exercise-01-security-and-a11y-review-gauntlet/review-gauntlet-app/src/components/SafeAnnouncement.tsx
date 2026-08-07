const trustedAnnouncement = "<strong>Scheduled maintenance:</strong> Sunday at 02:00 UTC";

// This static, source-controlled string is included as a deliberate scanner
// false positive. Reviewers should justify dismissing it instead of treating
// every dangerouslySetInnerHTML occurrence as equally exploitable.
export function SafeAnnouncement() {
  return <aside dangerouslySetInnerHTML={{ __html: trustedAnnouncement }} />;
}
