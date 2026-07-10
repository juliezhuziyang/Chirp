import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Heart, Check, X, Send } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import * as socialApi from "../../../lib/socialApi";
import { notifyFriendsNotificationsUpdated } from "../../../lib/friendsNotifications";
import {
  ACTIVITY_FEED_EVENT,
  formatActivityTime,
  notifyActivityFeedUpdated,
} from "../../../lib/activityFeed";
import type { ActivityItem, ChatMessage, FriendEntry, FriendRequest } from "../../../lib/types";
import { UserAvatar } from "../../components/shared/UserAvatar";

const ACTIVITY_POLL_MS = 20000;

export default function FriendsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<FriendEntry | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState("");
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  const loadActivity = useCallback(async () => {
    try {
      const a = await socialApi.fetchActivity();
      setActivity(a.activity.slice(0, 5));
    } catch {
      setActivity([]);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  const load = async () => {
    try {
      const f = await socialApi.fetchFriendsState();
      setFriends(f.friends);
      setIncoming(f.incoming);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadActivity();
    socialApi.markFriendRequestsSeen().then(() => notifyFriendsNotificationsUpdated());
  }, [loadActivity]);

  useEffect(() => {
    const refresh = () => loadActivity();
    window.addEventListener(ACTIVITY_FEED_EVENT, refresh);
    const interval = window.setInterval(loadActivity, ACTIVITY_POLL_MS);
    return () => {
      window.removeEventListener(ACTIVITY_FEED_EVENT, refresh);
      window.clearInterval(interval);
    };
  }, [loadActivity]);

  useEffect(() => {
    if (!selectedFriend) return;
    socialApi
      .fetchMessages(selectedFriend.userId)
      .then((r) => {
        setMessages(r.messages);
        notifyFriendsNotificationsUpdated();
      })
      .catch(() => setMessages([]));
  }, [selectedFriend]);

  const respond = async (requestId: string, accept: boolean) => {
    await socialApi.respondFriendRequest(requestId, accept);
    await load();
    notifyFriendsNotificationsUpdated();
    notifyActivityFeedUpdated();
    await loadActivity();
  };

  const sendMessage = async () => {
    if (!selectedFriend || !chatText.trim()) return;
    await socialApi.sendChatMessage(selectedFriend.userId, chatText);
    setChatText("");
    const r = await socialApi.fetchMessages(selectedFriend.userId);
    setMessages(r.messages);
    notifyFriendsNotificationsUpdated();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-8 h-8 text-orange-500" />
          {t("friends.title")}
        </h1>
        <p className="text-gray-500 mt-1">{t("friends.subtitle")}</p>
      </div>

      {incoming.length > 0 && (
        <section className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">{t("friends.friendRequests")}</h2>
          <div className="space-y-3">
            {incoming.map((req) => (
              <div
                key={req.id}
                className={`flex items-center justify-between gap-4 p-3 rounded-xl ${
                  req.seen === false ? "bg-orange-100/80 ring-1 ring-orange-200" : "bg-orange-50/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserAvatar avatar={req.fromAvatar} size="md" />
                  <span className="font-medium">{req.fromName}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => respond(req.id, true)}
                    className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => respond(req.id, false)}
                    className="p-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">{t("friends.friendsList")}</h2>
          {loading ? (
            <p className="text-gray-500 text-sm">{t("common.loading")}</p>
          ) : friends.length === 0 ? (
            <p className="text-gray-500 text-sm">{t("friends.noFriends")}</p>
          ) : (
            <ul className="space-y-2">
              {friends.map((f) => (
                <li key={f.userId}>
                  <button
                    type="button"
                    onClick={() => setSelectedFriend(f)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                      selectedFriend?.userId === f.userId
                        ? "bg-orange-100 border border-orange-200"
                        : "hover:bg-orange-50"
                    }`}
                  >
                    <UserAvatar avatar={f.avatar} size="md" />
                    <div>
                      <p className="font-medium text-gray-900">{f.name}</p>
                      {f.birdName && (
                        <p className="text-xs text-orange-600">🦜 {f.birdName}</p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm min-h-[280px] flex flex-col">
          <h2 className="font-bold text-gray-900 mb-4">{t("friends.messages")}</h2>
          {selectedFriend ? (
            <>
              <p className="text-sm text-gray-500 mb-3">
                {t("friends.chatWith", { name: selectedFriend.name })}
              </p>
              <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-48">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`text-sm px-3 py-2 rounded-xl max-w-[85%] ${
                      m.senderId === user?.id
                        ? "ml-auto bg-orange-500 text-white"
                        : "bg-orange-50 text-gray-800"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-orange-100 text-sm"
                  placeholder={t("friends.messagePlaceholder")}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  className="p-2 rounded-xl bg-orange-500 text-white"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm">{t("friends.selectFriend")}</p>
          )}
        </section>
      </div>

      <section className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">{t("friends.activityFeed")}</h2>
          <span className="text-xs text-gray-500">{t("friends.activityMeta")}</span>
        </div>
        {activityLoading ? (
          <p className="text-gray-500 text-sm">{t("friends.loadingActivity")}</p>
        ) : activity.length === 0 ? (
          <p className="text-gray-500 text-sm">{t("friends.noActivity")}</p>
        ) : (
          <div className="space-y-4">
            {activity.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 text-sm items-start"
              >
                <UserAvatar avatar={item.userAvatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-semibold text-gray-900">{item.userName}</span>
                    {item.birdName && (
                      <span className="text-orange-600 text-xs">🦜 {item.birdName}</span>
                    )}
                    <span className="text-gray-400 text-xs">
                      {formatActivityTime(item.createdAt ?? item.date)}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-0.5">
                    {item.message}
                    {item.emotion && (
                      <span className="text-orange-500 font-medium"> ({item.emotion})</span>
                    )}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
