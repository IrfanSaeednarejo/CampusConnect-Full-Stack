import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserSocieties, getSocietyMembers } from "@/api/societyApi";
import SocietyPageHeader from "../../components/societies/SocietyPageHeader";

export default function SocietyNetworking() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const socRes = await getUserSocieties(user?._id);
        const societies = socRes.data || socRes || [];

        let allMembers = [];
        const seenIds = new Set();

        for (const society of societies) {
          const sid = society._id || society.id;
          try {
            const membersRes = await getSocietyMembers(sid);
            const membersList = membersRes.data || membersRes || [];
            // Only include approved members, avoid duplicates
            for (const m of membersList) {
              const mid = m.memberId?._id || m.memberId || m._id;
              if (m.status === "approved" && !seenIds.has(mid)) {
                seenIds.add(mid);
                allMembers.push({
                  ...m,
                  societyName: society.name,
                });
              }
            }
          } catch {
            /* skip if can't fetch */
          }
        }
        setMembers(allMembers);
      } catch (err) {
        console.error("Failed to fetch networking members:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchMembers();
  }, [user]);

  const getMemberName = (m) =>
    m.memberId?.profile?.displayName ||
    m.memberId?.profile?.firstName ||
    m.name ||
    "Unknown";

  const getMemberEmail = (m) => m.memberId?.email || m.email || "";

  const getMemberAvatar = (m) =>
    m.memberId?.profile?.avatar || m.image || "";

  const getMemberRole = (m) => m.role || "member";

  const getMemberDate = (m) => {
    const d = m.joinedAt || m.createdAt;
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getMemberId = (m) => m.memberId?._id || m.memberId || m._id;

  const filteredMembers = useMemo(() => {
    let list = members;

    // Text search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (m) =>
          getMemberName(m).toLowerCase().includes(q) ||
          getMemberEmail(m).toLowerCase().includes(q) ||
          (m.societyName || "").toLowerCase().includes(q)
      );
    }

    // Role filter
    if (filter !== "all") {
      list = list.filter((m) => getMemberRole(m) === filter);
    }

    return list;
  }, [members, filter, searchTerm]);

  // Get unique roles for filter tabs
  const roles = useMemo(() => {
    const roleSet = new Set(members.map((m) => getMemberRole(m)));
    return Array.from(roleSet);
  }, [members]);

  return (
    <div className="min-h-screen bg-background text-white">
      <SocietyPageHeader
        title="Networking Hub"
        subtitle="Connect with society members and alumni"
        icon="lan"
        backPath="/society/dashboard"
        action={
          <div className="relative">
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 rounded-lg bg-background border border-border text-white placeholder-[#9eb7a9] focus:outline-none focus:border-[#1dc964] w-64"
            />
            <span className="material-symbols-outlined absolute right-3 top-2.5 text-text-secondary">
              search
            </span>
          </div>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary hover:bg-surface/80 hover:text-white"
              }`}
            >
              All Members ({members.length})
            </button>
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setFilter(role)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filter === role
                    ? "bg-primary text-white"
                    : "bg-surface text-text-secondary hover:bg-surface/80 hover:text-white"
                }`}
              >
                {role} ({members.filter((m) => getMemberRole(m) === role).length}
                )
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1dc964]"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-surface border border-border rounded-lg p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-[#29382f] block mb-4">
              group
            </span>
            <h3 className="text-xl font-semibold text-white mb-2">
              No members found
            </h3>
            <p className="text-text-secondary">
              {searchTerm
                ? "Try a different search term."
                : "Society members will appear here once they join."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredMembers.map((member) => {
              const mid = getMemberId(member);
              const name = getMemberName(member);
              const avatar = getMemberAvatar(member);
              const initial = (name || "U")[0].toUpperCase();
              const colors = [
                "from-green-400 to-blue-500",
                "from-purple-500 to-indigo-500",
                "from-pink-500 to-orange-400",
                "from-blue-400 to-emerald-400",
                "from-yellow-400 to-orange-500",
              ];
              const colorClass =
                colors[(name || "").length % colors.length];

              return (
                <div
                  key={mid}
                  className="bg-surface border border-border rounded-lg p-6 hover:border-[#1dc964]/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      {avatar ? (
                        <div
                          className="w-16 h-16 rounded-full bg-cover bg-center ring-2 ring-[#29382f]"
                          style={{
                            backgroundImage: `url("${avatar}")`,
                          }}
                        />
                      ) : (
                        <div
                          className={`w-16 h-16 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-2xl font-bold`}
                        >
                          {initial}
                        </div>
                      )}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        getMemberRole(member) === "head" || getMemberRole(member) === "admin"
                          ? "bg-purple-500/20 text-purple-400"
                          : getMemberRole(member) === "moderator"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-primary/20 text-[#1dc964]"
                      }`}
                    >
                      {getMemberRole(member)}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">
                    {name}
                  </h3>
                  {getMemberEmail(member) && (
                    <p className="text-text-secondary text-sm mb-1 truncate">
                      {getMemberEmail(member)}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                    <span className="material-symbols-outlined text-sm">
                      badge
                    </span>
                    <span className="truncate">
                      {member.societyName}
                    </span>
                  </div>
                  {getMemberDate(member) && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary mb-4">
                      <span className="material-symbols-outlined text-sm">
                        calendar_today
                      </span>
                      <span>Joined {getMemberDate(member)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Networking Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">Total Members</p>
                <p className="text-3xl font-bold text-white">
                  {members.length}
                </p>
              </div>
              <span className="material-symbols-outlined text-[#1dc964] text-4xl">
                group
              </span>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">Unique Roles</p>
                <p className="text-3xl font-bold text-white">
                  {roles.length}
                </p>
              </div>
              <span className="material-symbols-outlined text-[#1dc964] text-4xl">
                diversity_3
              </span>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">Societies</p>
                <p className="text-3xl font-bold text-white">
                  {new Set(members.map((m) => m.societyName)).size}
                </p>
              </div>
              <span className="material-symbols-outlined text-[#1dc964] text-4xl">
                apartment
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
