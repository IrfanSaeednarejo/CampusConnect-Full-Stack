import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchPublicProfile,
    clearViewedProfile,
    setActiveTab,
} from "../../redux/slices/profileSlice";
import { fetchNetworkState, fetchMutualConnections } from "../../redux/slices/networkSlice";
import { recordProfileView } from "../../api/profileApi";
import { useAuth } from "../../hooks/useAuth";
import ProfileHero       from "../../components/profile/ProfileHero";
import ProfileTabNav     from "../../components/profile/ProfileTabNav";
import ExperienceSection from "../../components/profile/ExperienceSection";
import ProjectsSection   from "../../components/profile/ProjectsSection";
import EventParticipationSection from "../../components/profile/EventParticipationSection";
import AchievementsDisplay       from "../../components/profile/AchievementsDisplay";
import MutualConnectionsPreview  from "../../components/network/MutualConnectionsPreview";
import ConnectionButton          from "../../components/network/ConnectionButton";
import { Loader2, Lock, GraduationCap, Link2, Sparkles, BookOpen, Star, ArrowLeft } from "lucide-react";

// ── Privacy-gated placeholder ─────────────────────────────────────────────────
function PrivateSection({ label }) {
    return (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 flex flex-col items-center justify-center gap-2 text-center">
            <Lock className="w-6 h-6 text-[#30363d]" />
            <p className="text-[#8b949e] text-sm font-medium">{label} is private</p>
            <p className="text-[#8b949e] text-xs opacity-60">Connect with this user to see more</p>
        </div>
    );
}

// ── About Tab ─────────────────────────────────────────────────────────────────
function AboutTab({ profile, privacy }) {
    const interests   = profile?.interests   || [];
    const socialLinks = profile?.socialLinks || [];
    const academic    = profile?.academic;

    return (
        <div className="space-y-4">
            {interests.length > 0 && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
                    <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-400" /> Skills & Interests
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {interests.map((interest) => (
                            <span key={interest}
                                className="px-3 py-1 bg-[#1f6feb]/10 text-[#58a6ff] border border-[#1f6feb]/20 rounded-full text-xs font-medium capitalize">
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {(academic?.degree || academic?.department) && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
                    <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-green-400" /> Education
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Degree",          value: academic?.degree           },
                            { label: "Department",      value: academic?.department       },
                            { label: "Enrollment Year", value: academic?.enrollmentYear   },
                            { label: "Graduating",      value: academic?.expectedGraduation },
                        ].filter((f) => f.value).map((f) => (
                            <div key={f.label}>
                                <p className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-0.5">{f.label}</p>
                                <p className="text-[#c9d1d9] text-sm font-medium">{f.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Social links — gated by privacy.showEmail (we use showEmail as proxy for contact visibility) */}
            {privacy?.showEmail !== false && socialLinks.length > 0 && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
                    <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-blue-400" /> Links
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {socialLinks.map((link) => (
                            <a key={link.provider} href={link.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] text-xs font-medium rounded-xl border border-[#30363d] hover:border-[#58a6ff]/30 transition-all capitalize">
                                <Link2 className="w-3 h-3" /> {link.provider}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Mutual connections */}
            <MutualConnectionsPreview targetUserId={profile?._id} />

            {/* Mentor card */}
            {profile?.mentorVerification?.isVerified && profile?.mentorProfile && (
                <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 border border-amber-500/25 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-amber-400" />
                        <h2 className="text-amber-300 font-bold text-base">Available for Mentoring</h2>
                    </div>
                    <p className="text-[#8b949e] text-xs mb-3">
                        {profile.profile?.displayName} is a verified mentor on CampusConnect.
                    </p>
                    <ConnectionButton targetUserId={profile._id} variant="mentor" />
                </div>
            )}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PublicUserProfile() {
    const { id }    = useParams();
    const navigate  = useNavigate();
    const dispatch  = useDispatch();
    const { user }  = useAuth();

    const { viewedProfile: profile, viewLoading, viewError, activeTab } = useSelector((s) => s.profile);

    // Track visit (fire-and-forget, skip own profile)
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
            // Reset tab on new profile
            dispatch(setActiveTab("about"));
        }
        return () => { dispatch(clearViewedProfile()); };
    }, [dispatch, id]);

    // ── Loading ───────────────────────────────────────────────────────────────
    if (viewLoading) {
        return (
            <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (viewError || !profile) {
        return (
            <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-4 text-center p-8">
                <div className="w-20 h-20 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center">
                    <span className="text-4xl">👤</span>
                </div>
                <h2 className="text-2xl font-bold text-white">User Not Found</h2>
                <p className="text-[#8b949e] max-w-sm text-sm">{viewError || "This profile may be private or no longer exists."}</p>
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-xl text-sm font-semibold transition-all">
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
            </div>
        );
    }

    const privacy = profile.preferences?.privacy || {};

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
            {/* Sticky back nav */}
            <div className="sticky top-0 z-30 bg-[#0d1117]/95 backdrop-blur-md border-b border-[#21262d] px-4 py-2.5 flex items-center gap-2">
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-[#8b949e] hover:text-white text-sm font-medium transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <span className="text-[#30363d]">/</span>
                <span className="text-[#8b949e] text-sm truncate">
                    {profile.profile?.displayName || "Profile"}
                </span>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
                {/* Hero */}
                <ProfileHero profile={profile} isOwner={false} />

                {/* Achievements */}
                {privacy.showAchievements !== false && <AchievementsDisplay profile={profile} />}

                {/* Tab Nav */}
                <ProfileTabNav profile={profile} />

                {/* Tab Content */}
                <div className="pb-10">
                    {activeTab === "about" && <AboutTab profile={profile} privacy={privacy} />}

                    {activeTab === "experience" && (
                        privacy.showExperience !== false
                            ? <ExperienceSection profile={profile} isOwner={false} />
                            : <PrivateSection label="Experience" />
                    )}
                    {activeTab === "projects" && (
                        privacy.showProjects !== false
                            ? <ProjectsSection profile={profile} isOwner={false} />
                            : <PrivateSection label="Projects" />
                    )}
                    {activeTab === "events" && (
                        privacy.showEventHistory !== false
                            ? <EventParticipationSection profile={profile} isOwner={false} />
                            : <PrivateSection label="Event history" />
                    )}
                    {activeTab === "activity" && (
                        privacy.showActivity !== false ? (
                            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 flex flex-col items-center gap-2 text-center">
                                <BookOpen className="w-8 h-8 opacity-30" />
                                <p className="text-[#8b949e] text-sm">Activity timeline coming soon</p>
                            </div>
                        ) : <PrivateSection label="Activity" />
                    )}
                </div>
            </div>
        </div>
    );
}
