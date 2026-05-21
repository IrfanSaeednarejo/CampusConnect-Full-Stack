import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminUsers, updateUserStatus, forceLogoutUser } from "../../api/adminApi";
import { toast } from "react-hot-toast";
import AdminTable from "../components/AdminTable";
import AdminBadge from "../components/AdminBadge";
import ReasonModal from "../components/ReasonModal";
import ConfirmModal from "../components/ConfirmModal";
import useHomeTheme from "@/hooks/useHomeTheme";
import { getButtonClassName } from "../../components/common/Button";

export const AdminUsers = () => {
    const isDark = useHomeTheme();
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
                        width: 32, height: 32, borderRadius: "50%", background: isDark ? "rgb(var(--color-container-dark))" : "rgb(var(--color-background-light))", 
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "rgb(var(--color-info))"
                    }}>
                        {u.profile?.displayName?.[0] || u.profile?.firstName?.[0] || "?"}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: isDark ? "rgb(var(--color-text-primary-dark))" : "rgb(var(--color-text-primary-light))" }}>{u.profile?.displayName || `${u.profile?.firstName} ${u.profile?.lastName}`}</div>
                        <div style={{ fontSize: 11, color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))" }}>ID: {u._id.slice(-8).toUpperCase()}</div>
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
                <div style={{ fontSize: 13, color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))" }}>
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
            <div className="mb-10">
                <h1 className="m-0 text-3xl font-semibold tracking-tight text-text-primary">User Management</h1>
                <p className="mt-2 text-sm text-text-secondary">Audit, moderate, and manage system access across all roles.</p>
            </div>

            {/* ── Control Bar ────────────────────────────── */}
            <div className="theme-surface mb-8 flex items-center gap-6 rounded-[20px] p-6">
                <div style={{ position: "relative", flex: 1 }}>
                    <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.5 }}>🔍</span>
                    <input
                        placeholder="Search by identity or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                
                <div className="theme-surface-muted flex gap-1 rounded-xl p-1">
                    {["all", "active", "suspended"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilters(prev => ({ ...prev, status: s, page: 1 }))}
                            className={getButtonClassName({
                                variant: filters.status === s ? "primary" : "ghost",
                                size: "sm",
                                isDark,
                            })}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Database Table ─────────────────────────── */}
            <div className="theme-surface rounded-[20px] p-2">
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
    background: "rgb(var(--color-surface))",
    border: "1px solid rgb(var(--color-border))",
    borderRadius: 14, 
    color: "rgb(var(--color-text-primary))",
    fontSize: 14, 
    outline: "none", 
    transition: "border-color 0.2s, color 0.2s, background-color 0.2s"
};

export default AdminUsers;
