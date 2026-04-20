import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMutualConnections } from '../../redux/slices/networkSlice';

export default function MutualConnectionsPreview({ targetUserId, initialMutualCount = 0 }) {
  const dispatch = useDispatch();
  const mutualData = useSelector(state => state.network.mutualMap[targetUserId]);

  useEffect(() => {
    if (targetUserId && !mutualData && initialMutualCount > 0) {
      dispatch(fetchMutualConnections(targetUserId));
    }
  }, [dispatch, targetUserId, mutualData, initialMutualCount]);

  const count = mutualData?.mutualCount ?? initialMutualCount;
  const users = mutualData?.mutualUsers || [];

  if (!count) return null;

  const avatarUrl = (u) =>
    u.profile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(u.profile?.displayName || 'User')}&size=32&background=0d1117&color=58a6ff&bold=true`;

  return (
    <div className="flex items-center gap-2 text-xs text-[#8b949e]">
      {users.length > 0 && (
        <div className="flex -space-x-2">
          {users.slice(0, 3).map(u => (
            <img
              key={u._id}
              src={avatarUrl(u)}
              alt={u.profile?.displayName || 'User'}
              className="w-5 h-5 rounded-full border-2 border-[#161b22] object-cover"
              title={u.profile?.displayName}
            />
          ))}
        </div>
      )}
      <span>
        {count} mutual connection{count !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
