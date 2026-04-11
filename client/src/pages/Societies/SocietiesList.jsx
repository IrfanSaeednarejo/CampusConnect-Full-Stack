import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAllSocieties,
  setSocieties,
} from "../../redux/slices/societySlice";
import { getAllSocieties } from "../../api/societyApi";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import FilterButtons from "../../components/common/FilterButtons";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import Avatar from "../../components/common/Avatar";

export default function SocietiesList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const allSocieties = useSelector(selectAllSocieties);

  // Fetch real societies from backend API
  useEffect(() => {
    const loadSocieties = async () => {
      setLoading(true);
      try {
        const res = await getAllSocieties();
        const data = res.data?.docs || res.data || [];
        dispatch(setSocieties(Array.isArray(data) ? data : []));
      } catch (err) {
        console.error("[SocietiesList] Failed to load societies:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSocieties();
  }, [dispatch]);

  const filteredSocieties = useMemo(() => {
    return allSocieties.filter((society) => {
      const matchesCategory =
        filterCategory === "all" || society.category === filterCategory;
      const matchesSearch =
        society.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        society.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allSocieties, filterCategory, searchQuery]);

  const totalMembers = useMemo(
    () => allSocieties.reduce((sum, s) => sum + (s.memberCount || 0), 0),
    [allSocieties]
  );

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto bg-background">
      {/* Header */}
      <PageHeader
        title="All Societies"
        subtitle="Discover and join campus communities"
        icon="groups"
        showBack={false}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Societies"
            value={allSocieties.length}
            icon="groups"
          />
          <StatCard
            label="Total Members"
            value={totalMembers}
            icon="people"
          />
          <StatCard
            label="Active Events"
            value={allSocieties.reduce((sum, s) => sum + (s.eventCount || 0), 0)}
            icon="event"
          />
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              search
            </span>
            <input
              type="text"
              placeholder="Search societies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder-[#475569] focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <FilterButtons
          buttons={[
            { value: "all", label: "All Categories" },
            { value: "STEM", label: "STEM" },
            { value: "Arts", label: "Arts" },
            { value: "Business", label: "Business" },
            { value: "Community", label: "Community" },
          ]}
          activeFilter={filterCategory}
          onFilterChange={setFilterCategory}
          className="mb-8"
        />

        {/* Societies Grid */}
        {filteredSocieties.length === 0 ? (
          <Card padding="p-12">
            <EmptyState
              icon="search_off"
              title="No societies found"
              description="Try adjusting your search or filters"
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSocieties.map((society) => (
              <Card
                key={society.id}
                padding="p-6"
                hover={true}
                onClick={() => navigate(`/societies/${society.id}`)}
              >
                <div className="flex flex-col h-full">
                  {/* Society Logo */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center text-3xl overflow-hidden">
                      {society.media?.logo && society.media.logo.startsWith('http') ? (
                        <img src={society.media.logo} alt={society.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        society.media?.logo || society.name?.charAt(0) || '🏛️'
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-text-primary mb-1">
                        {society.name}
                      </h3>
                      <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full font-medium">
                        {society.category}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2 flex-1">
                    {society.description}
                  </p>

                  {/* Society Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          people
                        </span>
                        {society.memberCount || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          event
                        </span>
                        {society.eventCount || 0}
                      </div>
                    </div>
                  </div>

                  {/* Society Head */}
                  <div className="flex items-center gap-2 mt-3 text-xs text-text-secondary">
                    <span className="material-symbols-outlined text-sm">
                      person
                    </span>
                    <span>Led by {society.createdBy?.profile?.displayName || 'N/A'}</span>
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
