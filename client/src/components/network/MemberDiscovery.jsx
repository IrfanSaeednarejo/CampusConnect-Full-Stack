import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "../common/Card";
import Input from "../common/Input";
import MemberCard from "../common/MemberCard";
import { searchUsers } from "../../api/userApi";
import { fetchNetworkState } from "../../redux/slices/networkSlice";
import { selectUser } from "../../redux/slices/authSlice";
import { MemberListRow } from "./NetworkTabs";
import { createOrGetDMThunk } from "../../redux/slices/chatSlice";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function MemberDiscovery({ view = "grid" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectUser);
  const isDark = useHomeTheme();

  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);

  useEffect(() => {
    dispatch(fetchNetworkState());
  }, [dispatch]);

  const loadMembers = async (searchQuery = "") => {
    setLoading(true);
    try {
      const response = await searchUsers(searchQuery, 1, 50);
      setMembers(response.data.data.users || []);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setQuery(value);

    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => {
      loadMembers(value);
    }, 300);
    setDebounceTimer(timer);
  };

  const displayedMembers = members.filter((member) => member._id !== currentUser?._id);

  return (
    <div className="flex flex-col gap-6">
      <Card
        isDark={isDark}
        className={
          isDark
            ? "border-border-dark bg-surface-dark"
            : "border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
        }
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              className={`text-lg font-semibold ${
                isDark ? "text-text-primary-dark" : "text-slate-900"
              }`}
            >
              Discover Members
            </h2>
            <p
              className={`mt-1 text-sm ${
                isDark ? "text-text-secondary-dark" : "text-slate-500"
              }`}
            >
              Search students and professionals across your network.
            </p>
          </div>

          <div className="w-full sm:max-w-xs">
            <Input
              value={query}
              onChange={handleSearchChange}
              placeholder="Search by name"
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className={`py-10 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Loading members...
        </div>
      ) : displayedMembers.length === 0 ? (
        <div
          className={`rounded-2xl border border-dashed px-6 py-12 text-center ${
            isDark
              ? "border-border-dark bg-surface-dark text-text-secondary-dark"
              : "border-slate-200 bg-white text-slate-500 shadow-[0_14px_32px_rgba(15,23,42,0.05)]"
          }`}
        >
          No members found.
        </div>
      ) : view === "list" ? (
        <div className="flex flex-col gap-3">
          {displayedMembers.map((member) => (
            <MemberListRow
              key={member._id}
              item={member}
              isDark={isDark}
              onMessage={async (userId) => {
                try {
                  const result = await dispatch(createOrGetDMThunk(userId)).unwrap();
                  navigate(`/messages/${result._id}`);
                } catch (error) {
                  console.error("Failed to open chat", error);
                }
              }}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {displayedMembers.map((member) => (
            <MemberCard
              key={member._id}
              userId={member._id}
              name={member.profile?.displayName || member.name || "Unknown"}
              displayName={member.username}
              role={member.roles?.[0]}
              avatarUrl={member.profile?.avatar}
              campus={member.profile?.campus || member.campus}
              bio={member.profile?.bio}
              interests={member.interests || []}
              sharedInterests={member.sharedInterests || []}
              matchType={member.matchType}
              mutualCount={member.mutualCount || 0}
              connectionsCount={member.connectionsCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
