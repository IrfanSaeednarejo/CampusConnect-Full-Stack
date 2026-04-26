import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, ShieldAlert, Users, Calendar, Clock, MapPin } from "lucide-react";
import api from "../../api/axios";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";

export default function AdminEventDetail() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const res = await api.get(`/admin/events/${id}/analytics`);
            setData(res.data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch event data");
        } finally {
            setLoading(false);
        }
    };

    const handleKillSwitch = async () => {
        const reason = window.prompt("EMERGENCY KILL SWITCH: Enter cancellation reason. This will notify all users and refund any applicable fees.");
        if (!reason) return;

        setActionLoading(true);
        try {
            const res = await api.patch(`/admin/events/${id}/cancel`, { reason });
            toast.success(res.data.message);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Kill switch failed");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size="xl" />
        </div>
    );
    if (!data) return <div className="text-slate-400 p-8">Event not found.</div>;

    const { event, analytics } = data;

    return (
        <div className="p-8 max-w-6xl mx-auto font-sans text-slate-200">
            <Link to="/admin/events" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6 w-fit transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Events
            </Link>

            {/* Header Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8 shadow-xl flex flex-col lg:flex-row gap-8 justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            event.status === 'published' || event.status === 'registration' || event.status === 'ongoing' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : event.status === 'cancelled'
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                            {event.status}
                        </span>
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-bold">
                            {event.type}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">{event.title}</h1>
                    <div className="flex flex-col gap-2 text-sm text-slate-400">
                        <p className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {format(new Date(event.startAt), 'PPP')}</p>
                        <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {format(new Date(event.startAt), 'p')} - {format(new Date(event.endAt), 'p')}</p>
                        <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.venue || 'Online / TBD'}</p>
                        <p className="flex items-center gap-2 mt-2 text-indigo-300">Organized by: {event.societyId?.name || 'Unknown'}</p>
                    </div>
                </div>

                {/* Kill Switch Panel */}
                <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-6 min-w-[300px]">
                    <h3 className="text-rose-400 font-bold mb-2 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" /> Danger Zone
                    </h3>
                    <p className="text-rose-200/70 text-xs mb-4">
                        Immediately terminate this event. This action cannot be undone and will dispatch emergency notifications.
                    </p>
                    <button
                        onClick={handleKillSwitch}
                        disabled={actionLoading || event.status === 'cancelled' || event.status === 'completed'}
                        className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-900/50 disabled:text-rose-500/50 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <AlertTriangle className="w-5 h-5" />
                        {event.status === 'cancelled' ? 'Event Cancelled' : 'ENGAGE KILL SWITCH'}
                    </button>
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                    <p className="text-sm text-slate-500 font-medium mb-1">Total Capacity</p>
                    <p className="text-3xl font-bold text-white">{event.capacity || '∞'}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                    <p className="text-sm text-slate-500 font-medium mb-1">Total RSVP'd</p>
                    <p className="text-3xl font-bold text-indigo-400">{analytics.totalRegistrations}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                    <p className="text-sm text-slate-500 font-medium mb-1">Checked In (Attended)</p>
                    <p className="text-3xl font-bold text-emerald-400">{analytics.attended}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                    <p className="text-sm text-slate-500 font-medium mb-1">Drop-off Rate</p>
                    <p className="text-3xl font-bold text-amber-400">{analytics.dropOffRate}%</p>
                </div>
            </div>

            {/* RSVP Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5" /> RSVP Breakdown
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-center">
                        <p className="text-2xl font-bold text-slate-300 mb-1">{analytics.registered}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Registered</p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-center">
                        <p className="text-2xl font-bold text-slate-300 mb-1">{analytics.waitlisted}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Waitlisted</p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-center">
                        <p className="text-2xl font-bold text-slate-300 mb-1">{analytics.attended}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Attended</p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-center">
                        <p className="text-2xl font-bold text-slate-300 mb-1">{analytics.cancelled}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Cancelled</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
