import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMentors,
  fetchMyMentorProfile,
  selectAllMentors,
  selectMentoringLoading,
  selectMyMentorProfile,
  selectMentoringError,
} from "../redux/slices/mentoringSlice";
import { selectUser } from "../redux/slices/authSlice";

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "all",              label: "All",              icon: "grid_view" },
  { id: "technical",        label: "Technical",        icon: "code" },
  { id: "academic",         label: "Academic",         icon: "school" },
  { id: "career",           label: "Career",           icon: "work" },
  { id: "entrepreneurship", label: "Entrepreneurship", icon: "rocket_launch" },
  { id: "wellness",         label: "Wellness",         icon: "self_improvement" },
  { id: "creative",         label: "Creative",         icon: "palette" },
  { id: "professional",     label: "Professional",     icon: "business_center" },
];

const TIER_CONFIG = {
  gold:   { label: "Gold",   cls: "bg-yellow-400/15 text-yellow-300 border border-yellow-400/25" },
  silver: { label: "Silver", cls: "bg-slate-300/15 text-slate-300 border border-slate-400/25" },
  bronze: { label: "Bronze", cls: "bg-orange-600/15 text-orange-300 border border-orange-500/25" },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function StarRating({ value, size = "sm" }) {
  const sz = size === "sm" ? "text-[13px]" : "text-base";
  return (
    <span className={`flex items-center gap-0.5 ${sz}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`material-symbols-outlined ${sz} ${i <= Math.round(value) ? "text-yellow-400" : "text-slate-700"}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >star</span>
      ))}
    </span>
  );
}

