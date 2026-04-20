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
                const { data } = await getAdminUsers({ status: "active", limit: 10, q: userSearchQ });
                setUsers(data.data?.docs || []);
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
            toast.success("Study Group created successfully!");
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create study group");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-white leading-tight">Create Study Group</h2>
                        <p className="text-slate-400 text-sm mt-1">Found a new academic cluster.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-500 tracking-wider">GROUP NAME</label>
                            <input 
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. Advanced AI Study"
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-500 tracking-wider">SUBJECT</label>
                            <input 
                                required
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                placeholder="e.g. Machine Learning"
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-500 tracking-wider">COURSE CODE (OPTIONAL)</label>
                            <input 
                                value={formData.course}
                                onChange={(e) => setFormData({...formData, course: e.target.value})}
                                placeholder="e.g. CS402"
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-indigo-500 tracking-wider">MAX CAPACITY</label>
                            <input 
                                type="number"
                                required
                                min={2}
                                max={100}
                                value={formData.maxMembers}
                                onChange={(e) => setFormData({...formData, maxMembers: parseInt(e.target.value) || 2})}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-indigo-500 tracking-wider uppercase">Assign Group Leader</label>
                        
                        {selectedUser ? (
                            <div className="w-full bg-slate-800 border border-indigo-500 rounded-xl px-4 py-3 flex justify-between items-center animate-in fade-in zoom-in duration-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase">
                                        {selectedUser.profile?.displayName?.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{selectedUser.profile?.displayName}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">{selectedUser.email}</div>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => { setSelectedUser(null); setFormData({...formData, coordinatorId: ""}); }}
                                    className="text-[10px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-tighter"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</div>
                                <input 
                                    placeholder="Search by name or email..."
                                    value={userSearchQ}
                                    onChange={(e) => { setUserSearchQ(e.target.value); setDropdownOpen(true); }}
                                    onFocus={() => setDropdownOpen(true)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-colors"
                                />
                                
                                {dropdownOpen && userSearchQ.length >= 2 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-50 shadow-2xl max-h-[160px] overflow-y-auto">
                                        {loadingUsers ? (
                                            <div className="p-4 text-center text-xs text-slate-500">Searching...</div>
                                        ) : users.length > 0 ? (
                                            users.map(u => (
                                                <div 
                                                    key={u._id} 
                                                    onClick={() => handleSelectUser(u)}
                                                    className="p-3 border-b border-slate-700/50 hover:bg-indigo-600/20 cursor-pointer transition-colors group"
                                                >
                                                    <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{u.profile?.displayName}</div>
                                                    <div className="text-[10px] text-slate-400 uppercase">{u.email} {u.academic?.department ? `· ${u.academic.department}` : ""}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-xs text-slate-500">No active students found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-indigo-500 tracking-wider">DESCRIPTION</label>
                        <textarea 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Details about the study focus..."
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-colors min-h-[100px] resize-none"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="flex-1 px-6 py-4 rounded-2xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800 transition-colors uppercase text-xs tracking-widest"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting} 
                            className="flex-[2] px-6 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-50 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all uppercase text-xs tracking-widest"
                        >
                            {submitting ? "Initiating..." : "Create Group"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateStudyGroupModal;
