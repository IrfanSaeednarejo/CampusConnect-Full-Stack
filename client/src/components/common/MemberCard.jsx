import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Avatar from './Avatar';
import ConnectionButton from '../network/ConnectionButton';
import MutualConnectionsPreview from '../network/MutualConnectionsPreview';
import RecommendationBadge from '../network/RecommendationBadge';

export default function MemberCard({
  userId,
  name,
  displayName,
  role,
  avatarUrl,
  campus,
  bio,
  interests = [],
  sharedInterests = [],
  matchType,
  mutualCount = 0,
  connectionsCount,
  isConnected,
  className = '',
  compact = false,
}) {
  const navigate = useNavigate();
  const { connected, pendingSent, pendingReceived } = useSelector((s) => s.network);

  const connectionRecord = connected.find((c) => c.user._id === userId);
  const isPendingSent = pendingSent.find((c) => c.user._id === userId);
  const isPendingReceived = pendingReceived.find((c) => c.user._id === userId);
  const isActuallyConnected = !!connectionRecord || isConnected;

  const avatarToUse = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d1117&color=58a6ff&bold=true`;
  const displayedRole = role ? role.replace(/_/g, ' ') : 'Member';
  const shortBio = bio ? (bio.length > 80 ? bio.slice(0, 80) + '…' : bio) : null;
  
  const connectionBadge = () => {
    if (isActuallyConnected) return { label: 'Connected', color: 'text-[#3fb950] bg-[#238636]/15 border-[#238636]/30' };
    if (isPendingReceived) return { label: 'Respond', color: 'text-[#d29922] bg-[#b08800]/15 border-[#b08800]/30' };
    if (isPendingSent) return { label: 'Pending', color: 'text-[#8b949e] bg-[#30363d]/50 border-[#30363d]' };
    return null;
  };

  const badge = connectionBadge();

  return (
    <div
      className={`group relative flex flex-col bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden 
        hover:border-[#58a6ff]/40 hover:shadow-lg hover:shadow-[#58a6ff]/5 
        transition-all duration-200 ease-out cursor-pointer ${className}`}
      onClick={(e) => {
        // Don't navigate when clicking inside action buttons
        if (e.target.closest('[data-no-nav]')) return;
        navigate(`/users/${userId}`);
      }}
    >
      {/* Top accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#1f6feb] via-[#388bfd] to-[#8957e5] opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex flex-col p-4 gap-3 flex-1">
        {/* Header: Avatar + Identity */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <Avatar src={avatarToUse} size="12" />
            {isActuallyConnected && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#3fb950] rounded-full border-2 border-[#161b22]" title="Connected" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-[#e6edf3] font-bold text-base leading-tight truncate">{name}</h2>
                {displayName && (
                  <p className="text-[#58a6ff] text-xs mt-0.5 truncate">@{displayName}</p>
                )}
              </div>
              {badge && (
                <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.color}`}>
                  {badge.label}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[#8b949e] text-xs capitalize">{displayedRole}</span>
              {campus && (
                <>
                  <span className="text-[#30363d]">·</span>
                  <span className="text-[#8b949e] text-xs flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[11px]">location_on</span>
                    {campus}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recommendation Badge */}
        {matchType && matchType !== 'New' && <RecommendationBadge matchType={matchType} />}

        {/* Bio */}
        {shortBio && (
          <p className="text-[#8b949e] text-xs leading-relaxed line-clamp-2">{shortBio}</p>
        )}

        {/* Interests / Skills */}
        {interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {interests.slice(0, 4).map((interest, idx) => {
              const isShared = sharedInterests.includes(interest);
              return (
                <span
                  key={idx}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    isShared
                      ? 'bg-[#238636]/15 text-[#3fb950] border-[#238636]/30'
                      : 'bg-[#1f6feb]/10 text-[#58a6ff] border-[#1f6feb]/20'
                  }`}
                >
                  {isShared && '✓ '}{interest}
                </span>
              );
            })}
            {interests.length > 4 && (
              <span className="text-[10px] text-[#8b949e] px-1 self-center">+{interests.length - 4}</span>
            )}
          </div>
        )}

        {/* Footer: Mutual connections + Stats */}
        <div className="mt-auto pt-2 border-t border-[#21262d]">
          <div className="flex items-center justify-between gap-2">
            <MutualConnectionsPreview targetUserId={userId} initialMutualCount={mutualCount} />
            {connectionsCount !== undefined && (
              <span className="text-[10px] text-[#8b949e]">
                {connectionsCount} connections
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-4 pb-4" data-no-nav>
        <ConnectionButton targetUserId={userId} fullWidth />
      </div>
    </div>
  );
}
