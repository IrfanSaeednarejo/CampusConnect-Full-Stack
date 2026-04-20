import { useState, useEffect } from "react";
import { getAdminUsers, adminCreateStudyGroup } from "../../api/adminApi";
import { toast } from "react-hot-toast";

const CreateStudyGroupModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: "",
        subject: "",
        course: "",
        description: "",
        coordinatorId: "",
        maxMembers: 10
    });
    const [users, setUsers] = useState([]);
    const [userSearchQ, setUserSearchQ] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            if (userSearchQ.length < 2) return;
            setLoadingUsers(true);
            try {
                const { data } = await getAdminUsers({ status: "active", limit: 20, q: userSearchQ });
                const eligible = (data.data?.docs || []).filter(u => !u.roles.includes("admin"));
                setUsers(eligible);
            } finally {
                setLoadingUsers(false);
            }
        };

        const debounce = setTimeout(fetchUsers, 300);
        return () => clearTimeout(debounce);
    }, [userSearchQ]);

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setFormData({ ...formData, coordinatorId: user._id });
        setDropdownOpen(false);
        setUserSearchQ("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        if (!formData.coordinatorId) {
            setError("Please assign a Group Leader");
            return;
        }

        setSubmitting(true);
        try {
            await adminCreateStudyGroup(formData);
            toast.success("Study Group created!");
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create study group");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", margin: 0 }}>Create New Study Group</h2>
                    <button onClick={onClose} style={closeBtnStyle}>✕</button>
                </div>

                <form onSubmit={handleSubmit} style={formStyle}>
                    {error && (
                        <div style={errorStyle}>{error}</div>
                    )}

                    <div style={gridStyle}>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>GROUP NAME</label>
                            <input 
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. Advanced AI Study"
                                style={inputStyle}
                            />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>SUBJECT</label>
                            <input 
                                required
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                placeholder="e.g. Deep Learning"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={gridStyle}>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>COURSE CODE</label>
                            <input 
                                value={formData.course}
                                onChange={(e) => setFormData({...formData, course: e.target.value})}
                                placeholder="e.g. CS401"
                                style={inputStyle}
                            />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>MAX CAPACITY</label>
                            <input 
                                type="number"
                                required
                                min={2}
                                value={formData.maxMembers}
                                onChange={(e) => setFormData({...formData, maxMembers: parseInt(e.target.value) || 2})}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={fieldStyle}>
                        <label style={labelStyle}>ASSIGN GROUP LEADER</label>
                        
                        {selectedUser ? (
                            <div style={{ ...inputStyle, display: "flex", justifyContent: "space-between", alignItems: "center", borderColor: "#6366f1" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={avatarStyle}>
                                        {selectedUser.profile?.displayName?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "#f8fafc" }}>{selectedUser.profile?.displayName}</div>
                                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{selectedUser.email}</div>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => { setSelectedUser(null); setFormData({...formData, coordinatorId: ""}); }}
                                    style={{ background: "transparent", border: "none", color: "#f43f5e", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                                >
                                    REMOVE
                                </button>
                            </div>
                        ) : (
                            <div style={{ position: "relative" }}>
                                <input 
                                    placeholder="Search student by name or email..."
                                    value={userSearchQ}
                                    onChange={(e) => { setUserSearchQ(e.target.value); setDropdownOpen(true); }}
                                    onFocus={() => setDropdownOpen(true)}
                                    style={inputStyle}
                                />
                                
                                {dropdownOpen && userSearchQ.length >= 2 && (
                                    <div style={dropdownStyle}>
                                        {loadingUsers ? (
                                            <div style={dropdownStatusStyle}>Searching...</div>
                                        ) : users.length > 0 ? (
                                            users.map(u => (
                                                <div 
                                                    key={u._id} 
                                                    onClick={() => handleSelectUser(u)}
                                                    style={dropdownItemStyle}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = "#334155"}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                                >
                                                    <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 13 }}>{u.profile?.displayName}</div>
                                                    <div style={{ color: "#94a3b8", fontSize: 11 }}>{u.email}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={dropdownStatusStyle}>No students found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={fieldStyle}>
                        <label style={labelStyle}>DESCRIPTION</label>
                        <textarea 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Briefly describe the group's focus..."
                            style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                        <button type="button" onClick={onClose} style={cancelBtn}>CANCEL</button>
                        <button type="submit" disabled={submitting} style={submitBtn}>
                            {submitting ? "CREATING..." : "CREATE STUDY GROUP"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Styles ──────────────────────────────────────────────────────────────────

const overlayStyle = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(2, 6, 23, 0.85)", backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    padding: 20
};

const modalStyle = {
    background: "#0f172a", border: "1px solid #1e293b", borderRadius: 24,
    padding: 32, width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
};

const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 };
const formStyle = { display: "flex", flexDirection: "column", gap: 20 };
const gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 };
const fieldStyle = { display: "flex", flexDirection: "column", gap: 6 };
const labelStyle = { fontSize: 11, fontWeight: 800, color: "#4f46e5", letterSpacing: "0.05em" };
const errorStyle = { padding: "12px 16px", background: "#7f1d1d33", border: "1px solid #7f1d1d", borderRadius: 12, color: "#f87171", fontSize: 13 };

const inputStyle = {
    background: "#1e293b", border: "1px solid #334155", borderRadius: 12,
    padding: "12px 16px", color: "#f1f5f9", fontSize: 14, outline: "none",
    transition: "border-color 0.2s", width: "100%"
};

const dropdownStyle = { 
    position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, 
    background: "#1e293b", border: "1px solid #334155", borderRadius: 12, 
    maxHeight: 200, overflowY: "auto", zIndex: 10,
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)"
};

const dropdownItemStyle = { padding: "10px 16px", borderBottom: "1px solid #334155", cursor: "pointer" };
const dropdownStatusStyle = { padding: 12, color: "#64748b", fontSize: 13, textAlign: "center" };

const avatarStyle = { 
    width: 24, height: 24, borderRadius: "50%", background: "#4f46e5", 
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" 
};

const closeBtnStyle = { background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 20 };

const submitBtn = {
    flex: 2, padding: "14px", background: "#6366f1", color: "#fff",
    border: "none", borderRadius: 14, cursor: "pointer", fontWeight: 700,
    fontSize: 14, boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)"
};

const cancelBtn = {
    flex: 1, padding: "14px", background: "transparent", color: "#94a3b8",
    border: "1px solid #334155", borderRadius: 14, cursor: "pointer", 
    fontWeight: 700, fontSize: 14
};

export default CreateStudyGroupModal;
