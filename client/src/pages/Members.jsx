import { useEffect, useState, useCallback, useRef } from "react";
import SectionHeader from "../components/common/SectionHeader";
import MemberCard from "../components/common/MemberCard";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { searchUsers } from "../api/userApi";
import { useDispatch } from "react-redux";
import { fetchNetworkState } from "../redux/slices/networkSlice";

export default function Members() {
  const dispatch = useDispatch();
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
    dispatch(fetchNetworkState());
  }, [dispatch]);

  const loadMembers = async (searchQuery = "") => {
    setLoading(true);
    try {
      const response = await searchUsers(searchQuery || "a", 1, 50); // Search with 'a' to get some initial users
      setMembers(response.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      loadMembers(val);
    }, 500);
  };

  return (
    <div className="w-full bg-[#0d1117] text-[#e6edf3] min-h-screen py-10 px-4 sm:px-10 md:px-20 lg:px-40">
      <div className="max-w-[960px] mx-auto">
        <div className="mb-10">
          <SectionHeader
            title="Community Members"
            subtitle="Meet the talented students and professionals in the CampusConnect community."
            align="left"
          />
        </div>

        <Card className="mb-12">
          <h2 className="text-[#e6edf3] text-xl font-bold mb-3">
            Find Your People
          </h2>
          <div className="flex gap-2 w-full max-w-lg">
            <Input
              type="text"
              placeholder="Search members by name..."
              className="flex-1"
              value={query}
              onChange={handleSearchChange}
            />
          </div>
        </Card>

        {loading ? (
          <div className="text-center text-slate-400 py-10">Searching...</div>
        ) : members.length === 0 ? (
          <div className="text-center text-slate-400 py-10">No members found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <MemberCard
                key={member._id}
                userId={member._id}
                name={member.profile?.displayName || member.profile?.firstName + " " + member.profile?.lastName}
                role={member.roles?.[0]}
                interests={member.interests}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
