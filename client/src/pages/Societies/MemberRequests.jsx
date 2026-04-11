import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import {
  getUserSocieties,
  getSocietyMembers,
  approveSocietyMember,
  rejectSocietyMember,
} from "@/api/societyApi";
import SocietyPageHeader from "../../components/societies/SocietyPageHeader";

export default function MemberRequests() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      const userId = user?._id || user?.id;
      const socRes = await getUserSocieties(userId);
      const societies = socRes.data || socRes || [];

      let allPending = [];
      for (const society of societies) {
        const sid = society._id || society.id;
        try {
          const membersRes = await getSocietyMembers(sid);
          const members = membersRes.data || membersRes || [];
          const pending = members
            .filter((m) => m.status === "pending")
            .map((m) => ({
              ...m,
              societyId: sid,
              societyName: society.name,
            }));
          allPending = [...allPending, ...pending];
        } catch {
          /* society might not have members endpoint accessible */
        }
      }
      setPendingRequests(allPending);
    } catch (err) {
      console.error("Failed to fetch pending requests:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) fetchPendingRequests();
  }, [user, fetchPendingRequests]);

  const handleApprove = async (request) => {
    const mid = request.memberId?._id || request.memberId || request._id;
    setActionLoading(mid);
    try {
      await approveSocietyMember(request.societyId, mid);
      showSuccess("Member request approved!");
      setPendingRequests((prev) =>
        prev.filter((r) => (r.memberId?._id || r._id) !== mid)
      );
    } catch (err) {
      showError(err?.message || "Failed to approve request.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (request) => {
    const mid = request.memberId?._id || request.memberId || request._id;
    setActionLoading(mid);
    try {
      await rejectSocietyMember(request.societyId, mid);
      showSuccess("Member request rejected.");
      setPendingRequests((prev) =>
        prev.filter((r) => (r.memberId?._id || r._id) !== mid)
      );
    } catch (err) {
      showError(err?.message || "Failed to reject request.");
    } finally {
      setActionLoading(null);
    }
  };

  // Extract display data from populated or flat member object
  const getMemberName = (req) =>
    req.memberId?.profile?.displayName ||
    req.memberId?.profile?.firstName ||
    req.name || "Unknown User";

  const getMemberEmail = (req) =>
    req.memberId?.email || req.email || "";

  const getMemberAvatar = (req) =>
    req.memberId?.profile?.avatar || req.image || "";

  const getMemberDate = (req) => {
    const d = req.joinedAt || req.createdAt || req.requestDate;
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getMemberId = (req) => req.memberId?._id || req.memberId || req._id;

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <SocietyPageHeader
        title="Member Requests"
        subtitle="Review and approve new members"
        icon="person_add"
        backPath="/society/dashboard"
        action={
          pendingRequests.length > 0 ? (
            <span className="px-4 py-2 rounded-full bg-primary/20 text-primary font-bold">
              {pendingRequests.length} Pending
            </span>
          ) : null
        }
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="bg-surface border border-border rounded-lg p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-text-secondary/40 block mb-4">
              inbox
            </span>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No pending requests
            </h3>
            <p className="text-text-secondary">
              All member requests have been reviewed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => {
              const mid = getMemberId(request);
              const initial = (getMemberName(request) || "U")[0].toUpperCase();
              const avatar = getMemberAvatar(request);

              return (
                <div
                  key={mid}
                  className="bg-surface border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-6">
                    {/* Avatar */}
                    {avatar ? (
                      <div
                        className="w-16 h-16 rounded-full bg-cover bg-center flex-shrink-0 ring-2 ring-border"
                        style={{ backgroundImage: `url("${avatar}")` }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[#4F46E5] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                        {initial}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-text-primary font-bold text-lg mb-1">
                            {getMemberName(request)}
                          </h3>
                          {getMemberEmail(request) && (
                            <p className="text-text-secondary text-sm mb-1">
                              {getMemberEmail(request)}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <span className="material-symbols-outlined text-sm">
                              badge
                            </span>
                            <span>{request.societyName}</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-medium flex-shrink-0">
                          Pending
                        </span>
                      </div>

                      {/* Metadata */}
                      {getMemberDate(request) && (
                        <div className="flex items-center gap-4 text-xs text-text-secondary mb-4">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">
                              calendar_today
                            </span>
                            Requested on {getMemberDate(request)}
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(request)}
                          disabled={actionLoading === mid}
                          className="flex-1 px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {actionLoading === mid ? (
                            <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span className="material-symbols-outlined text-sm">
                              check_circle
                            </span>
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request)}
                          disabled={actionLoading === mid}
                          className="flex-1 px-6 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-sm">
                            cancel
                          </span>
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        {pendingRequests.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface border border-border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-primary">
                {pendingRequests.length}
              </div>
              <div className="text-sm text-text-secondary mt-1">
                Pending Requests
              </div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-primary">
                {new Set(pendingRequests.map(r => r.societyName)).size}
              </div>
              <div className="text-sm text-text-secondary mt-1">Societies</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
