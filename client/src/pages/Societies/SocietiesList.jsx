import { useState, useEffect, useMemo } from "react";
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
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import Button, { getButtonClassName } from "../../components/common/Button";
import IconButton from "../../components/common/IconButton";
import useHomeTheme from "../../hooks/useHomeTheme";
import { cn, getSocietyTheme } from "./societyTheme";

const CATEGORY_FILTERS = [
  { value: "all", label: "All Societies" },
  { value: "my_joined", label: "My Joined Societies" },
  { value: "Technology", label: "Technology" },
  { value: "Business", label: "Business" },
  { value: "Arts", label: "Arts" },
  { value: "Science", label: "Science" },
  { value: "Sports", label: "Sports" },
  { value: "Culture", label: "Culture" },
  { value: "Other", label: "Other" },
];

function RequestSocietyModal({ isOpen, onClose, isDark, theme }) {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Technology",
  });

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className={cn("w-full max-w-lg overflow-hidden rounded-[28px] border", theme.hero)} onClick={(event) => event.stopPropagation()}>
        <div className={cn("flex items-center justify-between border-b px-6 py-4", theme.divider)}>
          <h2 className={cn("flex items-center gap-2 text-lg font-semibold", theme.text)}>
            <span className={cn("material-symbols-outlined", isDark ? "text-[#58a6ff]" : "text-slate-500")}>add_moderator</span>
            Request New Society
          </h2>
          <IconButton icon="close" onClick={onClose} title="Close" variant="ghost" size="icon-sm" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className={cn("flex gap-2 rounded-2xl border p-3 text-sm", theme.info)}>
            <span className="material-symbols-outlined text-base">info</span>
            <p>Your request will be sent to the Campus Admin for approval before the society becomes active.</p>
          </div>

          <div>
            <label className={cn("mb-1.5 block text-sm font-medium", theme.text)}>Society Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              className={cn("w-full rounded-2xl border px-4 py-2.5 text-sm transition-colors focus:outline-none", theme.field)}
              placeholder="E.g. Computer Science Club"
            />
          </div>

          <div>
            <label className={cn("mb-1.5 block text-sm font-medium", theme.text)}>Category</label>
            <select
              value={formData.category}
              onChange={(event) => setFormData({ ...formData, category: event.target.value })}
              className={cn("w-full rounded-2xl border px-4 py-2.5 text-sm transition-colors focus:outline-none", theme.field)}
            >
              {CATEGORY_FILTERS.slice(2).map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={cn("mb-1.5 block text-sm font-medium", theme.text)}>Mission Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              className={cn("w-full resize-none rounded-2xl border px-4 py-2.5 text-sm transition-colors focus:outline-none", theme.field)}
              placeholder="Why should this society exist? What value does it bring?"
            />
          </div>

          <div className={cn("flex gap-3 border-t pt-4", theme.divider)}>
            <button type="button" onClick={onClose} className={getButtonClassName({ variant: "secondary", size: "md", isDark, className: "flex-1" })}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className={getButtonClassName({ variant: "primary", size: "md", isDark, className: "flex-1" })}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SocietiesList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const societies = useSelector(selectAllSocieties);
  const mySocieties = useSelector(selectMySocieties);
  const pagination = useSelector(selectSocietyPagination);
  const loading = useSelector(selectSocietyLoading);
  const error = useSelector(selectSocietyError);
  const user = useSelector(selectUser);
  const isDark = useHomeTheme();
  const theme = getSocietyTheme(isDark);

  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const campusId = user?.campusId;
  const userId = user?._id;
  const mySocietiesCount = mySocieties.length;

  useEffect(() => {
    const params = { page, limit: 12 };
    if (campusId) params.campusId = campusId;
    if (filterCategory !== "all" && filterCategory !== "my_joined") params.category = filterCategory;
    if (debouncedSearch) params.q = debouncedSearch;

    dispatch(fetchSocieties(params));

    if (userId && mySocietiesCount === 0) {
      dispatch(fetchMySocieties(userId));
    }
  }, [dispatch, campusId, userId, debouncedSearch, filterCategory, page, mySocietiesCount]);

  const filteredSocieties = useMemo(() => {
    if (filterCategory === "my_joined") {
      const query = debouncedSearch.toLowerCase();
      return mySocieties.filter((society) => {
        if (!query) return true;
        return society.name?.toLowerCase().includes(query) || society.description?.toLowerCase().includes(query);
      });
    }
    return societies;
  }, [societies, mySocieties, filterCategory, debouncedSearch]);

  const totalMembers = useMemo(
    () => societies.reduce((sum, society) => sum + (society.memberCount ?? society.members ?? 0), 0),
    [societies]
  );

  const statCards = [
    { label: "Campus Societies", value: societies.length, icon: "grid_view" },
    { label: "Total Members", value: totalMembers, icon: "people_alt" },
    { label: "My Societies", value: mySocieties.length, icon: "star" },
  ];

  return (
    <div className={cn("flex min-h-screen flex-col", theme.page)}>
      <PageHeader
        title="Student Societies"
        subtitle="Discover communities, grow your network, and shape the campus culture."
        icon="hub"
        showBack={false}
        isDark={isDark}
        action={
          <button
            onClick={() => setRequestModalOpen(true)}
            className={getButtonClassName({ variant: "primary", size: "md", isDark })}
          >
            <span className="material-symbols-outlined text-sm">add_moderator</span>
            Request Society
          </button>
        }
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className={cn("rounded-[28px] border p-6 sm:p-8", theme.hero)}>
          <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {statCards.map((card) => (
              <div key={card.label} className={cn("flex items-center gap-4 rounded-[24px] border p-6", theme.card)}>
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl border", theme.subtle)}>
                  <span className={cn("material-symbols-outlined text-2xl", theme.muted)}>{card.icon}</span>
                </div>
                <div>
                  <p className={cn("mb-1 text-xs font-semibold uppercase tracking-[0.16em]", theme.muted)}>{card.label}</p>
                  <h3 className={cn("text-3xl font-bold", theme.text)}>{card.value}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <div className="relative">
              <span className={cn("material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl", theme.muted)}>
                search
              </span>
              <input
                type="text"
                id="society-search"
                placeholder="Search societies..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className={cn("w-full rounded-2xl border py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none", theme.field)}
              />
            </div>
          </div>

          <div className={cn("mb-8 rounded-[24px] border p-4", theme.card)}>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => {
                    setFilterCategory(filter.value);
                    setPage(1);
                  }}
                  className={cn(
                    "rounded-2xl border px-4 py-2 text-sm font-medium transition-colors",
                    filterCategory === filter.value ? theme.tabActive : theme.tabInactive
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className={cn("mb-6 rounded-2xl border p-4 text-sm", theme.error)}>{error}</div>}

          {loading && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className={cn("animate-pulse rounded-[24px] border p-6", theme.card)}>
                  <div className="mb-4 flex items-center gap-4">
                    <div className={cn("h-14 w-14 rounded-2xl", theme.subtle)} />
                    <div className="flex-1 space-y-2">
                      <div className={cn("h-4 w-3/4 rounded", theme.subtle)} />
                      <div className={cn("h-3 w-1/2 rounded", theme.subtle)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className={cn("h-3 rounded", theme.subtle)} />
                    <div className={cn("h-3 w-5/6 rounded", theme.subtle)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredSocieties.length === 0 && (
            <Card padding="p-12" isDark={isDark}>
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

          {!loading && filteredSocieties.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredSocieties.map((society) => {
                const isJoined = society.isMember || mySocieties.some((member) => member._id === society._id);
                return (
                  <div
                    key={society._id}
                    onClick={() => navigate(`/societies/${society._id}`)}
                    className={cn("group flex cursor-pointer flex-col rounded-[28px] border p-6 transition-all", theme.card)}
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {society.logo ? (
                          <img src={society.logo} alt={society.name} className="h-16 w-16 rounded-2xl object-cover" />
                        ) : (
                          <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl border", theme.subtle)}>
                            <span className={cn("material-symbols-outlined text-3xl", theme.muted)}>architecture</span>
                          </div>
                        )}
                        <div>
                          <h3 className={cn("line-clamp-1 text-lg font-medium", theme.text)}>{society.name}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]", theme.badgeMuted)}>
                              {society.category || "General"}
                            </span>
                            <span className={cn("text-[10px] font-medium", theme.muted)}>
                              {new Date(society.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short" })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={cn("mb-4 grid grid-cols-2 gap-3 rounded-2xl border p-3", theme.subtle)}>
                      <div>
                        <span className={cn("text-[10px] font-semibold uppercase tracking-[0.14em]", theme.muted)}>Members</span>
                        <p className={cn("text-sm font-bold", theme.text)}>{society.memberCount || 0}</p>
                      </div>
                      <div>
                        <span className={cn("text-[10px] font-semibold uppercase tracking-[0.14em]", theme.muted)}>Events</span>
                        <p className={cn("text-sm font-bold", theme.text)}>{society.eventsCount || 0}</p>
                      </div>
                    </div>

                    <p className={cn("mb-6 flex-1 text-sm leading-6", theme.muted)}>
                      {society.description || "No bio provided yet. Explore to learn more."}
                    </p>

                    <div className={cn("mt-auto flex items-center justify-between border-t pt-4", theme.divider)}>
                      <span className={cn("rounded-full px-2 py-1 text-[10px] font-bold", theme.badgeMuted)}>
                        #{society.tags || "campuslife"}
                      </span>
                      {isJoined ? (
                        <button className={getButtonClassName({ variant: "primary", size: "sm", isDark })}>
                          Visit
                        </button>
                      ) : society.status === "pending" ? (
                        <span className={cn("rounded-2xl px-3 py-1.5 text-[10px] font-semibold uppercase", theme.badge)}>
                          Pending
                        </span>
                      ) : (
                        <button className={getButtonClassName({ variant: "secondary", size: "sm", isDark })}>
                          Explore
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filterCategory !== "my_joined" && filteredSocieties.length > 0 && pagination?.pages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                disabled={page === 1}
                className={getButtonClassName({ variant: "secondary", size: "icon-md", isDark, className: "min-w-0" })}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className={cn("text-sm font-medium", theme.muted)}>
                Page <span className={theme.text}>{page}</span> of {pagination.pages}
              </span>
              <button
                onClick={() => setPage((previous) => Math.min(pagination.pages, previous + 1))}
                disabled={page >= pagination.pages}
                className={getButtonClassName({ variant: "secondary", size: "icon-md", isDark, className: "min-w-0" })}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </section>
      </main>

      <RequestSocietyModal
        isOpen={isRequestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        isDark={isDark}
        theme={theme}
      />
    </div>
  );
}
