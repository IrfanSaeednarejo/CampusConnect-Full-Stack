import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMutualConnections } from "../../redux/slices/networkSlice";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function MutualConnectionsPreview({
  targetUserId,
  initialMutualCount = 0,
}) {
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const mutualData = useSelector((state) => state.network.mutualMap[targetUserId]);

  useEffect(() => {
    if (!targetUserId || mutualData) return;
    dispatch(fetchMutualConnections(targetUserId));
  }, [dispatch, mutualData, targetUserId]);

  const count = mutualData?.mutualCount ?? initialMutualCount;
  const users = mutualData?.mutualUsers || [];

  if (!count) return null;

  const avatarUrl = (user) =>
    user?.profile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.profile?.displayName || user?.username || "User"
    )}&background=0f172a&color=2563eb&size=64`;

  return (
    <div
      className={`flex items-center gap-2 text-xs ${
        isDark ? "text-text-secondary-dark" : "text-slate-500"
      }`}
    >
      {users.length > 0 && (
        <div className="flex -space-x-2">
          {users.slice(0, 3).map((user) => (
            <img
              key={user._id}
              src={avatarUrl(user)}
              alt={user?.profile?.displayName || user?.username || "User"}
              className={`h-5 w-5 rounded-full object-cover ring-1 ${
                isDark ? "ring-surface-dark" : "ring-white"
              }`}
            />
          ))}
        </div>
      )}
      <span>
        {count} mutual connection{count > 1 ? "s" : ""}
      </span>
    </div>
  );
}
