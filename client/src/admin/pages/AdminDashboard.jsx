import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDashboardStats, getPendingMentors, getPendingSocieties, verifyMentor, updateSocietyStatus } from "../../api/adminApi";
import { setPendingCounts, decrementPending, selectLiveEvents, selectPendingCounts } from "../../redux/slices/adminSlice";
import AdminStatCard from "../components/AdminStatCard";
import LiveEventFeed from "../components/LiveEventFeed";

export const AdminDashboard = () => {
    const dispatch = useDispatch();
    const liveEvents = useSelector(selectLiveEvents);
    const pendingCounts = useSelector(selectPendingCounts);
    const [stats, setStats] = useState(null);
    const [pendingMentors, setPendingMentors] = useState([]);
    const [pendingSocieties, setPendingSocieties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getDashboardStats(),
            getPendingMentors(),
            getPendingSocieties(),
        ]).then(([statsRes, mentorsRes, societiesRes]) => {
            setStats(statsRes.data?.data);
            setPendingMentors(mentorsRes.data?.data?.docs || []);
            setPendingSocieties(societiesRes.data?.data?.docs || []);
            dispatch(setPendingCounts({
                mentors: mentorsRes.data?.data?.pagination?.total || 0,
                societies: societiesRes.data?.data?.pagination?.total || 0,
            }));
        }).finally(() => setLoading(false));
    }, [dispatch]);

    const handleAction = async (requestId, type, action, reason = "") => {
        try {
            let endpoint = "";
            let payload = {};

            if (type === "mentor") {
                endpoint = `/admin/mentors/${requestId}/${action === "approve" ? "verify" : "reject"}`;
                payload = action === "reject" ? { reason } : {};
            } else if (type === "society") {
                endpoint = `/admin/societies/${requestId}/status`;
                payload = { status: action === "approve" ? "active" : "rejected", reason };
            }

            await axios.patch(endpoint, payload);
            
            // Local state updates
            if (type === "mentor") {
                setPendingMentors((prev) => prev.filter((m) => m._id !== requestId));
                dispatch(decrementPending({ key: "mentors" }));
            } else {
                setPendingSocieties((prev) => prev.filter((s) => s._id !== requestId));
                dispatch(decrementPending({ key: "societies" }));
            }
        } catch (err) {
            alert("Action failed: " + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "#64748b" }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ width: 40, height: 40, border: "3px solid #1e293b", borderTopColor: "#6366f1", borderRadius: "50%", animate: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                <p style={{ fontWeight: 600 }}>Synchronizing System Stats...</p>
            </div>
        </div>
    );

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: 0 }}>System Overview</h1>
                <p style={{ color: "#64748b", marginTop: 4 }}>Real-time telemetry and management controls.</p>
            </div>

            {/* ── Stats Row ─────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 40 }}>
                <AdminStatCard icon="👥" label="Total Active Users" value={stats?.totalUsers ?? stats?.totalActiveUsers ?? "0"} />
                <AdminStatCard icon="📨" label="Action Items" value={pendingCounts.mentors + pendingCounts.societies} color="#6366f1" />
                <AdminStatCard icon="🎓" label="Mentor Sessions" value={stats?.activeSessions ?? stats?.totalSessions ?? 0} />
                <AdminStatCard icon="🏛️" label="Active Societies" value={stats?.totalSocieties ?? 0} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32, alignItems: "start" }}>
                {/* ── Pending Queue ─────────────────────────────── */}
                <div style={{ background: "#0f172a", borderRadius: 16, border: "1px solid #1e293b", overflow: "hidden" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Approval Queue</h2>
                        <span style={{ fontSize: 12, background: "#1e293b", color: "#94a3b8", padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>Priority Actions</span>
                    </div>

                    <div style={{ padding: 20 }}>
                        {[...pendingMentors.map(m => ({...m, type: 'mentor'})), ...pendingSocieties.map(s => ({...s, type: 'society'}))].slice(0, 6).map((item) => (
                            <div key={item._id} style={queueCardStyle}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: item.type === 'mentor' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)', display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                                        {item.type === 'mentor' ? "🎓" : "🏛️"}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name || item.userId?.profile?.displayName}</div>
                                        <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                                            {item.type === 'mentor' ? "Mentor Request" : "Society Request"}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button 
                                        onClick={() => handleAction(item._id, item.type, "approve")} 
                                        style={approveBtn}
                                    >
                                        Verify
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setSelectedRequest({ _id: item._id, requestType: item.type });
                                            setShowRejectModal(true);
                                        }}
                                        style={rejectBtn}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}

                        {pendingMentors.length === 0 && pendingSocieties.length === 0 && (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
                                <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
                                <div style={{ fontWeight: 600 }}>Approval Queue Empty</div>
                                <div style={{ fontSize: 12 }}>All service requests have been processed.</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Live Feed ─────────────────────────────────── */}
                <div style={{ position: "sticky", top: 104 }}>
                    <LiveEventFeed events={liveEvents} />
                </div>
            </div>

            {showRejectModal && (
                <ReasonModal 
                    title={`Decline ${selectedRequest?.requestType} Application`}
                    onClose={({ confirmed, reason }) => {
                        if (confirmed) {
                            handleAction(selectedRequest._id, selectedRequest.requestType, "reject", reason);
                        }
                        setShowRejectModal(false);
                    }}
                />
            )}
        </div>
    );
};

const queueCardStyle = {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px", background: "rgba(30, 41, 59, 0.5)", borderRadius: 12, marginBottom: 12,
    border: "1px solid transparent", transition: "all 0.2s",
};
const approveBtn = {
    padding: "6px 16px", background: "#6366f1", color: "#fff",
    border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
    boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.4)"
};
const rejectBtn = {
    padding: "6px 16px", background: "transparent", color: "#94a3b8",
    border: "1px solid #334155", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600
};

export default AdminDashboard;
