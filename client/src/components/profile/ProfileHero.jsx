import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Camera, MapPin, Edit2, Sparkles, BadgeCheck, Star, MessageCircle } from "lucide-react";
import ConnectionButton from "../network/ConnectionButton";

const ROLE_CONFIG = {
    student:       { label: "Student",        color: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
    mentor:        { label: "Mentor",         color: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
    society_head:  { label: "Society Head",   color: "bg-violet-500/15 text-violet-400 border-violet-500/25" },
    campus_admin:  { label: "Campus Admin",   color: "bg-green-500/15 text-green-400 border-green-500/25" },
};

/** Animated donut ring for completeness percentage */
function CompletenessRing({ score = 0 }) {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const progress = circumference - (score / 100) * circumference;
    const color = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

    return (
        <div className="relative w-14 h-14 group cursor-pointer" title={`Profile ${score}% complete`}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r={radius} fill="none" stroke="#1e293b" strokeWidth="4" />
                <circle cx="28" cy="28" r={radius} fill="none" stroke={color} strokeWidth="4"
                    strokeDasharray={circumference} strokeDashoffset={progress}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-white leading-none">{score}%</span>
            </div>
        </div>
    );
}

/**
 * ProfileHero — top-of-page identity block.
 * Props:
 *   profile     {object}  — full user profile object
 *   isOwner     {boolean} — show edit controls
 *   onEditCover {fn}      — called when cover image change is triggered
 *   onEditAvatar{fn}      — called when avatar change is triggered
 */
export default function ProfileHero({ profile, isOwner = false, onEditCover, onEditAvatar }) {
    const navigate  = useNavigate();
    const coverRef  = useRef(null);
    const avatarRef = useRef(null);

    const fullName  = profile?.profile?.displayName
        || `${profile?.profile?.firstName || ""} ${profile?.profile?.lastName || ""}`.trim()
        || "Unknown User";
    const initials  = fullName.charAt(0).toUpperCase();
    const avatar    = profile?.profile?.avatar;
    const cover     = profile?.profile?.coverImage;
    const headline  = profile?.profile?.headline;
    const location  = profile?.profile?.location;
    const bio       = profile?.profile?.bio;
    const roles     = profile?.roles || [];
    const isVerified= profile?.emailVerified;
    const completeness = profile?.profileCompleteness ?? 0;
    const isMentor  = profile?.mentorVerification?.isVerified && profile?.roles?.includes("mentor");

    return (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-xl">
            {/* ── Cover Image ──────────────────────────────────────────────── */}
            <div className="relative h-44 md:h-56 overflow-hidden group">
                {cover ? (
                    <img src={cover} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0d2449] via-[#1a3a6e] to-[#0f172a]" />
                )}
                {/* Subtle overlay gradient for avatar readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#161b22]/80 via-transparent to-transparent" />

                {isOwner && (
                    <>
                        <input ref={coverRef} type="file" accept="image/*" className="hidden"
                            onChange={(e) => onEditCover?.(e.target.files?.[0])} />
                        <button
                            onClick={() => coverRef.current?.click()}
                            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 hover:bg-black/70 text-white text-xs font-semibold rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Camera className="w-3.5 h-3.5" /> Change Cover
                        </button>
                    </>
                )}
            </div>

            <div className="px-5 md:px-8 pb-6">
                {/* ── Avatar row ──────────────────────────────────────────── */}
                <div className="flex items-end justify-between -mt-12 mb-4">
                    {/* Avatar */}
                    <div className="relative group/av">
                        {avatar ? (
                            <img src={avatar} alt={fullName}
                                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-[#161b22] shadow-2xl"
                            />
                        ) : (
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-green-600 to-blue-700 flex items-center justify-center text-white text-4xl font-bold border-4 border-[#161b22] shadow-2xl">
                                {initials}
                            </div>
                        )}
                        {isOwner && (
                            <>
                                <input ref={avatarRef} type="file" accept="image/*" className="hidden"
                                    onChange={(e) => onEditAvatar?.(e.target.files?.[0])} />
                                <button
                                    onClick={() => avatarRef.current?.click()}
                                    className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover/av:opacity-100 transition-opacity"
                                >
                                    <Camera className="w-6 h-6 text-white" />
                                </button>
                            </>
                        )}
                        {/* Online / verified dot */}
                        {isVerified && (
                            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-[#161b22] flex items-center justify-center">
                                <BadgeCheck className="w-3.5 h-3.5 text-white" />
                            </span>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-14">
                        {isOwner ? (
                            <>
                                {completeness < 100 && <CompletenessRing score={completeness} />}
                                <button
                                    onClick={() => navigate("/profile/manage")}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-green-500/20"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit Profile
                                </button>
                            </>
                        ) : (
                            <ConnectionButton targetUserId={profile?._id} />
                        )}
                    </div>
                </div>

                {/* ── Identity ─────────────────────────────────────────────── */}
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-white">{fullName}</h1>
                        {isVerified && (
                            <BadgeCheck className="w-5 h-5 text-blue-400 flex-shrink-0" title="Verified email" />
                        )}
                        {isMentor && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/25 rounded-full text-xs font-bold">
                                <Star className="w-3 h-3" /> Mentor
                            </span>
                        )}
                    </div>

                    {/* Headline */}
                    {headline ? (
                        <p className="text-[#8b949e] text-sm md:text-base">{headline}</p>
                    ) : isOwner ? (
                        <button onClick={() => navigate("/profile/manage")}
                            className="flex items-center gap-1 text-[#8b949e] text-sm hover:text-[#58a6ff] transition-colors">
                            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                            Add a headline — who are you?
                        </button>
                    ) : null}

                    {/* Role badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        {roles.map((r) => (
                            <span key={r}
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${ROLE_CONFIG[r]?.color || "bg-slate-700 text-slate-300 border-slate-600"}`}>
                                {ROLE_CONFIG[r]?.label || r.replace(/_/g, " ")}
                            </span>
                        ))}
                        {profile?.academic?.department && (
                            <span className="text-[#8b949e] text-xs">· {profile.academic.department}</span>
                        )}
                        {profile?.campusId?.name && (
                            <span className="text-[#8b949e] text-xs">· {profile.campusId.name}</span>
                        )}
                    </div>

                    {/* Location */}
                    {location && (
                        <div className="flex items-center gap-1 text-[#8b949e] text-xs">
                            <MapPin className="w-3 h-3" /> {location}
                        </div>
                    )}

                    {/* Bio */}
                    {bio && (
                        <p className="text-[#c9d1d9] text-sm leading-relaxed max-w-2xl pt-1">{bio}</p>
                    )}
                </div>

                {/* ── Stats row ────────────────────────────────────────────── */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[#30363d]">
                    {[
                        { label: "Connections", value: profile?.connectionCount },
                        { label: "Profile Views", value: profile?.profileViews },
                        { label: "Projects",     value: profile?.projects?.length },
                        { label: "Experience",   value: profile?.experience?.length },
                    ].filter((s) => s.value > 0).map((s) => (
                        <div key={s.label} className="text-center">
                            <p className="text-white font-bold text-lg leading-none">{s.value}</p>
                            <p className="text-[#8b949e] text-[10px] uppercase tracking-wider mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Become a Mentor CTA (own profile, not yet mentor) ─────── */}
                {isOwner && !isMentor && (
                    <button
                        onClick={() => navigate("/mentors/become")}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 hover:border-amber-500/50 text-amber-400 text-sm font-semibold rounded-xl transition-all"
                    >
                        <Star className="w-4 h-4" />
                        Become a Mentor — share your knowledge with campus
                    </button>
                )}
            </div>
        </div>
    );
}
