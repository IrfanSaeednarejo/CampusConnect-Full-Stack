import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    getAdminUserDetail, 
    getAdminUserActivity, 
    updateUserStatus, 
    updateUserRole, 
    forceLogoutUser 
} from "../../api/adminApi";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import AdminBadge from "../components/AdminBadge";
import ReasonModal from "../components/ReasonModal";
import ConfirmModal from "../components/ConfirmModal";

export const AdminUserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: adminUser } = useSelector((state) => state.auth);
    const isSuperAdmin = adminUser?.roles?.includes("super_admin");

    const [user, setUser] = useState(null);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState("profile");
    const [suspendModal, setSuspendModal] = useState(false);
    const [logoutModal, setLogoutModal] = useState(false);
    const [roleConfirmModal, setRoleConfirmModal] = useState(false);
    const [newRoles, setNewRoles] = useState([]);

    const ALL_ROLES = ["student", "mentor", "society_head", "admin", "super_admin", "campus_admin"];

    useEffect(() => {
        Promise.all([getAdminUserDetail(userId), getAdminUserActivity(userId)])
            .then(([uRes, aRes]) => {
                setUser(uRes.data?.data);
                setNewRoles(uRes.data?.data?.roles || []);
                setActivity(aRes.data?.data || []);
            })
            .finally(() => setLoading(false));
    }, [userId]);

    const handleStatusChange = async ({ confirmed, reason }) => {
        if (!confirmed || !suspendModal) return setSuspendModal(false);
        const newStatus = user.status === "active" ? "suspended" : "active";
        try {
            await updateUserStatus(userId, { status: newStatus, reason });
            setUser((u) => ({ ...u, status: newStatus }));
            toast.success(`User set to ${newStatus} successfully!`);
        } catch (err) {
            toast.error(err.message || "Status update failed");
        } finally {
            setSuspendModal(false);
        }
    };

    const handleRoleUpdate = async ({ confirmed }) => {
        if (!confirmed) return setRoleConfirmModal(false);
        try {
            await updateUserRole(userId, { roles: newRoles });
            setUser((u) => ({ ...u, roles: newRoles }));
            toast.success("User permissions updated!");
        } catch (err) {
            toast.error(err.message || "Role update failed");
        } finally {
            setRoleConfirmModal(false);
        }
    };

    const handleForceLogout = async ({ confirmed }) => {
        if (!confirmed) return setLogoutModal(false);
        try {
            await forceLogoutUser(userId);
            toast.success("All sessions terminated for this identity.");
        } catch (err) {
            toast.error(err.message || "Force logout failed");
        } finally {
            setLogoutModal(false);
        }
    };

    if (loading) return (
        <div style={{ padding: 40, color: "#94a3b8", textAlign: "center" }}>
            <div style={{ width: 32, height: 32, border: "2px solid #1e293b", borderTopColor: "#6366f1", borderRadius: "50%", animate: "spin 1s linear infinite", margin: "0 auto 12px" }} />
            Synchronizing account data...
        </div>
    );
    if (!user) return (
        <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
            <h2 style={{ color: "#f8fafc" }}>Identity Not Found</h2>
            <p style={{ color: "#64748b" }}>This user record may have been purged or relocated.</p>
            <button onClick={() => navigate("/admin/users")} style={{ background: "#6366f1", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, marginTop: 16, cursor: "pointer" }}>
                Return to Directory
            </button>
        </div>
    );

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <button 
                onClick={() => navigate("/admin/users")} 
                style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", marginBottom: 24, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
            >
                ← BACK TO DIRECTORY
            </button>

            {/* Header Section */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, padding: "32px", marginBottom: 32, display: "flex", gap: 32, alignItems: "center" }}>
                <div style={{ position: "relative" }}>
                    <img src={user.profile?.avatar || "/default-avatar.png"} alt="" style={{ width: 100, height: 100, borderRadius: 24, background: "#1e293b", border: "4px solid #1e293b", objectFit: "cover" }} />
                    <div style={{ position: "absolute", bottom: -5, right: -5, width: 24, height: 24, borderRadius: "50%", background: user.status === "active" ? "#10b981" : "#f43f5e", border: "4px solid #0f172a" }} />
                </div>
                
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#f8fafc", margin: 0 }}>{user.profile?.displayName}</h1>
                        <AdminBadge type="status" value={user.status} />
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 14, fontWeight: 500, marginBottom: 16 }}>{user.email}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                        {user.roles?.map((r) => <AdminBadge key={r} type="role" value={r} />)}
                    </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                    <button 
                        onClick={() => setActiveSection("danger")}
                        style={{ padding: "10px 20px", background: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", border: "1px solid rgba(244, 63, 94, 0.2)", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                    >
                        RESTRICT ACCESS
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: "flex", gap: 6, padding: 4, background: "#0f172a", borderRadius: 12, marginBottom: 32, maxWidth: "fit-content", border: "1px solid #1e293b" }}>
                {[
                    {id: 'profile', label: 'IDENTITY', icon: '👤'},
                    {id: 'activity', label: 'ACTIVITY TRAIL', icon: '📜'},
                    {id: 'danger', label: 'GOVERNANCE', icon: '🛡️'}
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSection(tab.id)}
                        style={{
                            padding: "10px 24px", border: "none", borderRadius: 8,
                            background: activeSection === tab.id ? "#6366f1" : "transparent",
                            color: activeSection === tab.id ? "#fff" : "#64748b",
                            cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8,
                            transition: "all 0.2s"
                        }}
                    >
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Sections */}
            <div style={{ minHeight: "400px" }}>
                {activeSection === "profile" && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 }}>
                        <InfoCard title="Account Details">
                            <Field label="System ID" value={user._id} copyable />
                            <Field label="Identity Status" value={<AdminBadge type="status" value={user.status} />} />
                            <Field label="Onboarding Status" value={user.onboarding?.isComplete ? "COMPLETED" : "INCOMPLETE"} />
                            <Field label="Registration Date" value={new Date(user.createdAt).toLocaleDateString()} />
                            <Field label="Last Session" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "NONE RECORDED"} />
                        </InfoCard>

                        <InfoCard title="Identity Profile">
                            <Field label="Legal First Name" value={user.profile?.firstName} />
                            <Field label="Legal Last Name" value={user.profile?.lastName} />
                            <Field label="Contact Phone" value={user.profile?.phone || "NOT SET"} />
                            <Field label="Campus Node" value={user.campusId?.name || "GLOBAL"} />
                        </InfoCard>

                        {isSuperAdmin && (
                            <InfoCard title="Administrative Permissions">
                                <p style={{ color: "#64748b", fontSize: 12, marginBottom: 16 }}>Select roles to assign to this identity. Note that this affects system-wide access.</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                                    {ALL_ROLES.map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setNewRoles((prev) =>
                                                prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
                                            )}
                                            style={{
                                                padding: "6px 14px", border: "1px solid",
                                                borderColor: newRoles.includes(r) ? "#6366f1" : "#1e293b",
                                                borderRadius: 8,
                                                background: newRoles.includes(r) ? "rgba(99, 102, 241, 0.1)" : "#1e293b",
                                                color: newRoles.includes(r) ? "#818cf8" : "#64748b",
                                                cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s"
                                            }}
                                        >
                                            {r.replace("_", " ").toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    disabled={JSON.stringify(newRoles) === JSON.stringify(user.roles)}
                                    onClick={() => setRoleConfirmModal(true)}
                                    style={{ 
                                        width: "100%", padding: "12px", background: "#6366f1", color: "#fff", 
                                        border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", 
                                        opacity: JSON.stringify(newRoles) === JSON.stringify(user.roles) ? 0.5 : 1
                                    }}
                                >
                                    COMMIT ROLE CHANGES
                                </button>
                            </InfoCard>
                        )}
                    </div>
                )}

                {activeSection === "activity" && (
                    <div style={{ background: "#0f172a", borderRadius: 20, border: "1px solid #1e293b", padding: 32 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
                            Audit Logs <span style={{ color: "#64748b", fontSize: 12, fontWeight: 500 }}>System Recorded History</span>
                        </h2>
                        {activity.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>No activity matches this identity trail.</div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {activity.map((evt, i) => (
                                    <div key={i} style={{ display: "flex", gap: 20, padding: "16px", borderRadius: 12, transition: "background 0.2s", cursor: "default" }} onMouseEnter={(e) => e.currentTarget.style.background = "#1e293b"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: evt._source === "admin_action" ? "#f59e0b" : "#6366f1", marginTop: 4, flexShrink: 0, boxShadow: evt._source === "admin_action" ? "0 0 8px rgba(245, 158, 11, 0.4)" : "0 0 8px rgba(99, 102, 241, 0.4)" }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>{evt.action || evt.eventType}</span>
                                                <span style={{ color: "#475569", fontSize: 12, fontWeight: 500 }}>{new Date(evt.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div style={{ color: "#94a3b8", fontSize: 13 }}>
                                                {evt.description || "System triggered action"}
                                                {evt._source === "admin_action" && evt.adminId && (
                                                    <span style={{ color: "#6366f1", fontWeight: 600 }}> — via Admin {evt.adminId?.profile?.displayName}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeSection === "danger" && (
                    <div style={{ background: "#0f172a", border: "1px solid #7f1d1d", borderRadius: 20, padding: "32px" }}>
                        <div style={{ marginBottom: 32 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f43f5e", margin: 0 }}>System Governance</h2>
                            <p style={{ color: "#64748b", marginTop: 4 }}>Irreversible actions and system-wide restriction controls.</p>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <GovernanceRow
                                title={user.status === "active" ? "IDENTITY SUSPENSION" : "IDENTITY REACTIVATION"}
                                description={user.status === "active" ? "Immediately revoke all system access and lock this identity." : "Restore full system access and notify the user."}
                                actionLabel={user.status === "active" ? "SUSPEND" : "RESTORE"}
                                variant="danger"
                                onClick={() => setSuspendModal(true)}
                            />
                            <GovernanceRow
                                title="FORCE SESSION TERMINATION"
                                description="Immediately invalidate all active JWT tokens and clear socket connections."
                                actionLabel="TERMINATE"
                                variant="alert"
                                onClick={() => setLogoutModal(true)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {suspendModal && (
                <ReasonModal
                    title="System Restriction"
                    onClose={handleStatusChange}
                />
            )}
            {logoutModal && (
                <ConfirmModal
                    title="Terminate Identity Sessions?"
                    description={`This will force ${user.profile?.displayName} to re-authenticate by invalidating all active login tokens across all devices.`}
                    confirmWord="TERMINATE SESSIONS"
                    danger={true}
                    onClose={handleForceLogout}
                />
            )}
            {roleConfirmModal && (
                <ConfirmModal
                    title="Commit Role Changes?"
                    description={`You are about to modify the system-wide permissions for ${user.profile?.displayName}. The new role set will be: ${newRoles.map(r => r.toUpperCase()).join(", ")}.`}
                    confirmWord="UPDATE PERMISSIONS"
                    onClose={handleRoleUpdate}
                />
            )}
        </div>
    );
};

// ── Shared Subview Components ──────────────────────────────────────────────────

const InfoCard = ({ title, children }) => (
    <div style={{ background: "#0f172a", borderRadius: 20, border: "1px solid #1e293b", padding: 28 }}>
        <h3 style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>{title}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {children}
        </div>
    </div>
);

const Field = ({ label, value, copyable }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>{label}</span>
        <div style={{ textAlign: "right" }}>
            <div style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 600 }}>{value ?? "N/A"}</div>
        </div>
    </div>
);

const GovernanceRow = ({ title, description, actionLabel, variant, onClick }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "rgba(30, 41, 59, 0.3)", borderRadius: 16, border: "1px solid #1e293b" }}>
        <div>
            <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 14, letterSpacing: "0.02em" }}>{title}</div>
            <div style={{ color: "#64748b", fontSize: 12, marginTop: 4, maxWidth: "400px" }}>{description}</div>
        </div>
        <button 
            onClick={onClick} 
            style={{ 
                padding: "10px 24px", 
                background: variant === 'danger' ? "#f43f5e" : "#8b5cf6", 
                color: "#fff", 
                border: "none", 
                borderRadius: 10, 
                cursor: "pointer", 
                fontWeight: 700, 
                fontSize: 13,
                boxShadow: `0 4px 12px ${variant === 'danger' ? 'rgba(244, 63, 114, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`
            }}
        >
            {actionLabel}
        </button>
    </div>
);

export default AdminUserDetail;