function MentorCard({ mentor, navigate }) {
  const p            = mentor?.userId?.profile ?? {};
  const displayName  = p.displayName || `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "Mentor";
  const avatar       = p.avatar;
  const initials     = displayName.slice(0, 2).toUpperCase();
  const department   = mentor?.userId?.academic?.department;
  const expertise    = mentor?.expertise?.slice(0, 3).join(", ") || "General";
  const remainingExp = (mentor?.expertise?.length ?? 0) - 3;
  const tierCfg      = TIER_CONFIG[mentor?.tier];
  const isFree       = !mentor?.hourlyRate || mentor.hourlyRate === 0;

  return (
    <div
      onClick={() => navigate(`/mentors/${mentor._id}`)}
      className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 cursor-pointer hover:border-slate-500 hover:bg-slate-800 transition-all group flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start gap-3.5">
        {avatar ? (
          <img src={avatar} alt={displayName} className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 group-hover:border-slate-500 transition-colors shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-slate-100 font-bold text-sm group-hover:text-white transition-colors truncate">{displayName}</h3>
            {tierCfg && (
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${tierCfg.cls}`}>{tierCfg.label}</span>
            )}
          </div>
          {department && <p className="text-slate-500 text-xs truncate mt-0.5">{department}</p>}
          <div className="flex items-center gap-2 mt-1">
            {mentor.averageRating > 0 ? (
              <>
                <StarRating value={mentor.averageRating} />
                <span className="text-slate-400 text-xs">{mentor.averageRating.toFixed(1)}</span>
              </>
            ) : (
              <span className="text-slate-600 text-xs">New Mentor</span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-emerald-400 font-bold text-sm">{isFree ? "Free" : `${mentor.currency ?? "PKR"} ${mentor.hourlyRate}`}</p>
          {!isFree && <p className="text-slate-600 text-[10px]">/hour</p>}
        </div>
      </div>

      {/* Bio */}
      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 flex-1">
        {mentor.bio || "No bio provided."}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {mentor?.expertise?.slice(0, 3).map(skill => (
          <span key={skill} className="text-[10px] bg-slate-900/60 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
            {skill}
          </span>
        ))}
        {remainingExp > 0 && (
          <span className="text-[10px] bg-slate-700/50 text-slate-500 px-2 py-0.5 rounded-full">+{remainingExp} more</span>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 pt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">group</span>
            {mentor.totalSessions ?? 0} sessions
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">calendar_clock</span>
            {mentor.availability?.length > 0 ? `${mentor.availability.length} slots` : "Flexible"}
          </span>
        </div>
        <span className="text-emerald-400 text-xs font-semibold group-hover:underline">View Profile →</span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-slate-700" />
        <div className="flex-1"><div className="h-4 bg-slate-700 rounded mb-2 w-3/4" /><div className="h-3 bg-slate-700/60 rounded w-1/2" /></div>
      </div>
      <div className="h-3 bg-slate-700/60 rounded mb-2" /><div className="h-3 bg-slate-700/40 rounded w-3/4 mb-4" />
      <div className="flex gap-2"><div className="h-5 bg-slate-700/60 rounded-full w-16" /><div className="h-5 bg-slate-700/40 rounded-full w-20" /></div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function Mentors() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user     = useSelector(selectUser);
  const mentors  = useSelector(selectAllMentors);
  const loading  = useSelector(selectMentoringLoading);
  const myProfile = useSelector(selectMyMentorProfile);

  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("all");
  const [minRating, setMinRating] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Load mentor profile to know if user is already a mentor
  useEffect(() => {
    if (user?._id) dispatch(fetchMyMentorProfile());
  }, [dispatch, user?._id]);

  // Fetch mentors when filters change
  useEffect(() => {
    const params = { limit: 12 };
    if (category !== "all") params.category = category;
    if (searchDebounced.trim()) params.q = searchDebounced.trim();
    if (minRating) params.minRating = minRating;
    dispatch(fetchMentors(params));
  }, [dispatch, category, searchDebounced, minRating]);

  const isMentor        = !!myProfile;
  const isPendingMentor = myProfile && !myProfile.verified;
  const isVerifiedMentor = myProfile?.verified;

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* ── Hero Banner ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0d1117 0%,#111827 50%,#0d1117 100%)" }}
      >
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 pt-12 pb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                  CampusConnect
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">
                Find Your <span className="text-emerald-400">Mentor</span>
              </h1>
              <p className="text-slate-400 text-sm max-w-lg">
                Connect with verified mentors who can guide your academic journey, career path, and personal growth.
              </p>
            </div>

            {/* Become a Mentor CTA */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 min-w-[240px]">
              {isVerifiedMentor ? (
                <div className="text-center">
                  <span className="material-symbols-outlined text-emerald-400 text-3xl block mb-1">verified</span>
                  <p className="text-slate-200 font-semibold text-sm">You're a Verified Mentor</p>
                  <button
                    onClick={() => navigate("/mentoring/hub")}
                    className="mt-3 w-full px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/25 text-emerald-400 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Open Mentor Hub
                  </button>
                </div>
              ) : isPendingMentor ? (
                <div className="text-center">
                  <span className="material-symbols-outlined text-amber-400 text-3xl block mb-1">pending</span>
                  <p className="text-slate-200 font-semibold text-sm">Application Pending</p>
                  <p className="text-slate-500 text-xs mt-1">Under review by admins</p>
                </div>
              ) : (
                <>
                  <p className="text-slate-200 font-semibold text-sm mb-1">Share Your Expertise</p>
                  <p className="text-slate-500 text-xs mb-4 leading-relaxed">
                    Help fellow students grow. Apply to become a mentor today.
                  </p>
                  <button
                    onClick={() => user ? navigate("/mentor/register") : navigate("/login")}
                    className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Become a Mentor
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Filters ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl pointer-events-none">search</span>
          <input
            type="text"
            placeholder="Search mentors by name, skill, or topic…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-2xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-slate-500 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                category === cat.id
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-800/50 text-slate-500 border border-slate-700 hover:text-slate-300 hover:border-slate-600"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
              {cat.label}
            </button>
          ))}

          {/* Rating filter */}
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <span className="text-slate-600 text-xs whitespace-nowrap">Min rating:</span>
            <select
              value={minRating}
              onChange={e => setMinRating(e.target.value)}
              className="bg-slate-800/60 border border-slate-700 text-slate-400 text-xs rounded-xl px-2 py-1.5 focus:outline-none focus:border-slate-500"
            >
              <option value="">Any</option>
              {[4, 3, 2].map(r => <option key={r} value={r}>{r}+ ★</option>)}
            </select>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-slate-600 text-xs">
            {mentors.length === 0
              ? "No mentors found"
              : `${mentors.length} mentor${mentors.length !== 1 ? "s" : ""} found`}
            {category !== "all" && ` in ${CATEGORIES.find(c => c.id === category)?.label}`}
            {searchDebounced && ` matching "${searchDebounced}"`}
          </p>
        )}
      </div>

      {/* ── Mentor Grid ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : mentors.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-16 text-center">
            <span className="material-symbols-outlined text-slate-600 text-6xl block mb-4">search_off</span>
            <h3 className="text-slate-300 font-semibold text-lg mb-2">No mentors found</h3>
            <p className="text-slate-500 text-sm mb-6">
              {search
                ? `No results for "${search}". Try a different search term or remove filters.`
                : "No mentors are available in this category yet."}
            </p>
            <button
              onClick={() => { setSearch(""); setCategory("all"); setMinRating(""); }}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold rounded-xl border border-slate-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mentors.map(mentor => (
              <MentorCard key={mentor._id} mentor={mentor} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
