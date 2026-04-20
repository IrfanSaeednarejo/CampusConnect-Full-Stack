import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminUsers, updateUserStatus, forceLogoutUser } from "../../api/adminApi";
import { toast } from "react-hot-toast";
import AdminTable from "../components/AdminTable";
import AdminBadge from "../components/AdminBadge";
import ReasonModal from "../components/ReasonModal";
import ConfirmModal from "../components/ConfirmModal";

export const AdminUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ page: 1, limit: 20, status: "all", q: "" });
    const [searchQuery, setSearchQuery] = useState("");
    const [reasonModal, setReasonModal] = useState(null); // { userId, action }
    const [confirmModal, setConfirmModal] = useState(null); // { userId, action, title, description, confirmWord, danger }

    // Fetch users with filters
    const fetchUsers = useCallback(async (f = filters) => {
        setLoading(true);
        try {
            const { data } = await getAdminUsers(f);
            setUsers(data.data.docs || []);
            setPagination(data.data.pagination || {});
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Initial fetch and on filter change
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, q: searchQuery, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSuspend = async ({ confirmed, reason }) => {
        if (!confirmed || !reasonModal) {
            setReasonModal(null);
            return;
        }
        try {
            await updateUserStatus(reasonModal.userId, { status: "suspended", reason });
            toast.success("User suspended! Access restricted immediately.");
            setReasonModal(null);
            fetchUsers();
        } catch (err) {
            toast.error(err.message || "Action failed. Please try again.");
        }
    };

    const handleConfirmation = async ({ confirmed }) => {
        if (!confirmed || !confirmModal) {
            setConfirmModal(null);
            return;
        }
        const { userId, action } = confirmModal;
        try {
            if (action === "kill_sessions") {
                await forceLogoutUser(userId);
                toast.success("All sessions terminated. User will be forced to login.");
            } else if (action === "restore") {
                await updateUserStatus(userId, { status: "active" });
                toast.success("User access restored!");
            }
            setConfirmModal(null);
            fetchUsers();
        } catch (err) {
            toast.error(err.message || "Action failed. Please try again.");
        }
    };

    const columns = [
        { 
            key: "name", 
            label: "Name", 
            render: (u) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ 
                        width: 32, height: 32, borderRadius: "50%", background: "#1e293b", 
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#6366f1"
                    }}>
                        {u.profile?.displayName?.[0] || u.profile?.firstName?.[0] || "?"}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: "#f1f5f9" }}>{u.profile?.displayName || `${u.profile?.firstName} ${u.profile?.lastName}`}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>ID: {u._id.slice(-8).toUpperCase()}</div>
                    </div>
                </div>
            ) 
        },
        { key: "email", label: "Email" },
        { 
            key: "roles", 
            label: "Roles", 
            render: (u) => (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {u.roles?.map((r) => <AdminBadge key={r} type="role" value={r} />)}
                </div>
            )
        },
        { key: "status", label: "Status", render: (u) => <AdminBadge type="status" value={u.status} /> },
        { 
            key: "lastLoginAt", 
            label: "Last Login", 
            render: (u) => (
                <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Never Recorded"}
                </div>
            )
        },
    ];

    const rowActions = (user) => [
        { label: "Full Audit Profile", onClick: () => navigate(`/admin/users/${user._id}`) },
        ...(user.status === "active" 
            ? [{ label: "Suspend Account", onClick: () => setReasonModal({ userId: user._id, action: "suspend" }), danger: true }]
            : [{ 
                label: "Restore Access", 
                onClick: () => setConfirmModal({ 
                    userId: user._id, 
                    action: "restore", 
                    title: "Restore User Access?", 
                    description: `Are you sure you want to restore system access for ${user.profile?.displayName}? They will be able to log in and interact with the platform immediately.`,
                    confirmWord: "RESTORE"
                }) 
              }]
        ),
        { 
            label: "Kill All Sessions", 
            onClick: () => setConfirmModal({ 
                userId: user._id, 
                action: "kill_sessions", 
                title: "Terminate User Sessions?", 
                description: `This will immediately invalidate all active JWT tokens and clear socket connections for ${user.profile?.displayName}. The user will be forced to re-authenticate.`,
                confirmWord: "KILL SESSIONS",
                danger: true
            }), 
            danger: true 
        },
    ];

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: "#f8fafc", margin: 0, letterSpacing: "-0.02em" }}>User Management</h1>
                <p style={{ color: "#64748b", marginTop: 8, fontSize: 15 }}>Audit, moderate, and manage system access across all roles.</p>
            </div>

            {/* ── Control Bar ────────────────────────────── */}
            <div style={{ 
                background: "rgba(15, 23, 42, 0.4)", 
                border: "1px solid #1e293b", 
                borderRadius: 20, 
                padding: "24px", 
                marginBottom: 32, 
                display: "flex", 
                gap: 24, 
                alignItems: "center" 
            }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.5 }}>🔍</span>
                    <input
                        placeholder="Search by identity or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                
                <div style={{ 
                    display: "flex", 
                    gap: 4, 
                    background: "#0f172a", 
                    padding: 4, 
                    borderRadius: 12,
                    border: "1px solid #1e293b"
                }}>
                    {["all", "active", "suspended"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilters(prev => ({ ...prev, status: s, page: 1 }))}
                            style={{ 
                                ...filterPill, 
                                background: filters.status === s ? "#6366f1" : "transparent",
                                color: filters.status === s ? "#fff" : "#64748b",
                                fontWeight: filters.status === s ? 700 : 500,
                                boxShadow: filters.status === s ? "0 4px 12px rgba(99, 102, 241, 0.25)" : "none"
                            }}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Database Table ─────────────────────────── */}
            <div style={{ 
                background: "#0f172a", 
                border: "1px solid #1e293b", 
                borderRadius: 20, 
                padding: "8px", 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
            }}>
                <AdminTable
                    columns={columns}
                    data={users}
                    loading={loading}
                    rowActions={rowActions}
                    onRowClick={(u) => navigate(`/admin/users/${u._id}`)}
                    pagination={pagination}
                    onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))}
                />
            </div>

            {reasonModal && (
                <ReasonModal
                    title="Administrative Restriction"
                    prompt={`Provide a justification for suspending access to this account. This will be recorded in the system audit logs.`}
                    onClose={handleSuspend}
                />
            )}

            {confirmModal && (
                <ConfirmModal
                    title={confirmModal.title}
                    description={confirmModal.description}
                    confirmWord={confirmModal.confirmWord}
                    danger={confirmModal.danger}
                    onClose={handleConfirmation}
                />
            )}
        </div>
    );
};

const inputStyle = {
    width: "100%", 
    padding: "14px 16px 14px 48px", 
    background: "#0f172a", 
    border: "1px solid #1e293b",
    borderRadius: 14, 
    color: "#f8fafc", 
    fontSize: 14, 
    outline: "none", 
    transition: "all 0.2s",
    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)"
};

const filterPill = {
    padding: "10px 24px", 
    border: "none", 
    borderRadius: 10,
    cursor: "pointer", 
    fontSize: 13, 
    transition: "all 0.2s"
};

export default AdminUsers;
