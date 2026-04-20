import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
    getAdminSocietyDetail, updateSocietyStatus, adminDeleteSociety, 
    adminAddSocietyMember, adminUpdateSocietyMember, adminRemoveSocietyMember, getAdminUsers 
} from "../../api/adminApi";
import AdminBadge from "../components/AdminBadge";
import ConfirmModal from "../components/ConfirmModal";
import ReasonModal from "../components/ReasonModal";

const AdminSocietyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [society, setSociety] = useState(null);
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
                
                // Filter out users who are already in the society
                const existingMemberIds = society?.members?.map(m => m.memberId?._id?.toString()) || [];
                const eligibleUsers = fetchedUsers.filter(u => !existingMemberIds.includes(u._id.toString()) && !u.roles.includes("admin"));
                
                setUserResults(eligibleUsers);
            } catch(e) {}
            setLoadingUsers(false);
        }, 300);
        return () => clearTimeout(to);
    }, [userSearchQ, addMemberOpen, society]);

    const confirmAddMember = async ({ confirmed }) => {
        if (!confirmed || !pendingAddMember) return setPendingAddMember(null);
        try {
            await adminAddSocietyMember(society._id, { userId: pendingAddMember.userId, role: pendingAddMember.role });
            setPendingAddMember(null);
            fetchSociety();
            setAddMemberOpen(false);
            setUserSearchQ("");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add member");
            setPendingAddMember(null);
        }
    };

    const confirmRoleUpdate = async ({ confirmed }) => {
        if (!confirmed || !pendingRoleUpdate) return setPendingRoleUpdate(null);
        try {
            await adminUpdateSocietyMember(society._id, pendingRoleUpdate.userId, { role: pendingRoleUpdate.newRole });
            setPendingRoleUpdate(null);
            fetchSociety();
        } catch(err) {
            alert(err.response?.data?.message || "Failed to update role");
            setPendingRoleUpdate(null);
        }
    };

    const confirmRemoveMember = async ({ confirmed }) => {
        if (!confirmed || !pendingRemoveMember) return setPendingRemoveMember(null);
        try {
            await adminRemoveSocietyMember(society._id, pendingRemoveMember);
            setPendingRemoveMember(null);
            fetchSociety();
        } catch(err) {
            alert(err.response?.data?.message || "Failed to remove member");
            setPendingRemoveMember(null);
        }
    };

    useEffect(() => {
        fetchSociety();
    }, [id]);

    const fetchSociety = async () => {
        setLoading(true);
        try {
            const { data } = await getAdminSocietyDetail(id);
            setSociety(data.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch society detail");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async ({ confirmed, reason }) => {
        if (!confirmed || !statusModal) return setStatusModal(null);
        try {
            await updateSocietyStatus(society._id, { status: statusModal.type, reason });
            setStatusModal(null);
            fetchSociety(); // Refresh data
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update status");
        }
    };

    const handleDelete = async ({ confirmed }) => {
        if (!confirmed) return setDeleteModalOpen(false);
        try {
            await adminDeleteSociety(society._id);
            navigate("/admin/societies");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete society");
        }
    };

    if (loading) return <div style={{ color: "#64748b", padding: 32 }}>Loading society profile...</div>;
    if (error) return <div style={{ color: "#f43f5e", padding: 32 }}>Error: {error}</div>;
    if (!society) return null;

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            {/* Header & Nav */}
            <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 16 }}>
                <Link to="/admin/societies" style={{ color: "#64748b", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                    ← BACK TO SOCIETIES
                </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
                {/* Main Content Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    
                    {/* Society Header Card */}
                    <div style={{ background: "#0f172a", borderRadius: 20, padding: 32, border: "1px solid #1e293b", position: "relative", overflow: "hidden" }}>
                        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                            {society.media?.logo ? (
                                <img src={society.media.logo} alt="Logo" style={{ width: 80, height: 80, borderRadius: 20, objectFit: "cover", background: "#1e293b" }} />
                            ) : (
                                <div style={{ width: 80, height: 80, borderRadius: 20, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🏛️</div>
                            )}
                            <div>
                                <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f8fafc", margin: "0 0 8px 0" }}>{society.name}</h1>
                                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <span style={{ color: "#6366f1", fontWeight: 700, fontSize: 14 }}>#{society.tag}</span>
                                    <span style={{ color: "#64748b" }}>·</span>
                                    <span style={{ color: "#94a3b8", fontSize: 13, textTransform: "capitalize" }}>{society.category}</span>
                                    <span style={{ color: "#64748b" }}>·</span>
                                    <span style={{ color: "#94a3b8", fontSize: 13 }}>{society.campusId?.name || "Global Campus"}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #1e293b" }}>
                            <h3 style={{ color: "#64748b", fontSize: 12, fontWeight: 800, marginBottom: 8 }}>MISSION STATEMENT</h3>
                            <p style={{ color: "#e2e8f0", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                                {society.description || <span style={{ color: "#64748b", fontStyle: "italic" }}>No description provided.</span>}
                            </p>
                        </div>
                    </div>

                    {/* Members List */}
                    <div style={{ background: "#0f172a", borderRadius: 20, padding: 32, border: "1px solid #1e293b" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <div>
                                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc", margin: 0 }}>Associated Members</h2>
                                <span style={{ color: "#64748b", fontSize: 13 }}>Top 50 Members · {society.memberCount} Total</span>
                            </div>
                            <button 
                                onClick={() => setAddMemberOpen(!addMemberOpen)}
                                style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                            >
                                + ADD MEMBER
                            </button>
                        </div>

                        {addMemberOpen && (
                            <div style={{ background: "#1e293b", padding: 16, borderRadius: 12, marginBottom: 24, border: "1px solid #334155" }}>
                                <input 
                                    placeholder="Search users to add..." 
                                    value={userSearchQ} 
                                    onChange={e => setUserSearchQ(e.target.value)} 
                                    style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: 12, borderRadius: 8, marginBottom: 12, outline: "none", fontSize: 13 }}
                                />
                                {loadingUsers && <div style={{ color: "#64748b", fontSize: 12, textAlign: "center" }}>Searching...</div>}
                                {!loadingUsers && userSearchQ.length >= 2 && userResults.length === 0 && (
                                    <div style={{ color: "#f43f5e", fontSize: 13, textAlign: "center", padding: "8px 0" }}>
                                        No users found. They might be an admin, or are already a member of this society.
                                    </div>
                                )}
                                {!loadingUsers && userResults.length > 0 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {userResults.map(u => (
                                            <div key={u._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f172a", padding: "8px 12px", borderRadius: 8 }}>
                                                <div style={{ color: "#f8fafc", fontSize: 13 }}>{u.profile?.displayName} <span style={{ color: "#64748b" }}>({u.email})</span></div>
                                                <div style={{ display: "flex", gap: 8 }}>
                                                    <button 
                                                        onClick={() => setPendingAddMember({ userId: u._id, role: "executive", name: u.profile?.displayName })} 
                                                        style={{ background: "#6366f122", color: "#6366f1", border: "1px solid #6366f144", padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = "#6366f1"; e.currentTarget.style.color = "#fff"; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = "#6366f122"; e.currentTarget.style.color = "#6366f1"; }}
                                                    >
                                                        ADD AS HEAD
                                                    </button>
                                                    <button 
                                                        onClick={() => setPendingAddMember({ userId: u._id, role: "student", name: u.profile?.displayName })} 
                                                        style={{ background: "#10b98122", color: "#10b981", border: "1px solid #10b98144", padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = "#10b981"; e.currentTarget.style.color = "#fff"; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = "#10b98122"; e.currentTarget.style.color = "#10b981"; }}
                                                    >
                                                        ADD MEMBER
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {society.members?.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {society.members.map(member => (
                                    <div key={member.memberId?._id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "#1e293b", borderRadius: 12 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff" }}>
                                            {member.memberId?.profile?.avatar ? <img src={member.memberId.profile.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : member.memberId?.profile?.displayName?.charAt(0) || "U"}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: "#f8fafc", fontWeight: 600, fontSize: 14 }}>{member.memberId?.profile?.displayName || "Unknown User"}</div>
                                            <div style={{ color: "#94a3b8", fontSize: 12 }}>{member.memberId?.email || "No email"}</div>
                                        </div>
                                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                            <div style={{ position: "relative" }}>
                                                <select 
                                                    value={member.role}
                                                    onChange={(e) => setPendingRoleUpdate({ userId: member.memberId._id, newRole: e.target.value })}
                                                    style={{ 
                                                        appearance: "none", background: "#0f172a", color: "#f8fafc", 
                                                        border: "1px solid #334155", padding: "8px 32px 8px 12px", 
                                                        borderRadius: 8, fontSize: 13, outline: "none", cursor: "pointer",
                                                        transition: "border-color 0.2s"
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                                                    onBlur={(e) => e.target.style.borderColor = "#334155"}
                                                >
                                                    <option value="executive">Society Head (Executive)</option>
                                                    <option value="co-coordinator">Co-coordinator</option>
                                                    <option value="active-member">Active Member</option>
                                                    <option value="student">General Member</option>
                                                </select>
                                                <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#64748b" }}>▼</div>
                                            </div>
                                            <button 
                                                onClick={() => setPendingRemoveMember(member.memberId._id)}
                                                style={{ 
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    width: 32, height: 32, borderRadius: 8, background: "#f43f5e11", color: "#f43f5e", 
                                                    border: "1px solid transparent", cursor: "pointer", transition: "all 0.2s" 
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = "#f43f5e22"}
                                                onMouseLeave={(e) => e.currentTarget.style.background = "#f43f5e11"}
                                                title="Remove from society"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 24 }}>No members found.</div>
                        )}
                    </div>

                    {/* Events List */}
                    <div style={{ background: "#0f172a", borderRadius: 20, padding: 32, border: "1px solid #1e293b" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc", margin: 0 }}>Society Events</h2>
                            <AdminBadge type="default" value={`${society.eventsCount} Events`} />
                        </div>

                        {society.events?.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {society.events.map(event => (
                                    <div key={event._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#1e293b", borderRadius: 12 }}>
                                        <div>
                                            <div style={{ color: "#f8fafc", fontWeight: 600, fontSize: 14 }}>{event.title}</div>
                                            <div style={{ color: "#94a3b8", fontSize: 12 }}>
                                                {new Date(event.startDate).toLocaleDateString()} {event.startTime && `· ${event.startTime}`}
                                            </div>
                                        </div>
                                        <AdminBadge type="status" value={event.status} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 24 }}>No events have been organized yet.</div>
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    
                    {/* Status & Oversight Card */}
                    <div style={{ background: "#0f172a", borderRadius: 20, padding: 24, border: "1px solid #1e293b" }}>
                        <h2 style={{ fontSize: 14, fontWeight: 800, color: "#94a3b8", margin: "0 0 20px 0" }}>GOVERNANCE & STATUS</h2>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, padding: "12px", background: "#1e293b", borderRadius: 12 }}>
                            <span style={{ color: "#f8fafc", fontSize: 14, fontWeight: 600 }}>Current Status</span>
                            <AdminBadge type="status" value={society.status} />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {society.status === "pending" && (
                                <>
                                    <button onClick={() => setStatusModal({ type: "approved" })} style={btnStyle("#10b981", "#10b98122", "#10b981")}>✓ APPROVE SOCIETY</button>
                                    <button onClick={() => setStatusModal({ type: "rejected" })} style={btnStyle("#f43f5e", "transparent", "#f43f5e", true)}>✗ REJECT SOCIETY</button>
                                </>
                            )}
                            
                            {society.status === "approved" && (
                                <button onClick={() => setStatusModal({ type: "archived" })} style={btnStyle("#f59e0b", "#f59e0b22", "#f59e0b")}>FREEZE SOCIETY</button>
                            )}
                            
                            {society.status === "archived" && (
                                <button onClick={() => setStatusModal({ type: "approved" })} style={btnStyle("#10b981", "#10b98122", "#10b981")}>REACTIVATE SOCIETY</button>
                            )}

                            <div style={{ height: 1, background: "#1e293b", margin: "8px 0" }}></div>
                            <button onClick={() => setDeleteModalOpen(true)} style={btnStyle("#f43f5e", "transparent", "#f43f5e", true)}>PERMANENTLY DELETE</button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div style={{ background: "#0f172a", borderRadius: 20, padding: 24, border: "1px solid #1e293b" }}>
                        <h2 style={{ fontSize: 14, fontWeight: 800, color: "#94a3b8", margin: "0 0 20px 0" }}>METRICS</h2>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "#64748b", fontSize: 13 }}>Hosted Events</span>
                                <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: 16 }}>{society.eventsCount || 0}</span>
                            </div>
                            <div style={{ height: 1, background: "#1e293b" }}></div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "#64748b", fontSize: 13 }}>Approved Members</span>
                                <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: 16 }}>{society.memberCount || 0}</span>
                            </div>
                            <div style={{ height: 1, background: "#1e293b" }}></div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "#64748b", fontSize: 13 }}>Created On</span>
                                <span style={{ color: "#f8fafc", fontWeight: 600, fontSize: 13 }}>{new Date(society.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Modals */}
            {statusModal?.type === "rejected" && (
                <ReasonModal title="Reject Society" prompt="Provide a rejection reason:" onClose={handleStatusUpdate} />
            )}
            
            {(statusModal?.type === "approved" || statusModal?.type === "archived") && (
                <ConfirmModal 
                    title={statusModal.type === "approved" ? "Approve Society" : "Freeze Society"} 
                    description={`Are you sure you want to ${statusModal.type === "approved" ? "approve and activate" : "freeze"} this society?`} 
                    confirmWord="CONFIRM" 
                    onClose={handleStatusUpdate} 
                />
            )}

            {deleteModalOpen && (
                <ConfirmModal 
                    title="Delete Society" 
                    description="This is a permanent action. The society, its roster, and related live events will be cancelled and deleted from the platform entirely." 
                    confirmWord="DELETE" 
                    danger={true} 
                    onClose={handleDelete} 
                />
            )}
            {pendingAddMember && (
                <ConfirmModal 
                    title="Add User to Society" 
                    description={`Are you sure you want to add ${pendingAddMember.name} as a ${pendingAddMember.role === "executive" ? "Society Head (Executive)" : "Member"}?`} 
                    confirmWord="ADD TO SOCIETY" 
                    onClose={confirmAddMember} 
                />
            )}

            {pendingRoleUpdate && (
                <ConfirmModal 
                    title="Update Member Role" 
                    description={`Are you sure you want to change this user's role to ${pendingRoleUpdate.newRole}? This may grant them elevated system privileges.`} 
                    confirmWord="UPDATE ROLE" 
                    onClose={confirmRoleUpdate} 
                />
            )}

            {pendingRemoveMember && (
                <ConfirmModal 
                    title="Remove Society Member" 
                    description="Are you sure you want to remove this user from the society? They will lose all role-based permissions related to this society." 
                    confirmWord="REMOVE" 
                    danger={true} 
                    onClose={confirmRemoveMember} 
                />
            )}
        </div>
    );
};

const btnStyle = (color, bg, border, outline = false) => ({
    width: "100%", padding: "12px", borderRadius: 12, cursor: "pointer",
    fontSize: 12, fontWeight: 800, transition: "all 0.2s",
    background: outline ? "transparent" : bg,
    color: color,
    border: `1px solid ${border}`,
    textAlign: "center"
});

export default AdminSocietyDetail;
