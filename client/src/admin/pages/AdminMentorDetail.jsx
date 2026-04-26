import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Ban, AlertTriangle, CheckCircle, CalendarX } from "lucide-react";
import api from "../../api/axios";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";

export default function AdminMentorDetail() {
    const { id } = useParams();
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchOverview();
    }, [id]);

    const fetchOverview = async () => {
        try {
            const { data } = await api.get(`/admin/mentors/${id}/overview`);
            setOverview(data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch mentor overview");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action, reasonPrompt) => {
        const reason = window.prompt(reasonPrompt);
        if (!reason) return;

        setActionLoading(true);
        try {
            const { data } = await api.post(`/admin/mentors/${id}/action`, {
                action,
                reason
            });
            toast.success(data.message);
            fetchOverview();
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size="xl" />
        </div>
    );
    if (!overview) return <div className="text-slate-400 p-8">Mentor not found.</div>;

    const { mentor, sessionStats } = overview;
    const user = mentor.userId || {};

    return (
        <div className="p-8 max-w-5xl mx-auto font-sans text-slate-200">
            <Link to="/admin/mentors" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6 w-fit transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Mentors
            </Link>

            {/* Header Profile Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-xl">
                <img 
                    src={user?.profile?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.profile?.firstName}+${user?.profile?.lastName}&background=3730a3&color=fff`} 
                    alt={user?.profile?.displayName}
                    className="w-24 h-24 rounded-full border-4 border-slate-800 object-cover shadow-lg"
                />
                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-white">{user?.profile?.displayName}</h1>
                        {mentor.verified && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                    </div>
                    <p className="text-slate-400">{user?.email} • Campus: {user?.campusId?.name || 'N/A'}</p>
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-semibold">
                            Tier: {mentor.tier.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 border rounded-full text-xs font-semibold ${mentor.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                            {mentor.isActive ? 'Active' : 'Suspended'}
                        </span>
                    </div>
                </div>

                {/* Control Panel */}
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <button 
                        onClick={() => handleAction("issue_warning", "Enter reason for official warning:")}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-lg transition-colors font-medium text-sm"
                    >
                        <AlertTriangle className="w-4 h-4" /> Issue Warning
                    </button>
                    <button 
                        onClick={() => handleAction("force_cancel_sessions", "Enter reason for force cancelling all upcoming sessions:")}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-lg transition-colors font-medium text-sm"
                    >
                        <CalendarX className="w-4 h-4" /> Cancel Upcoming Sessions
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Financial Ledger */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg md:col-span-2">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        Financial Overview
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                            <p className="text-sm text-slate-500 font-medium mb-1">Total Earnings</p>
                            <p className="text-2xl font-bold text-emerald-400">${mentor.totalEarnings?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                            <p className="text-sm text-slate-500 font-medium mb-1">Pending Payout</p>
                            <p className="text-2xl font-bold text-amber-400">${mentor.pendingPayout?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>
                </div>

                {/* Rating & Performance */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        Performance
                    </h2>
                    <div className="flex flex-col gap-4">
                        <div>
                            <p className="text-sm text-slate-500 font-medium mb-1">Average Rating</p>
                            <p className="text-2xl font-bold text-white">{mentor.averageRating?.toFixed(1) || '0.0'} <span className="text-sm text-slate-500 font-normal">/ 5.0</span></p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium mb-1">Total Reviews</p>
                            <p className="text-xl font-bold text-slate-300">{mentor.totalReviews || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Session Stats */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg mb-8">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    Session Analytics
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {Object.entries(sessionStats).map(([status, count]) => (
                        <div key={status} className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-center">
                            <p className="text-3xl font-bold text-white mb-1">{count}</p>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{status}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Moderation History / Status */}
            {mentor.suspendReason && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 shadow-lg">
                    <h2 className="text-lg font-semibold text-rose-400 mb-2 flex items-center gap-2">
                        <Ban className="w-5 h-5" /> Current Suspension
                    </h2>
                    <p className="text-rose-200">
                        <span className="font-semibold">Reason:</span> {mentor.suspendReason}
                    </p>
                    {mentor.suspendedAt && (
                        <p className="text-rose-300/70 text-sm mt-2">
                            Suspended on {format(new Date(mentor.suspendedAt), 'PPP')}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
