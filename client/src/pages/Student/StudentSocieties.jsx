import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAllSocieties,
  setSocieties,
} from "../../redux/slices/societySlice";
import StatCard from "../../components/common/StatCard";
import FilterButtons from "../../components/common/FilterButtons";
import SocietyCard from "../../components/common/SocietyCard";
import Card from "../../components/common/Card";
import EmptyState from "../../components/studyGroups/EmptyState";
import Avatar from "../../components/common/Avatar";

export default function StudentSocieties() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filterStatus, setFilterStatus] = useState("all");

  const allSocieties = useSelector(selectAllSocieties);

  useEffect(() => {
    if (allSocieties.length === 0) {
      const mockSocieties = [
    {
      id: 1,
      name: "IEEE Student Chapter",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA5tRFcE_pFi824MNGNisea0s5XZIR-b-IBAuIchECnJ8ET_u-MZqJKAyC1Cd23hxZ-D0-3ffLxaYR2zyFNLQmsHcU3Iruq3o4_vdBPWs1U7i8yk5F34fm_X6kO9H3r8GanzhHM0DrnO_jKDwK2Ab9Xg-H6Tn7lEQKQnLKqhIGiJK9_1BI7njNayzMDHBkmlbjVHXmYsdsbfWllwCUJLUJx0x3aCnvMx8K49KhPKH4lhFB9yeHgKSJb8pin4eAoUF2y0YxIY0qw4GI",
      description:
        "Professional society focused on electrical, electronics, and computer engineering.",
      members: 245,
      status: "registered",
      role: "Member",
      events: 8,
      category: "STEM",
    },
    {
      id: 2,
      name: "Debating Society",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDoQNTWTBvvjCWzGT4LSr1h0qdUOa09wVzKeBx1TX53dyRxgmKHYTDS1TN_XJ-VLe34SDS9ynUpvRNZSRm9Ye3nIOTGeARiF7VoBHRUOoJngE52BBV8TselfYt8GNnQI7A7KevlQzgglbGZlfLMMrKCIFTH_dcWm8clNTFCXKbZchH9FtsE5gMqjY5bl9q-XSz00KbL43PLMbTkQKskFEdjkkYVQLBXyt7kcQRB0O_KhbQDbbDkd0EZRslHm881dAppEobIhYUK95E",
      description:
        "Build your communication and critical thinking skills through debating.",
      members: 156,
      status: "registered",
      role: "Member",
      events: 12,
      category: "Arts",
    },
    {
      id: 3,
      name: "AI Club",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDAw7PEHr5CfYENft29JzW_oh8UNy32igeFcIciwY4SLganFizb8gE_yaxTVMUXknXfbbs2veZ4hzrA5Bs6a1Amq2ATMtYS80ZqCfzGd9qYy9u34e2BhMiLfD5hiXIkVwi6DhktH82Ew4leVgs1NDu1MCD6_6Er0SpmlF-WFut93bD157Ns9za1uJCd0Q0dMJoYX8vfND6G0ekTtV3V1Ff_HoP50ErEPHX7P00DVl6K2njjP26CKL39vwnOHDDERwHbVFUbwVixkXY",
      description:
        "Explore artificial intelligence, machine learning, and cutting-edge AI applications.",
      members: 187,
      status: "registered",
      role: "Co-founder",
      events: 15,
      category: "STEM",
    },
    {
      id: 4,
      name: "Photography Club",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBUb85ANOhOOBeBqSWd-wOjgFd2X0JCzolY-1hBJfJLPjgh0RfRot_aA7obi-3MbWJEWkp-4EOoKaQsxsXaQF0pQ9_q_NaYN4s8cQJ4w2_2cSVD2afeq_WLhwcjHdqA2L-hS7UiUQHqGRXQZ8e8Sm4KhRJ2_iwsPPiMvNwiHZ_JYeAdQdFb2EItrr5p2Qq1QGaRbiLF5b1_EN7VGa92MVgICDZ6Bl4CG_zB56DJg_8QU-44tuOXEc9QEJPAmSZPLZFMMJYsIDE-has",
      description:
        "Discover your creative eye and connect with fellow photography enthusiasts.",
      members: 98,
      status: "not-registered",
      role: null,
      events: 6,
      category: "Arts",
    },
    {
      id: 5,
      name: "Coding Hub",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCf2pszDHzZ8Hrk883PEi2Cznc1MZx0nBGTczVTe8nxYfIomylA04iCbgpsWtyNy6JV0Ib1LTxtI4XPMlt9g4j3Ft0ppd5lJHw7qbnFL4pS6mXoKfSSvQpP90_ke5lhCaqvTbuIuYfX7SMH_sd3y8qQ532m1LXC_fFdHSY0KsGdCSmXtuKbh0LZk-w1jBIn6MRqd2mjR0Nw2ZipmAXJXshFf6VWAcV9wOgJwFR4SwnqC3JtpDK9tRUS3le1eRWvdcfGPu9NizsZ6bg",
      description:
        "Learn, share, and collaborate on coding projects with like-minded developers.",
      members: 312,
      status: "registered",
      role: "Co-founder",
      events: 20,
      category: "STEM",
    },
    {
      id: 6,
      name: "Business Club",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA5CeuVKkEt85366ovsM9gFP98W-VrjlnfBkcllLm2KV54rCRoD_m4BNoAtEUSuQvcFlytThdRTIO9Z1nXBibQKGdaDAK6LhzpjhmYmbXva2k9oIC8h970iRH-SR6zbL8sHw7xVjy9ZboltlifQlD62MISDAbzDqSzU8FKt2BDFzz0BuTa8mENaA8tE8_wp_k0SwC_eUrxSsx4WPDQksvC4LD4-3ZokmlJRAYp0SCCUueTd_Sw9vg6LsJmch92wQln-EnZaZ9hvjhU",
      description:
        "Develop business acumen and entrepreneurial skills through workshops and mentoring.",
      members: 143,
      status: "not-registered",
      role: null,
      events: 10,
      category: "Commerce",
    },
      ];
      dispatch(setSocieties(mockSocieties));
    }
  }, [dispatch, allSocieties.length]);

  const filteredSocieties = useMemo(
    () =>
      filterStatus === "all"
        ? allSocieties
        : allSocieties.filter((s) => s.status === filterStatus),
    [allSocieties, filterStatus]
  );

  const registeredCount = useMemo(
    () => allSocieties.filter((s) => s.status === "registered").length,
    [allSocieties]
  );

  return (
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#30363d] px-6 sm:px-10 lg:px-20 py-3 sticky top-0 bg-[#0d1117]/80 backdrop-blur-sm z-50">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="text-white hover:text-[#238636] transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-4 text-white">
            <svg
              className="size-6 text-[#238636]"
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 6H42L36 24L42 42H6L12 24L6 6Z"
                fill="currentColor"
              ></path>
            </svg>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              CampusConnect
            </h2>
          </div>
        </div>

        <div className="flex flex-1 justify-end gap-2 sm:gap-4 md:gap-8 items-center">
          <div className="hidden lg:flex items-center gap-9">
            <button
              onClick={() => navigate("/student/dashboard")}
              className="text-white text-sm font-medium leading-normal hover:text-[#238636] transition-colors"
            >
              Dashboard
            </button>
            <a
              className="text-white text-sm font-medium leading-normal hover:text-[#238636] transition-colors"
              href="/student/tasks"
            >
              Tasks
            </a>
            <a
              className="text-white text-sm font-medium leading-normal hover:text-[#238636] transition-colors"
              href="/student/events"
            >
              Events
            </a>
            <a
              className="text-white text-sm font-medium leading-normal hover:text-[#238636] transition-colors"
              href="/student/societies"
            >
              Societies
            </a>
          </div>
          <div className="flex gap-2">
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#161b22] text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-[#30363d] transition-colors">
              <span className="material-symbols-outlined text-xl">
                notifications
              </span>
            </button>
          </div>
          <Avatar
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnPK_XOPkn_xRuJjkJ28yxLKxQIg3E7DdzwpZWAUgeAqsJeg1D0pmo858Xb6Fnx4adCLic40zRTqLsOgB5E6boNvQW2Wu0w08lQ8gAHHahDiL6kDHGnwyILKuDNZcMSbweDjM8qBupJvllgQTJWoxWH6d86ONwwFSFxfNP61cxoz4janxWpttRZcAk3RL0x_QOxMM51XYQYX2b552BqA-0bjn5bBeUsZ_NyXsgVxC2-H7bNrQwoisuCAVm2GoW5vct4koHXzgMiuI"
            size="10"
            hover={true}
            borderColor="[#238636]"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-10 lg:px-20 flex flex-1 justify-center py-5 md:py-10">
        <div className="layout-content-container flex flex-col w-full max-w-6xl">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Societies & Clubs
            </h1>
            <p className="text-[#8b949e]">
              Join communities and make meaningful connections
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Total Societies"
              value={allSocieties.length}
              icon="groups"
            />
            <StatCard
              label="Registered"
              value={registeredCount}
              icon="check_circle"
            />
            <StatCard
              label="Available"
              value={
                allSocieties.filter((s) => s.status === "not-registered").length
              }
              icon="add_circle"
            />
          </div>

          {/* Filter Buttons */}
          <FilterButtons
            buttons={[
              { value: "all", label: "All Societies" },
              { value: "registered", label: "My Societies" },
              { value: "not-registered", label: "Discover" },
            ]}
            activeFilter={filterStatus}
            onFilterChange={setFilterStatus}
            className="mb-8"
          />

          {/* Societies Grid */}
          {filteredSocieties.length === 0 ? (
            <Card padding="p-12">
              <EmptyState
                icon="search_off"
                title="No societies found"
                description="Try adjusting your filters"
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSocieties.map((society) => (
                <SocietyCard key={society.id} society={society} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
