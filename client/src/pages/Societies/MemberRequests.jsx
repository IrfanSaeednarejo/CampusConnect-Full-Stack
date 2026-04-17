import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchSocietyMembers,
  approveMemberThunk,
  rejectMemberThunk,
  selectMemberRequests,
  selectCurrentSociety,
  selectMembersLoading,
} from "../../redux/slices/societySlice";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";

export default function MemberRequests() {
  const dispatch  = useDispatch();
  const { showSuccess, showError } = useNotification();

  const society  = useSelector(selectCurrentSociety);
  const requests = useSelector(selectMemberRequests);
  const loading  = useSelector(selectMembersLoading);

  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (society?._id) {
      dispatch(fetchSocietyMembers({ id: society._id, params: { status: "pending" } }));
    }
  }, [dispatch, society?._id]);

  const handleApprove = async (memberId) => {
    setBusyId(memberId);
    try {
      await dispatch(approveMemberThunk({ societyId: society._id, memberId })).unwrap();
      showSuccess("Member approved successfully.");
    } catch (err) {
      showError(err || "Failed to approve member.");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (memberId) => {
    setBusyId(memberId);
    try {
      await dispatch(rejectMemberThunk({ societyId: society._id, memberId })).unwrap();
      showSuccess("Member request rejected.");
    } catch (err) {
      showError(err || "Failed to reject request.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0d1117]">
      <PageHeader
        title="Member Requests"
        subtitle="Review and approve join requests"
        icon="person_add"
        backPath="/society/manage"
        action={
          requests.length > 0 ? (
            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium">
              {requests.length} pending
            </span>
          ) : null
        }
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* No society context guard */}
        {!society && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm mb-6">
            Load your society management page first to get proper context.
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-[#161b22] border border-[#30363d] rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && requests.length === 0 && (
          <Card padding="p-12">
            <EmptyState
              icon="inbox"
              title="No pending requests"
              description="All member requests have been reviewed."
            />
          </Card>
        )}

        {/* Requests list */}
        {!loading && requests.length > 0 && (
          <div className="space-y-4">
            {requests.map((req) => {
              const profile = req.user?.profile ?? req.profile ?? {};
              const name = profile.displayName ||
                `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
                req.user?.email || "Unknown User";
              const avatar = profile.avatar;
              const initials = name.slice(0, 2).toUpperCase();
              const memberId = req._id || req.user?._id;
              const isBusy = busyId === memberId;

              return (
                <Card key={memberId} padding="p-6">
                  <div className="flex items-start gap-5">
                    {/* Avatar */}
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-14 h-14 rounded-full object-cover border border-[#30363d] flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#238636] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {initials}
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-semibold">{name}</h3>
                          <p className="text-[#8b949e] text-sm">{req.user?.email ?? ""}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                          Pending
                        </span>
                      </div>

                      {/* Academic info if available */}
                      {(profile.department || profile.semester) && (
                        <p className="text-[#8b949e] text-xs mb-2">
                          {[profile.department, profile.semester && `Semester ${profile.semester}`]
                            .filter(Boolean).join(" · ")}
                        </p>
                      )}

                      {req.requestNote && (
                        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 mb-3">
                          <p className="text-xs text-[#8b949e] font-medium mb-1">Note:</p>
                          <p className="text-sm text-[#c9d1d9]">{req.requestNote}</p>
                        </div>
                      )}

                      <p className="text-xs text-[#8b949e] mb-4">
                        Requested {req.joinedAt ? new Date(req.joinedAt).toLocaleDateString() : "recently"}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button
                          id={`approve-${memberId}`}
                          variant="primary"
                          size="sm"
                          disabled={isBusy}
                          onClick={() => handleApprove(memberId)}
                          className="flex-1"
                        >
                          <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                          {isBusy ? "Processing…" : "Approve"}
                        </Button>
                        <Button
                          id={`reject-${memberId}`}
                          variant="danger"
                          size="sm"
                          disabled={isBusy}
                          onClick={() => handleReject(memberId)}
                          className="flex-1"
                        >
                          <span className="material-symbols-outlined text-sm mr-1">cancel</span>
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {!loading && requests.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4">
            <Card padding="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#238636]">{requests.length}</div>
                <div className="text-xs text-[#8b949e] mt-1">Pending Requests</div>
              </div>
            </Card>
            <Card padding="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{society?.memberCount ?? "—"}</div>
                <div className="text-xs text-[#8b949e] mt-1">Total Members</div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
