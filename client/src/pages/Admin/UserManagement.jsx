import { useState, useEffect, useCallback } from "react";
import { getAllUsers, suspendUser, unsuspendUser, deleteUser, updateUserRoles } from "../../api/adminApi";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    const fetchUsers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const filters = {};
            if (search) filters.search = search;
            if (roleFilter) filters.role = roleFilter;
            const res = await getAllUsers(page, 20, filters);
            setUsers(res.data.users);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    }, [search, roleFilter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleSuspend = async (userId) => {
        if (!confirm("Are you sure you want to suspend this user?")) return;
        setActionLoading(userId);
        try {
            await suspendUser(userId, "Suspended by admin");
            fetchUsers(pagination.page);
        } catch (err) { alert("Failed to suspend user"); }
        setActionLoading(null);
    };

    const handleUnsuspend = async (userId) => {
        setActionLoading(userId);
        try {
            await unsuspendUser(userId);
            fetchUsers(pagination.page);
        } catch (err) { alert("Failed to unsuspend user"); }
        setActionLoading(null);
    };

    const handleDelete = async (userId) => {
        if (!confirm("⚠️ This action is PERMANENT. Are you sure you want to delete this user?")) return;
        setActionLoading(userId);
        try {
            await deleteUser(userId);
            fetchUsers(pagination.page);
        } catch (err) { alert("Failed to delete user"); }
        setActionLoading(null);
    };

    const handleRoleChange = async (userId, currentRoles, roleToToggle) => {
        const newRoles = currentRoles.includes(roleToToggle)
            ? currentRoles.filter(r => r !== roleToToggle)
            : [...currentRoles, roleToToggle];
        setActionLoading(userId);
        try {
            await updateUserRoles(userId, newRoles);
            fetchUsers(pagination.page);
        } catch (err) { alert("Failed to update roles"); }
        setActionLoading(null);
    };

    const getRoleBadge = (role) => {
        const colors = {
            admin: "bg-red-900/50 text-red-400 border-red-700/50",
            mentor: "bg-purple-900/50 text-purple-400 border-purple-700/50",
            society_head: "bg-orange-900/50 text-orange-400 border-orange-700/50",
            student: "bg-green-900/50 text-primary border-green-700/50",
        };
        return colors[role] || "bg-gray-700 text-gray-300 border-gray-600";
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-background">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-white">User Management</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {pagination.total} users on the platform
                    </p>
                </header>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-surface border border-border rounded-lg px-4 py-2 text-white text-sm placeholder:text-text-secondary focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-surface border border-border rounded-lg px-4 py-2 text-white text-sm focus:ring-1 focus:ring-primary"
                    >
                        <option value="">All Roles</option>
                        <option value="student">Students</option>
                        <option value="mentor">Mentors</option>
                        <option value="society_head">Society Heads</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20 text-text-secondary">
                        <p className="text-4xl mb-3">👥</p>
                        <p>No users found matching your criteria.</p>
                    </div>
                ) : (
                    <>
                        {/* Users Table */}
                        <div className="bg-surface border border-border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border text-text-secondary">
                                            <th className="text-left px-4 py-3 font-medium">User</th>
                                            <th className="text-left px-4 py-3 font-medium">Email</th>
                                            <th className="text-left px-4 py-3 font-medium">Roles</th>
                                            <th className="text-left px-4 py-3 font-medium">Joined</th>
                                            <th className="text-left px-4 py-3 font-medium">Status</th>
                                            <th className="text-right px-4 py-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => {
                                            const name = user.profile?.displayName || user.profile?.firstName || "Unknown";
                                            const avatar = user.profile?.avatar;
                                            const isSuspended = user.status === "suspended";
                                            const isProcessing = actionLoading === user._id;
                                            return (
                                                <tr key={user._id} className="border-b border-border hover:bg-surface-hover transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {avatar ? (
                                                                <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                                                    {name.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <span className="text-white font-medium capitalize">{name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-text-secondary">{user.email}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-1 flex-wrap">
                                                            {user.roles.map((role) => (
                                                                <span key={role} className={`text-xs px-2 py-0.5 rounded-full border ${getRoleBadge(role)}`}>
                                                                    {role.replace("_", " ")}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-text-secondary">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${isSuspended ? "bg-red-900/50 text-red-400 border-red-700/50" : "bg-green-900/50 text-primary border-green-700/50"}`}>
                                                            {isSuspended ? "Suspended" : "Active"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            {!user.roles.includes("admin") && (
                                                                <>
                                                                    {isSuspended ? (
                                                                        <button
                                                                            onClick={() => handleUnsuspend(user._id)}
                                                                            disabled={isProcessing}
                                                                            className="text-xs px-3 py-1 rounded bg-green-900/30 text-primary hover:bg-green-900/50 border border-green-700/50 disabled:opacity-50"
                                                                        >
                                                                            Unsuspend
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => handleSuspend(user._id)}
                                                                            disabled={isProcessing}
                                                                            className="text-xs px-3 py-1 rounded bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50 border border-yellow-700/50 disabled:opacity-50"
                                                                        >
                                                                            Suspend
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => handleDelete(user._id)}
                                                                        disabled={isProcessing}
                                                                        className="text-xs px-3 py-1 rounded bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-700/50 disabled:opacity-50"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => fetchUsers(page)}
                                        className={`px-3 py-1 rounded text-sm border transition-colors ${page === pagination.page
                                            ? "bg-primary text-white border-primary"
                                            : "bg-surface text-text-secondary border-border hover:border-primary/50"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
