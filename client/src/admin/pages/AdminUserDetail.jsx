import { useState as useState2, useEffect as useEffect2 } from "react";
import { useParams, useNavigate as useNavigate2 } from "react-router-dom";
import { getAdminUserDetail, getAdminUserActivity, updateUserStatus, updateUserRole, forceLogoutUser } from "../../api/adminApi";
import { useSelector as useSelector2 } from "react-redux";
import AdminBadge3 from "../components/AdminBadge";
import ReasonModal2 from "../components/ReasonModal";
import ConfirmModal3 from "../components/ConfirmModal";

export const AdminUserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate2();
    const { user: adminUser } = useSelector2((state) => state.auth);
    const isSuperAdmin = adminUser?.roles?.includes("super_admin");

    const [user, setUser] = useState2(null);
    const [activity, setActivity2] = useState2([]);
    const [loading, setLoading2] = useState2(true);
    const [activeSection, setActiveSection2] = useState2("profile"); // profile | activity | danger
    const [suspendModal, setSuspendModal2] = useState2(false);
    const [logoutModal, setLogoutModal2] = useState2(false);
    const [newRoles, setNewRoles2] = useState2([]);

    const ALL_ROLES = ["student", "mentor", "society_head", "admin", "super_admin", "campus_admin", "read_only_admin"];

    useEffect2(() => {
        Promise.all([getAdminUserDetail(userId), getAdminUserActivity(userId)])
            .then(([uRes, aRes]) => {
                setUser(uRes.data?.data);
                setNewRoles2(uRes.data?.data?.roles || []);
                setActivity2(aRes.data?.data || []);
            })
            .finally(() => setLoading2(false));
    }, [userId]);

    const handleStatusChange = async ({ confirmed, reason }) => {
        if (!confirmed || !suspendModal) return setSuspendModal2(false);
        const newStatus = user.status === "active" ? "suspended" : "active";
        await updateUserStatus(userId, { status: newStatus, reason });
        setSuspendModal2(false);
        setUser((u) => ({ ...u, status: newStatus }));
    };

    const handleRoleUpdate = async () => {
        await updateUserRole(userId, { roles: newRoles });
        setUser((u) => ({ ...u, roles: newRoles }));
    };

    const handleForceLogout = async ({ confirmed }) => {
        if (!confirmed) return setLogoutModal2(false);
        await forceLogoutUser(userId);
        setLogoutModal2(false);
    };

    if (loading) return <div style={{ color: "#64748b", padding: 32 }}>Loading...</div>;
    if (!user)   return <div style={{ color: "#ef4444", padding: 32 }}>User not found</div>;

    const sectionBtn = (key, label) => (
        <button
            onClick={() => setActiveSection2(key)}
            style={{
                padding: "8px 20px", border: "none", borderRadius: 6,
                background: activeSection === key ? "#6366f1" : "#1e293b",
                color: "#f8fafc", cursor: "pointer", fontSize: 13,
            }}
        >
            {label}
        </button>
    );

    return (
        <div>
            <button onClick={() => navigate("/admin/users")} style={{ background: "transparent", border: "none", color: "#6366f1", cursor: "pointer", marginBottom: 16, fontSize: 14 }}>
                ← Back to Users
            </button>

            {/* Header */}
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
                <img src={user.profile?.avatar || ""} alt="" style={{ width: 60, height: 60, borderRadius: "50%", background: "#334155" }} />
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700 }}>{user.profile?.displayName}</h1>
                    <div style={{ color: "#64748b", fontSize: 14 }}>{user.email}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        {user.roles?.map((r) => <AdminBadge3 key={r} type="role" value={r} />)}
                        <AdminBadge3 type="status" value={user.status} />
                    </div>
                </div>
            </div>

            {/* Section tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {sectionBtn("profile",  "Profile")}
                {sectionBtn("activity", "Activity")}
                {sectionBtn("danger",   "Actions")}
            </div>

            {/* ── Profile Section ───────────────────────── */}
            {activeSection === "profile" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <InfoCard title="Account">
                        <Field label="Email"       value={user.email} />
                        <Field label="Status"      value={<AdminBadge3 type="status" value={user.status} />} />
                        <Field label="Login Count" value={user.loginCount ?? 0} />
                        <Field label="Last Login"  value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"} />
                        <Field label="Created"     value={new Date(user.createdAt).toLocaleDateString()} />
                    </InfoCard>

                    <InfoCard title="Profile">
                        <Field label="First Name" value={user.profile?.firstName} />
                        <Field label="Last Name"  value={user.profile?.lastName} />
                        <Field label="Phone"      value={user.profile?.phone || "—"} />
                        <Field label="Bio"        value={user.profile?.bio || "—"} />
                        <Field label="Campus"     value={user.campusId?.name || "—"} />
                    </InfoCard>

                    <InfoCard title="Academic">
                        <Field label="Degree"      value={user.academic?.degree || "—"} />
                        <Field label="Department"  value={user.academic?.department || "—"} />
                        <Field label="Semester"    value={user.academic?.semester || "—"} />
                        <Field label="Student ID"  value={user.academic?.studentId || "—"} />
                    </InfoCard>

                    {isSuperAdmin && (
                        <InfoCard title="Role Management">
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                                {ALL_ROLES.map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setNewRoles2((prev) =>
                                            prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
                                        )}
                                        style={{
                                            padding: "4px 12px", border: "1px solid",
                                            borderColor: newRoles.includes(r) ? "#6366f1" : "#334155",
                                            borderRadius: 6,
                                            background: newRoles.includes(r) ? "#6366f120" : "transparent",
                                            color: newRoles.includes(r) ? "#6366f1" : "#94a3b8",
                                            cursor: "pointer", fontSize: 12,
                                        }}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleRoleUpdate}
                                style={{ padding: "7px 16px", background: "#6366f1", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: 13 }}
                            >
                                Save Roles
                            </button>
                        </InfoCard>
                    )}
                </div>
            )}

            {/* ── Activity Section ──────────────────────── */}
            {activeSection === "activity" && (
                <div style={{ background: "#1e293b", borderRadius: 12, padding: 20 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Activity Timeline</h2>
                    {activity.length === 0
                        ? <div style={{ color: "#64748b" }}>No activity recorded</div>
                        : activity.map((evt, i) => (
                            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: evt._source === "admin_action" ? "#f59e0b" : "#6366f1", marginTop: 5, flexShrink: 0 }} />
                                <div>
                                    <div style={{ color: "#f8fafc", fontSize: 13 }}>
                                        {evt.action || evt.eventType}
                                        {evt._source === "admin_action" && evt.adminId && (
                                            <span style={{ color: "#64748b", fontSize: 11 }}> by {evt.adminId?.profile?.displayName}</span>
                                        )}
                                    </div>
                                    <div style={{ color: "#64748b", fontSize: 11 }}>{new Date(evt.createdAt).toLocaleString()}</div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            )}

            {/* ── Danger Zone Section ───────────────────── */}
            {activeSection === "danger" && (
                <div style={{ background: "#1e293b", borderRadius: 12, padding: 24, border: "1px solid #7f1d1d" }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: "#ef4444", marginBottom: 20 }}>Danger Zone</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <DangerRow
                            label={user.status === "active" ? "Suspend User" : "Reactivate User"}
                            description={user.status === "active" ? "Block access and force logout" : "Restore account access"}
                            btnLabel={user.status === "active" ? "Suspend" : "Reactivate"}
                            btnColor={user.status === "active" ? "#dc2626" : "#16a34a"}
                            onClick={() => setSuspendModal2(true)}
                        />
                        <DangerRow
                            label="Force Logout"
                            description="Invalidate all active sessions immediately"
                            btnLabel="Logout"
                            btnColor="#7c3aed"
                            onClick={() => setLogoutModal2(true)}
                        />
                    </div>
                </div>
            )}

            {suspendModal && (
                <ReasonModal2
                    title={user.status === "active" ? "Suspend User" : "Reactivate User"}
                    prompt={user.status === "active" ? "Provide a reason for suspension:" : "Reason for reactivation (optional):"}
                    onClose={handleStatusChange}
                />
            )}
            {logoutModal && (
                <ConfirmModal3
                    title="Force Logout User"
                    description="All active sessions will be invalidated immediately."
                    confirmWord="LOGOUT"
                    danger
                    onClose={handleForceLogout}
                />
            )}
        </div>
    );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoCard = ({ title, children }) => (
    <div style={{ background: "#0f172a", borderRadius: 10, padding: 20, border: "1px solid #334155" }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>{title}</h3>
        {children}
    </div>
);

const Field = ({ label, value }) => (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "flex-start" }}>
        <span style={{ color: "#64748b", fontSize: 12, flexShrink: 0, marginRight: 12 }}>{label}</span>
        <span style={{ color: "#f8fafc", fontSize: 13, textAlign: "right" }}>{value ?? "—"}</span>
    </div>
);

const DangerRow = ({ label, description, btnLabel, btnColor, onClick }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #334155" }}>
        <div>
            <div style={{ color: "#f8fafc", fontWeight: 500, fontSize: 14 }}>{label}</div>
            <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>{description}</div>
        </div>
        <button onClick={onClick} style={{ padding: "7px 18px", background: btnColor, border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
            {btnLabel}
        </button>
    </div>
);

export default AdminUserDetail;
