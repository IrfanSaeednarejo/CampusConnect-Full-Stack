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
      <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-[#8b949e]">Study group not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#161b22] border border-[#30363d] rounded-lg p-8">
        <div className="text-center mb-6">
          <span className="material-symbols-outlined text-6xl text-[#238636] block mb-4">
            groups
          </span>
          <h1 className="text-2xl font-bold text-[#c9d1d9] mb-2">
            Join Study Group
          </h1>
          <p className="text-[#8b949e]">You're about to join:</p>
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 mb-6">
          <h2 className="text-xl font-bold text-[#c9d1d9] mb-2">
            {group.name}
          </h2>
          <div className="flex items-center gap-4 text-sm text-[#8b949e]">
            <span className="px-3 py-1 rounded-full bg-[#238636]/20 text-[#238636] border border-[#238636]/30 font-semibold">
              {group.course}
            </span>
            <span>
              {group.members} / {group.maxMembers || "Unlimited"} Members
            </span>
          </div>
        </div>

        <div className="bg-[#238636]/10 border border-[#238636]/30 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-[#238636] text-xl">
              info
            </span>
            <div className="text-sm text-[#8b949e]">
              <p className="font-medium text-[#c9d1d9] mb-2">
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
            className="flex-1 px-6 py-3 rounded-lg bg-[#21262d] text-[#c9d1d9] font-semibold border border-[#30363d] hover:bg-[#30363d] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            className="flex-1 px-6 py-3 rounded-lg bg-[#238636] text-white font-semibold hover:bg-[#2ea043] transition-colors flex items-center justify-center gap-2"
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
