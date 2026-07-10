import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Image, Mic, Send, MessageCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import * as socialApi from "../../../lib/socialApi";
import { notifyActivityFeedUpdated } from "../../../lib/activityFeed";
import type {
  CommunityPost,
  FriendRelationshipStatus,
  PublicUserSummary,
} from "../../../lib/types";
import { UserAvatar } from "../../components/shared/UserAvatar";
import { ProfilePopup } from "../../components/shared/ProfilePopup";

export default function CommunityPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [profile, setProfile] = useState<PublicUserSummary | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [relationship, setRelationship] = useState<FriendRelationshipStatus>("none");
  const [relationshipLoading, setRelationshipLoading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingAudio, setPendingAudio] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const load = () => {
    socialApi
      .fetchCommunityPosts()
      .then((r) => setPosts(r.posts as CommunityPost[]))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openProfile = async (userId: string) => {
    try {
      const { profile: p } = await socialApi.fetchPublicProfile(userId);
      setProfile(p);
      setRelationship("none");
      setProfileOpen(true);
      if (userId !== user?.id) {
        setRelationshipLoading(true);
        try {
          const { status } = await socialApi.fetchFriendRelationship(userId);
          setRelationship(status);
        } catch {
          setRelationship("none");
        } finally {
          setRelationshipLoading(false);
        }
      }
    } catch {
      /* ignore */
    }
  };

  const handlePost = async () => {
    if (!text.trim() && !pendingImage && !pendingAudio) return;
    setPosting(true);
    try {
      await socialApi.createCommunityPost({
        text,
        imageUrl: pendingImage,
        audioUrl: pendingAudio,
      });
      setText("");
      setPendingImage(null);
      setPendingAudio(null);
      load();
      notifyActivityFeedUpdated();
    } finally {
      setPosting(false);
    }
  };

  const handleComment = async (postId: string) => {
    const comment = commentDrafts[postId]?.trim();
    if (!comment) return;
    await socialApi.addPostComment(postId, comment);
    setCommentDrafts((d) => ({ ...d, [postId]: "" }));
    load();
  };

  const readFile = (file: File, cb: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => cb(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("community.title")}</h1>
        <p className="text-gray-500 mt-1">{t("community.subtitle")}</p>
      </div>

      <div className="bg-white rounded-2xl border border-orange-100 p-4 shadow-sm">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("community.postPlaceholder")}
          rows={3}
          className="w-full resize-none border-0 focus:ring-0 outline-none text-gray-800 placeholder:text-gray-400"
        />
        {(pendingImage || pendingAudio) && (
          <p className="text-xs text-orange-600 mb-2">{t("community.attachmentReady")}</p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-orange-50">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => imageRef.current?.click()}
              className="p-2 rounded-lg hover:bg-orange-50 text-orange-600"
            >
              <Image className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => audioRef.current?.click()}
              className="p-2 rounded-lg hover:bg-orange-50 text-orange-600"
            >
              <Mic className="w-5 h-5" />
            </button>
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) readFile(f, setPendingImage);
              }}
            />
            <input
              ref={audioRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) readFile(f, setPendingAudio);
              }}
            />
          </div>
          <button
            type="button"
            onClick={handlePost}
            disabled={posting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {t("common.post")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500 py-12">{t("community.noPosts")}</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <button type="button" onClick={() => openProfile(post.authorId)}>
                  <UserAvatar avatar={post.authorAvatar} size="md" />
                </button>
                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => openProfile(post.authorId)}
                    className="font-semibold text-gray-900 hover:text-orange-600 text-left"
                  >
                    {post.authorName}
                  </button>
                  {post.birdName && (
                    <p className="text-xs text-orange-600">🦜 {post.birdName}</p>
                  )}
                  <p className="text-gray-700 mt-2 whitespace-pre-wrap">{post.text}</p>
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt=""
                      className="mt-3 rounded-xl max-h-64 object-cover w-full"
                    />
                  )}
                  {post.audioUrl && (
                    <audio controls src={post.audioUrl} className="mt-3 w-full" />
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {post.comments?.length > 0 && (
                <div className="mt-4 pl-12 space-y-2 border-l-2 border-orange-50">
                  {post.comments.map((c) => (
                    <div key={c.id} className="flex gap-2 text-sm">
                      <button type="button" onClick={() => openProfile(c.authorId)}>
                        <UserAvatar avatar={c.authorAvatar} size="sm" />
                      </button>
                      <div>
                        <span className="font-medium text-gray-800">{c.authorName}</span>
                        <p className="text-gray-600">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 flex gap-2 pl-12">
                <MessageCircle className="w-4 h-4 text-gray-400 mt-2 shrink-0" />
                <input
                  value={commentDrafts[post.id] ?? ""}
                  onChange={(e) =>
                    setCommentDrafts((d) => ({ ...d, [post.id]: e.target.value }))
                  }
                  placeholder={t("community.commentPlaceholder")}
                  className="flex-1 text-sm px-3 py-2 rounded-xl bg-orange-50/50 border border-orange-100 outline-none focus:border-orange-300"
                  onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                />
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <ProfilePopup
        profile={profile}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        isSelf={profile?.id === user?.id}
        relationship={relationship}
        relationshipLoading={relationshipLoading}
        onAddFriend={
          profile && profile.id !== user?.id
            ? relationship === "none"
              ? async () => {
                  try {
                    await socialApi.sendFriendRequest(profile.id);
                    setRelationship("pending_sent");
                  } catch {
                    /* ignore */
                  }
                }
              : () => {}
            : undefined
        }
      />
    </div>
  );
}
