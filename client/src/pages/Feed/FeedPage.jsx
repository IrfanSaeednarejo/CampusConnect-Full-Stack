import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { PenSquare, Loader2, Hash, Newspaper, Users2, Building2 } from "lucide-react";
import useHomeTheme from "@/hooks/useHomeTheme";
import { fetchFeed, setFeedType, openComposer } from "../../redux/slices/feedSlice";
import PostCard from "../../components/feed/PostCard";
import PostComposer from "../../components/feed/PostComposer";
import RepostComposer from "../../components/feed/RepostComposer";
import CommentDrawer from "../../components/feed/CommentDrawer";
import FeedSidebar from "../../components/feed/FeedSidebar";
import { getButtonClassName } from "../../components/common/Button";
import { useLanguage } from "../../hooks/useLanguage";

const TABS = [
  { type: "campus", labelKey: "feed.tab.campus", icon: Building2 },
  { type: "following", labelKey: "feed.tab.following", icon: Users2 },
];

function ComposerTrigger({ onOpen, user, isDark, t }) {
  return (
    <div className={`rounded-2xl border p-4 ${isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light shadow-[0_18px_40px_rgba(15,23,42,0.08)]"}`}>
      <div className="flex items-center gap-3">
        <img
          src={user?.profile?.avatar || `https://ui-avatars.com/api/?name=${user?.profile?.displayName}&background=2563eb&color=fff`}
          alt=""
          className={`h-10 w-10 shrink-0 rounded-full border-2 object-cover ${isDark ? "border-border-dark" : "border-border-light"}`}
        />
        <button
          onClick={onOpen}
          className={getButtonClassName({
            variant: "secondary",
            size: "md",
            isDark,
            className: "flex-1 cursor-text justify-start text-left font-normal text-text-secondary",
          })}
        >
          {t("feed.composerPrompt")}
        </button>
        <button
          onClick={onOpen}
          className={getButtonClassName({
            variant: "primary",
            size: "md",
            isDark,
            className: "shrink-0",
          })}
        >
          <PenSquare className="w-4 h-4" /> {t("feed.post")}
        </button>
      </div>
    </div>
  );
}

function HashtagHeader({ tag, isDark, t }) {
  return (
    <div className={`border rounded-2xl p-6 ${isDark ? "bg-surface-dark border-border-dark" : "bg-surface-light border-border-light shadow-[0_18px_40px_rgba(15,23,42,0.08)]"}`}>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? "bg-info/10" : "bg-info/10"}`}>
          <Hash className="w-6 h-6 text-info" />
        </div>
        <div>
          <h1 className={`text-xl font-bold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>#{tag}</h1>
          <p className={`text-sm mt-0.5 ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>{t("feed.hashtagPosts", { tag })}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ feedType, isDark, t }) {
  const dispatch = useDispatch();
  return (
    <div className={`border rounded-2xl p-12 text-center ${isDark ? "bg-background-dark border-border-dark" : "bg-surface-light border-border-light shadow-[0_18px_40px_rgba(15,23,42,0.08)]"}`}>
      <Newspaper className={`w-12 h-12 mx-auto mb-4 ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`} />
      <h3 className={`text-lg font-bold mb-2 ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>{t("feed.emptyTitle")}</h3>
      <p className={`text-sm mb-6 ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
        {feedType === "following" ? t("feed.emptyFollowing") : t("feed.emptyCampus")}
      </p>
      <button
        onClick={() => dispatch(openComposer())}
        className={getButtonClassName({
          variant: "primary",
          size: "md",
          isDark,
        })}
      >
        {t("feed.emptyCta")}
      </button>
    </div>
  );
}

export default function FeedPage() {
  const dispatch = useDispatch();
  const { tag } = useParams();
  const isDark = useHomeTheme();
  const { t } = useLanguage();

  const { docs, feedLoading, feedError, feedType, hasMore, composerOpen, repostComposerOpen, pagination } = useSelector((s) => s.feed);
  const user = useSelector((s) => s.auth.user);
  const sentinelRef = useRef(null);

  const loadFeed = useCallback((type = feedType, page = 1) => {
    dispatch(fetchFeed({ feedType: type, page }));
  }, [dispatch, feedType]);

  useEffect(() => {
    if (tag) {
      import("../../api/postApi").then(({ getPostsByHashtag }) => getPostsByHashtag(tag).catch(() => {}));
    } else {
      loadFeed(feedType, 1);
    }
  }, [feedType, tag]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !feedLoading) {
          dispatch(fetchFeed({ feedType, page: pagination.page + 1 }));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, feedLoading, feedType, pagination.page]);

  const handleTabChange = (type) => {
    if (type === feedType) return;
    dispatch(setFeedType(type));
  };

  return (
    <div className={`min-h-screen px-4 py-6 ${isDark ? "bg-background-dark" : "bg-background-light"}`}>
      <div className="max-w-5xl mx-auto flex gap-8 items-start">
        <main className="flex-1 min-w-0 space-y-4">
          {tag && <HashtagHeader tag={tag} isDark={isDark} t={t} />}
          {!tag && <ComposerTrigger onOpen={() => dispatch(openComposer())} user={user} isDark={isDark} t={t} />}

          {!tag && (
            <div className={`flex gap-1 rounded-xl border p-1 ${isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light shadow-[0_18px_40px_rgba(15,23,42,0.08)]"}`}>
              {TABS.map(({ type, labelKey, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => handleTabChange(type)}
                  className={getButtonClassName({
                    variant: feedType === type ? "primary" : "ghost",
                    size: "md",
                    isDark,
                    className: "flex-1",
                  })}
                >
                  <Icon className="w-4 h-4" /> {t(labelKey)}
                </button>
              ))}
            </div>
          )}

          {feedError && (
            <div className="rounded-xl border border-danger/20 bg-danger/10 p-4 text-center text-sm text-danger">
              {t("feed.retryLoad")} <button onClick={() => loadFeed(feedType, 1)} className={getButtonClassName({
                variant: "ghost",
                size: "sm",
                isDark,
                className: "ml-1 h-auto min-w-0 px-1 text-danger underline-offset-2 hover:text-danger hover:underline",
              })}>{t("common.retry")}</button>
            </div>
          )}

          {docs.length === 0 && !feedLoading ? <EmptyState feedType={feedType} isDark={isDark} t={t} /> : docs.map((post) => <PostCard key={post._id} post={post} />)}

          {feedLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          )}

          <div ref={sentinelRef} className="h-1" />

          {!hasMore && docs.length > 0 && !feedLoading && (
            <p className={`py-6 text-center text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>{t("feed.endOfFeed")}</p>
          )}
        </main>

        <FeedSidebar />
      </div>

      {composerOpen && <PostComposer />}
      {repostComposerOpen && <RepostComposer />}
      <CommentDrawer />
    </div>
  );
}
