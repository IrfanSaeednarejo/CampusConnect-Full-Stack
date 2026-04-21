import { useEffect } from "react";
import { NavLink, useNavigate, Outlet, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMySocieties,
  fetchSocietyById,
  fetchSocietyMembers,
  fetchSocietyStats,
  selectMySocieties,
  selectCurrentSociety,
  selectMemberRequests,
  selectSocietyLoading,
} from "../../redux/slices/societySlice";
import { selectUser } from "../../redux/slices/authSlice";

export default function SocietyHQLayout() {
  const { id }      = useParams(); // The ID from /society/:id/*
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const user        = useSelector(selectUser);
  const mySocieties = useSelector(selectMySocieties);
  const currentSoc  = useSelector(selectCurrentSociety);
  const pendingReqs = useSelector(selectMemberRequests);
  const loading     = useSelector(selectSocietyLoading);

  const headSociety = currentSoc?._id === id ? currentSoc : null;
  const societyId   = id;



  // Load user's societies on mount
  useEffect(() => {
    if (user?._id) dispatch(fetchMySocieties(user._id));
  }, [dispatch, user?._id]);

  // Load specific society data when ID changes
  useEffect(() => {
    if (id) {
      dispatch(fetchSocietyById(id));
      dispatch(fetchSocietyMembers({ id, params: { status: "all" } }));
      dispatch(fetchSocietyStats(id));
    }
  }, [dispatch, id]);

  const pendingCount = pendingReqs.filter(m => m.status === "pending").length;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading && !headSociety) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-slate-700 border-t-slate-300 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading Society HQ…</p>
        </div>
      </div>
    );
  }

  // ── No Society Guard ─────────────────────────────────────────────────────────
  if (!loading && !headSociety) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center max-w-md">
          <span className="material-symbols-outlined text-slate-600 text-6xl block mb-4">groups</span>
          <h2 className="text-slate-200 font-bold text-xl mb-2">No Society Found</h2>
          <p className="text-slate-500 text-sm mb-6">
            You don't manage a society yet. Create one to access the Society HQ.
          </p>
          <button
            onClick={() => navigate("/societies")}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl border border-slate-600 transition-colors"
          >
            Browse Societies
          </button>
        </div>
      </div>
    );
  }

  const statusCls = {
    approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    pending:  "bg-amber-500/15 text-amber-400 border-amber-500/25",
    rejected: "bg-red-500/15 text-red-400 border-red-500/25",
  }[headSociety?.status] ?? "bg-slate-500/15 text-slate-400";

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      {/* ── Dynamic Header (Sub-Navbar) ── */}
      <header className="sticky top-0 z-30 bg-[#0d1117]/80 backdrop-blur-md border-b border-slate-800/60 transition-all">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            {headSociety?.media?.logo ? (
              <img src={headSociety.media.logo} alt="" className="w-9 h-9 rounded-xl object-cover border border-slate-700 shadow-lg shadow-black/20" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                <span className="material-symbols-outlined text-slate-500 text-lg">groups</span>
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-slate-100 font-bold text-base leading-tight truncate">{headSociety?.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Society HQ</span>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${statusCls}`}>
                  {headSociety?.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto transition-all">
           <Outlet context={{ headSociety, societyId, pendingCount }} />
        </div>
      </main>
    </div>
  );
}
