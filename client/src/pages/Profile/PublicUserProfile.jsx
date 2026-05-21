import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPublicProfile,
  clearViewedProfile,
  setActiveTab,
} from "../../redux/slices/profileSlice";
import {
  fetchNetworkState,
  fetchMutualConnections,
} from "../../redux/slices/networkSlice";
import { recordProfileView } from "../../api/profileApi";
import { useAuth } from "../../hooks/useAuth";
import useHomeTheme from "../../hooks/useHomeTheme";
import ProfileHero from "../../components/profile/ProfileHero";
import ProfileTabNav from "../../components/profile/ProfileTabNav";
import ExperienceSection from "../../components/profile/ExperienceSection";
import ProjectsSection from "../../components/profile/ProjectsSection";
import EventParticipationSection from "../../components/profile/EventParticipationSection";
import AchievementsDisplay from "../../components/profile/AchievementsDisplay";
import MutualConnectionsPreview from "../../components/network/MutualConnectionsPreview";
import ConnectionButton from "../../components/network/ConnectionButton";
import {
  Loader2,
  Lock,
  GraduationCap,
  Link2,
  Sparkles,
  BookOpen,
  Star,
  ArrowLeft,
} from "lucide-react";

function PrivateSection({ label, isDark }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-8 text-center ${
        isDark
          ? "border-[#30363d] bg-[#161b22]"
          : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      <Lock className={`h-6 w-6 ${isDark ? "text-[#30363d]" : "text-slate-300"}`} />
      <p className={`text-sm font-medium ${isDark ? "text-[#8b949e]" : "text-slate-600"}`}>
        {label} is private
      </p>
      <p className={`text-xs ${isDark ? "text-[#8b949e]/60" : "text-slate-400"}`}>
        Connect with this user to see more
      </p>
    </div>
  );
}

function AboutTab({ profile, privacy, isDark }) {
  const interests = profile?.interests || [];
  const socialLinks = profile?.socialLinks || [];
  const academic = profile?.academic;

  const surfaceClass = isDark
    ? "border-[#30363d] bg-[#161b22]"
    : "border-slate-200 bg-white shadow-sm";
  const titleClass = isDark ? "text-white" : "text-slate-900";
  const bodyClass = isDark ? "text-[#c9d1d9]" : "text-slate-700";
  const mutedClass = isDark ? "text-[#8b949e]" : "text-slate-500";

  return (
    <div className="space-y-4">
      {interests.length > 0 && (
        <div className={`rounded-2xl border p-6 ${surfaceClass}`}>
          <h2 className={`mb-3 flex items-center gap-2 text-base font-bold ${titleClass}`}>
            <Sparkles className="h-4 w-4 text-info" /> Skills & Interests
          </h2>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                  isDark
                    ? "border-info/20 bg-info/10 text-info"
                    : "border-info/20 bg-info/10 text-info"
                }`}
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {(academic?.degree || academic?.department) && (
        <div className={`rounded-2xl border p-6 ${surfaceClass}`}>
          <h2 className={`mb-4 flex items-center gap-2 text-base font-bold ${titleClass}`}>
            <GraduationCap className="h-4 w-4 text-green-400" /> Education
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: "Degree", value: academic?.degree },
              { label: "Department", value: academic?.department },
              { label: "Enrollment Year", value: academic?.enrollmentYear },
              { label: "Graduating", value: academic?.expectedGraduation },
            ]
              .filter((field) => field.value)
              .map((field) => (
                <div key={field.label}>
                  <p className={`mb-0.5 text-[10px] uppercase tracking-wider ${mutedClass}`}>
                    {field.label}
                  </p>
                  <p className={`text-sm font-medium ${bodyClass}`}>{field.value}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {privacy?.showEmail !== false && socialLinks.length > 0 && (
        <div className={`rounded-2xl border p-6 ${surfaceClass}`}>
          <h2 className={`mb-3 flex items-center gap-2 text-base font-bold ${titleClass}`}>
            <Link2 className="h-4 w-4 text-info" /> Links
          </h2>
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((link) => (
              <a
                key={link.provider}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                  isDark
                    ? "border-border-dark bg-background-dark text-info hover:border-info/40 hover:bg-surface-dark"
                    : "border-border-light bg-[rgb(var(--color-surface-muted-light)/1)] text-info hover:border-info/30 hover:bg-surface-light"
                }`}
              >
                <Link2 className="h-3 w-3" /> {link.provider}
              </a>
            ))}
          </div>
        </div>
      )}

      <MutualConnectionsPreview targetUserId={profile?._id} />

      {profile?.mentorVerification?.isVerified && profile?.mentorProfile && (
        <div
            className={`rounded-2xl border p-6 ${
            isDark
              ? "border-info/20 bg-info/10"
              : "border-info/20 bg-info/10"
          }`}
        >
          <div className="mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-info" />
            <h2 className="text-base font-bold text-info">
              Available for Mentoring
            </h2>
          </div>
          <p className={`mb-3 text-xs ${mutedClass}`}>
            {profile.profile?.displayName} is a verified mentor on CampusNexus.
          </p>
          <ConnectionButton targetUserId={profile._id} variant="mentor" />
        </div>
      )}
    </div>
  );
}

