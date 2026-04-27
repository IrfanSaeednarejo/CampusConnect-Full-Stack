import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Hash, TrendingUp, Users } from "lucide-react";
import { fetchTrendingHashtags } from "../../redux/slices/feedSlice";

export default function FeedSidebar() {
    const dispatch = useDispatch();
    const { trendingHashtags } = useSelector((s) => s.feed);
    const user = useSelector((s) => s.auth.user);

    useEffect(() => {
        dispatch(fetchTrendingHashtags());
    }, [dispatch]);

    return (
        <aside className="hidden lg:flex flex-col gap-5 w-64 flex-shrink-0">

            {/* Profile card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                {/* Cover */}
                <div className="h-16 bg-gradient-to-r from-green-600/40 via-purple-600/30 to-slate-900" />
                <div className="px-4 pb-4">
                    <img
                        src={user?.profile?.avatar || `https://ui-avatars.com/api/?name=${user?.profile?.displayName}&background=4f46e5&color=fff`}
                        alt={user?.profile?.displayName}
                        className="w-14 h-14 rounded-full border-4 border-slate-900 -mt-7 object-cover"
                    />
                    <h3 className="font-bold text-white text-sm mt-2">{user?.profile?.displayName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{user?.campusId?.name || user?.academic?.department || "CampusNexus"}</p>
                    <Link to={`/users/${user?._id}`}
                        className="mt-3 block text-center text-xs font-semibold text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg py-1.5 transition-colors">
                        View Profile
                    </Link>
                </div>
            </div>

            {/* Trending hashtags */}
            {trendingHashtags.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        <TrendingUp className="w-3.5 h-3.5" /> Trending on Campus
                    </h3>
                    <ul className="space-y-2">
                        {trendingHashtags.slice(0, 8).map(({ tag, count }) => (
                            <li key={tag}>
                                <Link to={`/feed/hashtag/${tag}`}
                                    className="flex items-center justify-between group py-1 px-2 rounded-lg hover:bg-slate-800 transition-colors">
                                    <span className="flex items-center gap-1.5 text-sm text-green-400 group-hover:text-green-300 font-medium">
                                        <Hash className="w-3 h-3" />{tag}
                                    </span>
                                    <span className="text-[10px] text-slate-600">{count}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Quick links */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Links</h3>
                <ul className="space-y-1">
                    {[
                        { to: "/societies",    label: "Societies" },
                        { to: "/mentors",      label: "Mentors" },
                        { to: "/events",       label: "Events" },
                        { to: "/study-groups", label: "Study Groups" },
                        { to: "/network",      label: "Network" },
                    ].map(({ to, label }) => (
                        <li key={to}>
                            <Link to={to} className="block text-sm text-slate-500 hover:text-slate-200 py-1 px-2 rounded-lg hover:bg-slate-800 transition-colors">
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
