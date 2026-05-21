import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useHomeTheme from "@/hooks/useHomeTheme";
import { selectStudyGroupById, joinGroup } from "../../redux/slices/studyGroupSlice";
import { useNavigation } from "../../hooks";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import {
  getStudyGroupTheme,
  studyGroupPageTitle,
} from "../../components/studyGroups/studyGroupTheme";

const commitments = [
  "Participate actively in group discussions",
  "Respect all group members",
  "Maintain academic integrity",
  "Follow the meeting schedule",
];

export default function JoinStudyGroup() {
  const { goTo } = useNavigation();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { showSuccess, showError } = useNotification();
  const isDark = useHomeTheme();
  const theme = getStudyGroupTheme(isDark);

  const group = useSelector(selectStudyGroupById(id));

  const handleJoin = async () => {
    try {
      await dispatch(joinGroup(id)).unwrap();
      showSuccess("Successfully joined the study group!");
      goTo(`/study-groups/${id}`);
    } catch (error) {
      showError(error || "Failed to join the study group");
      console.error("Join group error:", error);
    }
  };

  if (!group) {
    return (
      <div className={`flex min-h-screen items-center justify-center p-4 ${theme.page}`}>
        <div className={`rounded-[28px] border px-8 py-10 text-center ${theme.surface}`}>
          <p className={theme.muted}>Study group not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen items-center justify-center px-4 py-8 ${theme.page}`}>
      <div className={`w-full max-w-xl rounded-[32px] border p-6 sm:p-8 ${theme.surface}`}>
        <div className="mb-8 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border ${theme.accentSurface}`}>
            <span className={`material-symbols-outlined text-3xl ${theme.iconAccent}`}>groups</span>
          </div>
          <h1 className={`${studyGroupPageTitle} ${theme.title}`}>Join Study Group</h1>
          <p className={`mt-2 text-sm ${theme.muted}`}>You&apos;re about to join the following study circle.</p>
        </div>

        <div className={`mb-6 rounded-[28px] border p-5 ${theme.surfaceMuted}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className={`text-xl font-semibold ${theme.title}`}>{group.name}</h2>
              <p className={`mt-1 text-sm ${theme.muted}`}>{group.subject || "General study"}</p>
            </div>
            {group.course && (
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${theme.accentSurface} ${theme.iconAccent}`}>
                {group.course}
              </span>
            )}
          </div>

          <div className={`mt-4 flex items-center gap-2 text-sm ${theme.muted}`}>
            <span className="material-symbols-outlined text-base">group</span>
            <span>
              {group.members} / {group.maxMembers || "Unlimited"} members
            </span>
          </div>
        </div>

        <div className={`mb-8 rounded-[28px] border p-5 ${theme.infoSurface}`}>
          <div className="flex gap-3">
            <span className={`material-symbols-outlined mt-0.5 text-lg ${theme.infoText}`}>info</span>
            <div>
              <p className={`text-sm font-medium ${theme.title}`}>By joining this group, you agree to:</p>
              <ul className={`mt-3 space-y-2 text-sm ${theme.infoText}`}>
                {commitments.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => goTo(`/study-groups/${id}`)}
            className={`flex-1 rounded-2xl border px-6 py-3 text-sm font-medium transition ${theme.buttonSecondary}`}
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-medium transition ${theme.buttonPrimary}`}
          >
            <span className="material-symbols-outlined text-lg">check_circle</span>
            Confirm Join
          </button>
        </div>
      </div>
    </div>
  );
}
