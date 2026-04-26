import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { PenSquare, RefreshCw, Loader2, Hash, Newspaper, Users2, Building2 } from "lucide-react";
import {
    fetchFeed,
    setFeedType,
    openComposer,
} from "../../redux/slices/feedSlice";
import PostCard       from "../../components/feed/PostCard";
import PostComposer   from "../../components/feed/PostComposer";
import RepostComposer from "../../components/feed/RepostComposer";
import CommentDrawer  from "../../components/feed/CommentDrawer";
import FeedSidebar    from "../../components/feed/FeedSidebar";

// ── Feed tab config ───────────────────────────────────────────────────────────
const TABS = [
    { type: "campus",     label: "Campus",    icon: Building2 },
    { type: "following",  label: "Following", icon: Users2 },
];

// ── Composer trigger box ──────────────────────────────────────────────────────
function ComposerTrigger({ onOpen, user }) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <img src={user?.profile?.avatar || `https://ui-avatars.com/api/?name=${user?.profile?.displayName}&background=4f46e5&color=fff`}
                    alt="" className="w-10 h-10 rounded-full border-2 border-slate-700 object-cover flex-shrink-0" />
                <button onClick={onOpen}
                    className="flex-1 text-left px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-green-500/50 rounded-xl text-slate-500 text-sm transition-all cursor-text">
                    What's on your mind?
                </button>
                <button onClick={onOpen}
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-green-500/20 flex-shrink-0">
                    <PenSquare className="w-4 h-4" /> Post
                </button>
            </div>
        </div>
    );
}

// ── Hashtag feed header ───────────────────────────────────────────────────────
function HashtagHeader({ tag }) {
    return (
        <div className="bg-gradient-to-r from-green-600/20 to-slate-900 border border-green-500/20 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Hash className="w-6 h-6 text-green-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">#{tag}</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Posts tagged with #{tag}</p>
                </div>
            </div>
        </div>
    );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ feedType }) {
    const dispatch = useDispatch();
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-sm">
            <Newspaper className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Nothing here yet</h3>
            <p className="text-slate-400 text-sm mb-6">
                {feedType === "following"
                    ? "Connect with people to see their posts here."
                    : "Be the first to post something on campus!"}
            </p>
            <button onClick={() => dispatch(openComposer())}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-green-500/20">
                Create the first post
            </button>
        </div>
    );
}

// ── FeedPage ──────────────────────────────────────────────────────────────────
export default function FeedPage() {
    const dispatch = useDispatch();
    const { tag }  = useParams(); // present only on /feed/hashtag/:tag

    const { docs, feedLoading, feedError, feedType, hasMore, composerOpen, repostComposerOpen, pagination } = useSelector((s) => s.feed);
    const user = useSelector((s) => s.auth.user);

    // Infinite scroll sentinel
    const sentinelRef = useRef(null);

    const loadFeed = useCallback((type = feedType, page = 1) => {
        dispatch(fetchFeed({ feedType: type, page }));
    }, [dispatch, feedType]);

    // Initial load
    useEffect(() => {
        if (tag) {
            import("../../api/postApi").then(({ getPostsByHashtag }) =>
                getPostsByHashtag(tag).catch(() => {})
            );
        } else {
            loadFeed(feedType, 1);
        }
    }, [feedType, tag]);

    // Infinite scroll observer
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
        <div className="min-h-screen bg-slate-950 py-6 px-4">
            <div className="max-w-5xl mx-auto flex gap-8 items-start">

                {/* Main column */}
                <main className="flex-1 min-w-0 space-y-4">

                    {/* Hashtag page header */}
                    {tag && <HashtagHeader tag={tag} />}

                    {/* Composer trigger (not on hashtag pages) */}
                    {!tag && <ComposerTrigger onOpen={() => dispatch(openComposer())} user={user} />}

                    {/* Feed tabs */}
                    {!tag && (
                        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                            {TABS.map(({ type, label, icon: Icon }) => (
                                <button key={type} onClick={() => handleTabChange(type)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                        feedType === type
                                            ? "bg-green-600 text-white shadow-lg shadow-green-500/20"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                                    }`}>
                                    <Icon className="w-4 h-4" /> {label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Error state */}
                    {feedError && (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-sm text-center">
                            Failed to load feed. <button onClick={() => loadFeed(feedType, 1)} className="underline ml-1">Retry</button>
                        </div>
                    )}

                    {/* Feed list */}
                    {docs.length === 0 && !feedLoading ? (
                        <EmptyState feedType={feedType} />
                    ) : (
                        docs.map((post) => <PostCard key={post._id} post={post} />)
                    )}

                    {/* Loading indicator */}
                    {feedLoading && (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-7 h-7 animate-spin text-green-500" />
                        </div>
                    )}

                    {/* Infinite scroll sentinel */}
                    <div ref={sentinelRef} className="h-1" />

                    {/* End of feed */}
                    {!hasMore && docs.length > 0 && !feedLoading && (
                        <p className="text-center text-xs text-slate-600 py-6">— You're all caught up —</p>
                    )}
                </main>

                {/* Sidebar */}
                <FeedSidebar />
            </div>

            {/* Composer modal */}
            {composerOpen && <PostComposer />}
            
            {/* Repost modal */}
            {repostComposerOpen && <RepostComposer />}

            {/* Comment drawer */}
            <CommentDrawer />
        </div>
    );
}
