import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Avatar from "./Avatar";
import ConnectionButton from "../network/ConnectionButton";
import MutualConnectionsPreview from "../network/MutualConnectionsPreview";
import RecommendationBadge from "../network/RecommendationBadge";
import useHomeTheme from "../../hooks/useHomeTheme";

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
  className = "",
  compact = false,
}) {
  const navigate = useNavigate();
  const isDark = useHomeTheme();
  const { connected, pendingSent, pendingReceived } = useSelector(
    (state) => state.network
  );

  const connectionRecord =
    connected.find((item) => item.user._id === userId) ||
    pendingSent.find((item) => item.user._id === userId) ||
    pendingReceived.find((item) => item.user._id === userId);

  const isPendingSent = pendingSent.find((item) => item.user._id === userId);
  const isPendingReceived = pendingReceived.find((item) => item.user._id === userId);
  const isActuallyConnected = !!connectionRecord || isConnected;

  const avatarToUse =
    avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name || displayName || "User"
    )}&background=0d1117&color=58a6ff&size=128`;

  const displayedRole = role ? role.replace(/_/g, " ") : "Member";
  const shortBio = bio ? (bio.length > 80 ? `${bio.slice(0, 80)}...` : bio) : null;

  const connectionBadge = () => {
    if (isActuallyConnected) {
      return {
        label: "Connected",
        classes: isDark
          ? "border-[#238636]/30 bg-[#238636]/15 text-[#3fb950]"
          : "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    }
    if (isPendingReceived) {
      return {
        label: "Respond",
        classes: isDark
          ? "border-[#b08800]/30 bg-[#b08800]/15 text-[#d29922]"
          : "border-amber-200 bg-amber-50 text-amber-700",
      };
    }
    if (isPendingSent) {
      return {
        label: "Pending",
        classes: isDark
          ? "border-[#30363d] bg-[#30363d]/50 text-[#8b949e]"
          : "border-slate-200 bg-slate-100 text-slate-600",
      };
    }
    return null;
  };

  const badge = connectionBadge();

  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${
        isDark
          ? "border-[#30363d] bg-[#161b22] hover:border-[#58a6ff]/40 hover:shadow-lg hover:shadow-[#58a6ff]/5"
          : "border-slate-200 bg-white hover:border-sky-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
      } ${compact ? "p-4" : "p-5"} ${className}`}
      onClick={(event) => {
        if (event.target.closest("[data-no-nav]")) return;
        navigate(`/users/${userId}`);
      }}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-primary" />

      <div className="flex flex-1 flex-col">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <Avatar
              src={avatarToUse}
              alt={name || displayName || "User avatar"}
              size={compact ? "12" : "14"}
              className={compact ? "" : "shadow-sm"}
            />
            {isActuallyConnected && (
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 ${
                  isDark ? "border-[#161b22] bg-[#3fb950]" : "border-white bg-emerald-500"
                }`}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3
                  className={`truncate text-base font-semibold ${
                    isDark ? "text-[#e6edf3]" : "text-slate-900"
                  }`}
                >
                  {name || "Unknown"}
                </h3>
                {displayName && displayName !== name && (
                  <p
                    className={`truncate text-xs ${
                      isDark ? "text-[#8b949e]" : "text-slate-500"
                    }`}
                  >
                    @{displayName}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                {badge && (
                  <span
                    className={`rounded-full border px-2 py-1 text-[11px] font-medium ${badge.classes}`}
                  >
                    {badge.label}
                  </span>
                )}
                <RecommendationBadge matchType={matchType} />
              </div>
            </div>

            <div
              className={`mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${
                isDark ? "text-[#8b949e]" : "text-slate-500"
              }`}
            >
              <span className="capitalize">{displayedRole}</span>
              {campus && (
                <>
                  <span>&middot;</span>
                  <span>{campus}</span>
                </>
              )}
            </div>

            {shortBio && (
              <p
                className={`mt-3 min-h-12 line-clamp-2 text-sm leading-6 ${
                  isDark ? "text-[#c9d1d9]" : "text-slate-600"
                }`}
              >
                {shortBio}
              </p>
            )}

            {interests.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {interests.slice(0, compact ? 3 : 4).map((interest) => {
                  const isShared = sharedInterests.includes(interest);
                  return (
                    <span
                      key={interest}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                        isShared
                          ? isDark
                            ? "border-[#1f6feb]/25 bg-[#1f6feb]/10 text-[#58a6ff]"
                            : "border-sky-200 bg-sky-50 text-sky-700"
                          : isDark
                            ? "border-[#30363d] bg-[#0d1117] text-[#8b949e]"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      {isShared ? `Shared ${interest}` : interest}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`mt-5 flex items-end justify-between gap-3 border-t pt-4 ${
          isDark ? "border-[#21262d]" : "border-slate-200"
        } ${compact ? "flex-col items-stretch" : ""}`}
      >
        <div className="min-w-0 flex-1">
          <MutualConnectionsPreview
            targetUserId={userId}
            initialMutualCount={mutualCount}
          />
          {typeof connectionsCount === "number" && connectionsCount > 0 && (
            <p
              className={`mt-2 text-xs ${
                isDark ? "text-[#8b949e]" : "text-slate-500"
              }`}
            >
              {connectionsCount} connection{connectionsCount > 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className={`${compact ? "w-full" : "shrink-0"}`} data-no-nav>
          <ConnectionButton targetUserId={userId} fullWidth={compact} />
        </div>
      </div>
    </div>
  );
}
