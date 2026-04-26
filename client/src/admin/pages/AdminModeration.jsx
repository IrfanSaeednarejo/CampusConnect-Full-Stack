import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle, Shield, XCircle, Search, Filter } from "lucide-react";
import api from "../../api/axios";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";

export default function AdminModeration() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("pending");
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchReports();
    }, [filterStatus]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/admin/reports?status=${filterStatus}`);
            setReports(data.data.docs || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch reports");
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id, status, promptMsg) => {
        const notes = window.prompt(promptMsg);
        if (notes === null) return;

        setActionLoading(id);
        try {
            await api.patch(`/admin/reports/${id}`, { status, adminNotes: notes });
            toast.success("Report updated successfully");
            fetchReports();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update report");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans text-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Shield className="w-8 h-8 text-rose-500" /> Moderation Queue
                    </h1>
                    <p className="text-slate-400 mt-2">Manage user reports and enforce platform safety.</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-900 p-1 border border-slate-800 rounded-lg">
                    {["pending", "reviewed", "resolved", "dismissed"].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-md text-sm font-semibold capitalize transition-all ${
                                filterStatus === status 
                                    ? "bg-indigo-600 text-white shadow-lg" 
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Spinner size="xl" />
                </div>
            ) : reports.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center shadow-lg">
                    <Shield className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Queue is Empty</h3>
                    <p className="text-slate-400">No {filterStatus} reports found. Great job keeping the platform clean!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {reports.map((report) => (
                        <div key={report._id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row gap-6 shadow-md hover:border-slate-700 transition-colors">
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold rounded uppercase tracking-wider">
                                        {report.reason.replace("_", " ")}
                                    </span>
                                    <span className="text-sm font-mono text-slate-500">Target: {report.targetModel}</span>
                                    <span className="text-sm text-slate-500">• {format(new Date(report.createdAt), 'PP p')}</span>
                                </div>
                                <p className="text-slate-300 font-medium mb-4 italic border-l-2 border-slate-700 pl-4 py-1">
                                    "{report.description}"
                                </p>
                                <div className="text-xs text-slate-500 flex flex-wrap gap-4">
                                    <span>Reporter: <span className="font-semibold text-slate-400">{report.reporterId?.profile?.displayName || report.reporterId?.email || 'Unknown'}</span></span>
                                    <span>Target ID: <Link to={`/admin/${report.targetModel.toLowerCase()}s/${report.targetId}`} className="text-indigo-400 hover:underline font-mono">{report.targetId}</Link></span>
                                </div>
                                {report.adminNotes && (
                                    <div className="mt-4 bg-slate-950 p-3 rounded border border-slate-800 text-sm">
                                        <span className="text-slate-500 font-semibold">Admin Notes: </span>
                                        <span className="text-slate-300">{report.adminNotes}</span>
                                    </div>
                                )}
                            </div>

                            {report.status === "pending" && (
                                <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 min-w-[160px]">
                                    <button 
                                        onClick={() => handleResolve(report._id, "resolved", "Enter action taken (e.g. User suspended for 7 days):")}
                                        disabled={actionLoading === report._id}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-lg text-sm font-semibold transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Resolve
                                    </button>
                                    <button 
                                        onClick={() => handleResolve(report._id, "dismissed", "Enter reason for dismissal:")}
                                        disabled={actionLoading === report._id}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-sm font-semibold transition-colors"
                                    >
                                        <XCircle className="w-4 h-4" /> Dismiss
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
