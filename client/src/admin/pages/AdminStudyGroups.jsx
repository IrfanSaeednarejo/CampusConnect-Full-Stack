import { useState, useEffect, useCallback } from "react";
import { 
    getAdminStudyGroups, 
    adminUpdateGroupStatus, 
    adminDeleteGroup 
} from "../../api/adminApi";
import AdminTable from "../components/AdminTable";
import AdminBadge from "../components/AdminBadge";
import ConfirmModal from "../components/ConfirmModal";
import ReasonModal from "../components/ReasonModal";
import CreateStudyGroupModal from "../components/CreateStudyGroupModal";
import { toast } from "react-hot-toast";

const AdminStudyGroups = () => {
    const [activeTab, setActiveTab] = useState("active");
    const [q, setQ] = useState("");
    const [groups, setGroups] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [archiveModal, setArchiveModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);

    const TABS = [
        { key: "pending", label: "Pending Requests" },
        { key: "active", label: "Active Groups" },
        { key: "archived", label: "Archived" },
    ];

    const fetchGroups = useCallback(async (p = 1, searchQuery = q) => {
        setLoading(true);
        try {
            const { data } = await getAdminStudyGroups({ 
                status: activeTab === "active" ? "active" : (activeTab === "pending" ? "pending" : "archived"), 
                page: p, 
                limit: 10,
                q: searchQuery.trim()
            });
            setGroups(data.data?.docs || []);
            setPagination(data.data?.pagination || {});
        } catch (err) {
            toast.error("Failed to load study groups");
        } finally {
            setLoading(false);
        }
    }, [activeTab, q]);

    useEffect(() => {
        fetchGroups(1);
    }, [fetchGroups]);

    const handleStatusUpdate = async (id, status, reason = "") => {
        try {
            await adminUpdateGroupStatus(id, { status, reason });
            toast.success(`Group ${status} successfuly`);
            fetchGroups(page);
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        }
    };

    const handleArchive = async ({ confirmed, reason }) => {
        if (!confirmed || !archiveModal) return setArchiveModal(null);
        await handleStatusUpdate(archiveModal, "archived", reason);
        setArchiveModal(null);
    };

    const handleDelete = async ({ confirmed }) => {
        if (!confirmed || !deleteModal) return setDeleteModal(null);
        try {
            await adminDeleteGroup(deleteModal);
            toast.success("Study group deleted");
            fetchGroups(page);
        } catch (err) {
            toast.error("Deletion failed");
        } finally {
            setDeleteModal(null);
        }
    };

    const columns = [
        {
            key: "name",
            label: "Study Group",
            render: (g) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-xl">📚</div>
                    <div>
                        <div className="text-white font-bold text-sm tracking-tight">{g.name}</div>
                        <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{g.subject}</div>
                    </div>
                </div>
            )
        },
        {
            key: "leader",
            label: "Group Leader",
            render: (g) => (
                <div className="flex items-center gap-2">
                    <div className="text-slate-300 text-xs font-semibold">{g.coordinatorId?.profile?.displayName}</div>
                </div>
            )
        },
        {
            key: "members",
            label: "Members",
            render: (g) => (
                <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-xs">{g.memberCount || 0}</span>
                    <span className="text-slate-500 text-[10px]">/ {g.maxMembers}</span>
                </div>
            )
        },
        {
            key: "campus",
            label: "Campus",
            render: (g) => <span className="text-slate-400 text-xs">{g.campusId?.name || "Global"}</span>
        },
        {
            key: "status",
            label: "Status",
            render: (g) => <AdminBadge type="status" value={g.status} />
        }
    ];

    const rowActions = (g) => [
        { label: "View Details", onClick: () => {} }, // TODO: Group Detail page
        ...(g.status === "pending" ? [
            { label: "Approve", onClick: () => handleStatusUpdate(g._id, "active") },
            { label: "Reject", onClick: () => setArchiveModal(g._id), danger: true }
        ] : []),
        ...(g.status === "active" ? [
            { label: "Archive", onClick: () => setArchiveModal(g._id), danger: true }
        ] : []),
        ...(g.status === "archived" ? [
            { label: "Reactivate", onClick: () => handleStatusUpdate(g._id, "active") }
        ] : []),
        { label: "Delete Permanently", onClick: () => setDeleteModal(g._id), danger: true }
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Study Groups</h1>
                    <p className="text-slate-500 mt-2 font-medium max-w-xl">
                        Oversee collaborative academic hubs. Moderate group leader assignments, monitor participation metrics, and govern the system-wide study network.
                    </p>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-3 group active:scale-95"
                >
                    <span className="text-xl group-hover:rotate-90 transition-transform duration-300">＋</span>
                    <span className="text-xs tracking-widest uppercase">Create Study Group</span>
                </button>
            </div>

            {/* Navigation & Search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
                <div className="flex p-1 bg-slate-900/50 border border-slate-800 rounded-2xl w-fit">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                activeTab === t.key 
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1 max-w-sm">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">🔍</div>
                    <input 
                        placeholder="Search by name, subject, or course..."
                        value={q}
                        onChange={(e) => { setQ(e.target.value); fetchGroups(1, e.target.value); }}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white text-xs outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                    />
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
                <AdminTable 
                    columns={columns}
                    data={groups}
                    loading={loading}
                    rowActions={rowActions}
                    pagination={pagination}
                    onPageChange={(p) => { setPage(p); fetchGroups(p); }}
                />
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateStudyGroupModal 
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => { setActiveTab("active"); fetchGroups(1); }}
                />
            )}

            {archiveModal && (
                <ReasonModal 
                    title={activeTab === "pending" ? "Reject Group Request" : "Archive Study Group"} 
                    prompt="Enter a reason to be sent to the group leader:" 
                    onClose={handleArchive} 
                />
            )}

            {deleteModal && (
                <ConfirmModal 
                    title="Delete Permanently"
                    description="This action will remove the study group, archive its associated chats, and clear all member records. This action IS NOT reversible."
                    confirmWord="DELETE"
                    danger
                    onClose={handleDelete}
                />
            )}
        </div>
    );
};

export default AdminStudyGroups;
