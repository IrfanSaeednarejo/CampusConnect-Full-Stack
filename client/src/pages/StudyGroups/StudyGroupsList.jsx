import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectAllStudyGroups,
  fetchStudyGroups,
  fetchMyStudyGroups,
  selectStudyGroupLoading,
  selectStudyGroupError,
  selectMyStudyGroups,
  selectStudyGroupPagination,
} from "../../redux/slices/studyGroupSlice";
import { useAuth } from "../../hooks/useAuth";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function GroupCard({ group, onNavigate }) {
  const memberPct = Math.round((group.memberCount / group.maxMembers) * 100);
  const isFull = group.memberCount >= group.maxMembers;

  return (
    <div
      onClick={() => onNavigate(`/study-groups/${group._id}`)}
      className="group relative bg-[#161b22] border border-[#30363d] rounded-2xl p-5 cursor-pointer 
                 hover:border-[#238636]/60 hover:shadow-lg hover:shadow-[#238636]/5 
                 transition-all duration-300 hover:-translate-y-0.5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#238636]/20 to-[#1a7f37]/10 
                        border border-[#238636]/20 flex items-center justify-center shrink-0">
          <span className="text-xl font-black text-[#238636] uppercase">
            {group.name?.substring(0, 2) || "??"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-bold text-sm leading-tight truncate max-w-[160px] group-hover:text-[#58a6ff] transition-colors">
              {group.name}
            </h3>
            {group.isPrivate && (
              <span className="flex items-center gap-0.5 bg-[#f85149]/10 text-[#f85149] text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-[#f85149]/20 uppercase">
                <span className="material-symbols-outlined text-[10px]">lock</span> Private
              </span>
            )}
          </div>
          <p className="text-[#8b949e] text-xs mt-0.5">{group.subject || "General Study"}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 ${
          isFull
            ? "bg-[#f85149]/10 text-[#f85149] border-[#f85149]/20"
            : "bg-[#238636]/10 text-[#238636] border-[#238636]/20"
        }`}>
          {isFull ? "Full" : "Open"}
        </span>
      </div>

      {/* Description */}
      {group.description && (
        <p className="text-[#8b949e] text-xs leading-relaxed line-clamp-2">{group.description}</p>
      )}

      {/* Tags */}
      {group.tags?.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {group.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] text-[#58a6ff] bg-[#58a6ff]/10 px-2 py-0.5 rounded-full border border-[#58a6ff]/15">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Schedule */}
      {group.schedule?.length > 0 && (
        <div className="flex items-center gap-1.5 text-[#8b949e] text-xs">
          <span className="material-symbols-outlined text-sm">schedule</span>
          <span>{group.schedule.map(s => DAYS[s.day]).join(", ")} · {group.schedule[0]?.startTime}</span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-[#30363d]/60 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[#8b949e] text-xs">
          <span className="material-symbols-outlined text-sm">group</span>
          <span>{group.memberCount}/{group.maxMembers} members</span>
        </div>
        {/* Capacity bar */}
        <div className="flex items-center gap-2">
          <div className="w-16 h-1 bg-[#30363d] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isFull ? "bg-[#f85149]" : "bg-[#238636]"}`}
              style={{ width: `${Math.min(memberPct, 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-[#8b949e]">{memberPct}%</span>
        </div>
      </div>
    </div>
  );
}

export default function StudyGroupsList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const allGroups = useSelector(selectAllStudyGroups);
  const myGroups = useSelector(selectMyStudyGroups);
  const loading = useSelector(selectStudyGroupLoading);
  const error = useSelector(selectStudyGroupError);
  const pagination = useSelector(selectStudyGroupPagination);

  const isAdmin = user?.roles?.includes("admin");

  const [tab, setTab] = useState("all"); // "all" | "mine"
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchStudyGroups());
    if (isAuthenticated) dispatch(fetchMyStudyGroups());
  }, [dispatch, isAuthenticated]);

  const subjects = useMemo(() => {
    const all = allGroups.map(g => g.subject).filter(Boolean);
    return ["all", ...new Set(all)];
  }, [allGroups]);

  const displayGroups = useMemo(() => {
    let base = tab === "mine" ? myGroups : allGroups;
    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(g =>
        g.name?.toLowerCase().includes(q) ||
        g.subject?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.tags?.some(t => t.includes(q))
      );
    }
    if (subjectFilter !== "all") {
      base = base.filter(g => g.subject === subjectFilter);
    }
    return base;
  }, [tab, allGroups, myGroups, search, subjectFilter]);

  const stats = useMemo(() => ({
    total: allGroups.length,
    totalMembers: allGroups.reduce((s, g) => s + (g.memberCount || 0), 0),
    open: allGroups.filter(g => !g.isFull && g.memberCount < g.maxMembers).length,
  }), [allGroups]);

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Hero Banner */}
      <div className="relative bg-[#0d1117] border-b border-[#30363d] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#238636]/8 via-transparent to-[#1f6feb]/5 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#238636]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#238636]/15 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#238636] text-xl">groups</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Study Groups</h1>
              </div>
              <p className="text-[#8b949e] text-sm">Find your study squad. Collaborate, share resources, and ace your exams.</p>
            </div>
            {isAuthenticated && (
              <button
                onClick={() => navigate("/study-groups/create")}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#238636] text-white font-bold rounded-xl
                           hover:bg-[#2ea043] transition-all shadow-lg shadow-[#238636]/20 shrink-0 text-sm"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                {isAdmin ? "Create Group" : "Request a Group"}
              </button>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-4 mt-8">
            {[
              { label: "Active Groups", value: stats.total, icon: "groups" },
              { label: "Total Members", value: stats.totalMembers, icon: "person" },
              { label: "Open to Join", value: stats.open, icon: "door_open" },
              { label: "My Groups", value: myGroups.length, icon: "bookmark" },
            ].map(s => (
              <div key={s.label} className="bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-2.5 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#238636] text-lg">{s.icon}</span>
                <div>
                  <p className="text-white font-bold text-lg leading-tight">{s.value}</p>
                  <p className="text-[#8b949e] text-[10px] font-medium uppercase">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Tabs */}
          <div className="flex gap-1 bg-[#161b22] border border-[#30363d] rounded-xl p-1">
            {[["all", "All Groups"], ["mine", "My Groups"]].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  tab === key
                    ? "bg-[#238636] text-white shadow-sm"
                    : "text-[#8b949e] hover:text-[#c9d1d9]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#8b949e] text-sm">search</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search groups..."
              className="w-full pl-9 pr-4 py-2 bg-[#161b22] border border-[#30363d] rounded-xl text-sm
                         text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#238636]/60 transition-colors"
            />
          </div>

          {/* Subject filter */}
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="bg-[#161b22] border border-[#30363d] rounded-xl text-sm text-[#c9d1d9] px-3 py-2
                       focus:outline-none focus:border-[#238636]/60 transition-colors"
          >
            {subjects.map(s => (
              <option key={s} value={s}>{s === "all" ? "All Subjects" : s}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {loading && displayGroups.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 animate-pulse h-48" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 text-[#f85149]">
            <span className="material-symbols-outlined text-5xl block mb-3">error</span>
            <p className="font-bold">{error}</p>
          </div>
        ) : displayGroups.length === 0 ? (
          <div className="text-center py-20 bg-[#161b22] border border-[#30363d] rounded-2xl">
            <span className="material-symbols-outlined text-6xl text-[#30363d] block mb-4">groups</span>
            <h3 className="text-white font-bold text-lg mb-2">No study groups found</h3>
            <p className="text-[#8b949e] text-sm mb-6">
              {tab === "mine" ? "You haven't joined any study groups yet." : "Try adjusting your search or create a new group."}
            </p>
            {isAuthenticated && (
              <button
                onClick={() => navigate("/study-groups/create")}
                className="px-5 py-2.5 bg-[#238636] text-white font-bold rounded-xl hover:bg-[#2ea043] transition-all text-sm"
              >
                {isAdmin ? "Create Group" : "Request a Group"}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayGroups.map(group => (
              <GroupCard key={group._id || group.id} group={group} onNavigate={navigate} />
            ))}
          </div>
        )}

        {/* Pagination hint */}
        {pagination.pages > 1 && (
          <p className="text-center text-[#8b949e] text-xs mt-8">
            Showing {displayGroups.length} of {pagination.total} groups
          </p>
        )}
      </div>
    </div>
  );
}
