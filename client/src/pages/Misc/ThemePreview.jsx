import React, { useState } from "react";
import { Layout, BookOpen, Activity, Users, MessageSquare } from "lucide-react";

const themes = [
    {
        id: "classic-indigo",
        name: "Classic Modern Indigo",
        description: "Highly professional, clean, and extremely readable with perfect contrast. Matches the aesthetics of modern SaaS platforms.",
        colors: {
            primary: "#4F46E5", // indigo-600
            accent: "#818CF8", // indigo-400
            background: "#EEF2FF", // indigo-50
            surface: "#FFFFFF",
            text: "#0F172A", // slate-900
            textLight: "#475569" // slate-600
        }
    },
    {
        id: "crimson-cream",
        name: "Crimson & Cream",
        description: "Warm, energetic, and highly focused. Feels very academic and lively on a warm paper-like background.",
        colors: {
            primary: "#E11D48", // rose-600
            accent: "#FB7185", // rose-400
            background: "#FAFAF9", // stone-50
            surface: "#FFFFFF",
            text: "#1C1917", // stone-900
            textLight: "#57534E" // stone-500
        }
    },
    {
        id: "deep-emerald",
        name: "Deep Emerald",
        description: "A properly balanced, highly readable natural theme using ultra-dark forest navy text to absolutely assure legibility.",
        colors: {
            primary: "#10B981", // emerald-500
            accent: "#34D399", // emerald-400
            background: "#ECFDF5", // emerald-50
            surface: "#FFFFFF",
            text: "#134E4A", // teal-900
            textLight: "#0F766E" // teal-700
        }
    }
];

