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
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Analytics</h1>
                <div style={{ display: "flex", gap: 8 }}>
                    {["7d", "30d", "90d", "1y"].map((p) => (
                        <button key={p} onClick={() => setPeriod(p)}
                            style={{ ...pillBtn, background: period === p ? "#6366f1" : "#1e293b" }}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {chart("User Growth", (
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={growth}>
                        <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                        <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            ))}

            {chart("Top Mentors by Sessions", (
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={mentors} layout="vertical">
                        <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                        <YAxis dataKey="displayName" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} width={100} />
                        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                        <Bar dataKey="completedSessions" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            ))}

            {chart("Session Status Breakdown", (
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie data={sessions.breakdown} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80}>
                            {sessions.breakdown.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            ))}
        </div>
    );
};

export default AdminAnalytics;
