import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectStudyGroupById,
  joinGroup,
} from "../../redux/slices/studyGroupSlice";
import { useNavigation } from "../../hooks";
import { useNotification } from "../../contexts/NotificationContext.jsx";

export default function JoinStudyGroup() {
  const { goTo } = useNavigation();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { showSuccess, showError } = useNotification();

  const group = useSelector(selectStudyGroupById(id));

  const handleJoin = () => {
    try {
      dispatch(joinGroup(parseInt(id)));
      showSuccess("Successfully joined the study group!");
      goTo(`/study-groups/${id}`);
    } catch (error) {
      showError("Failed to join the study group");
      console.error("Join group error:", error);
    }
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-text-secondary">Study group not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface border border-border rounded-lg p-8">
        <div className="text-center mb-6">
          <span className="material-symbols-outlined text-6xl text-primary block mb-4">
            groups
          </span>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Join Study Group
          </h1>
          <p className="text-text-secondary">You're about to join:</p>
        </div>

        <div className="bg-background border border-border rounded-lg p-4 mb-6">
          <h2 className="text-xl font-bold text-text-primary mb-2">
            {group.name}
          </h2>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 font-semibold">
              {group.course}
            </span>
            <span>
              {group.members} / {group.maxMembers || "Unlimited"} Members
            </span>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-primary text-xl">
              info
            </span>
            <div className="text-sm text-text-secondary">
              <p className="font-medium text-text-primary mb-2">
                By joining this group, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Participate actively in group discussions</li>
                <li>Respect all group members</li>
                <li>Maintain academic integrity</li>
                <li>Follow the meeting schedule</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => goTo(`/study-groups/${id}`)}
            className="flex-1 px-6 py-3 rounded-lg bg-surface-hover text-text-primary font-semibold border border-border hover:bg-[#C7D2FE] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            className="flex-1 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">
              check_circle
            </span>
            Confirm Join
          </button>
        </div>
      </div>
    </div>
  );
}
