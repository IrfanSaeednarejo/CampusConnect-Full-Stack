import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAllSocieties,
  setSocieties,
} from "../../redux/slices/societySlice";
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

  const allSocieties = useSelector(selectAllSocieties);

  useEffect(() => {
    if (allSocieties.length === 0) {
      const mockSocieties = [
        {
          id: 1,
          name: "IEEE Student Chapter",
          logo: "⚡",
          description: "Professional society focused on electrical, electronics, and computer engineering.",
          members: 245,
          category: "STEM",
          head: "Sarah Chen",
          events: 8,
          status: "active",
        },
        {
          id: 2,
          name: "Debating Society",
          logo: "🎤",
          description: "Build your communication and critical thinking skills through debating.",
          members: 156,
          category: "Arts",
          head: "Michael Brown",
          events: 12,
          status: "active",
        },
        {
          id: 3,
          name: "AI & ML Club",
          logo: "🤖",
          description: "Explore artificial intelligence, machine learning, and cutting-edge AI applications.",
          members: 187,
          category: "STEM",
          head: "Alex Kumar",
          events: 15,
          status: "active",
        },
        {
          id: 4,
          name: "Photography Club",
          logo: "📷",
          description: "Discover your creative eye and connect with fellow photography enthusiasts.",
          members: 98,
          category: "Arts",
          head: "Emma Wilson",
          events: 6,
          status: "active",
        },
        {
          id: 5,
          name: "Entrepreneurship Society",
          logo: "💼",
          description: "Supporting student entrepreneurs and startup initiatives.",
          members: 178,
          category: "Business",
          head: "Lisa Wang",
          events: 10,
          status: "active",
        },
        {
          id: 6,
          name: "Environmental Club",
          logo: "🌍",
          description: "Promoting sustainability and environmental awareness on campus.",
          members: 134,
          category: "Community",
          head: "David Lee",
          events: 9,
          status: "active",
        },
      ];
      dispatch(setSocieties(mockSocieties));
    }
  }, [dispatch, allSocieties.length]);

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
    () => allSocieties.reduce((sum, s) => sum + s.members, 0),
    [allSocieties]
  );

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto bg-[#0d1117]">
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
            value={allSocieties.reduce((sum, s) => sum + s.events, 0)}
            icon="event"
          />
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]">
              search
            </span>
            <input
              type="text"
              placeholder="Search societies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#238636]"
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
                    <div className="w-16 h-16 rounded-lg bg-[#238636]/20 flex items-center justify-center text-3xl">
                      {society.logo}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {society.name}
                      </h3>
                      <span className="px-2 py-1 bg-[#238636]/20 text-[#238636] text-xs rounded-full font-medium">
                        {society.category}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[#8b949e] text-sm mb-4 line-clamp-2 flex-1">
                    {society.description}
                  </p>

                  {/* Society Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#30363d]">
                    <div className="flex items-center gap-4 text-sm text-[#8b949e]">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          people
                        </span>
                        {society.members}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          event
                        </span>
                        {society.events}
                      </div>
                    </div>
                  </div>

                  {/* Society Head */}
                  <div className="flex items-center gap-2 mt-3 text-xs text-[#8b949e]">
                    <span className="material-symbols-outlined text-sm">
                      person
                    </span>
                    <span>Led by {society.head}</span>
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
