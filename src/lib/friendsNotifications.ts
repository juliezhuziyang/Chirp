/** Dispatched when unread messages or unviewed friend requests change. */
export const FRIENDS_NOTIFICATIONS_EVENT = "chirp:friends-notifications-updated";

export function notifyFriendsNotificationsUpdated() {
  window.dispatchEvent(new Event(FRIENDS_NOTIFICATIONS_EVENT));
}
