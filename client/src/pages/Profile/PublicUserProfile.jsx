import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserProfile,
  selectViewedProfile,
  selectUserViewLoading,
  selectUserViewError,
  clearViewedProfile,
} from '../../redux/slices/userSlice';
import { fetchNetworkState, fetchMutualConnections } from '../../redux/slices/networkSlice';
import ConnectionButton from '../../components/network/ConnectionButton';
import MutualConnectionsPreview from '../../components/network/MutualConnectionsPreview';

function StatPill({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col items-center px-4 py-2 bg-[#0d1117] rounded-lg border border-[#30363d] min-w-[80px]">
      <span className="text-[#e6edf3] font-bold text-lg">{value}</span>
      <span className="text-[#8b949e] text-[10px] uppercase tracking-wider">{label}</span>
    </div>
  );
}

function SkillTag({ label, highlight }) {
  return (
    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
      highlight
        ? 'bg-[#238636]/15 text-[#3fb950] border-[#238636]/30'
        : 'bg-[#1f6feb]/10 text-[#58a6ff] border-[#1f6feb]/20'
    }`}>
      {label}
    </span>
  );
}

export default function PublicUserProfile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profile = useSelector(selectViewedProfile);
  const loading = useSelector(selectUserViewLoading);
  const error = useSelector(selectUserViewError);
  const { connected } = useSelector((s) => s.network);
  const mutualData = useSelector((s) => s.network.mutualMap[id]);

  const isConnected = connected.some((c) => c.user._id === id);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserProfile(id));
      dispatch(fetchNetworkState());
      dispatch(fetchMutualConnections(id));
    }
    return () => { dispatch(clearViewedProfile()); };
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#1f6feb] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8b949e] text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-4 text-center p-8">
        <span className="material-symbols-outlined text-5xl text-[#8b949e]">person_off</span>
        <h2 className="text-xl font-bold text-[#e6edf3]">User Not Found</h2>
        <p className="text-[#8b949e] max-w-sm">{error || 'This profile may be private or no longer exists.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] rounded-lg text-sm font-medium transition-colors"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  const firstName = profile.profile?.firstName || '';
  const lastName = profile.profile?.lastName || '';
  const fullName = profile.profile?.displayName
    ? profile.profile.displayName
    : firstName
    ? `${firstName} ${lastName}`.trim()
    : 'Unknown User';
  const initials = fullName.charAt(0).toUpperCase();
  const avatarSrc = profile.profile?.avatar;
  const bio = profile.profile?.bio;
  const interests = profile.interests || [];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Sticky back nav */}
      <div className="sticky top-0 z-10 bg-[#0d1117]/90 backdrop-blur-sm border-b border-[#21262d] px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#8b949e] hover:text-[#e6edf3] transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back
        </button>
        <span className="text-[#30363d]">/</span>
        <span className="text-[#8b949e] text-sm truncate">{fullName}</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* ── Profile Hero Card ──────────────────────────────── */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
          {/* Cover gradient */}
          <div className="h-28 bg-gradient-to-br from-[#0d2449] via-[#1f3d6f] to-[#1a1f2e]" />

          <div className="px-6 pb-6">
            {/* Avatar — overlaps cover */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="relative">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={fullName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-[#161b22] shadow-xl"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1f6feb] to-[#8957e5] flex items-center justify-center text-3xl font-bold border-4 border-[#161b22] shadow-xl">
                    {initials}
                  </div>
                )}
                {isConnected && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#3fb950] rounded-full border-2 border-[#161b22] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[12px] text-white">check</span>
                  </span>
                )}
              </div>

              {/* Action button */}
              <div className="flex gap-2" data-no-nav>
                <ConnectionButton targetUserId={id} />
              </div>
            </div>

            {/* Identity */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-[#e6edf3]">{fullName}</h1>
              {profile.profile?.displayName && (
                <p className="text-[#58a6ff] text-sm mt-0.5">@{profile.profile.displayName}</p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {profile.roles?.map((r) => (
                  <span key={r} className="px-2 py-0.5 bg-[#1f6feb]/15 text-[#58a6ff] rounded-full text-xs font-medium capitalize border border-[#1f6feb]/20">
                    {r.replace(/_/g, ' ')}
                  </span>
                ))}
                {profile.academic?.department && (
                  <span className="flex items-center gap-1 text-[#8b949e] text-xs">
                    <span className="material-symbols-outlined text-[13px]">school</span>
                    {profile.academic.department}
                  </span>
                )}
              </div>
            </div>

            {/* Bio */}
            {bio && (
              <p className="text-[#c9d1d9] text-sm leading-relaxed mb-4">{bio}</p>
            )}

            {/* Mutual connections */}
            <MutualConnectionsPreview targetUserId={id} initialMutualCount={mutualData?.mutualCount || 0} />

            {/* Stats row */}
            {(profile.connectionCount !== undefined || profile.academic?.enrollmentYear) && (
              <div className="flex flex-wrap gap-3 mt-4">
                {profile.connectionCount !== undefined && (
                  <StatPill label="Connections" value={profile.connectionCount} />
                )}
                {profile.academic?.enrollmentYear && (
                  <StatPill label="Enrolled" value={profile.academic.enrollmentYear} />
                )}
                {profile.academic?.expectedGraduation && (
                  <StatPill label="Graduates" value={profile.academic.expectedGraduation} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Skills / Interests ────────────────────────────── */}
        {interests.length > 0 && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wider mb-3">Skills & Interests</h2>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, idx) => (
                <SkillTag key={idx} label={interest} />
              ))}
            </div>
          </div>
        )}

        {/* ── Academics ─────────────────────────────────────── */}
        {profile.academic?.degree && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wider mb-4">Education</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Degree', value: profile.academic.degree },
                { label: 'Department', value: profile.academic.department },
                { label: 'Enrollment Year', value: profile.academic.enrollmentYear },
                { label: 'Expected Graduation', value: profile.academic.expectedGraduation },
              ].filter((f) => f.value).map((f) => (
                <div key={f.label}>
                  <p className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-0.5">{f.label}</p>
                  <p className="text-[#c9d1d9] text-sm font-medium">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Social Links ──────────────────────────────────── */}
        {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wider mb-3">Links</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(profile.socialLinks).filter(([, v]) => v).map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] text-xs rounded-lg border border-[#30363d] transition-colors capitalize"
                >
                  <span className="material-symbols-outlined text-[14px]">link</span>
                  {key}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Connection-gated message CTA ─────────────────── */}
        {isConnected && (
          <div className="bg-gradient-to-br from-[#1f3d6f]/40 to-[#2d1b69]/30 border border-[#1f6feb]/30 rounded-xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[#e6edf3] font-semibold">You're connected with {fullName}</p>
              <p className="text-[#8b949e] text-sm mt-0.5">Start a private conversation</p>
            </div>
            <ConnectionButton targetUserId={id} />
          </div>
        )}
      </div>
    </div>
  );
}
