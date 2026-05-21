import toast from "react-hot-toast";
import {
  badgeUnlocked,
  certificateIssued,
  leaderboardUpdated,
  levelUp,
  pointsEarned,
  streakUpdated,
} from "../../redux/slices/gamificationSlice";

export const registerGamificationHandlers = (socket, dispatch) => {
  socket.on("gamification:points-earned", (payload) => {
    dispatch(pointsEarned(payload));
    toast.success(`+${payload.points} points`);
  });

  socket.on("gamification:badge-unlocked", (payload) => {
    dispatch(badgeUnlocked(payload));
    toast.success(`Badge unlocked: ${payload.badge?.name || "New badge"}`);
  });

  socket.on("gamification:level-up", (payload) => {
    dispatch(levelUp(payload));
    toast.success(`Level ${payload.newLevel} reached`);
  });

  socket.on("gamification:streak-updated", (payload) => {
    dispatch(streakUpdated(payload));
    if (payload.broken) {
      toast(`Streak restarted at ${payload.currentCount}`);
    } else {
      toast.success(`Streak: ${payload.currentCount} day(s)`);
    }
  });

  socket.on("gamification:leaderboard-updated", (payload) => {
    dispatch(leaderboardUpdated(payload));
    toast("Leaderboard updated");
  });

  socket.on("gamification:certificate-issued", (payload) => {
    dispatch(certificateIssued(payload));
    toast.success(`Certificate issued: ${payload.title}`);
  });
};

export const unregisterGamificationHandlers = (socket) => {
  [
    "gamification:points-earned",
    "gamification:badge-unlocked",
    "gamification:level-up",
    "gamification:streak-updated",
    "gamification:leaderboard-updated",
    "gamification:certificate-issued",
  ].forEach((event) => socket.off(event));
};
