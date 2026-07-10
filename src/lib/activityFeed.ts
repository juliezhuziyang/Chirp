import i18n from "../i18n";

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
  const t = i18n.t.bind(i18n);
  if (diffMin < 1) return t("time.justNow");
  if (diffMin < 60) return t("time.minutesAgo", { count: diffMin });
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return t("time.hoursAgo", { count: diffHr });
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
