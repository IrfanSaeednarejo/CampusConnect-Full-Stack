import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Avatar from "../../components/common/Avatar";
import {
  selectAllEvents,
  setEvents,
} from "../../redux/slices/eventSlice";
import useHomeTheme from "../../hooks/useHomeTheme";
import { cn, getStudentTheme } from "./studentTheme";

export default function StudentEvents() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filterUpcoming, setFilterUpcoming] = useState(true);
  const isDark = useHomeTheme();
  const theme = getStudentTheme(isDark);

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
      ];
      dispatch(setEvents(mockEvents));
    }
  }, [dispatch, allEvents.length]);

  const filteredEvents = useMemo(
    () =>
      filterUpcoming
        ? allEvents.filter((event) => new Date(event.date) >= new Date())
        : allEvents.filter((event) => new Date(event.date) < new Date()),
    [allEvents, filterUpcoming]
  );

  const upcomingCount = allEvents.filter((event) => new Date(event.date) >= new Date()).length;
  const pastCount = allEvents.filter((event) => new Date(event.date) < new Date()).length;

  return (
    <div className={cn("min-h-screen", theme.page)}>
      <header className={cn("sticky top-0 z-50 border-b backdrop-blur-sm", theme.header)}>
        <div className="flex items-center justify-between px-6 py-3 sm:px-10 lg:px-20">
          <div className="flex items-center gap-8">
            <button onClick={() => navigate("/student/dashboard")} className={theme.navLink}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex items-center gap-4">
              <svg className="size-6 text-[#238636]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
              </svg>
              <h2 className={cn("text-lg font-semibold tracking-[-0.015em]", theme.text)}>CampusNexus</h2>
            </div>
          </div>
          <Avatar
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnPK_XOPkn_xRuJjkJ28yxLKxQIg3E7DdzwpZWAUgeAqsJeg1D0pmo858Xb6Fnx4adCLic40zRTqLsOgB5E6boNvQW2Wu0w08lQ8gAHHahDiL6kDHGnwyILKuDNZcMSbweDjM8qBupJvllgQTJWoxWH6d86ONwwFSFxfNP61cxoz4janxWpttRZcAk3RL0x_QOxMM51XYQYX2b552BqA-0bjn5bBeUsZ_NyXsgVxC2-H7bNrQwoisuCAVm2GoW5vct4koHXzgMiuI"
            size="10"
            hover={true}
          />
        </div>
      </header>

      <main className="flex flex-1 justify-center px-4 py-6 sm:px-10 md:py-10 lg:px-20">
        <div className="layout-content-container flex w-full max-w-6xl flex-col">
          <section className={cn("rounded-[28px] border p-6 sm:p-8", theme.hero)}>
            <div className="mb-8">
              <h1 className={cn("text-3xl font-bold sm:text-4xl", theme.text)}>All Events</h1>
              <p className={cn("mt-2 text-base", theme.muted)}>Discover and register for events</p>
            </div>

            <div className={cn("mb-8 rounded-[24px] border p-4", theme.card)}>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setFilterUpcoming(true)}
                  className={cn(
                    "rounded-2xl border px-4 py-2 text-sm font-medium transition-colors",
                    filterUpcoming ? theme.tabActive : theme.tabInactive
                  )}
                >
                  Upcoming ({upcomingCount})
                </button>
                <button
                  onClick={() => setFilterUpcoming(false)}
                  className={cn(
                    "rounded-2xl border px-4 py-2 text-sm font-medium transition-colors",
                    !filterUpcoming ? theme.tabActive : theme.tabInactive
                  )}
                >
                  Past ({pastCount})
                </button>
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className={cn("rounded-[24px] border p-12 text-center", theme.card)}>
                <span className={cn("material-symbols-outlined mb-4 block text-5xl", theme.muted)}>event_busy</span>
                <p className={cn("mb-2 font-semibold", theme.text)}>No events found</p>
                <p className={cn("text-sm", theme.muted)}>
                  There are no {filterUpcoming ? "upcoming" : "past"} events at the moment
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event) => (
                  <div key={event.id} className={cn("group overflow-hidden rounded-[24px] border transition-colors", theme.card)}>
                    <div className={cn("relative h-48 w-full overflow-hidden", isDark ? "bg-[#0d1117]" : "bg-slate-100")}>
                      <div
                        className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundImage: `url("${event.image}")` }}
                      />
                      <div className="absolute right-4 top-4">
                        <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", event.status === "registered" ? theme.badge : theme.badgeMuted)}>
                          {event.status === "registered" ? "Registered" : "Available"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 p-4">
                      <div>
                        <p className={cn("text-sm font-medium", theme.muted)}>{event.society}</p>
                        <h3 className={cn("text-lg font-medium leading-tight", theme.text)}>{event.title}</h3>
                      </div>
                      <p className={cn("line-clamp-2 text-sm", theme.muted)}>{event.description}</p>

                      <div className={cn("space-y-2 border-y py-3", theme.divider)}>
                        <div className={cn("flex items-center gap-2 text-sm", theme.muted)}>
                          <span className="material-symbols-outlined text-base">calendar_month</span>
                          <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                        </div>
                        <div className={cn("flex items-center gap-2 text-sm", theme.muted)}>
                          <span className="material-symbols-outlined text-base">location_on</span>
                          <span>{event.location}</span>
                        </div>
                        <div className={cn("flex items-center gap-2 text-sm", theme.muted)}>
                          <span className="material-symbols-outlined text-base">group</span>
                          <span>{event.capacity}</span>
                        </div>
                      </div>

                      <button className={cn("flex h-10 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold", theme.primaryButton)}>
                        <span className="material-symbols-outlined text-base">
                          {event.status === "registered" ? "check_circle" : "add_circle"}
                        </span>
                        <span>{event.status === "registered" ? "Registered" : "Register Now"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
