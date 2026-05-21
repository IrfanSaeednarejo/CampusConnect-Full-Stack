import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Hash, TrendingUp } from "lucide-react";
import useHomeTheme from "@/hooks/useHomeTheme";
import { fetchTrendingHashtags } from "../../redux/slices/feedSlice";

export default function FeedSidebar() {
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const { trendingHashtags } = useSelector((s) => s.feed);
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(fetchTrendingHashtags());
  }, [dispatch]);

  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col gap-5 lg:flex">
      <div
        className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
          isDark
            ? "border-slate-800 bg-slate-900"
            : "border-[#E2E8F0] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
        }`}
      >
        <div
          className={`h-16 ${
            isDark
              ? "bg-surface-dark"
              : "bg-surface-light"
          }`}
        />
        <div className="px-4 pb-4">
          <img
            src={
              user?.profile?.avatar ||
              `https://ui-avatars.com/api/?name=${user?.profile?.displayName}&background=2563eb&color=fff`
            }
            alt={user?.profile?.displayName}
            className={`-mt-7 h-14 w-14 rounded-full border-4 object-cover transition-colors duration-300 ${
              isDark ? "border-slate-900" : "border-white"
            }`}
          />
          <h3
            className={`mt-2 text-sm font-bold transition-colors duration-300 ${
              isDark ? "text-white" : "text-[#0F172A]"
            }`}
          >
            {user?.profile?.displayName}
          </h3>
          <p
            className={`mt-0.5 text-xs transition-colors duration-300 ${
              isDark ? "text-slate-500" : "text-[#64748B]"
            }`}
          >
            {user?.campusId?.name || user?.academic?.department || "CampusNexus"}
          </p>
          <Link
            to={`/users/${user?._id}`}
            className={`mt-3 block rounded-lg border py-1.5 text-center text-xs font-semibold transition-colors ${
              isDark
                ? "border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300"
                : "border-green-200 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
            }`}
          >
            View Profile
          </Link>
        </div>
      </div>

      {trendingHashtags.length > 0 && (
        <div
          className={`rounded-2xl border p-4 transition-colors duration-300 ${
            isDark
              ? "border-slate-800 bg-slate-900"
              : "border-[#E2E8F0] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
          }`}
        >
          <h3
            className={`mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
              isDark ? "text-slate-400" : "text-[#64748B]"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" /> Trending on Campus
          </h3>
          <ul className="space-y-2">
            {trendingHashtags.slice(0, 8).map(({ tag, count }) => (
              <li key={tag}>
                <Link
                  to={`/feed/hashtag/${tag}`}
                  className={`group flex items-center justify-between rounded-lg px-2 py-1 transition-colors ${
                    isDark ? "hover:bg-slate-800" : "hover:bg-[#F1F5F9]"
                  }`}
                >
                  <span
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                      isDark
                        ? "text-green-400 group-hover:text-green-300"
                        : "text-green-600 group-hover:text-green-700"
                    }`}
                  >
                    <Hash className="h-3 w-3" />
                    {tag}
                  </span>
                  <span
                    className={`text-[10px] transition-colors ${
                      isDark ? "text-slate-600" : "text-[#94a3b8]"
                    }`}
                  >
                    {count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className={`rounded-2xl border p-4 transition-colors duration-300 ${
          isDark
            ? "border-slate-800 bg-slate-900"
            : "border-[#E2E8F0] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
        }`}
      >
        <h3
          className={`mb-3 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
            isDark ? "text-slate-400" : "text-[#64748B]"
          }`}
        >
          Quick Links
        </h3>
        <ul className="space-y-1">
          {[
            { to: "/societies", label: "Societies" },
            { to: "/mentors", label: "Mentors" },
            { to: "/events", label: "Events" },
            { to: "/study-groups", label: "Study Groups" },
            { to: "/network", label: "Network" },
          ].map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={`block rounded-lg px-2 py-1 text-sm transition-colors ${
                  isDark
                    ? "text-slate-500 hover:bg-slate-800 hover:text-slate-200"
                    : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
