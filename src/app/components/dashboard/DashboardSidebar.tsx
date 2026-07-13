import { NavLink, useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  Waves,
  Bird,
  Users,
  Heart,
  Gift,
  LogOut,
  Feather,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { UserAvatar } from "../shared/UserAvatar";
import * as socialApi from "../../../lib/socialApi";
import {
  FRIENDS_NOTIFICATIONS_EVENT,
} from "../../../lib/friendsNotifications";
import { LanguageSwitcher } from "../LanguageSwitcher";

const NAV = [
  { to: "/dashboard/sound", labelKey: "dashboard.soundEmotion", icon: Waves, end: false },
  { to: "/dashboard/my-bird", labelKey: "dashboard.myBirdProfile", icon: Bird, end: false },
  { to: "/dashboard/community", labelKey: "dashboard.community", icon: Users, end: false },
  { to: "/dashboard/friends", labelKey: "dashboard.friends", icon: Heart, end: false, badge: true },
  { to: "/dashboard/contribute", labelKey: "dashboard.contribute", icon: Gift, end: false },
] as const;

export function DashboardSidebar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [showFriendsBadge, setShowFriendsBadge] = useState(false);

  const refreshFriendsBadge = useCallback(() => {
    socialApi
      .fetchFriendsState()
      .then((s) => {
        setShowFriendsBadge(
          s.hasFriendsNotification ||
            (s.unreadMessageCount ?? 0) > 0 ||
            (s.unviewedRequestCount ?? 0) > 0,
        );
      })
      .catch(() => setShowFriendsBadge(false));
  }, []);

  useEffect(() => {
    refreshFriendsBadge();
  }, [refreshFriendsBadge, location.pathname]);

  useEffect(() => {
    window.addEventListener(FRIENDS_NOTIFICATIONS_EVENT, refreshFriendsBadge);
    const interval = window.setInterval(refreshFriendsBadge, 30000);
    return () => {
      window.removeEventListener(FRIENDS_NOTIFICATIONS_EVENT, refreshFriendsBadge);
      window.clearInterval(interval);
    };
  }, [refreshFriendsBadge]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <motion.aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      animate={{ width: expanded ? 220 : 72 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 z-40 h-screen flex flex-col bg-white/90 backdrop-blur-xl border-r border-orange-100/80 shadow-lg"
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-orange-50 min-h-[72px]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0">
          <Feather className="w-5 h-5 text-white" />
        </div>
        {expanded && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold text-lg bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent whitespace-nowrap"
          >
            Chirp
          </motion.span>
        )}
      </div>

      {user && (
        <button
          type="button"
          onClick={() => navigate("/dashboard/my-bird")}
          className="px-3 py-4 flex items-center gap-3 border-b border-orange-50 w-full text-left hover:bg-orange-50/80 transition-colors"
          aria-label={t("dashboard.myBirdProfile")}
        >
          <UserAvatar avatar={user.avatar} size="md" />
          {expanded && (
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate text-sm">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">
                {user.bird?.name || t("dashboard.birdParent")}
              </p>
            </div>
          )}
        </button>
      )}

      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {NAV.map(({ to, labelKey, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-700"
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {expanded && <span className="text-sm font-medium whitespace-nowrap">{t(labelKey)}</span>}
            {badge && showFriendsBadge && (
              <span className="absolute top-2 left-9 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-orange-50 space-y-1">
        <div className={`flex ${expanded ? "justify-start px-3" : "justify-center"}`}>
          <LanguageSwitcher />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {expanded && <span className="text-sm font-medium">{t("dashboard.logout")}</span>}
        </button>
      </div>
    </motion.aside>
  );
}
