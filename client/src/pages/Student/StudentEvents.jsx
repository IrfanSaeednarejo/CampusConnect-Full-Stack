import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Avatar from "../../components/common/Avatar";
import {
  selectAllEvents,
  setEvents,
} from "../../redux/slices/eventSlice";

export default function StudentEvents() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filterUpcoming, setFilterUpcoming] = useState(true);

  const allEvents = useSelector(selectAllEvents);

  useEffect(() => {
    if (allEvents.length === 0) {
      const mockEvents = [
    {
      id: 1,
      society: "IEEE Student Chapter",
      title: "Annual Tech Symposium",
      date: "2026-02-26",
      time: "10:00 AM",
      location: "Main Auditorium",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD9RA_fMuSaLKstjcMP5ozR-vSaxtqQ_kzINRu0QEbitLaiaOGSvhHQ0t3zi1Py769dste1tAWujcMGzeKsHP3LIDU8GpBrAtxlzAEKMTgoN2PCuAMYnxMVStac_6sgv9hNluDqsTZg4B7sFD-1sE6Uqn7KpdMC_eKzapyTUfan20XYGE2tBdjBB1D9B7MnCMh1-NNhn67QqbuDD5OKhys_-_9nTeollnRzd23QBgopcA4rmFIaSDdXU_42pp-765L5mTwpjWlySM8",
      description:
        "Join us for a day of technical talks, networking, and innovation showcases.",
      status: "registered",
      capacity: "300 / 350",
    },
    {
      id: 2,
      society: "Debating Society",
      title: "Inter-University Debate Finals",
      date: "2026-03-04",
      time: "2:00 PM",
      location: "Debate Hall",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD3-_oIn91suwJp2Y7wxBTs3ZPaq72Kd3QtdHOL6EAqtQ0n6pEncU7_La8js5jGDp5Kdnq6kTZFIlzvBwNVVXL5B8iD9ywnZP35iPGjqP-dyZRon4S-2U8RENBHlJUtbWJIHeZQJOH_qCScqBVJG5Ri7fhSA5tI5wwhJ4JT1kRXW3-4TlUwqiyRTBJIKwu8tDxKOBltGDVxpO6MiMUlxREPa1y6MTdQbrVx5MJtWEMJiNqfhjjzGPSRGTe4ThsX54Y986W9h7baUy0",
      description:
        "Participate in our most prestigious debate competition of the year.",
      status: "registered",
      capacity: "150 / 200",
    },
    {
      id: 3,
      society: "AI Club",
      title: "Machine Learning Workshop",
      date: "2026-02-20",
      time: "3:00 PM",
      location: "Computer Lab",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDAw7PEHr5CfYENft29JzW_oh8UNy32igeFcIciwY4SLganFizb8gE_yaxTVMUXknXfbbs2veZ4hzrA5Bs6a1Amq2ATMtYS80ZqCfzGd9qYy9u34e2BhMiLfD5hiXIkVwi6DhktH82Ew4leVgs1NDu1MCD6_6Er0SpmlF-WFut93bD157Ns9za1uJCd0Q0dMJoYX8vfND6G0ekTtV3V1Ff_HoP50ErEPHX7P00DVl6K2njjP26CKL39vwnOHDDERwHbVFUbwVixkXY",
      description:
        "Learn the fundamentals of machine learning from industry experts.",
      status: "registered",
      capacity: "80 / 100",
    },
    {
      id: 4,
      society: "Photography Club",
      title: "Campus Photography Contest",
      date: "2026-03-15",
      time: "9:00 AM",
      location: "Various Locations",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBUb85ANOhOOBeBqSWd-wOjgFd2X0JCzolY-1hBJfJLPjgh0RfRot_aA7obi-3MbWJEWkp-4EOoKaQsxsXaQF0pQ9_q_NaYN4s8cQJ4w2_2cSVD2afeq_WLhwcjHdqA2L-hS7UiUQHqGRXQZ8e8Sm4KhRJ2_iwsPPiMvNwiHZ_JYeAdQdFb2EItrr5p2Qq1QGaRbiLF5b1_EN7VGa92MVgICDZ6Bl4CG_zB56DJg_8QU-44tuOXEc9QEJPAmSZPLZFMMJYsIDE-has",
      description: "Showcase your photography skills and win amazing prizes.",
      status: "not-registered",
      capacity: "50 / 150",
    },
    {
      id: 5,
      society: "IEEE Student Chapter",
      title: "Robotics Workshop",
      date: "2026-02-18",
      time: "1:00 PM",
      location: "Robotics Lab",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA5tRFcE_pFi824MNGNisea0s5XZIR-b-IBAuIchECnJ8ET_u-MZqJKAyC1Cd23hxZ-D0-3ffLxaYR2zyFNLQmsHcU3Iruq3o4_vdBPWs1U7i8yk5F34fm_X6kO9H3r8GanzhHM0DrnO_jKDwK2Ab9Xg-H6Tn7lEQKQnLKqhIGiJK9_1BI7njNayzMDHBkmlbjVHXmYsdsbfWllwCUJLUJx0x3aCnvMx8K49KhPKH4lhFB9yeHgKSJb8pin4eAoUF2y0YxIY0qw4GI",
      description: "Hands-on workshop on robotics and automation.",
      status: "registered",
      capacity: "60 / 80",
    },
      ];
      dispatch(setEvents(mockEvents));
    }
  }, [dispatch, allEvents.length]);

  const filteredEvents = useMemo(
    () =>
      filterUpcoming
        ? allEvents.filter((e) => new Date(e.date) >= new Date())
        : allEvents.filter((e) => new Date(e.date) < new Date()),
    [allEvents, filterUpcoming]
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
              CampusNexus
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
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-10 lg:px-20 flex flex-1 justify-center py-5 md:py-10">
        <div className="layout-content-container flex flex-col w-full max-w-6xl">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">All Events</h1>
            <p className="text-[#8b949e]">Discover and register for events</p>
          </div>

          {/* Filter Tabs */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 mb-8">
            <div className="flex gap-4">
              <button
                onClick={() => setFilterUpcoming(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterUpcoming
                    ? "bg-[#238636] text-[#0d1117]"
                    : "bg-[#0d1117] text-[#c9d1d9] hover:bg-[#161b22]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined">
                    event_upcoming
                  </span>
                  Upcoming (
                  {
                    allEvents.filter((e) => new Date(e.date) >= new Date())
                      .length
                  }
                  )
                </span>
              </button>
              <button
                onClick={() => setFilterUpcoming(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !filterUpcoming
                    ? "bg-[#238636] text-[#0d1117]"
                    : "bg-[#0d1117] text-[#c9d1d9] hover:bg-[#161b22]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined">event_note</span>
                  Past (
                  {
                    allEvents.filter((e) => new Date(e.date) < new Date())
                      .length
                  }
                  )
                </span>
              </button>
            </div>
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-[#8b949e] block mb-4">
                event_busy
              </span>
              <p className="text-[#c9d1d9] font-bold mb-2">No events found</p>
              <p className="text-[#8b949e] text-sm">
                There are no {filterUpcoming ? "upcoming" : "past"} events at
                the moment
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden hover:border-[#238636]/50 transition-colors group cursor-pointer"
                >
                  {/* Event Image */}
                  <div className="relative w-full h-48 overflow-hidden bg-[#0d1117]">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                      style={{ backgroundImage: `url("${event.image}")` }}
                    />
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          event.status === "registered"
                            ? "bg-[#238636] text-[#0d1117]"
                            : "bg-[#161b22]/80 text-[#c9d1d9] border border-[#30363d]"
                        }`}
                      >
                        {event.status === "registered"
                          ? "Registered"
                          : "Available"}
                      </span>
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="p-4 flex flex-col gap-3">
                    <div>
                      <p className="text-[#8b949e] text-sm font-medium">
                        {event.society}
                      </p>
                      <h3 className="text-white text-lg font-bold leading-tight">
                        {event.title}
                      </h3>
                    </div>

                    <p className="text-[#8b949e] text-sm line-clamp-2">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2 py-3 border-t border-b border-[#30363d]">
                      <div className="flex items-center gap-2 text-[#8b949e] text-sm">
                        <span className="material-symbols-outlined text-base">
                          calendar_month
                        </span>
                        <span>
                          {new Date(event.date).toLocaleDateString()} at{" "}
                          {event.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[#8b949e] text-sm">
                        <span className="material-symbols-outlined text-base">
                          location_on
                        </span>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#8b949e] text-sm">
                        <span className="material-symbols-outlined text-base">
                          group
                        </span>
                        <span>{event.capacity}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className="w-full flex items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-[#238636] text-[#0d1117] gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#2ea043] transition-colors">
                      <span className="material-symbols-outlined text-base">
                        {event.status === "registered"
                          ? "check_circle"
                          : "add_circle"}
                      </span>
                      <span>
                        {event.status === "registered"
                          ? "Registered"
                          : "Register Now"}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
