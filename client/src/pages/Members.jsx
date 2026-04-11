import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectFilteredMembers, setMembers, searchMembers } from "../redux/slices/memberSlice";
import SectionHeader from "../components/common/SectionHeader";
import MemberCard from "../components/common/MemberCard";
import Button from "../components/common/Button";
import LoginPromptModal from "../components/modals/LoginPromptModal";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { sendConnectionRequest } from "../redux/slices/academicNetworkSlice";
import api from "../api/axios";

export default function Members() {
  const dispatch = useDispatch();
  const members = useSelector(selectFilteredMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAuth();

  // Track loading state per member for connect button spinner
  const actionLoading = useSelector(
    (state) => state.academicNetwork?.actionLoading ?? {}
  );

  // Fetch real users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/users/search", {
          params: { limit: 50 },
        });
        const data = response.data?.data;
        const users = data?.users || data?.docs || [];
        // Normalize backend user data to the shape MemberCard expects
        const normalized = users.map((u) => ({
          id: u._id,
          _id: u._id,
          name:
            u.profile?.displayName ||
            `${u.profile?.firstName || ""} ${u.profile?.lastName || ""}`.trim() ||
            u.email?.split("@")[0] ||
            "User",
          role: u.roles?.[0] || "student",
          interests: u.interests || u.profile?.interests || [],
          joinDate: u.createdAt
            ? new Date(u.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            })
            : "Recently",
          followers: u.followersCount || 0,
          avatar: u.profile?.avatar || "",
          department: u.academic?.department || u.profile?.department || "",
          connectionStatus: "none",
        }));
        dispatch(setMembers(normalized));
      } catch (err) {
        console.error("[Members] Failed to fetch users:", err);
        dispatch(setMembers([]));
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [dispatch]);

  // Live search — dispatches on every keystroke
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    dispatch(searchMembers(value));
  };

  const handleClear = () => {
    setSearchTerm("");
    dispatch(searchMembers(""));
  };

  // Connect button logic with auth check and loading indicators
  const handleConnect = (memberId) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    dispatch(sendConnectionRequest(memberId));
  };

  return (
    <div className="w-full bg-background text-text-primary min-h-screen py-10 px-4 sm:px-10 md:px-20 lg:px-40">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <SectionHeader
            title="Community Members"
            subtitle="Meet the talented students and professionals in the CampusConnect community."
            align="left"
          />
        </div>

        {/* Search Bar — live filtering */}
        <div className="mb-8">
          <div className="relative max-w-lg">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, role, or interest..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-background border border-border text-text-primary text-sm placeholder-[#475569] focus:outline-none focus:border-[#3fb950] transition-colors"
            />
            {searchTerm && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-text-secondary text-xs mt-2">
              Showing {members.length} result{members.length !== 1 ? 's' : ''} for "{searchTerm}"
            </p>
          )}
        </div>

        {/* Members Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#3fb950] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {members.map((member) => (
              <MemberCard
                key={member.id || member._id}
                name={member.name}
                role={member.role}
                interests={member.interests}
                joinDate={member.joinDate}
                followers={member.followers}
                onConnect={() => handleConnect(member.id || member._id)}
                connectLoading={actionLoading[member.id || member._id]}
                connectionStatus={member.connectionStatus || 'none'}
              />
            ))}
          </div>
        )}

        {!loading && members.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg mb-4">
              {searchTerm ? `No members found matching "${searchTerm}"` : "No community members found"}
            </p>
            {searchTerm && (
              <Button variant="secondary" onClick={handleClear}>
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Please log in to connect with members or create events."
      />
    </div>
  );
}
