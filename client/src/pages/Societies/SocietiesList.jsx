import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchSocieties,
  fetchMySocieties,
  createSocietyThunk,
  selectAllSocieties,
  selectMySocieties,
  selectSocietyPagination,
  selectSocietyLoading,
  selectSocietyError,
} from "../../redux/slices/societySlice";
import { selectUser } from "../../redux/slices/authSlice";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import FilterButtons from "../../components/common/FilterButtons";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";

const CATEGORY_FILTERS = [
  { value: "all",        label: "All Societies" },
  { value: "my_joined",  label: "My Joined Societies" },
  { value: "Technology", label: "Technology" },
  { value: "Business",   label: "Business" },
  { value: "Arts",       label: "Arts" },
  { value: "Science",    label: "Science" },
  { value: "Sports",     label: "Sports" },
  { value: "Culture",    label: "Culture" },
  { value: "Other",      label: "Other" },
];

function RequestSocietyModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", category: "Technology" });
  
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("category", formData.category);
      await dispatch(createSocietyThunk(fd)).unwrap();
      showSuccess("Society request submitted for admin review!");
      onClose();
    } catch (err) {
      showError(err || "Failed to submit society request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between bg-[#1e293b]/50">
          <h2 className="text-[#f8fafc] font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6366f1]">add_moderator</span>
            Request New Society
          </h2>
          <button onClick={onClose} className="text-[#64748b] hover:text-[#f8fafc] transition-colors p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="p-3 bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-lg text-sm text-[#c7d2fe] flex gap-2">
            <span className="material-symbols-outlined text-base">info</span>
            <p>Your request will be sent to the Campus Admin for approval before the society becomes active.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#94a3b8] mb-1.5">Society Name</label>
            <input
              type="text" required
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-[#1e293b] border border-[#334155] rounded-xl text-[#f8fafc] focus:outline-none focus:border-[#6366f1] transition-colors"
              placeholder="E.g. Computer Science Club"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#94a3b8] mb-1.5">Category</label>
            <select
              value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-[#1e293b] border border-[#334155] rounded-xl text-[#f8fafc] focus:outline-none focus:border-[#6366f1] transition-colors"
            >
              {CATEGORY_FILTERS.slice(2).map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#94a3b8] mb-1.5">Mission Description</label>
            <textarea
              required rows={4}
              value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-[#1e293b] border border-[#334155] rounded-xl text-[#f8fafc] focus:outline-none focus:border-[#6366f1] transition-colors resize-none"
              placeholder="Why should this society exist? What value does it bring?"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#1e293b]">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 rounded-xl">Cancel</Button>
            <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold transition-all disabled:opacity-50 tracking-wide">
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SocietiesList() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const societies = useSelector(selectAllSocieties);
  const mySocieties = useSelector(selectMySocieties);
  const pagination = useSelector(selectSocietyPagination);
  const loading   = useSelector(selectSocietyLoading);
  const error     = useSelector(selectSocietyError);
  const user      = useSelector(selectUser);

  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);

  // Debounce search input to avoid spamming the backend
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const campusId = user?.campusId;
  const userId = user?._id;
  const mySocietiesCount = mySocieties.length;

  // Fetch societies from backend dynamically
  useEffect(() => {
    const params = {
      page: page,
      limit: 12, // 12 cards per page looks good for standard grids
    };
    if (campusId) params.campusId = campusId;
    if (filterCategory !== "all" && filterCategory !== "my_joined") params.category = filterCategory;
    if (debouncedSearch) params.q = debouncedSearch;

    dispatch(fetchSocieties(params));
    
    if (userId && mySocietiesCount === 0) {
      dispatch(fetchMySocieties(userId));
    }
  }, [dispatch, campusId, userId, debouncedSearch, filterCategory, page, mySocietiesCount]);

  // Client-side filtering only essentially required for "My Joined Societies" tab now
  const filteredSocieties = useMemo(() => {
    if (filterCategory === "my_joined") {
      const q = debouncedSearch.toLowerCase();
      return mySocieties.filter((s) => {
        if (!q) return true;
        return s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
      });
    }
    return societies; // For all other tabs, backend already filtered it
  }, [societies, mySocieties, filterCategory, debouncedSearch]);

  const totalMembers = useMemo(
    () => societies.reduce((sum, s) => sum + (s.memberCount ?? s.members ?? 0), 0),
    [societies]
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#0d1117]">
      <PageHeader
        title="Student Societies"
        subtitle="Discover communities, grow your network, and shape the campus culture."
        icon="hub"
        showBack={false}
        action={
          <button 
            onClick={() => setRequestModalOpen(true)}
            className="flex items-center gap-2 bg-[#6366f1] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-[#6366f1]/20 hover:bg-[#4f46e5] hover:-translate-y-0.5 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add_moderator</span>
            Request Society
          </button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-2xl p-6 flex items-center gap-4 shadow-xl shadow-black/20">
            <div className="w-12 h-12 bg-[#6366f1]/10 rounded-xl flex justify-center items-center">
              <span className="material-symbols-outlined text-[#6366f1] text-2xl">grid_view</span>
            </div>
            <div>
              <p className="text-[#94a3b8] font-bold text-xs uppercase tracking-wider mb-1">Campus Societies</p>
              <h3 className="text-3xl font-black text-[#f8fafc]">{societies.length}</h3>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-2xl p-6 flex items-center gap-4 shadow-xl shadow-black/20">
            <div className="w-12 h-12 bg-[#10b981]/10 rounded-xl flex justify-center items-center">
              <span className="material-symbols-outlined text-[#10b981] text-2xl">people_alt</span>
            </div>
            <div>
              <p className="text-[#94a3b8] font-bold text-xs uppercase tracking-wider mb-1">Total Members</p>
              <h3 className="text-3xl font-black text-[#f8fafc]">{totalMembers}</h3>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-2xl p-6 flex items-center gap-4 shadow-xl shadow-black/20">
            <div className="w-12 h-12 bg-[#388bfd]/10 rounded-xl flex justify-center items-center">
              <span className="material-symbols-outlined text-[#388bfd] text-2xl">star</span>
            </div>
            <div>
              <p className="text-[#94a3b8] font-bold text-xs uppercase tracking-wider mb-1">My Societies</p>
              <h3 className="text-3xl font-black text-[#f8fafc]">{mySocieties.length}</h3>
            </div>
          </div>
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
          onFilterChange={(cat) => {
            setFilterCategory(cat);
            setPage(1);
          }}
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
                <Button onClick={() => setRequestModalOpen(true)} variant="primary">
                  Request to Form a Society
                </Button>
              }
            />
          </Card>
        )}

        {/* Grid */}
        {!loading && filteredSocieties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSocieties.map((society) => {
              const isJoined = society.isMember || mySocieties.some(m => m._id === society._id);
              return (
                <div
                  key={society._id}
                  onClick={() => navigate(`/societies/${society._id}`)}
                  className="group relative bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6 cursor-pointer hover:border-[#6366f1] hover:shadow-2xl hover:shadow-[#6366f1]/15 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        {society.logo ? (
                           <img src={society.logo} alt={society.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-[#1e293b] shadow-md" />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center shadow-lg shadow-[#6366f1]/20 shrink-0">
                            <span className="material-symbols-outlined text-3xl text-white">architecture</span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-black text-[#f8fafc] group-hover:text-[#818cf8] transition-colors line-clamp-1">{society.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex px-2 py-0.5 bg-[#1e293b] text-[#94a3b8] text-[10px] uppercase font-bold tracking-wider rounded-md border border-[#334155]">
                              {society.category || "General"}
                            </span>
                            <span className="text-[#64748b] text-[10px] font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                              {new Date(society.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meta Stats Row */}
                    <div className="flex items-center gap-4 mb-4 p-3 bg-[#1e293b]/50 rounded-xl border border-[#334155]/50">
                       <div className="flex flex-col">
                         <span className="text-[#64748b] text-[10px] uppercase font-bold tracking-wider">Members</span>
                         <span className="text-[#f8fafc] font-black text-sm">{society.memberCount || 0}</span>
                       </div>
                       <div className="w-px h-6 bg-[#334155]"></div>
                       <div className="flex flex-col">
                         <span className="text-[#64748b] text-[10px] uppercase font-bold tracking-wider">Events</span>
                         <span className="text-[#f8fafc] font-black text-sm">{society.eventsCount || 0}</span>
                       </div>
                    </div>

                    {/* Bio Text */}
                    <p className="text-[#94a3b8] text-sm leading-relaxed mb-6 line-clamp-2 flex-1">
                      {society.description || <span className="italic opacity-60">No bio provided yet. Explore to learn more.</span>}
                    </p>

                     {/* Footer Tags & Action */}
                    <div className="mt-auto border-t border-[#1e293b] pt-4 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                         {society.tags ? (
                           <span className="text-[10px] font-bold text-[#64748b] bg-[#1e293b]/50 px-2 py-1 rounded-full">#{society.tags}</span>
                         ) : (
                           <span className="text-[10px] font-bold text-[#64748b] bg-[#1e293b]/50 px-2 py-1 rounded-full">#campuslife</span>
                         )}
                      </div>
                      
                      {/* Explicit Visit / Explore Button */}
                      {isJoined ? (
                        <button className="flex items-center gap-1 px-4 py-1.5 bg-[#10b981]/10 text-[#10b981] font-bold text-xs rounded-xl hover:bg-[#10b981]/20 transition-colors border border-[#10b981]/20">
                          Visit <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                      ) : society.status === "pending" ? (
                        <span className="px-3 py-1.5 bg-[#f59e0b]/10 text-[#f59e0b] font-bold text-[10px] uppercase rounded-xl border border-[#f59e0b]/20">
                          Pending
                        </span>
                      ) : (
                        <button className="flex items-center gap-1 px-4 py-1.5 bg-[#6366f1]/10 text-[#818cf8] font-bold text-xs rounded-xl hover:bg-[#6366f1]/20 transition-colors border border-[#6366f1]/20">
                          Explore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && filterCategory !== "my_joined" && filteredSocieties.length > 0 && pagination?.pages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-xl bg-[#1e293b] border border-[#334155] flex items-center justify-center text-[#f8fafc] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#6366f1] hover:text-[#6366f1] transition-all"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="text-[#94a3b8] font-semibold text-sm">
              Page <span className="text-[#f8fafc] mx-1">{page}</span> of {pagination.pages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page >= pagination.pages}
              className="w-10 h-10 rounded-xl bg-[#1e293b] border border-[#334155] flex items-center justify-center text-[#f8fafc] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#6366f1] hover:text-[#6366f1] transition-all"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </main>
      
      <RequestSocietyModal isOpen={isRequestModalOpen} onClose={() => setRequestModalOpen(false)} />
    </div>
  );
}
