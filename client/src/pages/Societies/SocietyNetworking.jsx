import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import useHomeTheme from "../../hooks/useHomeTheme";
import { selectAllMembers, setMembers } from "../../redux/slices/memberSlice";
import SocietyPageHeader from "../../components/societies/SocietyPageHeader";
import IconButton from "../../components/common/IconButton";
import { getButtonClassName } from "../../components/common/Button";
import { cn, getSocietyTheme } from "./societyTheme";

export default function SocietyNetworking() {
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const theme = getSocietyTheme(isDark);
  const [filter, setFilter] = useState("all");
  const connections = useSelector(selectAllMembers);

  useEffect(() => {
    if (connections.length === 0) {
      dispatch(
        setMembers([
          {
            id: 1,
            name: "Emma Thompson",
            role: "Software Engineer",
            company: "Tech Corp",
            society: "Tech Innovators Club",
            connections: 450,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuArj_dwVEXu6vzmlT6afGmhH-P_vfNeMG0QArGPe7pCuhjPDjoqtXQWJ-6iHMe84K0ML3iDOk8vH8EEWMQSw1f-Gf0vMJ2yPXE8AQIoO29dA_ixx6rBuKafMgf7gnj2yYJgMhcG1XLWX-7NWRMmhz87akFE_mQreb0Td1-xI25paXpdQS9LWhUAqaxNzU_M6plyRH_sCbSsKApcdFa1_VeSSglcaAs_t7DDGJN3ryveQN_LqpmzIDRJ0S6HDo6kNwysBVwRtLqlQrw",
            status: "online",
            interests: ["Technology", "Engineering"],
          },
          {
            id: 2,
            name: "David Kumar",
            role: "Startup Founder",
            company: "InnovateCo",
            society: "Entrepreneurs of Tomorrow",
            connections: 320,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuA5tRFcE_pFi824MNGNisea0s5XZIR-b-IBAuIchECnJ8ET_u-MZqJKAyC1Cd23hxZ-D0-3ffLxaYR2zyFNLQmsHcU3Iruq3o4_vdBPWs1U7i8yk5F34fm_X6kO9H3r8GanzhHM0DrnO_jKDwK2Ab9Xg-H6Tn7lEQKQnLKqhIGiJK9_1BI7njNayzMDHBkmlbjVHXmYsdsbfWllwCUJLUJx0x3aCnvMx8K49KhPKH4lhFB9yeHgKSJb8pin4eAoUF2y0YxIY0qw4GI",
            status: "offline",
            interests: ["Entrepreneurship", "Innovation"],
          },
          {
            id: 3,
            name: "Sophia Martinez",
            role: "Communications Director",
            company: "MediaPlus",
            society: "Debate Society",
            connections: 280,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDoQNTWTBvvjCWzGT4LSr1h0qdUOa09wVzKeBx1TX53dyRxgmKHYTDS1TN_XJ-VLe34SDS9ynUpvRNZSRm9Ye3nIOTGeARiF7VoBHRUOoJngE52BBV8TselfYt8GNnQI7A7KevlQzgglbGZlfLMMrKCIFTH_dcWm8clNTFCXKbZchH9FtsE5gMqjY5bl9q-XSz00KbL43PLMbTkQKskFEdjkkYVQLBXyt7kcQRB0O_KhbQDbbDkd0EZRslHm881dAppEobIhYUK95E",
            status: "online",
            interests: ["Communication", "Media"],
          },
          {
            id: 4,
            name: "James Wilson",
            role: "Data Scientist",
            company: "Analytics Pro",
            society: "Tech Innovators Club",
            connections: 195,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDAw7PEHr5CfYENft29JzW_oh8UNy32igeFcIciwY4SLganFizb8gE_yaxTVMUXknXfbbs2veZ4hzrA5Bs6a1Amq2ATMtYS80ZqCfzGd9qYy9u34e2BhMiLfD5hiXIkVwi6DhktH82Ew4leVgs1NDu1MCD6_6Er0SpmlF-WFut93bD157Ns9za1uJCd0Q0dMJoYX8vfND6G0ekTtV3V1Ff_HoP50ErEPHX7P00DVl6K2njjP26CKL39vwnOHDDERwHbVFUbwVixkXY",
            status: "offline",
            interests: ["Data Science", "Analytics"],
          },
          {
            id: 5,
            name: "Olivia Chen",
            role: "Product Manager",
            company: "DesignHub",
            society: "Tech Innovators Club",
            connections: 510,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuBUb85ANOhOOBeBqSWd-wOjgFd2X0JCzolY-1hBJfJLPjgh0RfRot_aA7obi-3MbWJEWkp-4EOoKaQsxsXaQF0pQ9_q_NaYN4s8cQJ4w2_2cSVD2afeq_WLhwcjHdqA2L-hS7UiUQHqGRXQZ8e8Sm4KhRJ2_iwsPPiMvNwiHZ_JYeAdQdFb2EItrr5p2Qq1QGaRbiLF5b1_EN7VGa92MVgICDZ6Bl4CG_zB56DJg_8QU-44tuOXEc9QEJPAmSZPLZFMMJYsIDE-has",
            status: "online",
            interests: ["Product Management", "Design"],
          },
          {
            id: 6,
            name: "Alex Johnson",
            role: "Marketing Specialist",
            company: "BrandCo",
            society: "Entrepreneurs of Tomorrow",
            connections: 340,
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuA5tRFcE_pFi824MNGNisea0s5XZIR-b-IBAuIchECnJ8ET_u-MZqJKAyC1Cd23hxZ-D0-3ffLxaYR2zyFNLQmsHcU3Iruq3o4_vdBPWs1U7i8yk5F34fm_X6kO9H3r8GanzhHM0DrnO_jKDwK2Ab9Xg-H6Tn7lEQKQnLKqhIGiJK9_1BI7njNayzMDHBkmlbjVHXmYsdsbfWllwCUJLUJx0x3aCnvMx8K49KhPKH4lhFB9yeHgKSJb8pin4eAoUF2y0YxIY0qw4GI",
            status: "online",
            interests: ["Marketing", "Branding"],
          },
        ])
      );
    }
  }, [dispatch, connections.length]);

  const filteredConnections = useMemo(
    () =>
      connections.filter((connection) => {
        if (filter === "all") return true;
        if (filter === "online") return connection.status === "online";
        return true;
      }),
    [connections, filter]
  );

  return (
    <div className={cn("min-h-screen", theme.page)}>
      <SocietyPageHeader
        title="Networking Hub"
        subtitle="Connect with society members and alumni."
        icon="lan"
        backPath="/society/dashboard"
        action={
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search connections..."
              className={cn("w-full rounded-2xl border py-2.5 pl-4 pr-11 text-sm outline-none transition-colors", theme.field)}
            />
            <span className={cn("material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-base", theme.muted)}>
              search
            </span>
          </div>
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={getButtonClassName({ variant: filter === "all" ? "primary" : "secondary", size: "sm", isDark })}
          >
            All Members ({connections.length})
          </button>
          <button
            onClick={() => setFilter("online")}
            className={getButtonClassName({ variant: filter === "online" ? "primary" : "secondary", size: "sm", isDark })}
          >
            Online Now ({connections.filter((connection) => connection.status === "online").length})
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredConnections.map((connection) => (
            <div key={connection.id} className={cn("rounded-3xl border p-6", theme.card)}>
              <div className="mb-4 flex items-start justify-between">
                <div className="relative">
                  <div
                    className="h-16 w-16 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url("${connection.image}")` }}
                  />
                  {connection.status === "online" && (
                    <div className={cn("absolute bottom-0 right-0 h-4 w-4 rounded-full border-2", isDark ? "border-[#161b22] bg-emerald-400" : "border-white bg-emerald-500")} />
                  )}
                </div>
                <IconButton icon="more_vert" title="More actions" variant="ghost" size="icon-sm" className={cn(theme.muted)} />
              </div>

              <h3 className={cn("text-lg font-medium", theme.text)}>{connection.name}</h3>
              <p className={cn("mt-1 text-sm", theme.muted)}>{connection.role}</p>
              <p className={cn("mt-1 text-xs", theme.muted)}>{connection.company}</p>

              <div className="mt-4 space-y-2 text-xs">
                <div className={cn("flex items-center gap-2", theme.muted)}>
                  <span className="material-symbols-outlined text-sm">group</span>
                  <span>{connection.connections} connections</span>
                </div>
                <div className={cn("flex items-center gap-2", theme.muted)}>
                  <span className="material-symbols-outlined text-sm">badge</span>
                  <span className="truncate">{connection.society}</span>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button className={getButtonClassName({ variant: "primary", size: "md", isDark, className: "flex-1" })}>
                  Message
                </button>
                <button className={getButtonClassName({ variant: "secondary", size: "md", isDark })}>
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: "Total Connections", value: connections.length, icon: "group" },
            { label: "Online Now", value: connections.filter((connection) => connection.status === "online").length, icon: "wifi" },
            { label: "New This Month", value: 12, icon: "trending_up" },
          ].map((stat) => (
            <div key={stat.label} className={cn("rounded-3xl border p-6", theme.card)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn("text-sm", theme.muted)}>{stat.label}</p>
                  <p className={cn("mt-2 text-3xl font-bold", theme.text)}>{stat.value}</p>
                </div>
                <span className={cn("material-symbols-outlined text-4xl", isDark ? "text-emerald-400" : "text-slate-900")}>
                  {stat.icon}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
