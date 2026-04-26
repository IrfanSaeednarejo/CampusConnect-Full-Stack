import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyProfile } from "../../redux/slices/profileSlice";
import { updateAvatarThunk, updateCoverThunk } from "../../redux/slices/authSlice";
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

// ── About Tab ─────────────────────────────────────────────────────────────────
function AboutTab({ profile }) {
    const interests   = profile?.interests || [];
    const socialLinks = profile?.socialLinks || [];
    const academic    = profile?.academic;

    return (
        <div className="space-y-4">
            {/* Interests */}
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

            {/* Academic */}
            {(academic?.degree || academic?.department) && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
                    <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
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
                                <p className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-0.5">{f.label}</p>
                                <p className="text-[#c9d1d9] text-sm font-medium">{f.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
                    <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-blue-400" /> Links
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {socialLinks.map((link) => (
                            <a key={link.provider} href={link.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] hover:text-[#79c0ff] text-xs font-medium rounded-xl border border-[#30363d] hover:border-[#58a6ff]/30 transition-all capitalize">
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

    const { myProfile, myLoading, activeTab } = useSelector((s) => s.profile);

    useEffect(() => {
        dispatch(fetchMyProfile());
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
            <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
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

                {/* Tab Nav */}
                <ProfileTabNav profile={profile} />

                {/* Tab Content */}
                <div className="pb-10">
                    {activeTab === "about"      && <AboutTab profile={profile} />}
                    {activeTab === "experience" && <ExperienceSection profile={profile} isOwner={true} />}
                    {activeTab === "projects"   && <ProjectsSection   profile={profile} isOwner={true} />}
                    {activeTab === "events"     && <EventParticipationSection profile={profile} isOwner={true} />}
                    {activeTab === "activity"   && (
                        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 text-center text-[#8b949e] text-sm py-12">
                            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            Activity timeline coming soon
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
