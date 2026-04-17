import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchSocieties,
  selectAllSocieties,
  selectSocietyLoading,
  selectSocietyError,
} from "../../redux/slices/societySlice";
import { selectUser } from "../../redux/slices/authSlice";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import FilterButtons from "../../components/common/FilterButtons";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";

const CATEGORY_FILTERS = [
  { value: "all",        label: "All" },
  { value: "Technology", label: "Technology" },
  { value: "Business",   label: "Business" },
  { value: "Arts",       label: "Arts" },
  { value: "Science",    label: "Science" },
  { value: "Sports",     label: "Sports" },
  { value: "Culture",    label: "Culture" },
  { value: "Other",      label: "Other" },
];

export default function SocietiesList() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const societies = useSelector(selectAllSocieties);
  const loading   = useSelector(selectSocietyLoading);
  const error     = useSelector(selectSocietyError);
  const user      = useSelector(selectUser);

  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery,    setSearchQuery]    = useState("");

  // Fetch on mount — filter by user's campus by default
  useEffect(() => {
    dispatch(fetchSocieties(user?.campusId ? { campusId: user.campusId } : {}));
  }, [dispatch, user?.campusId]);

  const filteredSocieties = useMemo(() => {
    return societies.filter((s) => {
      const matchesCategory = filterCategory === "all" || s.category === filterCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [societies, filterCategory, searchQuery]);

  const totalMembers = useMemo(
    () => societies.reduce((sum, s) => sum + (s.memberCount ?? s.members ?? 0), 0),
    [societies]
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#0d1117]">
      <PageHeader
        title="Societies"
        subtitle="Browse and join campus communities"
        icon="groups"
        showBack={false}
        action={
          <Button onClick={() => navigate("/society/create")} variant="primary" size="sm">
            <span className="material-symbols-outlined text-sm mr-1">add</span>
            Create Society
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Societies" value={societies.length}  icon="groups" />
          <StatCard label="Total Members"   value={totalMembers}      icon="people" />
          <StatCard label="Your Campus"     value={user?.campusId ? "Filtered" : "All"} icon="school" />
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e] text-xl">
              search
            </span>
            <input
              type="text"
              id="society-search"
              placeholder="Search societies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#161b22] border border-[#30363d] rounded-lg text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#238636] transition-colors"
            />
          </div>
        </div>

        {/* Category Filter */}
        <FilterButtons
          buttons={CATEGORY_FILTERS}
          activeFilter={filterCategory}
          onFilterChange={setFilterCategory}
          className="mb-8"
        />

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-[#f85149]/10 border border-[#f85149]/30 rounded-lg text-[#f85149] text-sm">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-lg bg-[#30363d]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#30363d] rounded w-3/4" />
                    <div className="h-3 bg-[#30363d] rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-[#30363d] rounded" />
                  <div className="h-3 bg-[#30363d] rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filteredSocieties.length === 0 && (
          <Card padding="p-12">
            <EmptyState
              icon="search_off"
              title="No societies found"
              description={searchQuery ? "Try adjusting your search or filters" : "No societies exist for your campus yet"}
              action={
                <Button onClick={() => navigate("/society/create")} variant="primary">
                  Create the first one
                </Button>
              }
            />
          </Card>
        )}

        {/* Grid */}
        {!loading && filteredSocieties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSocieties.map((society) => (
              <Card
                key={society._id}
                padding="p-6"
                hover
                onClick={() => navigate(`/societies/${society._id}`)}
              >
                <div className="flex flex-col h-full">
                  {/* Logo + name */}
                  <div className="flex items-center gap-4 mb-4">
                    {society.logo ? (
                      <img
                        src={society.logo}
                        alt={society.name}
                        className="w-14 h-14 rounded-lg object-cover border border-[#30363d]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-[#238636]/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl text-[#238636]">groups</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white truncate">{society.name}</h3>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-[#238636]/20 text-[#238636] text-xs rounded-full font-medium">
                        {society.category || "General"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[#8b949e] text-sm mb-4 line-clamp-2 flex-1">
                    {society.description || "No description provided."}
                  </p>

                  {/* Footer stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#30363d]">
                    <div className="flex items-center gap-3 text-xs text-[#8b949e]">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">people</span>
                        {society.memberCount ?? society.members ?? 0} members
                      </span>
                    </div>
                    {/* Status badge */}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      society.status === "active"
                        ? "bg-[#238636]/20 text-[#238636]"
                        : society.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-[#8b949e]/20 text-[#8b949e]"
                    }`}>
                      {society.status ?? "active"}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
