import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMentors,
  fetchMyMentorProfile,
  selectAllMentors,
  selectMentoringLoading,
  selectMyMentorProfile,
} from "../redux/slices/mentoringSlice";
import { selectUser } from "../redux/slices/authSlice";
import useHomeTheme from "../hooks/useHomeTheme";

const CATEGORIES = [
  { id: "all", label: "All", icon: "grid_view" },
  { id: "technical", label: "Technical", icon: "code" },
  { id: "academic", label: "Academic", icon: "school" },
  { id: "career", label: "Career", icon: "work" },
  { id: "entrepreneurship", label: "Entrepreneurship", icon: "rocket_launch" },
  { id: "wellness", label: "Wellness", icon: "self_improvement" },
  { id: "creative", label: "Creative", icon: "palette" },
  { id: "professional", label: "Professional", icon: "business_center" },
];

const TIER_CONFIG = {
  gold: {
    label: "Gold",
    darkClass:
      "border border-yellow-400/25 bg-yellow-400/15 text-yellow-300",
    lightClass:
      "border border-amber-200 bg-amber-50 text-amber-700",
  },
  silver: {
    label: "Silver",
    darkClass:
      "border border-slate-400/25 bg-slate-300/15 text-slate-300",
    lightClass:
      "border border-slate-200 bg-slate-100 text-slate-700",
  },
  bronze: {
    label: "Bronze",
    darkClass:
      "border border-orange-500/25 bg-orange-600/15 text-orange-300",
    lightClass:
      "border border-orange-200 bg-orange-50 text-orange-700",
  },
};

