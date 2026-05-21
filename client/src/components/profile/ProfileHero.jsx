import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, MapPin, Edit2, Sparkles, BadgeCheck, Star } from "lucide-react";
import ConnectionButton from "../network/ConnectionButton";
import ConnectionsModal from "../network/ConnectionsModal";
import { getButtonClassName } from "../common/Button";
import useHomeTheme from "../../hooks/useHomeTheme";

const ROLE_CONFIG = {
    student: { label: "Student", color: "bg-info/10 text-info border-info/25" },
    mentor: { label: "Mentor", color: "bg-warning/10 text-warning border-warning/25" },
    society_head: { label: "Society Head", color: "bg-info/10 text-info border-info/25" },
    campus_admin: { label: "Campus Admin", color: "bg-primary/10 text-primary border-primary/25" },
};

function CompletenessRing({ score = 0 }) {
    const isDark = useHomeTheme();
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const progress = circumference - (score / 100) * circumference;
    const color = score >= 80 ? "rgb(var(--color-success))" : score >= 50 ? "rgb(var(--color-warning))" : "rgb(var(--color-danger))";

    return (
        <div className="relative h-14 w-14 cursor-pointer" title={`Profile ${score}% complete`}>
            <svg className="h-full w-full -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r={radius} fill="none" stroke={isDark ? "rgb(var(--color-border-dark))" : "rgb(var(--color-border-light))"} strokeWidth="4" />
                <circle
                    cx="28"
                    cy="28"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={progress}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs font-bold leading-none ${isDark ? "text-white" : "text-slate-900"}`}>{score}%</span>
            </div>
        </div>
    );
}

export default function ProfileHero({ profile, isOwner = false, onEditCover, onEditAvatar }) {
    const navigate = useNavigate();
    const isDark = useHomeTheme();
    const coverRef = useRef(null);
    const avatarRef = useRef(null);
    const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);

    const fullName =
        profile?.profile?.displayName ||
        `${profile?.profile?.firstName || ""} ${profile?.profile?.lastName || ""}`.trim() ||
        "Unknown User";
    const initials = fullName.charAt(0).toUpperCase();
    const avatar = profile?.profile?.avatar;
    const cover = profile?.profile?.coverImage;
    const headline = profile?.profile?.headline;
    const location = profile?.profile?.location;
    const bio = profile?.profile?.bio;
    const roles = profile?.roles || [];
    const isVerified = profile?.emailVerified;
    const completeness = profile?.profileCompleteness ?? 0;
    const isMentor = profile?.mentorVerification?.isVerified && profile?.roles?.includes("mentor");

    return (
        <div
            className={`overflow-hidden rounded-2xl transition-colors ${
                isDark
                    ? "border border-border-dark bg-surface-dark shadow-lg"
                    : "border border-border-light bg-surface-light shadow-md"
            }`}
        >
            <div className="group relative h-44 overflow-hidden md:h-56">
                {cover ? (
                    <img src={cover} alt="Cover" className="h-full w-full object-cover" />
                ) : (
                    <div className={`h-full w-full ${isDark ? "bg-container-dark" : "bg-slate-100"}`} />
                )}
                <div className={`absolute inset-0 ${isDark ? "bg-black/25" : "bg-white/10"}`} />

                {isOwner && (
                    <>
                        <input
                            ref={coverRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => onEditCover?.(e.target.files?.[0])}
                        />
                        <button
                            onClick={() => coverRef.current?.click()}
                            className={getButtonClassName({
                                variant: "ghost",
                                size: "sm",
                                isDark,
                                className: "absolute right-3 top-3 border-white/20 bg-black/55 px-3 text-white opacity-0 backdrop-blur-sm group-hover:opacity-100 hover:border-white/30 hover:bg-black/70 hover:text-white",
                            })}
                        >
                            <Camera className="h-3.5 w-3.5" />
                            Change Cover
                        </button>
                    </>
                )}
            </div>

            <div className="px-5 pb-6 md:px-8">
                <div className="-mt-12 mb-4 flex items-end justify-between">
                    <div className="group/av relative">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={fullName}
                                className={`h-24 w-24 rounded-2xl border-4 object-cover shadow-lg md:h-28 md:w-28 ${isDark ? "border-surface-dark" : "border-white"}`}
                            />
                        ) : (
                            <div
                                className={`flex h-24 w-24 items-center justify-center rounded-2xl border-4 text-4xl font-bold text-white shadow-lg md:h-28 md:w-28 ${
                                    isDark ? "border-surface-dark bg-primary" : "border-white bg-primary"
                                }`}
                            >
                                {initials}
                            </div>
                        )}

                        {isOwner && (
                            <>
                                <input
                                    ref={avatarRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => onEditAvatar?.(e.target.files?.[0])}
                                />
                                <button
                                    onClick={() => avatarRef.current?.click()}
                                    className={getButtonClassName({
                                        variant: "ghost",
                                        size: "icon-lg",
                                        isDark,
                                        className: "absolute inset-0 h-full w-full rounded-2xl border-transparent bg-black/50 text-white opacity-0 group-hover/av:opacity-100 hover:bg-black/60 hover:text-white",
                                    })}
                                >
                                    <Camera className="h-6 w-6 text-white" />
                                </button>
                            </>
                        )}

                        {isVerified && (
                            <span
                                className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-success ${isDark ? "border-surface-dark" : "border-white"}`}
                            >
                                <BadgeCheck className="h-3.5 w-3.5 text-white" />
                            </span>
                        )}
                    </div>

                    <div className="mt-14 flex items-center gap-2">
                        {isOwner ? (
                            <>
                                {completeness < 100 && <CompletenessRing score={completeness} />}
                                <button
                                    onClick={() => navigate("/profile/manage")}
                                    className={getButtonClassName({ variant: "primary", size: "md", isDark })}
                                >
                                    <Edit2 className="h-4 w-4" />
                                    Edit Profile
                                </button>
                            </>
                        ) : (
                            <ConnectionButton targetUserId={profile?._id} />
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className={`text-2xl font-bold md:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>{fullName}</h1>
                        {isVerified && <BadgeCheck className="h-5 w-5 flex-shrink-0 text-info" title="Verified email" />}
                        {isMentor && (
                            <span className="flex items-center gap-1 rounded-full border border-warning/25 bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
                                <Star className="h-3 w-3" />
                                Mentor
                            </span>
                        )}
                    </div>

                    {headline ? (
                        <p className={`text-sm md:text-base ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>{headline}</p>
                    ) : isOwner ? (
                        <button
                            onClick={() => navigate("/profile/manage")}
                            className={getButtonClassName({ variant: "ghost", size: "sm", isDark, className: "min-w-0 px-2 text-primary hover:text-primary" })}
                        >
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            Add a headline - who are you?
                        </button>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        {roles.map((role) => (
                            <span
                                key={role}
                                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                                    ROLE_CONFIG[role]?.color || "border-slate-600 bg-slate-700 text-slate-300"
                                }`}
                            >
                                {ROLE_CONFIG[role]?.label || role.replace(/_/g, " ")}
                            </span>
                        ))}
                        {profile?.academic?.department && (
                            <span className={`text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>· {profile.academic.department}</span>
                        )}
                        {profile?.campusId?.name && (
                            <span className={`text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>· {profile.campusId.name}</span>
                        )}
                    </div>

                    {location && (
                        <div className={`flex items-center gap-1 text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                            <MapPin className="h-3 w-3" />
                            {location}
                        </div>
                    )}

                    {bio && <p className={`max-w-2xl pt-1 text-sm leading-relaxed ${isDark ? "text-text-primary-dark" : "text-slate-700"}`}>{bio}</p>}
                </div>

                <div className={`mt-4 flex flex-wrap gap-4 border-t pt-4 ${isDark ? "border-border-dark" : "border-border-light"}`}>
                    {[
                        { label: "Connections", value: profile?.connectionCount || 0, clickable: true },
                        { label: "Profile Views", value: profile?.profileViews },
                        { label: "Projects", value: profile?.projects?.length },
                        { label: "Experience", value: profile?.experience?.length },
                    ]
                        .filter((item) => item.value > 0 || item.label === "Connections" || item.label === "Profile Views")
                        .map((item) => (
                            <div
                                key={item.label}
                                className={`text-center ${item.clickable ? `${isDark ? "hover:bg-container-dark" : "hover:bg-slate-100"} cursor-pointer rounded-xl px-3 py-1 transition-all` : ""}`}
                                onClick={item.clickable ? () => setIsConnectionsModalOpen(true) : undefined}
                            >
                                <p className={`text-lg font-bold leading-none ${isDark ? "text-white" : "text-slate-900"}`}>{item.value}</p>
                                <p className={`mt-0.5 text-[10px] uppercase tracking-wider ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>{item.label}</p>
                            </div>
                        ))}
                </div>

                <ConnectionsModal
                    isOpen={isConnectionsModalOpen}
                    onClose={() => setIsConnectionsModalOpen(false)}
                    userId={profile?._id}
                    userName={fullName}
                />

                {isOwner && !isMentor && (
                    <button
                        onClick={() => navigate("/mentors/become")}
                        className={getButtonClassName({ variant: "warning", size: "md", isDark, className: "mt-4 w-full" })}
                    >
                        <Star className="h-4 w-4" />
                        Become a Mentor - share your knowledge with campus
                    </button>
                )}
            </div>
        </div>
    );
}
