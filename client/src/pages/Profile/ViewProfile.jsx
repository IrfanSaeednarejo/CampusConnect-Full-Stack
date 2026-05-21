import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyProfile } from "../../redux/slices/profileSlice";
import { updateAvatarThunk, updateCoverThunk } from "../../redux/slices/authSlice";
import {
    fetchGamificationBadges,
    fetchGamificationCertificates,
    fetchGamificationSummary,
    selectGamificationBadges,
    selectGamificationCertificates,
    selectGamificationSummary,
} from "../../redux/slices/gamificationSlice";
import { useAuth } from "../../hooks/useAuth";
import ProfileHero       from "../../components/profile/ProfileHero";
import ProfileTabNav     from "../../components/profile/ProfileTabNav";
import ExperienceSection from "../../components/profile/ExperienceSection";
import ProjectsSection   from "../../components/profile/ProjectsSection";
import EventParticipationSection from "../../components/profile/EventParticipationSection";
import AchievementsDisplay       from "../../components/profile/AchievementsDisplay";
import ProfileCompletenessWidget from "../../components/profile/ProfileCompletenessWidget";
import { Loader2, BookOpen, Link2, GraduationCap, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import useHomeTheme from "../../hooks/useHomeTheme";
import BadgeGrid from "../../components/gamification/BadgeGrid";
import CertificateCard from "../../components/gamification/CertificateCard";
import PointsCard from "../../components/gamification/PointsCard";

// ── About Tab ─────────────────────────────────────────────────────────────────
function AboutTab({ profile, isDark }) {
    const interests   = profile?.interests || [];
    const socialLinks = profile?.socialLinks || [];
    const academic    = profile?.academic;

    return (
        <div className="space-y-4">
            {/* Interests */}
            {interests.length > 0 && (
                <div className={`rounded-2xl border p-6 ${isDark ? "bg-[#161b22] border-[#30363d]" : "bg-white border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"}`}>
                    <h2 className={`mb-3 flex items-center gap-2 text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        <Sparkles className="w-4 h-4 text-info" /> Skills & Interests
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {interests.map((interest) => (
                            <span key={interest}
                                className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${isDark ? "bg-[#1f6feb]/10 text-[#58a6ff] border-[#1f6feb]/20" : "bg-sky-50 text-sky-700 border-sky-200"}`}>
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Academic */}
            {(academic?.degree || academic?.department) && (
                <div className={`rounded-2xl border p-6 ${isDark ? "bg-[#161b22] border-[#30363d]" : "bg-white border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"}`}>
                    <h2 className={`mb-4 flex items-center gap-2 text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        <GraduationCap className="w-4 h-4 text-green-400" /> Education
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Degree",            value: academic?.degree           },
                            { label: "Department",        value: academic?.department       },
                            { label: "Semester",          value: academic?.semester && `Semester ${academic.semester}` },
                            { label: "Enrollment Year",   value: academic?.enrollmentYear   },
                            { label: "Graduating",        value: academic?.expectedGraduation },
                            { label: "GPA",               value: academic?.cgpa && `${academic.cgpa} / ${academic.gpaScale || 4}` },
                        ].filter((f) => f.value).map((f) => (
                            <div key={f.label}>
                                <p className={`mb-0.5 text-[10px] uppercase tracking-wider ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>{f.label}</p>
                                <p className={`text-sm font-medium ${isDark ? "text-[#c9d1d9]" : "text-slate-700"}`}>{f.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
                <div className={`rounded-2xl border p-6 ${isDark ? "bg-[#161b22] border-[#30363d]" : "bg-white border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"}`}>
                    <h2 className={`mb-3 flex items-center gap-2 text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        <Link2 className="w-4 h-4 text-blue-400" /> Links
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {socialLinks.map((link) => (
                            <a key={link.provider} href={link.url} target="_blank" rel="noopener noreferrer"
                                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium capitalize transition-all ${isDark ? "bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] hover:text-[#79c0ff] border-[#30363d] hover:border-[#58a6ff]/30" : "bg-slate-50 hover:bg-slate-100 text-sky-700 border-slate-200 hover:border-sky-200"}`}>
                                <Link2 className="w-3 h-3" /> {link.provider}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ViewProfile() {
    const dispatch  = useDispatch();
    const navigate  = useNavigate();
    const { user }  = useAuth();
    const isDark = useHomeTheme();

    const { myProfile, myLoading, activeTab } = useSelector((s) => s.profile);
    const gamificationSummary = useSelector(selectGamificationSummary);
    const gamificationBadges = useSelector(selectGamificationBadges);
    const gamificationCertificates = useSelector(selectGamificationCertificates);

    useEffect(() => {
        dispatch(fetchMyProfile());
        dispatch(fetchGamificationSummary());
        dispatch(fetchGamificationBadges());
        dispatch(fetchGamificationCertificates());
    }, [dispatch]);

    // Use the full profile from profileSlice (includes new sections + completeness)
    // Fall back to auth user if profileSlice hasn't loaded yet
    const profile = myProfile || user;

    const handleAvatarChange = async (file) => {
        if (!file) return;
        try {
            await dispatch(updateAvatarThunk(file)).unwrap();
            toast.success("Profile photo updated!");
            dispatch(fetchMyProfile());
        } catch { toast.error("Failed to update photo"); }
    };

    const handleCoverChange = async (file) => {
        if (!file) return;
        try {
            await dispatch(updateCoverThunk(file)).unwrap();
            toast.success("Cover image updated!");
            dispatch(fetchMyProfile());
        } catch { toast.error("Failed to update cover"); }
    };

    if (myLoading && !myProfile) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-background-dark" : "bg-background-light"}`}>
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-background-dark text-text-primary-dark" : "bg-background-light text-text-primary-light"}`}>
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
                {/* Hero */}
                <ProfileHero
                    profile={profile}
                    isOwner={true}
                    onEditAvatar={handleAvatarChange}
                    onEditCover={handleCoverChange}
                />

                {/* Completeness Widget */}
                <ProfileCompletenessWidget profile={profile} />

                {/* Achievements (shown above tabs) */}
                <AchievementsDisplay profile={profile} />

                <div className="grid gap-4 lg:grid-cols-3">
                    <PointsCard summary={gamificationSummary} />
                    <div className="lg:col-span-2">
                        <BadgeGrid badges={gamificationBadges} compact title="Public Badges" />
                    </div>
                </div>

                {/* Tab Nav */}
                <ProfileTabNav profile={profile} />

                {/* Tab Content */}
                <div className="pb-10">
                    {activeTab === "about"      && <AboutTab profile={profile} isDark={isDark} />}
                    {activeTab === "about" && gamificationCertificates.length > 0 && (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            {gamificationCertificates.slice(0, 4).map((certificate) => (
                                <CertificateCard key={certificate._id} certificate={certificate} />
                            ))}
                        </div>
                    )}
                    {activeTab === "experience" && <ExperienceSection profile={profile} isOwner={true} />}
                    {activeTab === "projects"   && <ProjectsSection   profile={profile} isOwner={true} />}
                    {activeTab === "events"     && <EventParticipationSection profile={profile} isOwner={true} />}
                    {activeTab === "activity"   && (
                        <div className={`rounded-2xl border p-6 py-12 text-center text-sm ${isDark ? "bg-surface-dark border-border-dark text-text-secondary-dark" : "bg-surface-light border-border-light text-text-secondary-light shadow-[0_18px_50px_rgba(15,23,42,0.08)]"}`}>
                            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            Activity timeline coming soon
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
