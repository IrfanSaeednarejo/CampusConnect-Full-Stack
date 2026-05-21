import { useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useHomeTheme from "../../hooks/useHomeTheme";
import { getButtonClassName } from "../common/Button";
import { cn, getSocietyTheme } from "../../pages/Societies/societyTheme";
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
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDark = useHomeTheme();
  const theme = getSocietyTheme(isDark);
  const user = useSelector(selectUser);
  const mySocieties = useSelector(selectMySocieties);
  const currentSoc = useSelector(selectCurrentSociety);
  const pendingReqs = useSelector(selectMemberRequests);
  const loading = useSelector(selectSocietyLoading);

  const headSociety = currentSoc?._id === id ? currentSoc : null;
  const societyId = id;

  useEffect(() => {
    if (user?._id) dispatch(fetchMySocieties(user._id));
  }, [dispatch, user?._id]);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchSocietyById(id));
    dispatch(fetchSocietyMembers({ id, params: { status: "all" } }));
    dispatch(fetchSocietyStats(id));
  }, [dispatch, id]);

  const pendingCount = pendingReqs.filter((member) => member.status === "pending").length;

  if (loading && !headSociety) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", theme.page)}>
        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              "h-10 w-10 animate-spin rounded-full border-2 border-t-transparent",
              isDark ? "border-border-dark border-t-text-primary-dark" : "border-border-light border-t-text-primary-light"
            )}
          />
          <p className={cn("text-sm", theme.muted)}>Loading Society HQ...</p>
        </div>
      </div>
    );
  }

  if (!loading && !headSociety) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center p-8", theme.page)}>
        <div className={cn("max-w-md rounded-3xl border p-12 text-center", theme.card)}>
          <span className={cn("material-symbols-outlined mb-4 block text-6xl", theme.muted)}>groups</span>
          <h2 className={cn("mb-2 text-xl font-bold", theme.text)}>No Society Found</h2>
          <p className={cn("mb-6 text-sm leading-6", theme.muted)}>
            You don't manage a society yet. Create one to access the Society HQ.
          </p>
          <button
            onClick={() => navigate("/societies")}
            className={getButtonClassName({ variant: "secondary", size: "md" })}
          >
            Browse Societies
          </button>
        </div>
      </div>
    );
  }

  const statusCls = {
    approved: "border-emerald-500/25 bg-emerald-500/15 text-emerald-400",
    pending: "border-amber-500/25 bg-amber-500/15 text-amber-400",
    rejected: "border-red-500/25 bg-red-500/15 text-red-400",
  }[headSociety?.status] ?? theme.badgeMuted;

  return (
    <div className={cn("min-h-screen flex flex-col transition-colors duration-300", theme.page)}>
      <header className={cn("sticky top-0 z-30 border-b backdrop-blur-md transition-all", theme.header, theme.divider)}>
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
          <div className="flex min-w-0 items-center gap-4">
            {headSociety?.media?.logo ? (
              <img
                src={headSociety.media.logo}
                alt=""
                className={cn(
                  "h-9 w-9 rounded-xl border object-cover shadow-lg",
                  isDark ? "border-border-dark shadow-black/20" : "border-border-light shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
                )}
              />
            ) : (
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", theme.subtle)}>
                <span className={cn("material-symbols-outlined text-lg", theme.muted)}>groups</span>
              </div>
            )}

            <div className="min-w-0">
              <h1 className={cn("truncate text-base font-semibold leading-tight", theme.text)}>{headSociety?.name}</h1>
              <div className="mt-0.5 flex items-center gap-2">
                <span className={cn("text-[10px] font-semibold uppercase tracking-widest", theme.muted)}>Society HQ</span>
                <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase ${statusCls}`}>
                  {headSociety?.status}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className={getButtonClassName({ variant: "ghost", size: "sm", className: "min-w-0 px-3" })}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Dashboard
          </button>
        </div>
      </header>

      <main className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1400px] transition-all">
          <Outlet context={{ headSociety, societyId, pendingCount }} />
        </div>
      </main>
    </div>
  );
}
