import { useState, useEffect } from "react";
import { getPendingSocietyHeadApplications, approveSocietyHeadApplication, rejectSocietyHeadApplication } from "../../api/adminApi";

export default function SocietyApproval() {
    const [pendingHeads, setPendingHeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectingId, setRejectingId] = useState(null);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await getPendingSocietyHeadApplications();
            setPendingHeads(res.data);
        } catch (err) {
            console.error("Failed to fetch pending society heads:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPending(); }, []);

    const handleApprove = async (userId) => {
        setActionLoading(userId);
        try {
            await approveSocietyHeadApplication(userId);
            setPendingHeads((prev) => prev.filter((h) => h._id !== userId));
        } catch (err) { alert("Failed to approve society head"); }
        setActionLoading(null);
    };

    const handleReject = async (userId) => {
        setActionLoading(userId);
        try {
            await rejectSocietyHeadApplication(userId, rejectReason);
            setPendingHeads((prev) => prev.filter((h) => h._id !== userId));
            setRejectingId(null);
            setRejectReason("");
        } catch (err) { alert("Failed to reject application"); }
        setActionLoading(null);
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-background">
            <div className="max-w-5xl mx-auto">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-text-primary">Society Head Approvals</h1>
                    <p className="text-sm text-text-secondary mt-1">
                        Review and approve pending society head applications
                    </p>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : pendingHeads.length === 0 ? (
                    <div className="bg-surface border border-border rounded-lg p-12 text-center">
                        <span className="text-5xl block mb-4">✅</span>
                        <p className="text-text-primary text-lg font-semibold">All caught up!</p>
                        <p className="text-text-secondary mt-2">No pending society head applications to review.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingHeads.map((user) => {
                            const name = user.profile?.displayName || user.profile?.firstName || "Unknown";
                            const dept = user.academic?.department || "No department";
                            const avatar = user.profile?.avatar;
                            const isProcessing = actionLoading === user._id;
                            const isRejecting = rejectingId === user._id;

                            return (
                                <div key={user._id} className="bg-surface border border-border rounded-lg p-5">
                                    <div className="flex flex-col sm:flex-row items-start gap-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            {avatar ? (
                                                <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-orange-900/30 flex items-center justify-center text-orange-400 font-bold text-lg">
                                                    {name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-text-primary font-semibold capitalize">{name}</h3>
                                                <p className="text-text-secondary text-sm">{user.email}</p>
                                                <p className="text-text-secondary text-xs mt-1">{dept} • Applied {new Date(user.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={() => handleApprove(user._id)}
                                                disabled={isProcessing}
                                                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors"
                                            >
                                                ✓ Approve
                                            </button>
                                            <button
                                                onClick={() => setRejectingId(isRejecting ? null : user._id)}
                                                disabled={isProcessing}
                                                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-red-900/30 text-red-400 text-sm font-semibold hover:bg-red-900/50 border border-red-700/50 disabled:opacity-50 transition-colors"
                                            >
                                                ✕ Reject
                                            </button>
                                        </div>
                                    </div>

                                    {isRejecting && (
                                        <div className="mt-4 flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Reason for rejection (optional)..."
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-text-primary text-sm placeholder:text-text-secondary"
                                            />
                                            <button
                                                onClick={() => handleReject(user._id)}
                                                disabled={isProcessing}
                                                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                                            >
                                                Confirm Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
