/** Dispatched when the friends activity feed may have new items. */
export const ACTIVITY_FEED_EVENT = "chirp:activity-feed-updated";

export function notifyActivityFeedUpdated() {
  window.dispatchEvent(new Event(ACTIVITY_FEED_EVENT));
}

export function formatActivityTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