function StarRating({ value, size = "sm", isDark }) {
  const sz = size === "sm" ? "text-[13px]" : "text-base";

  return (
    <span className={`flex items-center gap-0.5 ${sz}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`material-symbols-outlined ${sz} ${
            i <= Math.round(value)
              ? "text-yellow-400"
              : isDark
                ? "text-slate-700"
                : "text-slate-300"
          }`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      ))}
    </span>
  );
}

function MentorCard({ mentor, navigate, isDark }) {
  const profile = mentor?.userId?.profile ?? {};
  const displayName =
    profile.displayName ||
    `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
    "Mentor";
  const avatar = profile.avatar;
  const initials = displayName.slice(0, 2).toUpperCase();
  const department = mentor?.userId?.academic?.department;
  const remainingExp = (mentor?.expertise?.length ?? 0) - 3;
  const tierCfg = TIER_CONFIG[mentor?.tier];
  const isFree = !mentor?.hourlyRate || mentor.hourlyRate === 0;

  return (
    <div
      onClick={() => navigate(`/mentors/${mentor._id}`)}
      className={`group flex cursor-pointer flex-col gap-4 rounded-[1.5rem] border p-5 transition-all duration-300 ${
        isDark
          ? "border-border-dark bg-surface-dark hover:border-info/60 hover:bg-container-dark"
          : "border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.07)] hover:border-sky-200 hover:bg-slate-50 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]"
      }`}
    >
      <div className="flex items-start gap-3.5">
        {avatar ? (
          <img
            src={avatar}
            alt={displayName}
            className={`h-12 w-12 shrink-0 rounded-full border-2 object-cover transition-colors ${
              isDark
                ? "border-slate-700 group-hover:border-slate-500"
                : "border-slate-200 group-hover:border-sky-300"
            }`}
          />
        ) : (
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold text-white ${
              isDark
                ? "bg-primary"
                : "bg-info"
            }`}
          >
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`truncate text-sm font-bold transition-colors ${
                isDark ? "text-slate-100 group-hover:text-white" : "text-slate-900 group-hover:text-info"
              }`}
            >
              {displayName}
            </h3>
            {tierCfg && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                  isDark ? tierCfg.darkClass : tierCfg.lightClass
                }`}
              >
                {tierCfg.label}
              </span>
            )}
          </div>

          {department && (
            <p
              className={`mt-0.5 truncate text-xs ${
                isDark ? "text-slate-500" : "text-slate-500"
              }`}
            >
              {department}
            </p>
          )}

          <div className="mt-1 flex items-center gap-2">
            {mentor.averageRating > 0 ? (
              <>
                <StarRating value={mentor.averageRating} isDark={isDark} />
                <span
                  className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}
                >
                  {mentor.averageRating.toFixed(1)}
                </span>
              </>
            ) : (
              <span className={`text-xs ${isDark ? "text-slate-600" : "text-slate-500"}`}>
                New Mentor
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p
            className={`text-sm font-bold ${
              isDark ? "text-primary" : "text-info"
            }`}
          >
            {isFree ? "Free" : `${mentor.currency ?? "PKR"} ${mentor.hourlyRate}`}
          </p>
          {!isFree && (
            <p className={`text-[10px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
              /hour
            </p>
          )}
        </div>
      </div>

      <p
        className={`flex-1 text-xs leading-relaxed ${
          isDark ? "text-slate-400" : "text-slate-600"
        }`}
      >
        {mentor.bio || "No bio provided."}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {mentor?.expertise?.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              isDark
                ? "border border-slate-700 bg-slate-900/60 text-slate-400"
                : "border border-slate-200 bg-slate-50 text-slate-600"
            }`}
          >
            {skill}
          </span>
        ))}
        {remainingExp > 0 && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              isDark ? "bg-slate-700/50 text-slate-500" : "bg-slate-100 text-slate-500"
            }`}
          >
            +{remainingExp} more
          </span>
        )}
      </div>

      <div
        className={`flex items-center justify-between gap-3 border-t pt-3 ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div
          className={`flex items-center gap-3 text-xs ${
            isDark ? "text-slate-500" : "text-slate-500"
          }`}
        >
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">group</span>
            {mentor.totalSessions ?? 0} sessions
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">
              calendar_clock
            </span>
            {mentor.availability?.length > 0
              ? `${mentor.availability.length} slots`
              : "Flexible"}
          </span>
        </div>
        <span
          className={`text-xs font-semibold ${
            isDark
              ? "text-primary group-hover:underline"
              : "text-info group-hover:underline"
          }`}
        >
          View Profile
        </span>
      </div>
    </div>
  );
}

function SkeletonCard({ isDark }) {
  return (
    <div
      className={`animate-pulse rounded-[1.5rem] border p-5 ${
        isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className={`h-12 w-12 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
        <div className="flex-1">
          <div
            className={`mb-2 h-4 w-3/4 rounded ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
          />
          <div
            className={`h-3 w-1/2 rounded ${
              isDark ? "bg-slate-700/60" : "bg-slate-200/80"
            }`}
          />
        </div>
      </div>
      <div className={`mb-2 h-3 rounded ${isDark ? "bg-slate-700/60" : "bg-slate-200/80"}`} />
      <div
        className={`mb-4 h-3 w-3/4 rounded ${
          isDark ? "bg-slate-700/40" : "bg-slate-200/60"
        }`}
      />
      <div className="flex gap-2">
        <div
          className={`h-5 w-16 rounded-full ${
            isDark ? "bg-slate-700/60" : "bg-slate-200/80"
          }`}
        />
        <div
          className={`h-5 w-20 rounded-full ${
            isDark ? "bg-slate-700/40" : "bg-slate-200/60"
          }`}
        />
      </div>
    </div>
  );
}

export default function Mentors() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const mentors = useSelector(selectAllMentors);
  const loading = useSelector(selectMentoringLoading);
  const myProfile = useSelector(selectMyMentorProfile);
  const isDark = useHomeTheme();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [minRating, setMinRating] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (user?._id) dispatch(fetchMyMentorProfile());
  }, [dispatch, user?._id]);

  useEffect(() => {
    const params = { limit: 12 };
    if (category !== "all") params.category = category;
    if (searchDebounced.trim()) params.q = searchDebounced.trim();
    if (minRating) params.minRating = minRating;
    dispatch(fetchMentors(params));
  }, [dispatch, category, searchDebounced, minRating]);

  const isPendingMentor = myProfile && !myProfile.verified;
  const isVerifiedMentor = myProfile?.verified;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-background-dark"
          : "bg-slate-50"
      }`}
    >
      <div
        className={`relative overflow-hidden border-b transition-colors duration-300 ${
          isDark
            ? "border-border-dark bg-background-dark"
            : "border-slate-200 bg-surface-light"
        }`}
      >
        <div
          className={`pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full blur-3xl ${
            isDark ? "bg-primary/5" : "bg-info/10"
          }`}
        />
        <div
          className={`pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full blur-3xl ${
            isDark ? "bg-info/5" : "bg-primary/10"
          }`}
        />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 pt-12 sm:px-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                  isDark
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-info/20 bg-white text-info"
                }`}
              >
                CampusNexus
              </span>
            </div>
            <h1
              className={`mb-2 text-3xl font-bold sm:text-4xl ${
                isDark ? "text-slate-100" : "text-slate-900"
              }`}
            >
              Find Your{" "}
              <span className={isDark ? "text-primary" : "text-info"}>
                Mentor
              </span>
            </h1>
            <p className={`max-w-lg text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Connect with verified mentors who can guide your academic journey,
              career path, and personal growth.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {[
                "Verified mentors",
                "Focused categories",
                "Flexible sessions",
              ].map((item) => (
                <span
                  key={item}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors duration-300 ${
                    isDark
                      ? "border-border-dark bg-background-dark text-text-secondary-dark"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div
            className={`min-w-[240px] rounded-[1.5rem] border p-5 transition-all duration-300 ${
              isDark
                ? "border-slate-700 bg-slate-800/60"
                : "border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            }`}
          >
            {isVerifiedMentor ? (
              <div className="text-center">
                <span
                  className={`material-symbols-outlined mb-1 block text-3xl ${
                    isDark ? "text-primary" : "text-info"
                  }`}
                >
                  verified
                </span>
                <p
                  className={`text-sm font-semibold ${
                    isDark ? "text-slate-200" : "text-slate-900"
                  }`}
                >
                  You&apos;re a Verified Mentor
                </p>
                <button
                  onClick={() => navigate("/mentor/dashboard")}
                  className={`mt-3 w-full rounded-xl border px-4 py-2 text-xs font-semibold transition-colors ${
                    isDark
                      ? "border-primary/25 bg-primary/15 text-primary hover:bg-primary/20"
                      : "border-info/20 bg-info/10 text-info hover:bg-info/15"
                  }`}
                >
                  Open Mentor Hub
                </button>
              </div>
            ) : isPendingMentor ? (
              <div className="text-center">
                <span className="material-symbols-outlined mb-1 block text-3xl text-amber-400">
                  pending
                </span>
                <p
                  className={`text-sm font-semibold ${
                    isDark ? "text-slate-200" : "text-slate-900"
                  }`}
                >
                  Application Pending
                </p>
                <p className={`mt-1 text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                  Under review by admins
                </p>
              </div>
            ) : (
              <>
                <p
                  className={`mb-1 text-sm font-semibold ${
                    isDark ? "text-slate-200" : "text-slate-900"
                  }`}
                >
                  Share Your Expertise
                </p>
                <p
                  className={`mb-4 text-xs leading-relaxed ${
                    isDark ? "text-slate-500" : "text-slate-500"
                  }`}
                >
                  Help fellow students grow. Apply to become a mentor today.
                </p>
                <button
                  onClick={() =>
                    user ? navigate("/mentor/register") : navigate("/login")
                  }
                  className={`flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-colors ${
                    isDark
                      ? "bg-primary hover:bg-primary-hover"
                      : "bg-info shadow-[0_10px_24px_rgba(37,99,235,0.18)] hover:bg-blue-700"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Become a Mentor
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-4 px-4 py-6 sm:px-8">
        <div className={`rounded-[1.75rem] border p-4 transition-all duration-300 md:p-5 ${isDark ? "border-[#30363d] bg-[#161b22]" : "border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]"}`}>
        <div className="relative">
          <span
            className={`material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search mentors by name, skill, or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-2xl border py-3 pl-11 pr-4 text-sm transition-all duration-300 focus:outline-none ${
              isDark
                ? "border-slate-700 bg-slate-800/60 text-slate-200 placeholder-slate-500 focus:border-slate-500"
                : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 shadow-[0_12px_32px_rgba(15,23,42,0.07)] focus:border-sky-600"
            }`}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                category === cat.id
                  ? isDark
                    ? "border-primary/30 bg-primary/15 text-primary"
                    : "border-info/20 bg-info/10 text-info"
                  : isDark
                    ? "border-slate-700 bg-slate-800/50 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                    : "border-slate-200 bg-white text-slate-500 hover:border-info/20 hover:text-info"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
              {cat.label}
            </button>
          ))}

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-600" : "text-slate-500"}`}>
              Min rating:
            </span>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className={`rounded-xl border px-2 py-1.5 text-xs focus:outline-none ${
                isDark
                  ? "border-slate-700 bg-slate-800/60 text-slate-400 focus:border-slate-500"
                  : "border-slate-200 bg-white text-slate-700 shadow-sm focus:border-sky-600"
              }`}
            >
              <option value="">Any</option>
              {[4, 3, 2].map((r) => (
                <option key={r} value={r}>
                  {r}+ star
                </option>
              ))}
            </select>
          </div>
        </div>

        {!loading && (
          <p className={`text-xs ${isDark ? "text-slate-600" : "text-slate-500"}`}>
            {mentors.length === 0
              ? "No mentors found"
              : `${mentors.length} mentor${mentors.length !== 1 ? "s" : ""} found`}
            {category !== "all" &&
              ` in ${CATEGORIES.find((c) => c.id === category)?.label}`}
            {searchDebounced && ` matching "${searchDebounced}"`}
          </p>
        )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} isDark={isDark} />
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <div
            className={`rounded-[1.75rem] border p-16 text-center ${
              isDark
                ? "border-slate-700 bg-slate-800/50"
                : "border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            }`}
          >
            <span
              className={`material-symbols-outlined mb-4 block text-6xl ${
                isDark ? "text-slate-600" : "text-slate-300"
              }`}
            >
              search_off
            </span>
            <h3
              className={`mb-2 text-lg font-semibold ${
                isDark ? "text-slate-300" : "text-slate-900"
              }`}
            >
              No mentors found
            </h3>
            <p
              className={`mb-6 text-sm ${
                isDark ? "text-slate-500" : "text-slate-600"
              }`}
            >
              {search
                ? `No results for "${search}". Try a different search term or remove filters.`
                : "No mentors are available in this category yet."}
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("all");
                setMinRating("");
              }}
              className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors ${
                isDark
                  ? "border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600"
                  : "border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50"
              }`}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor._id}
                mentor={mentor}
                navigate={navigate}
                isDark={isDark}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
