import { useEffect } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMySocieties,
  fetchSocietyMembers,
  fetchSocietyStats,
  selectMySocieties,
  selectCurrentSociety,
  selectMemberRequests,
  selectSocietyLoading,
} from "../../redux/slices/societySlice";
import { selectUser } from "../../redux/slices/authSlice";

const NAV_ITEMS = [
  { to: "/society/manage",          icon: "dashboard",         label: "Dashboard"      },
  { to: "/society/members",         icon: "group",             label: "Members"        },
  { to: "/society/events",          icon: "event",             label: "Events"         },
  { to: "/society/analytics",       icon: "analytics",         label: "Analytics"      },
  { to: "/society/profile",         icon: "badge",             label: "Society Profile"},
  { to: "/society/settings",        icon: "settings",          label: "Settings"       },
];

export default function SocietyHQLayout() {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const user        = useSelector(selectUser);
  const mySocieties = useSelector(selectMySocieties);
  const society     = useSelector(selectCurrentSociety);
  const pendingReqs = useSelector(selectMemberRequests);
  const loading     = useSelector(selectSocietyLoading);

  const headSociety = society ?? mySocieties?.[0] ?? null;
  const societyId   = headSociety?._id;

  // Load society context once
  useEffect(() => {
    if (user?._id) dispatch(fetchMySocieties(user._id));
  }, [dispatch, user?._id]);

  useEffect(() => {
    if (societyId) {
      dispatch(fetchSocietyMembers({ id: societyId, params: { status: "all" } }));
      dispatch(fetchSocietyStats(societyId));
    }
  }, [dispatch, societyId]);

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
    approved: "bg-emerald-500/15 text-emerald-400",
    pending:  "bg-amber-500/15 text-amber-400",
    rejected: "bg-red-500/15 text-red-400",
  }[headSociety?.status] ?? "bg-slate-500/15 text-slate-400";

  return (
    <div className="min-h-screen bg-[#0d1117] flex">
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Society Identity */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            {headSociety?.media?.logo ? (
              <img src={headSociety.media.logo} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-400 text-xl">groups</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-slate-200 font-semibold text-sm truncate">{headSociety?.name}</p>
              <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${statusCls}`}>
                {headSociety?.status}
              </span>
            </div>
          </div>
          <p className="text-slate-600 text-[10px] uppercase tracking-widest font-semibold">Society HQ</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map(({ to, icon, label }) => {
            const isMembers = to === "/society/members";
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-700/70 text-slate-100 border border-slate-600/50"
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                <span className="flex-1">{label}</span>
                {isMembers && pendingCount > 0 && (
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-500/30">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom: Back to Dashboard */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:text-slate-400 hover:bg-slate-800/50 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Dashboard
          </button>
        </div>
      </aside>

      {/* ── Content ── */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet context={{ headSociety, societyId, pendingCount }} />
      </main>
    </div>
  );
}
