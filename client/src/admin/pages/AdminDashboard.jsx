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

    const handleVerifyMentor = async (mentorId) => {
        await verifyMentor(mentorId);
        setPendingMentors((prev) => prev.filter((m) => m._id !== mentorId));
        dispatch(decrementPending({ key: "mentors" }));
    };

    const handleApproveSociety = async (id) => {
        await updateSocietyStatus(id, { status: "approved" });
        setPendingSocieties((prev) => prev.filter((s) => s._id !== id));
        dispatch(decrementPending({ key: "societies" }));
    };

    if (loading) return <div style={{ color: "#94a3b8" }}>Loading dashboard...</div>;

    return (
        <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>

            {/* ── Stats Row ─────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
                <AdminStatCard icon="👥" label="Active Users" value={stats?.totalActiveUsers ?? "—"} />
                <AdminStatCard icon="⏳" label="Pending Approvals" value={(pendingCounts.mentors + pendingCounts.societies)} color="#f59e0b" />
                <AdminStatCard icon="🎓" label="Active Sessions" value={stats?.activeSessions ?? 0} />
                <AdminStatCard icon="✅" label="System Status" value="Healthy" color="#22c55e" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
                {/* ── Pending Queue ─────────────────────────────── */}
                <div>
                    <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Pending Approvals</h2>

                    {pendingMentors.slice(0, 5).map((m) => (
                        <div key={m._id} style={queueCardStyle}>
                            <div>
                                <span style={{ fontWeight: 600 }}>{m.userId?.profile?.displayName}</span>
                                <span style={{ color: "#64748b", marginLeft: 8, fontSize: 12 }}>Mentor Application</span>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => handleVerifyMentor(m._id)} style={approveBtn}>Approve</button>
                                <button style={rejectBtn}>Reject</button>
                            </div>
                        </div>
                    ))}

                    {pendingSocieties.slice(0, 5).map((s) => (
                        <div key={s._id} style={queueCardStyle}>
                            <div>
                                <span style={{ fontWeight: 600 }}>{s.name}</span>
                                <span style={{ color: "#64748b", marginLeft: 8, fontSize: 12 }}>Society Request</span>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => handleApproveSociety(s._id)} style={approveBtn}>Approve</button>
                                <button style={rejectBtn}>Reject</button>
                            </div>
                        </div>
                    ))}

                    {pendingMentors.length === 0 && pendingSocieties.length === 0 && (
                        <div style={{ color: "#64748b", padding: 16 }}>No pending approvals ✓</div>
                    )}
                </div>

                {/* ── Live Feed ─────────────────────────────────── */}
                <LiveEventFeed events={liveEvents} />
            </div>
        </div>
    );
};

const queueCardStyle = {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 16px", background: "#1e293b", borderRadius: 8, marginBottom: 8,
};
const approveBtn = {
    padding: "4px 12px", background: "#16a34a", color: "#fff",
    border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12,
};
const rejectBtn = {
    padding: "4px 12px", background: "#dc2626", color: "#fff",
    border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12,
};

export default AdminDashboard;
