import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminStudyGroups,
  adminUpdateGroupStatus,
  adminDeleteGroup,
} from "../../api/adminApi";
import AdminTable from "../components/AdminTable";
import AdminBadge from "../components/AdminBadge";
import ConfirmModal from "../components/ConfirmModal";
import ReasonModal from "../components/ReasonModal";
import CreateStudyGroupModal from "../components/CreateStudyGroupModal";
import { toast } from "react-hot-toast";
import Button, { getButtonClassName } from "../../components/common/Button";
import useHomeTheme from "@/hooks/useHomeTheme";
import { getAdminThemeStyles } from "../utils/themeStyles";

const AdminStudyGroups = () => {
  const isDark = useHomeTheme();
  const theme = getAdminThemeStyles(isDark);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const [searchQ, setSearchQ] = useState("");
  const [groups, setGroups] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [archiveModal, setArchiveModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const tabs = [
    { key: "pending", label: "Pending Requests" },
    { key: "active", label: "Active Groups" },
    { key: "archived", label: "Frozen / Archived" },
  ];

  const fetchGroups = useCallback(
    async (nextPage = 1, query = searchQ) => {
      setLoading(true);
      try {
        const { data } = await getAdminStudyGroups({
          status: activeTab === "active" ? "active" : activeTab === "pending" ? "pending" : "archived",
          page: nextPage,
          limit: 20,
          q: query.trim(),
        });
        setGroups(data.data?.docs || []);
        setPagination(data.data?.pagination || {});
      } catch {
        toast.error("Failed to load study groups");
      } finally {
        setLoading(false);
      }
    },
    [activeTab, searchQ]
  );

  useEffect(() => {
    fetchGroups(1);
  }, [fetchGroups]);

  const handleStatusUpdate = async (id, status, reason = "") => {
    try {
      await adminUpdateGroupStatus(id, { status, reason });
      toast.success(`Group ${status} successfully`);
      fetchGroups(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleArchive = async ({ confirmed, reason }) => {
    if (!confirmed || !archiveModal) {
      setArchiveModal(null);
      return;
    }
    await handleStatusUpdate(archiveModal, "archived", reason);
    setArchiveModal(null);
  };

  const handleDelete = async ({ confirmed }) => {
    if (!confirmed || !deleteModal) {
      setDeleteModal(null);
      return;
    }
    try {
      await adminDeleteGroup(deleteModal);
      toast.success("Study group deleted");
      fetchGroups(page);
    } catch {
      toast.error("Deletion failed");
    } finally {
      setDeleteModal(null);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Study Group",
      render: (group) => (
        <div>
          <div style={{ ...theme.strong, fontWeight: 600 }}>{group.name}</div>
          <div style={{ ...theme.muted, fontSize: 11 }}>
            {group.subject} • {group.course || "General"}
          </div>
        </div>
      ),
    },
    {
      key: "leader",
      label: "Group Leader",
      render: (group) => (
        <div style={{ ...theme.muted, fontSize: 13 }}>
          {group.coordinatorId?.profile?.displayName || "Unknown"}
        </div>
      ),
    },
    {
      key: "members",
      label: "Members",
      render: (group) => (
        <div style={{ ...theme.muted, fontSize: 13 }}>
          {group.memberCount || 0} <span style={theme.label}>/ {group.maxMembers}</span>
        </div>
      ),
    },
    {
      key: "campus",
      label: "Campus",
      render: (group) => <span style={{ ...theme.muted, fontSize: 13 }}>{group.campusId?.name || "-"}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (group) => <AdminBadge type="status" value={group.status} />,
    },
  ];

  const rowActions = (group) => [
    { label: "View Detail", onClick: () => navigate(`/admin/study-groups/${group._id}`) },
    ...(group.status === "pending"
      ? [
          { label: "Approve", onClick: () => handleStatusUpdate(group._id, "active") },
          { label: "Reject", onClick: () => setArchiveModal(group._id), danger: true },
        ]
      : []),
    ...(group.status === "active"
      ? [{ label: "Archive", onClick: () => setArchiveModal(group._id), danger: true }]
      : []),
    ...(group.status === "archived"
      ? [{ label: "Reactivate", onClick: () => handleStatusUpdate(group._id, "active") }]
      : []),
    { label: "Delete", onClick: () => setDeleteModal(group._id), danger: true },
  ];

  const renderPendingCards = () => {
    if (loading) {
      return <div style={{ ...theme.muted, padding: 32 }}>Loading...</div>;
    }

    if (groups.length === 0) {
      return (
        <div style={{ ...theme.muted, padding: 32, textAlign: "center" }}>
          No pending study group requests
        </div>
      );
    }

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 16,
        }}
      >
        {groups.map((group) => (
          <div
            key={group._id}
            onClick={() => navigate(`/admin/study-groups/${group._id}`)}
            style={{
              ...theme.panel,
              borderRadius: 12,
              padding: 20,
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.borderColor = "rgb(var(--color-info))";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.borderColor = isDark
                ? "rgb(var(--color-border-dark))"
                : "rgb(var(--color-border-light))";
            }}
          >
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: isDark ? "rgb(var(--color-background-dark))" : "rgb(var(--color-background-light))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  ...theme.strong,
                }}
              >
                SG
              </div>
              <div>
                <div style={{ ...theme.strong, fontWeight: 600 }}>{group.name}</div>
                <div style={{ ...theme.muted, fontSize: 12 }}>
                  {group.subject} • {group.course || "General"}
                </div>
              </div>
            </div>

            {group.description && (
              <p
                style={{
                  ...theme.muted,
                  fontSize: 13,
                  marginBottom: 12,
                  lineHeight: 1.5,
                }}
              >
                {group.description.length > 100
                  ? `${group.description.substring(0, 100)}...`
                  : group.description}
              </p>
            )}

            <div style={{ ...theme.muted, fontSize: 12, marginBottom: 12 }}>
              Coordinator <span style={theme.strong}>{group.coordinatorId?.profile?.displayName || group.coordinatorId?.email}</span>
              {group.campusId && <span> • {group.campusId.name}</span>}
            </div>

            <div style={{ display: "flex", gap: 8 }} onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                onClick={() => handleStatusUpdate(group._id, "active")}
                className={getButtonClassName({ variant: "success", size: "sm", isDark })}
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => setArchiveModal(group._id)}
                className={getButtonClassName({ variant: "danger", size: "sm", isDark })}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div
        style={{
          marginBottom: 32,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <h1 style={{ ...theme.title, fontSize: 24, fontWeight: 800, margin: 0 }}>
            Study Group Governance
          </h1>
          <p style={{ ...theme.subtitle, marginTop: 4 }}>
            Moderate collaborative labs, manage group leadership, and audit participation metrics.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          size="md"
          className="gap-2 px-6 py-3 text-sm font-bold"
        >
          <span style={{ fontSize: 18 }}>+</span> CREATE STUDY GROUP
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          padding: 4,
          background: isDark ? "rgb(var(--color-surface-dark))" : "rgb(var(--color-surface-light))",
          borderRadius: 12,
          marginBottom: 32,
          maxWidth: "fit-content",
          border: `1px solid ${isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))"}`,
          boxShadow: isDark ? "none" : "0 16px 40px rgba(15,23,42,0.06)",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={getButtonClassName({
              variant: activeTab === tab.key ? "primary" : "ghost",
              size: "sm",
              isDark,
              className: "rounded-lg px-6 py-2.5 text-xs font-bold",
            })}
          >
            {tab.label.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ minHeight: 400 }}>
        <input
          placeholder="Search study groups..."
          value={searchQ}
          onChange={(event) => {
            setSearchQ(event.target.value);
            fetchGroups(1, event.target.value);
          }}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 12,
            fontSize: 14,
            outline: "none",
            transition: "border-color 0.2s",
            marginBottom: 16,
            ...theme.input,
          }}
        />

        {activeTab === "pending" ? (
          renderPendingCards()
        ) : (
          <AdminTable
            columns={columns}
            data={groups}
            loading={loading}
            rowActions={rowActions}
            pagination={pagination}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              fetchGroups(nextPage);
            }}
            onRowClick={(group) => navigate(`/admin/study-groups/${group._id}`)}
          />
        )}
      </div>

      {showCreateModal && (
        <CreateStudyGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setActiveTab("active");
            fetchGroups(1);
          }}
        />
      )}

      {archiveModal && (
        <ReasonModal
          title={activeTab === "pending" ? "Reject Group Request" : "Archive Study Group"}
          prompt="Reason for this action (sent to the group leader):"
          onClose={handleArchive}
        />
      )}

      {deleteModal && (
        <ConfirmModal
          title="Delete Study Group"
          description="This will permanently delete the group and archive its chats. This action cannot be undone."
          confirmWord="DELETE"
          danger
          onClose={handleDelete}
        />
      )}
    </div>
  );
};

export default AdminStudyGroups;