export default function PublicUserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const isDark = useHomeTheme();

  const {
    viewedProfile: profile,
    viewLoading,
    viewError,
    activeTab,
  } = useSelector((state) => state.profile);

  useEffect(() => {
    if (id && user && id !== user._id) {
      recordProfileView(id).catch(() => {});
    }
  }, [id, user]);

  useEffect(() => {
    if (id) {
      dispatch(fetchPublicProfile(id));
      dispatch(fetchNetworkState());
      dispatch(fetchMutualConnections(id));
      dispatch(setActiveTab("about"));
    }
    return () => {
      dispatch(clearViewedProfile());
    };
  }, [dispatch, id]);

  if (viewLoading) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${
          isDark ? "bg-[#0d1117]" : "bg-slate-50"
        }`}
      >
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (viewError || !profile) {
    return (
      <div
        className={`flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center ${
          isDark ? "bg-[#0d1117]" : "bg-slate-50"
        }`}
      >
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full border ${
            isDark
              ? "border-[#30363d] bg-[#161b22]"
              : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <span className="text-4xl">👤</span>
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          User Not Found
        </h2>
        <p className={`max-w-sm text-sm ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
          {viewError || "This profile may be private or no longer exists."}
        </p>
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            isDark
              ? "bg-[#21262d] text-white hover:bg-[#30363d]"
              : "border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50"
          }`}
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>
    );
  }

  const privacy = profile.preferences?.privacy || {};

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0d1117] text-[#c9d1d9]" : "bg-slate-50 text-slate-900"}`}>
      <div
        className={`sticky top-0 z-30 flex items-center gap-2 border-b px-4 py-2.5 backdrop-blur-md ${
          isDark
            ? "border-[#21262d] bg-[#0d1117]/95"
            : "border-slate-200 bg-white/95"
        }`}
      >
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
            isDark ? "text-[#8b949e] hover:text-white" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <span className={isDark ? "text-[#30363d]" : "text-slate-300"}>/</span>
        <span className={`truncate text-sm ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
          {profile.profile?.displayName || "Profile"}
        </span>
      </div>

      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
        <ProfileHero profile={profile} isOwner={false} />

        {privacy.showAchievements !== false && <AchievementsDisplay profile={profile} />}

        <ProfileTabNav profile={profile} />

        <div className="pb-10">
          {activeTab === "about" && (
            <AboutTab profile={profile} privacy={privacy} isDark={isDark} />
          )}

          {activeTab === "experience" &&
            (privacy.showExperience !== false ? (
              <ExperienceSection profile={profile} isOwner={false} />
            ) : (
              <PrivateSection label="Experience" isDark={isDark} />
            ))}

          {activeTab === "projects" &&
            (privacy.showProjects !== false ? (
              <ProjectsSection profile={profile} isOwner={false} />
            ) : (
              <PrivateSection label="Projects" isDark={isDark} />
            ))}

          {activeTab === "events" &&
            (privacy.showEventHistory !== false ? (
              <EventParticipationSection profile={profile} isOwner={false} />
            ) : (
              <PrivateSection label="Event history" isDark={isDark} />
            ))}

          {activeTab === "activity" &&
            (privacy.showActivity !== false ? (
              <div
                className={`flex flex-col items-center gap-2 rounded-2xl border p-8 text-center ${
                  isDark
                    ? "border-[#30363d] bg-[#161b22]"
                    : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                <BookOpen className={`h-8 w-8 ${isDark ? "opacity-30" : "text-slate-300"}`} />
                <p className={`text-sm ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                  Activity timeline coming soon
                </p>
              </div>
            ) : (
              <PrivateSection label="Activity" isDark={isDark} />
            ))}
        </div>
      </div>
    </div>
  );
}
