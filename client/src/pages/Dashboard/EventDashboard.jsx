import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import EventCard from "@/components/dashboard/EventCard";
import useHomeTheme from "@/hooks/useHomeTheme";
import { selectAllEvents, setEvents } from "@/redux/slices/eventSlice";

const FILTER_CATEGORIES = [
  { id: "all", label: "All Categories", icon: "label" },
  { id: "tech", label: "Tech & AI", icon: "computer" },
  { id: "academic", label: "Academic", icon: "school" },
  { id: "social", label: "Social", icon: "diversity_1" },
  { id: "culture", label: "Culture & Arts", icon: "explore" },
  { id: "career", label: "Career", icon: "work" },
];

const DATE_FILTERS = [
  { id: "today", label: "Today", icon: "calendar_month" },
  { id: "week", label: "This Week", icon: "calendar_view_week" },
  { id: "month", label: "This Month", icon: "calendar_view_month" },
];

export default function EventDashboard() {
  const dispatch = useDispatch();
  const events = useSelector(selectAllEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("upcoming");
  const isDark = useHomeTheme();

  useEffect(() => {
    if (events.length === 0) {
      dispatch(
        setEvents([
          {
            id: 1,
            section: "Featured & Trending",
            title: "AI & The Future of Tech: Generative AI Workshop",
            date: "Mon, 25 Nov, 6:00 PM",
            location: "Engineering Auditorium",
            society: "Computer Science Society",
            tags: ["Workshop", "Tech Deep Dive"],
            status: "Upcoming",
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDrjljiB3MeGaAU52O_VmJSVPp-PcOByGONtGUpXAZ154nIc3xgs7JamxXzKtM-plWnXznk6zEjX4f7wyRiou4rkVauBqr42vHGOkCrDLZHaefUYF2eneeEwzBrlX00n9NG30k8JZBGPVgdFASm0c2U9WGrXSnjKYfqxT4XRkglG_vFeYlK_eMo2ab61FnL-bQWIWXVfgJO2VzJ-CqWwJHshWqkcSVPhSigoomOlywaVkRQmZKP52ZkewwyO1f2ReXvTx4tcrSqQJw",
          },
          {
            id: 2,
            section: "Featured & Trending",
            title: "Startup Career Fair",
            date: "Tue, 26 Nov, 10:00 AM",
            location: "University Grand Hall",
            society: "Career Services",
            tags: ["Career Fair", "Networking"],
            status: "Upcoming",
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuAyQrkgtMINMocZMv-anp4ZeiHwuQPFSsIEVRot8L2rJk1sqRNixSJE0GJUElxFoMD2eecy2w3Va6JfQ1BYRwcIbmEJG1aptSfxN422ZrcqTlCbikOdpZHv1XroG528xHiVoyapQjBm-gZ-5H0sRHum477Bpe0NtwiNoepTzyOgqgyZTtMB5kpAZa7RTGpNgt7sn4Pmmkkyex2xccCmXQYu9mOCmcsqa7-1fFeaxIYDP6yE9gsp6vttF6Nr4Z1WwZfSt9bFNXSwI6w",
          },
          {
            id: 3,
            section: "Academic Workshops",
            title: "Effective Study Techniques",
            date: "Wed, 27 Nov, 3:00 PM",
            location: "Main Library",
            society: "Academic Success Center",
            tags: ["Study Skills", "Workshop"],
            status: "Upcoming",
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuBFzf-LRap3JmkXZvUyWXTN1_wNoFDFYvua_jKaph3KtmTzHfiO8AD4BVsT-AuW0ZW2yW_zc3d2tRyMACpFMW5LTMnORGL-DdXetHJRES_3pSje2oRF4T91daYCNXsj4c0VjK1dWhuWFPdCaCKSD7IQxHI2RxdZWnHGeJeZ6mxSydx7wbP8gGgAJF2mPCImEnI7CdD7MPjy8CLP9GE0RO1vtyL12_JPEADLRZSEcMNxmChnARmISkmlvPQjGysN0KL7LWGEbCSZUc0",
          },
          {
            id: 4,
            section: "Academic Workshops",
            title: "Intro to Bioinformatics",
            date: "Fri, 15 Nov, 1:00 PM",
            location: "Biology Lab 203",
            society: "Bio-Tech Society",
            tags: ["Science", "Lab Session"],
            status: "Past",
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuCh56drwKgf3KnRttM2GAP8oRC6qq-ktrWR148SCmSKO3ryZL6PvYCKEdMe7t1JEc_x0T4kGJAI1ujC6Fw9nnAm78jcjmG3CTmaYRc5p7eiZoPgPgKPz20lfvU2u_OfUEYbjX8wtJgpuHRuMUsu37Q8sFQnl8Xtphcz4JV06Mt-gZf5kRmCPz4JJWMA5D46OoAvnWJLJYZLv58RFFO_FWV8fEG9UGYGm27FiNmVWAv5ZfJUaz5Of7SFZesFv1YprbY8jc-WzwqwAGQ",
          },
          {
            id: 5,
            section: "Academic Workshops",
            title: "Research Presentation Skills",
            date: "Thu, 28 Nov, 2:00 PM",
            location: "Graduate Lounge",
            society: "Research Department",
            tags: ["Presentation", "Seminar"],
            status: "Upcoming",
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuAtbvuwTbYhlCKY-A6eCEVUQjLfABJ0uEAnNx94-ezIeEJegFkYkiJgb1KtYD5TCxu4RjxyBuslMnLrOw-mTRgUKH9n_rgxBttRkoqyxWfMVfI78W8h3tDyIFOVhL5Kg0YatJlk78wgVY4VDUXwGMhyeY6XSZDpT_aJkbe_ibPcPtF-lOoneGauU8qyLLAGg3Y-WRhbCRaP9OGvS0UBWon2I09VnRu_MDJANQuGrSWEBcDPqOZ8uoZbCLM8WF6H5U6dqPk_GbqW5RM",
          },
          {
            id: 6,
            section: "Social & Cultural Events",
            title: "Campus Music Festival",
            date: "Sat, 30 Nov, 7:00 PM",
            location: "Campus Green",
            society: "Student Union",
            tags: ["Music", "Festival"],
            status: "Upcoming",
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuCy1nPWma5_2g0kEGQfBe_IltD40mKPoIaWItMuM1SJt_Gu5lDTiCZlGE4wXy0heGdk62mgns0UZcVXpNQYqyvtPyDgO5qgo2r6NrWxwxx-QG3cFAFJ6C-LXp8gSutPrUOybp--BTnyJtp4ixRQiEtMfAkUPfN99vLndsZkh6-HS85QFtIYDmp63MowAMfHJTjP0ifkl53uYxCR24cTEpd7MwefAo1dKbmzsSQ8TJYBH4SAu4lnFkjRaLz6FMCRXTLZ_8JpIb0z9tA",
          },
          {
            id: 7,
            section: "Social & Cultural Events",
            title: "International Food Fair",
            date: "Fri, 08 Nov, 12:00 PM",
            location: "University Square",
            society: "International Student Office",
            tags: ["Food", "Culture"],
            status: "Past",
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDOAYx2iBKIOtsgItxTljlZlNhGedpzg_gWcRwO3xhsB8BH1uSFDOpA8IsHd1gXubAb4yCDTS0uzHeGRp1v6y-yYrHbQeUKqQXGJI6ZxL8vGlxAtEuYAs35DmZ2HUmxRNkW5ABTbsKPWgNe94iR5CEQZQYj7Zug53gTdPKjfib3jBLyP6Xw01F_3o8vhJAIOBJaXA3yV81f6knw1JfUY2S2MyxVkVi1HeflvCc2tnUPz5Yh3KP93yij-oTFzpW1oS05XZRIAhPB8Gc",
          },
        ])
      );
    }
  }, [dispatch, events.length]);

  const groupedEvents = useMemo(() => {
    const grouped = {};
    events.forEach((event) => {
      if (!grouped[event.section]) {
        grouped[event.section] = [];
      }
      grouped[event.section].push(event);
    });
    return grouped;
  }, [events]);

  const pageClassName = isDark
    ? "bg-[#0d1117] text-[#e6edf3]"
    : "bg-[#f8fafc] text-[#0f172a]";
  const surfaceClassName = isDark
    ? "border-[#30363d] bg-[#161b22]"
    : "border-[#dbe4ee] bg-white";
  const subtleSurfaceClassName = isDark
    ? "border-[#30363d] bg-[#0d1117]"
    : "border-[#e2e8f0] bg-[#f8fafc]";
  const mutedTextClassName = isDark ? "text-[#8b949e]" : "text-[#64748b]";
  const titleClassName = isDark ? "text-[#e6edf3]" : "text-[#0f172a]";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageClassName}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:px-8 lg:py-8">
        <aside className="w-full lg:sticky lg:top-8 lg:w-[280px] lg:shrink-0">
          <div
            className={`rounded-[28px] border p-5 sm:p-6 ${surfaceClassName}`}
            style={{
              boxShadow: isDark
                ? "0 24px 60px rgba(0,0,0,0.22)"
                : "0 24px 60px rgba(15,23,42,0.08)",
            }}
          >
            <div className="mb-5">
              <h2 className={`text-xl font-semibold ${titleClassName}`}>Event Navigator</h2>
              <p className={`mt-1 text-sm ${mutedTextClassName}`}>
                Browse upcoming and past events from one organized panel.
              </p>
            </div>

            <div className={`relative mb-5 rounded-2xl border px-3 ${subtleSurfaceClassName}`}>
              <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base ${mutedTextClassName}`}>
                search
              </span>
              <input
                className={`h-11 w-full bg-transparent pl-7 pr-2 text-sm outline-none ${
                  isDark
                    ? "text-[#e6edf3] placeholder:text-[#8b949e]"
                    : "text-[#0f172a] placeholder:text-[#64748b]"
                }`}
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <FilterSection title="Status" isDark={isDark}>
              {["Upcoming Events", "Past Events"].map((filter, idx) => {
                const isActive =
                  (idx === 0 && activeFilter === "upcoming") || (idx === 1 && activeFilter === "past");

                return (
                  <div
                    key={filter}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? isDark
                          ? "bg-[#21262d] text-[#e6edf3]"
                          : "bg-[#eff6ff] text-[#1d4ed8]"
                        : isDark
                          ? "text-[#8b949e] hover:bg-[#0d1117] hover:text-[#e6edf3]"
                          : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                    }`}
                    onClick={() => setActiveFilter(idx === 0 ? "upcoming" : "past")}
                  >
                    <span className="material-symbols-outlined text-base">
                      {idx === 0 ? "event_upcoming" : "history"}
                    </span>
                    <span>{filter}</span>
                  </div>
                );
              })}
            </FilterSection>

            <FilterSection title="Categories" isDark={isDark}>
              {FILTER_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    isDark
                      ? "text-[#8b949e] hover:bg-[#0d1117] hover:text-[#e6edf3]"
                      : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{cat.icon}</span>
                  <span>{cat.label}</span>
                </div>
              ))}
            </FilterSection>

            <FilterSection title="Date" isDark={isDark}>
              {DATE_FILTERS.map((date) => (
                <div
                  key={date.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    isDark
                      ? "text-[#8b949e] hover:bg-[#0d1117] hover:text-[#e6edf3]"
                      : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{date.icon}</span>
                  <span>{date.label}</span>
                </div>
              ))}
            </FilterSection>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <section
            className={`rounded-[28px] border p-6 sm:p-8 ${surfaceClassName}`}
            style={{
              boxShadow: isDark
                ? "0 24px 60px rgba(0,0,0,0.22)"
                : "0 24px 60px rgba(15,23,42,0.08)",
            }}
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] ${
                    isDark
                      ? "border-[#30363d] bg-[#0d1117] text-[#58a6ff]"
                      : "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]"
                  }`}
                >
                  EVENT DISCOVERY
                </span>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${subtleSurfaceClassName} ${mutedTextClassName}`}
                >
                  Campus-wide activity
                </span>
              </div>

              <div className="space-y-2">
                <h1 className={`text-3xl font-bold tracking-tight ${titleClassName}`}>Explore Campus Events</h1>
                <p className={`max-w-3xl text-sm leading-6 sm:text-base ${mutedTextClassName}`}>
                  Discover workshops, career fairs, and social gatherings happening across campus with a cleaner,
                  easier-to-scan event layout.
                </p>
              </div>
            </div>
          </section>

          <div className="mt-6 flex flex-col gap-6">
            {Object.entries(groupedEvents).map(([section, sectionEvents]) => (
              <section
                key={section}
                className={`rounded-[28px] border p-5 sm:p-6 ${surfaceClassName}`}
                style={{
                  boxShadow: isDark
                    ? "0 20px 50px rgba(0,0,0,0.2)"
                    : "0 20px 50px rgba(15,23,42,0.06)",
                }}
              >
                <div className={`mb-5 border-b pb-4 ${isDark ? "border-[#30363d]" : "border-[#e2e8f0]"}`}>
                  <h2 className={`text-2xl font-semibold ${titleClassName}`}>{section}</h2>
                </div>
                <div className="flex flex-col gap-4">
                  {sectionEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            ))}

            <div
              className={`flex flex-col items-center justify-center gap-3 rounded-[28px] border py-14 text-center ${surfaceClassName}`}
              style={{
                boxShadow: isDark
                  ? "0 20px 50px rgba(0,0,0,0.2)"
                  : "0 20px 50px rgba(15,23,42,0.06)",
              }}
            >
              <span className={`material-symbols-outlined text-5xl ${mutedTextClassName}`}>event_busy</span>
              <p className={`text-base font-medium ${titleClassName}`}>No more events to display.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function FilterSection({ title, children, isDark }) {
  return (
    <div className={`mt-5 border-t pt-5 ${isDark ? "border-[#30363d]" : "border-[#e2e8f0]"}`}>
      <h3 className={isDark ? "mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b949e]" : "mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#64748b]"}>
        {title}
      </h3>
      <nav className="flex flex-col gap-1">{children}</nav>
    </div>
  );
}
