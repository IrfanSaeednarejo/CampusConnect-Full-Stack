import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAllMembers,
  setMembers,
} from "../../redux/slices/memberSlice";
import SocietyPageHeader from "../../components/societies/SocietyPageHeader";

export default function SocietyNetworking() {
  const dispatch = useDispatch();
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
      connections.filter((conn) => {
        if (filter === "all") return true;
        if (filter === "online") return conn.status === "online";
        return true;
      }),
    [connections, filter]
  );

  return (
    <div className="min-h-screen bg-[#111714] text-white">
      {/* Header */}
      <SocietyPageHeader
        title="Networking Hub"
        subtitle="Connect with society members and alumni"
        icon="lan"
        backPath="/society/dashboard"
        action={
          <div className="relative">
            <input
              type="text"
              placeholder="Search connections..."
              className="px-4 py-2 rounded-lg bg-[#111714] border border-[#29382f] text-white placeholder-[#9eb7a9] focus:outline-none focus:border-[#1dc964] w-64"
            />
            <span className="material-symbols-outlined absolute right-3 top-2.5 text-[#9eb7a9]">
              search
            </span>
          </div>
        }
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-[#1dc964] text-[#111714]"
                  : "bg-[#1a241e] text-[#9eb7a9] hover:bg-[#1a241e]/80 hover:text-white"
              }`}
            >
              All Members ({connections.length})
            </button>
            <button
              onClick={() => setFilter("online")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "online"
                  ? "bg-[#1dc964] text-[#111714]"
                  : "bg-[#1a241e] text-[#9eb7a9] hover:bg-[#1a241e]/80 hover:text-white"
              }`}
            >
              Online Now (
              {connections.filter((c) => c.status === "online").length})
            </button>
          </div>
        </div>

        {/* Connections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredConnections.map((connection) => (
            <div
              key={connection.id}
              className="bg-[#1a241e] border border-[#29382f] rounded-lg p-6 hover:border-[#1dc964]/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url("${connection.image}")` }}
                  />
                  {connection.status === "online" && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#1dc964] rounded-full border-2 border-[#1a241e]" />
                  )}
                </div>
                <button className="text-[#9eb7a9] hover:text-white">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">
                {connection.name}
              </h3>
              <p className="text-[#9eb7a9] text-sm mb-1">{connection.role}</p>
              <p className="text-[#9eb7a9] text-xs mb-3">
                {connection.company}
              </p>
              <div className="flex items-center gap-2 text-xs text-[#9eb7a9] mb-4">
                <span className="material-symbols-outlined text-sm">group</span>
                <span>{connection.connections} connections</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#9eb7a9] mb-4">
                <span className="material-symbols-outlined text-sm">badge</span>
                <span className="truncate">{connection.society}</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 rounded-lg bg-[#1dc964] text-[#111714] text-sm font-medium hover:bg-[#1dc964]/90 transition-colors">
                  Message
                </button>
                <button className="px-4 py-2 rounded-lg bg-[#29382f] text-white text-sm font-medium hover:bg-[#29382f]/80 transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Networking Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#9eb7a9] text-sm mb-1">Total Connections</p>
                <p className="text-3xl font-bold text-white">
                  {connections.length}
                </p>
              </div>
              <span className="material-symbols-outlined text-[#1dc964] text-4xl">
                group
              </span>
            </div>
          </div>
          <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#9eb7a9] text-sm mb-1">Online Now</p>
                <p className="text-3xl font-bold text-white">
                  {connections.filter((c) => c.status === "online").length}
                </p>
              </div>
              <span className="material-symbols-outlined text-[#1dc964] text-4xl">
                wifi
              </span>
            </div>
          </div>
          <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#9eb7a9] text-sm mb-1">New This Month</p>
                <p className="text-3xl font-bold text-white">12</p>
              </div>
              <span className="material-symbols-outlined text-[#1dc964] text-4xl">
                trending_up
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
