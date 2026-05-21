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
import useHomeTheme from "@/hooks/useHomeTheme";
import { getButtonClassName } from "../../components/common/Button";

export const AdminUserDetail = () => {
    const isDark = useHomeTheme();
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
        <div style={{ padding: 40, color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))", textAlign: "center" }}>
            <div style={{ width: 32, height: 32, border: "2px solid rgb(var(--color-border-dark))", borderTopColor: "rgb(var(--color-info))", borderRadius: "50%", animate: "spin 1s linear infinite", margin: "0 auto 12px" }} />
            Synchronizing account data...
        </div>
    );
    if (!user) return (
        <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
            <h2 style={{ color: isDark ? "rgb(var(--color-text-primary-dark))" : "rgb(var(--color-text-primary-light))" }}>Identity Not Found</h2>
            <p style={{ color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))" }}>This user record may have been purged or relocated.</p>
            <button
                onClick={() => navigate("/admin/users")}
                className={getButtonClassName({ variant: "primary", size: "md", isDark, className: "mt-4" })}
            >
                Return to Directory
            </button>
        </div>
    );

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out", "--admin-card-bg": isDark ? "rgb(var(--color-background-dark))" : "rgb(var(--color-surface-light))", "--admin-card-border": isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))", "--admin-card-title": isDark ? "rgb(var(--color-text-primary-dark))" : "rgb(var(--color-text-primary-light))", "--admin-card-subtle": isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))", "--admin-row-bg": isDark ? "rgba(30, 41, 59, 0.3)" : "rgba(248, 250, 252, 0.95)" }}>
            <button
                onClick={() => navigate("/admin/users")}
                className={getButtonClassName({ variant: "ghost", size: "sm", isDark, className: "mb-6" })}
            >
                ← BACK TO DIRECTORY
            </button>

            {/* Header Section */}
            <div style={{ background: isDark ? "rgb(var(--color-background-dark))" : "rgb(var(--color-surface-light))", border: `1px solid ${isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))"}`, borderRadius: 20, padding: "32px", marginBottom: 32, display: "flex", gap: 32, alignItems: "center" }}>
                <div style={{ position: "relative" }}>
                    <img src={user.profile?.avatar || "/default-avatar.png"} alt="" style={{ width: 100, height: 100, borderRadius: 24, background: "rgb(var(--color-container-dark))", border: "4px solid rgb(var(--color-container-dark))", objectFit: "cover" }} />
                    <div style={{ position: "absolute", bottom: -5, right: -5, width: 24, height: 24, borderRadius: "50%", background: user.status === "active" ? "rgb(var(--color-success))" : "rgb(var(--color-danger))", border: "4px solid rgb(var(--color-background-dark))" }} />
                </div>
                
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: isDark ? "rgb(var(--color-text-primary-dark))" : "rgb(var(--color-text-primary-light))", margin: 0 }}>{user.profile?.displayName}</h1>
                        <AdminBadge type="status" value={user.status} />
                    </div>
                    <div style={{ color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))", fontSize: 14, fontWeight: 500, marginBottom: 16 }}>{user.email}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                        {user.roles?.map((r) => <AdminBadge key={r} type="role" value={r} />)}
                    </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                    <button
                        onClick={() => setActiveSection("danger")}
                        className={getButtonClassName({ variant: "danger", size: "sm", isDark })}
                    >
                        RESTRICT ACCESS
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: "flex", gap: 6, padding: 4, background: isDark ? "rgb(var(--color-background-dark))" : "rgb(var(--color-background-light))", borderRadius: 12, marginBottom: 32, maxWidth: "fit-content", border: `1px solid ${isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))"}` }}>
                {[
                    {id: 'profile', label: 'IDENTITY', icon: '👤'},
                    {id: 'activity', label: 'ACTIVITY TRAIL', icon: '📜'},
                    {id: 'danger', label: 'GOVERNANCE', icon: '🛡️'}
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSection(tab.id)}
                        className={getButtonClassName({
                            variant: activeSection === tab.id ? "primary" : "ghost",
                            size: "sm",
                            isDark,
                        })}
                    >
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Sections */}
            <div style={{ minHeight: "400px" }}>
                {activeSection === "profile" && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
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
                                <p style={{ color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))", fontSize: 12, marginBottom: 16 }}>Select roles to assign to this identity. Note that this affects system-wide access.</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                                    {ALL_ROLES.map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setNewRoles((prev) =>
                                                prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
                                            )}
                                            className={getButtonClassName({
                                                variant: newRoles.includes(r) ? "primary" : "secondary",
                                                size: "sm",
                                                isDark,
                                            })}
                                        >
                                            {r.replace("_", " ").toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    disabled={JSON.stringify(newRoles) === JSON.stringify(user.roles)}
                                    onClick={() => setRoleConfirmModal(true)}
                                    className={getButtonClassName({
                                        variant: "primary",
                                        size: "md",
                                        isDark,
                                        className: "w-full",
                                    })}
                                >
                                    COMMIT ROLE CHANGES
                                </button>
                            </InfoCard>
                        )}
                    </div>
                )}

                {activeSection === "activity" && (
                    <div style={{ background: isDark ? "rgb(var(--color-background-dark))" : "rgb(var(--color-surface-light))", borderRadius: 20, border: `1px solid ${isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))"}`, padding: 32 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: isDark ? "rgb(var(--color-text-primary-dark))" : "rgb(var(--color-text-primary-light))", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
                            Audit Logs <span style={{ color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))", fontSize: 12, fontWeight: 500 }}>System Recorded History</span>
                        </h2>
                        {activity.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "60px 0", color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))" }}>No activity matches this identity trail.</div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {activity.map((evt, i) => (
                                    <div key={i} style={{ display: "flex", gap: 20, padding: "16px", borderRadius: 12, transition: "background 0.2s", cursor: "default" }} onMouseEnter={(e) => e.currentTarget.style.background = isDark ? "rgb(var(--color-container-dark))" : "rgb(var(--color-background-light))"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: evt._source === "admin_action" ? "rgb(var(--color-warning))" : "rgb(var(--color-info))", marginTop: 4, flexShrink: 0, boxShadow: evt._source === "admin_action" ? "0 0 8px rgba(217, 119, 6, 0.35)" : "0 0 8px rgba(37, 99, 235, 0.35)" }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                <span style={{ color: isDark ? "rgb(var(--color-text-primary-dark))" : "rgb(var(--color-text-primary-light))", fontWeight: 700, fontSize: 14 }}>{evt.action || evt.eventType}</span>
                                                <span style={{ color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))", fontSize: 12, fontWeight: 500 }}>{new Date(evt.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div style={{ color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))", fontSize: 13 }}>
                                                {evt.description || "System triggered action"}
                                                {evt._source === "admin_action" && evt.adminId && (
                                                    <span style={{ color: "rgb(var(--color-info))", fontWeight: 600 }}> — via Admin {evt.adminId?.profile?.displayName}</span>
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
                    <div style={{ background: isDark ? "rgb(var(--color-background-dark))" : "rgb(var(--color-surface-light))", border: `1px solid ${isDark ? "rgba(220, 38, 38, 0.28)" : "rgba(220, 38, 38, 0.18)"}`, borderRadius: 20, padding: "32px" }}>
                        <div style={{ marginBottom: 32 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 800, color: "rgb(var(--color-danger))", margin: 0 }}>System Governance</h2>
                            <p style={{ color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))", marginTop: 4 }}>Irreversible actions and system-wide restriction controls.</p>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <GovernanceRow
                                title={user.status === "active" ? "IDENTITY SUSPENSION" : "IDENTITY REACTIVATION"}
                                description={user.status === "active" ? "Immediately revoke all system access and lock this identity." : "Restore full system access and notify the user."}
                                actionLabel={user.status === "active" ? "SUSPEND" : "RESTORE"}
                                variant="danger"
                                isDark={isDark}
                                onClick={() => setSuspendModal(true)}
                            />
                            <GovernanceRow
                                title="FORCE SESSION TERMINATION"
                                description="Immediately invalidate all active JWT tokens and clear socket connections."
                                actionLabel="TERMINATE"
                                variant="alert"
                                isDark={isDark}
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
    <div style={{ background: "var(--admin-card-bg, rgb(var(--color-background-dark)))", borderRadius: 20, border: "1px solid var(--admin-card-border, rgb(var(--color-border-dark)))", padding: 28 }}>
        <h3 style={{ fontSize: 12, fontWeight: 800, color: "var(--admin-card-subtle, rgb(var(--color-text-secondary-dark)))", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>{title}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {children}
        </div>
    </div>
);

const Field = ({ label, value, copyable }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ color: "var(--admin-card-subtle, rgb(var(--color-text-secondary-dark)))", fontSize: 13, fontWeight: 500 }}>{label}</span>
        <div style={{ textAlign: "right" }}>
            <div style={{ color: "var(--admin-card-title, rgb(var(--color-text-primary-dark)))", fontSize: 14, fontWeight: 600 }}>{value ?? "N/A"}</div>
        </div>
    </div>
);

const GovernanceRow = ({ title, description, actionLabel, variant, onClick, isDark }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "var(--admin-row-bg, rgba(30, 41, 59, 0.3))", borderRadius: 16, border: "1px solid var(--admin-card-border, rgb(var(--color-border-dark)))" }}>
        <div>
            <div style={{ color: "var(--admin-card-title, rgb(var(--color-text-primary-dark)))", fontWeight: 800, fontSize: 14, letterSpacing: "0.02em" }}>{title}</div>
            <div style={{ color: "var(--admin-card-subtle, rgb(var(--color-text-secondary-dark)))", fontSize: 12, marginTop: 4, maxWidth: "400px" }}>{description}</div>
        </div>
        <button
            onClick={onClick}
            className={getButtonClassName({
                variant: variant === "danger" ? "danger" : "primary",
                size: "sm",
                isDark,
            })}
        >
            {actionLabel}
        </button>
    </div>
);

export default AdminUserDetail;
