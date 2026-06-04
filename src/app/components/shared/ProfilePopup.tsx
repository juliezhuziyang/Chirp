import { motion, AnimatePresence } from "motion/react";
import { Check, UserPlus, X } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import { formatAgeLabel } from "../../../lib/localAuth";
import type { FriendRelationshipStatus, PublicUserSummary } from "../../../lib/types";

interface ProfilePopupProps {
  profile: PublicUserSummary | null;
  open: boolean;
  onClose: () => void;
  onAddFriend?: () => void;
  isSelf?: boolean;
  relationship?: FriendRelationshipStatus;
  relationshipLoading?: boolean;
}

export function ProfilePopup({
  profile,
  open,
  onClose,
  onAddFriend,
  isSelf,
  relationship = "none",
  relationshipLoading,
}: ProfilePopupProps) {
  if (!profile) return null;

  const isFriends = relationship === "friends";
  const requestSent = relationship === "pending_sent";
  const requestReceived = relationship === "pending_received";

  let friendButtonLabel = "Add Friend";
  let friendButtonDisabled = false;
  let friendButtonClass =
    "mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold disabled:opacity-60";

  if (isFriends) {
    friendButtonLabel = "Already Friends";
    friendButtonDisabled = true;
    friendButtonClass =
      "mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-100 text-green-800 border-2 border-green-300 font-semibold cursor-default";
  } else if (requestSent) {
    friendButtonLabel = "Request Sent";
    friendButtonDisabled = true;
  } else if (requestReceived) {
    friendButtonLabel = "Respond in Friends";
    friendButtonDisabled = true;
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 p-6 mx-4">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 p-1 rounded-lg hover:bg-orange-50 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center text-center">
                <UserAvatar avatar={profile.avatar} size="xl" />
                <h3 className="mt-4 text-xl font-bold text-gray-900">{profile.name}</h3>
                {profile.birdName && (
                  <div className="mt-4 w-full bg-orange-50 rounded-2xl p-4 text-left space-y-2">
                    <p className="text-sm font-semibold text-orange-800">Bird profile</p>
                    <p className="text-gray-700">
                      <span className="text-gray-500">Name:</span> {profile.birdName}
                    </p>
                    {profile.birdSpecies && (
                      <p className="text-gray-700">
                        <span className="text-gray-500">Species:</span> {profile.birdSpecies}
                      </p>
                    )}
                    {profile.birdAgeMonths != null && (
                      <p className="text-gray-700">
                        <span className="text-gray-500">Age:</span>{" "}
                        {formatAgeLabel(profile.birdAgeMonths)}
                      </p>
                    )}
                  </div>
                )}
                {!isSelf && onAddFriend && (
                  <button
                    type="button"
                    onClick={onAddFriend}
                    disabled={friendButtonDisabled || relationshipLoading}
                    className={friendButtonClass}
                  >
                    {isFriends ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    {relationshipLoading ? "Loading…" : friendButtonLabel}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
