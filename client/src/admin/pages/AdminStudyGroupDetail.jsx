import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
    getAdminStudyGroupDetail, adminUpdateGroupStatus, adminDeleteGroup,
    adminAddStudyMember, adminUpdateStudyMember, adminRemoveStudyMember, getAdminUsers 
} from "../../api/adminApi";
import AdminBadge from "../components/AdminBadge";
import ConfirmModal from "../components/ConfirmModal";
import ReasonModal from "../components/ReasonModal";
import { toast } from "react-hot-toast";

const AdminStudyGroupDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modals
    const [statusModal, setStatusModal] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    
    // Member action pending states
    const [pendingRoleUpdate, setPendingRoleUpdate] = useState(null); // { userId, newRole }
    const [pendingRemoveMember, setPendingRemoveMember] = useState(null); // userId
    const [pendingAddMember, setPendingAddMember] = useState(null); // { userId, role, name }
    
    // Member Management State
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [userSearchQ, setUserSearchQ] = useState("");
    const [userResults, setUserResults] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    
    useEffect(() => {
        if (!addMemberOpen || userSearchQ.length < 2) {
            setUserResults([]);
            return;
        }
        const to = setTimeout(async () => {
            setLoadingUsers(true);
            try {
                const { data } = await getAdminUsers({ limit: 10, q: userSearchQ });
                const fetchedUsers = data.data.docs || [];
                
                // Filter out users who are already in the group
                const existingMemberIds = group?.groupMembers?.map(m => m.memberId?._id?.toString()) || [];
                const eligibleUsers = fetchedUsers.filter(u => !existingMemberIds.includes(u._id.toString()) && !u.roles.includes("admin"));
                
                setUserResults(eligibleUsers);
            } catch(e) {}
            setLoadingUsers(false);
        }, 300);
        return () => clearTimeout(to);
    }, [userSearchQ, addMemberOpen, group]);

    useEffect(() => {
        fetchGroup();
    }, [id]);

    const fetchGroup = async () => {
        setLoading(true);
        try {
            const { data } = await getAdminStudyGroupDetail(id);
            setGroup(data.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch study group detail");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async ({ confirmed, reason }) => {
        if (!confirmed || !statusModal) return setStatusModal(null);
        try {
            await adminUpdateGroupStatus(group._id, { status: statusModal.type, reason });
            setStatusModal(null);
            toast.success(`Group ${statusModal.type} successfully`);
            fetchGroup();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update status");
        }
    };

    const handleDelete = async ({ confirmed }) => {
        if (!confirmed) return setDeleteModalOpen(false);
        try {
            await adminDeleteGroup(group._id);
            toast.success("Study group deleted");
            navigate("/admin/study-groups");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete study group");
        }
    };

    const confirmAddMember = async ({ confirmed }) => {
        if (!confirmed || !pendingAddMember) return setPendingAddMember(null);
        try {
            await adminAddStudyMember(group._id, { userId: pendingAddMember.userId, role: pendingAddMember.role });
            setPendingAddMember(null);
            toast.success("Member added");
            fetchGroup();
            setAddMemberOpen(false);
            setUserSearchQ("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add member");
            setPendingAddMember(null);
        }
    };

    const confirmRoleUpdate = async ({ confirmed }) => {
        if (!confirmed || !pendingRoleUpdate) return setPendingRoleUpdate(null);
        try {
            await adminUpdateStudyMember(group._id, pendingRoleUpdate.userId, { role: pendingRoleUpdate.newRole });
            setPendingRoleUpdate(null);
            toast.success("Role updated");
            fetchGroup();
        } catch(err) {
            toast.error(err.response?.data?.message || "Failed to update role");
            setPendingRoleUpdate(null);
        }
    };

    const confirmRemoveMember = async ({ confirmed }) => {
        if (!confirmed || !pendingRemoveMember) return setPendingRemoveMember(null);
        try {
            await adminRemoveStudyMember(group._id, pendingRemoveMember);
            setPendingRemoveMember(null);
            toast.success("Member removed");
            fetchGroup();
        } catch(err) {
            toast.error(err.response?.data?.message || "Failed to remove member");
            setPendingRemoveMember(null);
        }
    };

    if (loading) return <div style={{ color: "#64748b", padding: 32 }}>Loading study cluster...</div>;
    if (error) return <div style={{ color: "#f43f5e", padding: 32 }}>Error: {error}</div>;
    if (!group) return null;

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            {/* Header & Nav */}
            <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 16 }}>
                <Link to="/admin/study-groups" style={{ color: "#64748b", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                    ← BACK TO STUDY GROUPS
                </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
                {/* Main Content Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    
                    {/* Group Header Card */}
                    <div style={{ background: "#0f172a", borderRadius: 20, padding: 32, border: "1px solid #1e293b", position: "relative" }}>
                        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                            <div style={{ width: 80, height: 80, borderRadius: 20, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>📚</div>
                            <div>
                                <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f8fafc", margin: "0 0 8px 0" }}>{group.name}</h1>
                                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <span style={{ color: "#6366f1", fontWeight: 700, fontSize: 14 }}>{group.subject}</span>
                                    <span style={{ color: "#64748b" }}>·</span>
                                    <span style={{ color: "#94a3b8", fontSize: 13 }}>{group.course || "General Study"}</span>
                                    <span style={{ color: "#64748b" }}>·</span>
                                    <span style={{ color: "#94a3b8", fontSize: 13 }}>{group.campusId?.name || "Global Node"}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #1e293b" }}>
                            <h3 style={{ color: "#4f46e5", fontSize: 11, fontWeight: 800, marginBottom: 8, letterSpacing: "0.05em" }}>MISSION & FOCUS</h3>
                            <p style={{ color: "#e2e8f0", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                                {group.description || <span style={{ color: "#64748b", fontStyle: "italic" }}>No description provided.</span>}
                            </p>
                        </div>
                    </div>

                    {/* Members List */}
                    <div style={{ background: "#0f172a", borderRadius: 20, padding: 32, border: "1px solid #1e293b" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <div>
                                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc", margin: 0 }}>Group Roster</h2>
                                <span style={{ color: "#64748b", fontSize: 13 }}>{group.memberCount} / {group.maxMembers} Spots Filled</span>
                            </div>
                            <button 
                                onClick={() => setAddMemberOpen(!addMemberOpen)}
                                style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                            >
                                + ADD STUDENT
                            </button>
                        </div>

                        {addMemberOpen && (
                            <div style={{ background: "#1e293b", padding: 16, borderRadius: 12, marginBottom: 24, border: "1px solid #334155" }}>
                                <input 
                                    placeholder="Search students to add..." 
                                    value={userSearchQ} 
                                    onChange={e => setUserSearchQ(e.target.value)} 
                                    style={searchStyle}
                                />
                                {loadingUsers && <div style={{ color: "#64748b", fontSize: 12, textAlign: "center" }}>Searching...</div>}
                                {!loadingUsers && userSearchQ.length >= 2 && userResults.length > 0 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {userResults.map(u => (
                                            <div key={u._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f172a", padding: "8px 12px", borderRadius: 8 }}>
                                                <div style={{ color: "#f8fafc", fontSize: 13 }}>{u.profile?.displayName} <span style={{ color: "#64748b" }}>({u.email})</span></div>
                                                <button 
                                                    onClick={() => setPendingAddMember({ userId: u._id, role: "member", name: u.profile?.displayName })} 
                                                    style={addBtnStyle}
                                                >
                                                    ADD MEMBER
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {group.groupMembers?.map(member => (
                                <div key={member.memberId?._id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "#1e293b", borderRadius: 12 }}>
                                    <div style={avatarCircleStyle}>
                                        {member.memberId?.profile?.displayName?.charAt(0) || "U"}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: "#f8fafc", fontWeight: 600, fontSize: 14 }}>{member.memberId?.profile?.displayName || "Unknown User"}</div>
                                        <div style={{ color: "#94a3b8", fontSize: 12 }}>{member.memberId?.email || "No email"}</div>
                                    </div>
                                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                        <select 
                                            value={member.role}
                                            onChange={(e) => setPendingRoleUpdate({ userId: member.memberId._id, newRole: e.target.value })}
                                            style={selectStyle}
                                        >
                                            <option value="coordinator">Group Leader (Coordinator)</option>
                                            <option value="member">Active Member</option>
                                        </select>
                                        <button 
                                            onClick={() => setPendingRemoveMember(member.memberId._id)}
                                            style={removeBtnStyle}
                                            title="Remove from group"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reports Section - THE NEW SECTION REQUESTED */}
                    <div style={{ background: "#0f172a", borderRadius: 20, padding: 32, border: "1px solid #7f1d1d33" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <div>
                                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#f87171", margin: 0 }}>Peer Governance Reports</h2>
                                <span style={{ color: "#64748b", fontSize: 13 }}>Grievances and Behavioral Reports</span>
                            </div>
                            <AdminBadge type="danger" value={`${group.reports?.length || 0} Reports`} />
                        </div>

                        {group.reports?.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {group.reports.map((report, idx) => (
                                    <div key={idx} style={{ padding: "16px", background: "#7f1d1d11", border: "1px solid #7f1d1d33", borderRadius: 12 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                            <span style={{ color: "#f87171", fontSize: 12, fontWeight: 800 }}>{report.type.toUpperCase().replace("_", " ")}</span>
                                            <span style={{ color: "#64748b", fontSize: 11 }}>{new Date(report.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p style={{ color: "#e2e8f0", fontSize: 13, margin: "0 0 8px 0" }}>{report.reason}</p>
                                        <div style={{ fontSize: 11, color: "#64748b" }}>
                                            Reported by: <span style={{ color: "#94a3b8" }}>{report.reportedBy?.profile?.displayName || "Anonymous"}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 24, border: "1px dashed #334155", borderRadius: 12 }}>
                                No behavioural reports recorded for this group.
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    
                    {/* Status & Oversight Card */}
                    <div style={{ background: "#0f172a", borderRadius: 20, padding: 24, border: "1px solid #1e293b" }}>
                        <h2 style={{ fontSize: 14, fontWeight: 800, color: "#94a3b8", margin: "0 0 20px 0" }}>GOVERNANCE</h2>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, padding: "12px", background: "#1e293b", borderRadius: 12 }}>
                            <span style={{ color: "#f8fafc", fontSize: 14, fontWeight: 600 }}>Status</span>
                            <AdminBadge type="status" value={group.status} />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {group.status === "pending" && (
                                <>
                                    <button onClick={() => setStatusModal({ type: "active" })} style={btnStyle("#10b981", "#10b98122", "#10b981")}>✓ ACTIVATE GROUP</button>
                                    <button onClick={() => setStatusModal({ type: "rejected" })} style={btnStyle("#f43f5e", "transparent", "#f43f5e", true)}>✗ REJECT GROUP</button>
                                </>
                            )}
                            
                            {group.status === "active" && (
                                <button onClick={() => setStatusModal({ type: "archived" })} style={btnStyle("#f59e0b", "#f59e0b22", "#f59e0b")}>ARCHIVE GROUP</button>
                            )}
                            
                            {group.status === "archived" && (
                                <button onClick={() => setStatusModal({ type: "active" })} style={btnStyle("#10b981", "#10b98122", "#10b981")}>REACTIVATE GROUP</button>
                            )}

                            <div style={{ height: 1, background: "#1e293b", margin: "8px 0" }}></div>
                            <button onClick={() => setDeleteModalOpen(true)} style={btnStyle("#f43f5e", "transparent", "#f43f5e", true)}>TERMINATE NODE</button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div style={{ background: "#0f172a", borderRadius: 20, padding: 24, border: "1px solid #1e293b" }}>
                        <h2 style={{ fontSize: 14, fontWeight: 800, color: "#94a3b8", margin: "0 0 20px 0" }}>METRICS</h2>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "#64748b", fontSize: 13 }}>Members</span>
                                <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: 16 }}>{group.memberCount || 0}</span>
                            </div>
                            <div style={{ height: 1, background: "#1e293b" }}></div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "#64748b", fontSize: 13 }}>Resources</span>
                                <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: 16 }}>{group.groupResources?.length || 0}</span>
                            </div>
                            <div style={{ height: 1, background: "#1e293b" }}></div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "#64748b", fontSize: 13 }}>Created On</span>
                                <span style={{ color: "#f8fafc", fontWeight: 600, fontSize: 13 }}>{new Date(group.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {statusModal?.type === "rejected" && (
                <ReasonModal title="Reject Request" prompt="Provide a rejection reason:" onClose={handleStatusUpdate} />
            )}
            
            {(statusModal?.type === "active" || statusModal?.type === "archived") && (
                <ConfirmModal 
                    title={statusModal.type === "active" ? "Activate Group" : "Archive Group"} 
                    description={`Are you sure you want to ${statusModal.type === "active" ? "activate" : "archive"} this study group node?`} 
                    confirmWord="CONFIRM" 
                    onClose={handleStatusUpdate} 
                />
            )}

            {deleteModalOpen && (
                <ConfirmModal 
                    title="Terminate Node" 
                    description="Terminating this node will archive all communications, purge the roster, and remove it from the system entirely." 
                    confirmWord="TERMINATE" 
                    danger={true} 
                    onClose={handleDelete} 
                />
            )}
            {pendingAddMember && (
                <ConfirmModal 
                    title="Add Student to Group" 
                    description={`Add ${pendingAddMember.name} to this study collective?`} 
                    confirmWord="ADD TO GROUP" 
                    onClose={confirmAddMember} 
                />
            )}

            {pendingRoleUpdate && (
                <ConfirmModal 
                    title="Transfer Leadership" 
                    description={`Change this student's role to ${pendingRoleUpdate.newRole}? Assigning 'Coordinator' will designate them as the Cluster Leader.`} 
                    confirmWord="UPDATE ROLE" 
                    onClose={confirmRoleUpdate} 
                />
            )}

            {pendingRemoveMember && (
                <ConfirmModal 
                    title="Remove Member" 
                    description="Are you sure you want to remove this student from the study collective?" 
                    confirmWord="REMOVE" 
                    danger={true} 
                    onClose={confirmRemoveMember} 
                />
            )}
        </div>
    );
};

// ── Styles ──────────────────────────────────────────────────────────────────

const searchStyle = { width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: 12, borderRadius: 8, marginBottom: 12, outline: "none", fontSize: 13 };
const addBtnStyle = { background: "#10b98122", color: "#10b981", border: "1px solid #10b98144", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer" };
const avatarCircleStyle = { width: 40, height: 40, borderRadius: "50%", background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", fontWeight: "bold" };
const selectStyle = { background: "#0f172a", color: "#f8fafc", border: "1px solid #334155", padding: "8px 12px", borderRadius: 8, fontSize: 13, outline: "none", cursor: "pointer" };
const removeBtnStyle = { width: 32, height: 32, borderRadius: 8, background: "#f43f5e11", color: "#f43f5e", border: "none", cursor: "pointer", fontSize: 12, fontWeight: "bold" };

const btnStyle = (color, bg, border, outline = false) => ({
    width: "100%", padding: "12px", borderRadius: 12, cursor: "pointer",
    fontSize: 11, fontWeight: 800, transition: "all 0.2s",
    background: outline ? "transparent" : bg,
    color: color,
    border: `1px solid ${border}`,
    textAlign: "center"
});

export default AdminStudyGroupDetail;
