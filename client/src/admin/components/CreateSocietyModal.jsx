import { useState, useEffect } from "react";
import { getAdminUsers, adminCreateSociety } from "../../api/adminApi";

const CreateSocietyModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: "",
        tag: "",
        category: "academic",
        description: "",
        headUserId: ""
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
        setFormData({ ...formData, headUserId: user._id });
        setDropdownOpen(false);
        setUserSearchQ("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        if (!formData.headUserId) {
            setError("Please select a Society Head");
            return;
        }

        setSubmitting(true);
        try {
            await adminCreateSociety(formData);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create society");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", margin: 0 }}>Create New Society</h2>
                    <button onClick={onClose} style={closeBtnStyle}>✕</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {error && (
                        <div style={{ padding: "12px 16px", background: "#7f1d1d33", border: "1px solid #7f1d1d", borderRadius: 12, color: "#f87171", fontSize: 13 }}>
                            {error}
                        </div>
                    )}

                    <div style={gridStyle}>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>SOCIETY NAME</label>
                            <input 
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. Computer Science Society"
                                style={inputStyle}
                            />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>SOCIETY TAG</label>
                            <input 
                                required
                                value={formData.tag}
                                onChange={(e) => setFormData({...formData, tag: e.target.value})}
                                placeholder="e.g. css"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={fieldStyle}>
                        <label style={labelStyle}>CATEGORY</label>
                        <select 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            style={inputStyle}
                        >
                            <option value="academic">Academic</option>
                            <option value="cultural">Cultural</option>
                            <option value="sports">Sports</option>
                            <option value="tech">Tech</option>
                            <option value="social">Social</option>
                            <option value="arts">Arts</option>
                            <option value="professional">Professional</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div style={fieldStyle}>
                        <label style={labelStyle}>ASSIGN SOCIETY HEAD</label>
                        
                        {selectedUser ? (
                            <div style={{ ...inputStyle, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1e293b", borderColor: "#6366f1" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                                        {selectedUser.profile?.displayName?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "#f8fafc" }}>{selectedUser.profile?.displayName}</div>
                                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{selectedUser.email}</div>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => { setSelectedUser(null); setFormData({...formData, headUserId: ""}); }}
                                    style={{ background: "transparent", border: "none", color: "#f43f5e", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                                >
                                    REMOVE
                                </button>
                            </div>
                        ) : (
                            <div style={{ position: "relative" }}>
                                <input 
                                    placeholder="Search user by name or email..."
                                    value={userSearchQ}
                                    onChange={(e) => { setUserSearchQ(e.target.value); setDropdownOpen(true); }}
                                    onFocus={() => setDropdownOpen(true)}
                                    style={inputStyle}
                                />
                                
                                {dropdownOpen && (
                                    <div style={{ 
                                        position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, 
                                        background: "#1e293b", border: "1px solid #334155", borderRadius: 12, 
                                        maxHeight: 200, overflowY: "auto", zIndex: 10,
                                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)"
                                    }}>
                                        {loadingUsers ? (
                                            <div style={{ padding: 12, color: "#64748b", fontSize: 13, textAlign: "center" }}>Searching...</div>
                                        ) : users.length > 0 ? (
                                            users.map(u => (
                                                <div 
                                                    key={u._id} 
                                                    onClick={() => handleSelectUser(u)}
                                                    style={{ 
                                                        padding: "10px 16px", borderBottom: "1px solid #334155", 
                                                        cursor: "pointer", transition: "background 0.2s" 
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = "#334155"}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                                >
                                                    <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 13 }}>{u.profile?.displayName}</div>
                                                    <div style={{ color: "#94a3b8", fontSize: 11 }}>{u.email} {u.academic?.department ? `· ${u.academic.department}` : ""}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: 12, color: "#64748b", fontSize: 13, textAlign: "center" }}>No active students found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        <span style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                            Search limits to active students (no admins).
                        </span>
                    </div>

                    <div style={fieldStyle}>
                        <label style={labelStyle}>DESCRIPTION / MISSION</label>
                        <textarea 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Briefly describe the society's purpose..."
                            style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                        <button type="button" onClick={onClose} style={cancelBtn}>CANCEL</button>
                        <button type="submit" disabled={submitting} style={submitBtn}>
                            {submitting ? "CREATING..." : "CREATE SOCIETY"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const overlayStyle = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(2, 6, 23, 0.85)", backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    padding: 20
};

const modalStyle = {
    background: "#0f172a", border: "1px solid #1e293b", borderRadius: 24,
    padding: 32, width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
};

const gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 };
const fieldStyle = { display: "flex", flexDirection: "column", gap: 6 };
const labelStyle = { fontSize: 11, fontWeight: 800, color: "#4f46e5", letterSpacing: "0.05em" };
const inputStyle = {
    background: "#1e293b", border: "1px solid #334155", borderRadius: 12,
    padding: "12px 16px", color: "#f1f5f9", fontSize: 14, outline: "none",
    transition: "border-color 0.2s"
};

const closeBtnStyle = { 
    background: "transparent", border: "none", color: "#64748b", 
    cursor: "pointer", fontSize: 20, padding: 4 
};

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

export default CreateSocietyModal;
