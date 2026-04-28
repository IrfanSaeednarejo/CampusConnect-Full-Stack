import React, { useEffect, useState, useRef } from "react";
import MemberCard from "../common/MemberCard";
import Card from "../common/Card";
import Input from "../common/Input";
import { searchUsers } from "../../api/userApi";
import { useDispatch, useSelector } from "react-redux";
import { fetchNetworkState } from "../../redux/slices/networkSlice";
import { selectUser } from "../../redux/slices/authSlice";
import { MemberListRow } from "./NetworkTabs";
import { useNavigate } from "react-router-dom";
import { createOrGetDMThunk } from "../../redux/slices/chatSlice";

export default function MemberDiscovery({ view = 'grid' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectUser);
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
      const response = await searchUsers(searchQuery, 1, 50); 
      setMembers(response.data.data.users || []);
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

  const displayedMembers = members.filter(m => m._id !== currentUser?._id);

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-[#161b22] border-[#30363d]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[#e6edf3] text-lg font-bold">Global Discovery</h2>
            <p className="text-[#8b949e] text-sm small">Search across all campuses and find your peers.</p>
          </div>
          <div className="flex gap-2 w-full max-w-sm">
            <Input
              type="text"
              placeholder="Search by name, skills, interests..."
              className="flex-1"
              value={query}
              onChange={handleSearchChange}
              icon="search"
            />
          </div>
        </div>
      </Card>
      {loading ? (
        <div className="text-center text-slate-400 py-10">Searching community...</div>
      ) : displayedMembers.length === 0 ? (
        <div className="text-center text-slate-400 py-10 bg-[#161b22] rounded-lg border border-dashed border-[#30363d]">
          {query ? 'No members found matching your search.' : 'No other members discovered yet.'}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 nt-stagger">
          {displayedMembers.map((member) => (
            <MemberCard
              key={member._id}
              userId={member._id}
              name={member.profile?.displayName || `${member.profile?.firstName || ''} ${member.profile?.lastName || ''}`.trim() || 'Unknown'}
              displayName={member.profile?.displayName}
              role={member.roles?.[0]}
              avatarUrl={member.profile?.avatar}
              bio={member.profile?.bio}
              interests={member.interests}
              sharedInterests={member.sharedInterests}
              isConnected={member.isConnected}
            />
          ))}
        </div>
      ) : (
        <div className="nt-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {displayedMembers.map((member) => (
            <MemberListRow
              key={member._id}
              item={member}
              isConnected={member.isConnected}
              isSuggested={false}
              onMessage={async (userId, name) => {
                try {
                  const result = await dispatch(createOrGetDMThunk(userId)).unwrap();
                  navigate(`/messages/${result._id}`);
                } catch (err) {
                  console.error("Failed to open message", err);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
