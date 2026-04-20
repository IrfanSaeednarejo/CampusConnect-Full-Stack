import { useEffect, useState } from "react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
    getUserGrowth, getMentorEngagement, getEventParticipation,
    getSocietyActivity, getSessionsAnalytics,
} from "../../api/adminApi";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

export const AdminAnalytics = () => {
    const [period, setPeriod] = useState("30d");
    const [growth, setGrowth] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [events, setEvents] = useState([]);
    const [societies, setSocieties] = useState([]);
    const [sessions, setSessions] = useState({ breakdown: [], trend: [] });

    useEffect(() => {
        Promise.all([
            getUserGrowth({ period }),
            getMentorEngagement(),
            getEventParticipation(),
            getSocietyActivity(),
            getSessionsAnalytics({ period }),
        ]).then(([g, m, e, s, sess]) => {
            setGrowth(g.data?.data?.data || []);
            setMentors(m.data?.data?.slice(0, 10) || []);
            setEvents(e.data?.data?.slice(0, 10) || []);
            setSocieties(s.data?.data?.slice(0, 10) || []);
            setSessions({ breakdown: sess.data?.data?.breakdown || [], trend: sess.data?.data?.trend || [] });
        });
    }, [period]);

    const chart = (title, children) => (
        <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{title}</h3>
            {children}
        </div>
    );

    const pillBtn = {
        padding: "8px 14px", border: "none", borderRadius: 6,
        color: "#f8fafc", cursor: "pointer", fontSize: 13,
    };

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: 0 }}>System Intelligence</h1>
                    <p style={{ color: "#64748b", marginTop: 4 }}>Deep telemetry insights, engagement metrics, and growth forecasting.</p>
                </div>
                <div style={{ display: "flex", gap: 6, padding: 4, background: "#0f172a", borderRadius: 12, border: "1px solid #1e293b" }}>
                    {["7d", "30d", "90d", "1y"].map((p) => (
                        <button 
                            key={p} 
                            onClick={() => setPeriod(p)}
                            style={{ 
                                padding: "8px 16px", border: "none", borderRadius: 8,
                                background: period === p ? "#6366f1" : "transparent",
                                color: period === p ? "#fff" : "#64748b",
                                cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.2s"
                            }}
                        >
                            {p.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                    {chart("Identity Propagation (User Growth)", (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={growth}>
                                <defs>
                                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)" }} 
                                    itemStyle={{ color: "#f8fafc", fontSize: 12, fontWeight: 700 }}
                                />
                                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#0f172a" }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ))}
                </div>

                {chart("Service Node Performance (Top Mentors)", (
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={mentors} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="displayName" type="category" tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }} width={120} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: "rgba(99, 102, 241, 0.05)" }} contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12 }} />
                            <Bar dataKey="completedSessions" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                ))}

                {chart("Session Lifecycle Distribution", (
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie 
                                data={sessions.breakdown} 
                                dataKey="count" 
                                nameKey="status" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={60} 
                                outerRadius={90} 
                                paddingAngle={8}
                            >
                                {sessions.breakdown.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={4} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12 }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748b" }} />
                        </PieChart>
                    </ResponsiveContainer>
                ))}
            </div>
        </div>
    );
};

export default AdminAnalytics;
