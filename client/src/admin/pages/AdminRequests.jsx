import { useState, useEffect } from "react";
import axios from "../../api/axios";
import AdminTable from "../components/AdminTable";
import ActionMenu from "../components/ActionMenu";
import ReasonModal from "../components/ReasonModal";

const AdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/admin/requests", { params: { type: filter } });
            setRequests(data.data || []);
        } catch (err) {
            console.error("Failed to fetch requests", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, type, action, reason = "") => {
        try {
            let endpoint = "";
            let method = "PATCH";
            let payload = {};

            if (type === "mentor") {
                endpoint = `/admin/mentors/${requestId}/${action === "approve" ? "verify" : "reject"}`;
                payload = action === "reject" ? { reason } : {};
            } else if (type === "society") {
                endpoint = `/admin/societies/${requestId}/status`;
                payload = { status: action === "approve" ? "active" : "rejected", reason };
            } else if (type === "event") {
                endpoint = `/admin/events/${requestId}/status`;
                payload = { status: action === "approve" ? "approved" : "cancelled", reason };
            } else if (type === "study_group") {
                endpoint = `/admin/study-groups/${requestId}/status`;
                payload = { status: action === "approve" ? "active" : "archived", reason };
            }

            await axios({ method, url: endpoint, data: payload });
            fetchRequests();
        } catch (err) {
            console.error("Action error", err);
            alert("Action failed: " + (err.response?.data?.message || err.message));
        }
    };

    const columns = [
        { 
            label: "Type", 
            key: "requestType",
            render: (row) => {
                const val = row.requestType;
                return (
                    <span style={{ 
                        textTransform: "uppercase", fontSize: 10, fontWeight: 800, 
                        padding: "2px 6px", borderRadius: 4, 
                        background: val === "mentor" ? "#4f46e5" : val === "society" ? "#10b981" : "#f59e0b",
                        color: "#fff"
                    }}>
                        {val}
                    </span>
                );
            }
        },
        { 
            label: "Requester", 
            key: "user",
            render: (row) => {
                const user = row.userId || row.createdBy || row.coordinatorId;
                return (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <img src={user?.profile?.avatar || "/default-avatar.png"} alt="" style={{ width: 32, height: 32, borderRadius: "50%" }} />
                        <div>
                            <div style={{ fontWeight: 600 }}>{user?.profile?.displayName}</div>
                            <div style={{ fontSize: 11, color: "#6b7280" }}>{user?.email}</div>
                        </div>
                    </div>
                );
            }
        },
        { 
            label: "Subject", 
            key: "title",
            render: (row) => row.name || row.title || row.bio?.substring(0, 30) + "..."
        },
        { 
            label: "Region/Campus", 
            key: "campusId",
            render: (row) => row.campusId ? "Specified" : "Global"
        },
        { 
            label: "Date", 
            key: "createdAt",
            render: (row) => new Date(row.createdAt).toLocaleDateString()
        },
        {
            label: "Actions",
            key: "actions",
            render: (row) => (
                <div style={{ display: "flex", gap: 8 }}>
                    <button 
                        onClick={() => handleAction(row._id, row.requestType, "approve")}
                        style={{ background: "#10b981", color: "#fff", border: "none", padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
                    >
                        Approve
                    </button>
                    <button 
                        onClick={() => {
                            setSelectedRequest(row);
                            setShowRejectModal(true);
                        }}
                        style={{ background: "#ef4444", color: "#fff", border: "none", padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
                    >
                        Reject
                    </button>
                </div>
            )
        }
    ];

    return (
        <div>
            <header style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Request Management</h1>
                <p style={{ color: "#9ca3af", marginTop: 4 }}>Review and moderate system-wide entity requests.</p>
            </header>

            <div style={{ marginBottom: 24, display: "flex", gap: 12 }}>
                {["all", "mentors", "societies", "events", "study_groups"].map(t => (
                    <button
                        key={t}
                        onClick={() => setFilter(t)}
                        style={{
                            padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600,
                            background: filter === t ? "#4f46e5" : "#1f2937",
                            color: filter === t ? "#fff" : "#9ca3af",
                            border: "none", cursor: "pointer", transition: "all 0.2s"
                        }}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1).replace("_", " ")}
                    </button>
                ))}
            </div>

            <AdminTable 
                columns={columns} 
                data={requests} 
                loading={loading} 
            />

            {showRejectModal && (
                <ReasonModal 
                    title={`Reject ${selectedRequest?.requestType} Request`}
                    onClose={({ confirmed, reason }) => {
                        if (confirmed) {
                            handleAction(selectedRequest._id, selectedRequest.requestType, "reject", reason);
                        }
                        setShowRejectModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default AdminRequests;