export default function ThemePreview() {
    const [activeTheme, setActiveTheme] = useState(themes[0]);

    return (
        <div className="min-h-screen p-8 transition-colors duration-300" style={{ backgroundColor: activeTheme.colors.background, color: activeTheme.colors.text }}>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Options */}
                <div className="flex flex-col gap-4 text-center mb-10">
                    <h1 className="text-4xl font-bold tracking-tight">Theme Previewer</h1>
                    <p className="text-xl" style={{ color: activeTheme.colors.textLight }}>Select a theme below to instantly preview the CampusConnect interface aesthetics.</p>

                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {themes.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => setActiveTheme(theme)}
                                className={`px-6 py-3 rounded-xl font-medium transition-transform transform hover:scale-105 shadow-md`}
                                style={{
                                    backgroundColor: activeTheme.id === theme.id ? theme.colors.primary : theme.colors.surface,
                                    color: activeTheme.id === theme.id ? '#FFFFFF' : theme.colors.text,
                                    border: `2px solid ${theme.colors.primary}`
                                }}
                            >
                                {theme.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mockup Container */}
                <div className="rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-colors duration-300 border border-gray-200" style={{ backgroundColor: activeTheme.colors.surface }}>

                    {/* Sidebar Mockup */}
                    <div className="w-full md:w-64 p-6 border-r border-opacity-20" style={{ borderColor: activeTheme.colors.textLight }}>
                        <div className="flex items-center gap-2 mb-10">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: activeTheme.colors.primary }}>C</div>
                            <span className="text-xl font-bold">CampusConnect</span>
                        </div>

                        <nav className="space-y-2">
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-white" style={{ backgroundColor: activeTheme.colors.primary }}>
                                <Layout className="w-5 h-5" /> <span>Dashboard</span>
                            </div>
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ color: activeTheme.colors.textLight }}>
                                <BookOpen className="w-5 h-5" /> <span>Academics</span>
                            </div>
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ color: activeTheme.colors.textLight }}>
                                <Users className="w-5 h-5" /> <span>Societies</span>
                            </div>
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ color: activeTheme.colors.textLight }}>
                                <MessageSquare className="w-5 h-5" /> <span>Mentoring</span>
                            </div>
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ color: activeTheme.colors.textLight }}>
                                <Activity className="w-5 h-5" /> <span className="font-medium" style={{ color: activeTheme.colors.accent }}>MindSpace AI</span>
                            </div>
                        </nav>
                    </div>

                    {/* Main Content Mockup */}
                    <div className="flex-1 p-8" style={{ backgroundColor: activeTheme.colors.background }}>
                        <header className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold">Welcome back, Student</h2>
                                <p style={{ color: activeTheme.colors.textLight }}>Here's what's happening today.</p>
                            </div>
                            <button className="px-6 py-2 rounded-lg text-white font-medium shadow-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: activeTheme.colors.accent }}>
                                Generate Study Plan
                            </button>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Stat Cards */}
                            <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: activeTheme.colors.surface }}>
                                <div className="text-sm font-medium mb-1" style={{ color: activeTheme.colors.textLight }}>Upcoming Assignments</div>
                                <div className="text-3xl font-bold" style={{ color: activeTheme.colors.primary }}>4</div>
                            </div>
                            <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: activeTheme.colors.surface }}>
                                <div className="text-sm font-medium mb-1" style={{ color: activeTheme.colors.textLight }}>Pending Mentor Requests</div>
                                <div className="text-3xl font-bold" style={{ color: activeTheme.colors.primary }}>1</div>
                            </div>
                            <div className="p-6 rounded-xl shadow-sm border" style={{ backgroundColor: activeTheme.colors.surface, borderColor: activeTheme.colors.accent }}>
                                <div className="text-sm font-medium mb-1 flex items-center justify-between" style={{ color: activeTheme.colors.accent }}>
                                    <span>AI Wellbeing Check-in</span>
                                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeTheme.colors.accent }}></div>
                                </div>
                                <div className="text-sm font-medium mt-2" style={{ color: activeTheme.colors.textLight }}>You have a pending session.</div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: activeTheme.colors.surface }}>
                                <h3 className="font-bold mb-4 font-lg border-b pb-2" style={{ borderColor: `${activeTheme.colors.textLight}30` }}>Today's Schedule</h3>
                                <div className="space-y-4 pt-2">
                                    <div className="flex gap-4">
                                        <div className="w-1.5 h-12 rounded-full" style={{ backgroundColor: activeTheme.colors.accent }}></div>
                                        <div>
                                            <div className="font-medium">Web Engineering Lecture</div>
                                            <div className="text-sm" style={{ color: activeTheme.colors.textLight }}>10:00 AM - 11:30 AM</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-1.5 h-12 rounded-full" style={{ backgroundColor: activeTheme.colors.primary }}></div>
                                        <div>
                                            <div className="font-medium">1-on-1 Mentoring Call</div>
                                            <div className="text-sm" style={{ color: activeTheme.colors.textLight }}>2:00 PM - 2:30 PM</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl shadow-sm flex flex-col justify-center items-center text-center" style={{ backgroundColor: activeTheme.colors.primary }}>
                                <MessageSquare className="w-12 h-12 text-white mb-4 opacity-80" />
                                <h3 className="text-white text-xl font-bold">Need Help Studying?</h3>
                                <p className="text-white opacity-80 mt-2 mb-4 text-sm">StudySync AI is ready to quiz you.</p>
                                <button className="px-6 py-2 rounded-full font-medium shadow-md w-full" style={{ backgroundColor: '#FFFFFF', color: activeTheme.colors.primary }}>
                                    Start Session
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected Theme Details */}
                <div className="p-6 rounded-xl shadow-sm text-center max-w-2xl mx-auto border" style={{ backgroundColor: activeTheme.colors.surface, borderColor: `${activeTheme.colors.primary}30` }}>
                    <h3 className="font-bold text-lg mb-2" style={{ color: activeTheme.colors.primary }}>Why this theme?</h3>
                    <p style={{ color: activeTheme.colors.textLight }}>{activeTheme.description}</p>
                </div>

            </div>
        </div>
    );
}
