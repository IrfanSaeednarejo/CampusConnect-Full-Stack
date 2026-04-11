import { useState, useEffect, useCallback } from "react";
import { getAdminSocieties, deleteAdminSociety } from "../../api/adminApi";

export default function AdminSocieties() {
    const [societies, setSocieties] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    const fetchSocieties = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await getAdminSocieties(page, 20, search);
            setSocieties(res.data.societies);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error("Failed to fetch societies:", err);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { fetchSocieties(); }, [fetchSocieties]);

    const handleDelete = async (societyId, name) => {
        if (!confirm(`⚠️ Are you sure you want to permanently delete "${name}"? This cannot be undone.`)) return;
        setActionLoading(societyId);
        try {
            await deleteAdminSociety(societyId);
            fetchSocieties(pagination.page);
        } catch (err) { alert("Failed to delete society"); }
        setActionLoading(null);
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-background">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-text-primary">Society Oversight</h1>
                    <p className="text-sm text-text-secondary mt-1">
                        {pagination.total} societies on the platform
                    </p>
                </header>

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search societies by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full max-w-md bg-surface border border-border rounded-lg px-4 py-2 text-text-primary text-sm placeholder:text-text-secondary focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : societies.length === 0 ? (
                    <div className="text-center py-20 text-text-secondary">
                        <p className="text-4xl mb-3">🏢</p>
                        <p>No societies found.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {societies.map((society) => {
                                const logo = society.media?.logo;
                                const headName = society.createdBy?.profile?.displayName || society.createdBy?.email || "Unknown";
                                const isProcessing = actionLoading === society._id;

                                return (
                                    <div key={society._id} className="bg-surface border border-border rounded-lg p-5 flex flex-col">
                                        <div className="flex items-start gap-3 mb-4">
                                            {logo ? (
                                                <img src={logo} alt={society.name} className="w-12 h-12 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                                                    {society.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-text-primary font-semibold truncate">{society.name}</h3>
                                                <p className="text-text-secondary text-xs">{society.tag || "No tag"}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm mb-4 flex-1">
                                            <div className="flex justify-between text-text-secondary">
                                                <span>Head</span>
                                                <span className="text-text-primary capitalize">{headName}</span>
                                            </div>
                                            <div className="flex justify-between text-text-secondary">
                                                <span>Members</span>
                                                <span className="text-text-primary">{society.memberCount ?? society.members?.length ?? 0}</span>
                                            </div>
                                            <div className="flex justify-between text-text-secondary">
                                                <span>Created</span>
                                                <span className="text-text-primary">{new Date(society.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(society._id, society.name)}
                                            disabled={isProcessing}
                                            className="w-full px-3 py-2 rounded-lg bg-red-900/20 text-red-400 text-sm hover:bg-red-900/40 border border-red-700/50 disabled:opacity-50 transition-colors"
                                        >
                                            🗑️ Delete Society
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => fetchSocieties(page)}
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
