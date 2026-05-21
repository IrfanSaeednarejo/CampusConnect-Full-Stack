import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminSocieties,
  getPendingSocieties,
  updateSocietyStatus,
  adminDeleteSociety,
} from "../../api/adminApi";
import { useDispatch } from "react-redux";
import { decrementPending } from "../../redux/slices/adminSlice";
import AdminTable from "../components/AdminTable";
import AdminBadge from "../components/AdminBadge";
import ConfirmModal from "../components/ConfirmModal";
import ReasonModal from "../components/ReasonModal";
import CreateSocietyModal from "../components/CreateSocietyModal";
import Button, { getButtonClassName } from "../../components/common/Button";
import useHomeTheme from "@/hooks/useHomeTheme";

const PendingSocietiesTab = () => {
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);

  useEffect(() => {
    getPendingSocieties({ limit: 20 })
      .then(({ data }) => setSocieties(data.data?.docs || []))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    await updateSocietyStatus(id, { status: "approved" });
    dispatch(decrementPending({ key: "societies" }));
    setSocieties((prev) => prev.filter((s) => s._id !== id));
  };

  const handleReject = async ({ confirmed, reason }) => {
    if (!confirmed || !rejectModal) return setRejectModal(null);
    await updateSocietyStatus(rejectModal, { status: "rejected", reason });
    dispatch(decrementPending({ key: "societies" }));
    setSocieties((prev) => prev.filter((s) => s._id !== rejectModal));
    setRejectModal(null);
  };

  const cardClass = isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light";
  const mutedClass = isDark ? "text-text-secondary-dark" : "text-text-secondary-light";

  if (loading) {
    return <div className={`p-8 text-sm ${mutedClass}`}>Loading...</div>;
  }

  if (societies.length === 0) {
    return (
      <div className={`rounded-2xl border px-6 py-16 text-center text-sm ${cardClass} ${mutedClass}`}>
        No pending societies
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {societies.map((s) => (
          <div
            key={s._id}
            className={`rounded-2xl border p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-colors hover:border-slate-300 dark:hover:border-slate-600 ${cardClass}`}
          >
            <div className="mb-3 flex gap-3">
              {s.media?.logo && (
                <img src={s.media.logo} alt="" className="h-11 w-11 rounded-lg object-cover" />
              )}
              <div>
                <div className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
                  {s.name}
                </div>
                <div className={`text-xs ${mutedClass}`}>#{s.tag} · {s.category}</div>
              </div>
            </div>

            {s.description && (
              <p className={`mb-3 text-sm leading-6 ${mutedClass}`}>
                {s.description.length > 100 ? `${s.description.substring(0, 100)}...` : s.description}
              </p>
            )}

            <div className={`mb-4 text-xs ${mutedClass}`}>
              Requested by{" "}
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {s.createdBy?.profile?.displayName || s.createdBy?.email}
              </span>
              {s.campusId && <span> · {s.campusId.name}</span>}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleApprove(s._id)}
                className={getButtonClassName({
                  variant: "success",
                  size: "sm",
                  isDark,
                })}
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => setRejectModal(s._id)}
                className={getButtonClassName({
                  variant: "danger",
                  size: "sm",
                  isDark,
                })}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {rejectModal && (
        <ReasonModal
          title="Reject Society"
          prompt="Provide a reason (sent to the society head):"
          onClose={handleReject}
        />
      )}
    </div>
  );
};

const SocietyListTab = ({ filterParams }) => {
  const navigate = useNavigate();
  const isDark = useHomeTheme();
  const [societies, setSocieties] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [freezeModal, setFreezeModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [searchQ, setSearchQ] = useState("");

  const fetchSocieties = useCallback(
    async (p = 1, q = searchQ) => {
      setLoading(true);
      try {
        const { data } = await getAdminSocieties({
          ...filterParams,
          page: p,
          limit: 20,
          q,
        });
        setSocieties(data.data?.docs || []);
        setPagination(data.data?.pagination || {});
      } finally {
        setLoading(false);
      }
    },
    [filterParams, searchQ]
  );

  useEffect(() => {
    fetchSocieties(1);
  }, [fetchSocieties]);

  const handleFreeze = async ({ confirmed, reason }) => {
    if (!confirmed || !freezeModal) return setFreezeModal(null);
    await updateSocietyStatus(freezeModal, { status: "archived", reason });
    setFreezeModal(null);
    fetchSocieties(page);
  };

  const handleDelete = async ({ confirmed }) => {
    if (!confirmed || !deleteModal) return setDeleteModal(null);
    await adminDeleteSociety(deleteModal);
    setDeleteModal(null);
    fetchSocieties(page);
  };

  const columns = [
    {
      key: "name",
      label: "Society",
      render: (s) => (
        <div>
          <div className="font-medium text-text-primary-light dark:text-text-primary-dark">{s.name}</div>
          <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            #{s.tag} · {s.category}
          </div>
        </div>
      ),
    },
    { key: "campus", label: "Campus", render: (s) => s.campusId?.name || "-" },
    { key: "memberCount", label: "Members", render: (s) => s.memberCount ?? 0 },
    {
      key: "status",
      label: "Status",
      render: (s) => <AdminBadge type="status" value={s.status} />,
    },
    {
      key: "createdAt",
      label: "Created",
      render: (s) => new Date(s.createdAt).toLocaleDateString(),
    },
  ];

  const rowActions = (s) => [
    { label: "View Detail", onClick: () => navigate(`/admin/societies/${s._id}`) },
    ...(s.status !== "archived"
      ? [{ label: "Freeze", onClick: () => setFreezeModal(s._id), danger: true }]
      : []),
    ...(s.status === "archived"
      ? [
          {
            label: "Reactivate",
            onClick: async () => {
              await updateSocietyStatus(s._id, { status: "approved" });
              fetchSocieties(page);
            },
          },
        ]
      : []),
    { label: "Delete", onClick: () => setDeleteModal(s._id), danger: true },
  ];

  return (
    <div>
      <input
        placeholder="Search societies..."
        onChange={(e) => {
          setSearchQ(e.target.value);
          fetchSocieties(1, e.target.value);
        }}
        className={`mb-4 w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
          isDark
            ? "border-border-dark bg-background-dark text-text-primary-dark placeholder:text-text-secondary-dark"
            : "border-border-light bg-surface-light text-text-primary-light placeholder:text-text-secondary-light"
        }`}
      />

      <AdminTable
        columns={columns}
        data={societies}
        loading={loading}
        rowActions={rowActions}
        pagination={pagination}
        onPageChange={setPage}
        onRowClick={(s) => navigate(`/admin/societies/${s._id}`)}
      />

      {freezeModal && (
        <ReasonModal
          title="Freeze Society"
          prompt="Reason for freezing:"
          onClose={handleFreeze}
        />
      )}

      {deleteModal && (
        <ConfirmModal
          title="Delete Society"
          description="This will permanently delete the society and cancel all its events. This cannot be undone."
          confirmWord="DELETE"
          danger
          onClose={handleDelete}
        />
      )}
    </div>
  );
};

const AdminSocieties = () => {
  const isDark = useHomeTheme();
  const [activeTab, setActiveTab] = useState("pending");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const TABS = [
    { key: "pending", label: "Pending Requests", params: { status: "pending" } },
    { key: "active", label: "Active Societies", params: { status: "approved" } },
    { key: "frozen", label: "Frozen / Archived", params: { status: "archived" } },
  ];

  const current = TABS.find((t) => t.key === activeTab) || TABS[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Society Governance
          </h1>
          <p className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Moderate organizational nodes, manage leadership transitions, and audit activity.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          size="md"
          className="gap-2 px-6 text-sm font-bold"
        >
          <span className="text-base">+</span> CREATE SOCIETY
        </Button>
      </div>

      <div className="flex w-fit flex-wrap gap-1 rounded-2xl border border-border-light bg-slate-100 p-1 dark:border-border-dark dark:bg-container-dark">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={getButtonClassName({
              variant: activeTab === t.key ? "primary" : "ghost",
              size: "sm",
              isDark,
              className: "rounded-xl px-5 text-xs font-bold",
            })}
          >
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === "pending" ? (
          <PendingSocietiesTab />
        ) : (
          <SocietyListTab filterParams={current.params} />
        )}
      </div>

      {showCreateModal && (
        <CreateSocietyModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setActiveTab("active");
          }}
        />
      )}
    </div>
  );
};

export default AdminSocieties;
