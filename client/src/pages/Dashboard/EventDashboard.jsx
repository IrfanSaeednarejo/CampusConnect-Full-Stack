import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import EventCard from "@/components/dashboard/EventCard";
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

  return (
    <div className="relative flex min-h-screen bg-[#0D1117]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0D1117] border-r border-[#30363D] p-4 flex flex-col hidden lg:flex">
        <h2 className="text-xl font-bold text-[#E6EDF3] mb-6 mt-4">
          CampusConnect
        </h2>
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative mb-4">
            <input
              className="w-full rounded-md border border-[#30363D] bg-[#161B22] py-2 pl-9 pr-3 text-sm text-[#E6EDF3] placeholder-[#8B949E] focus:border-[#238636] focus:outline-none focus:ring-0 transition"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[#8B949E] text-base">
              search
            </span>
          </div>

          {/* Filters Section */}
          <h3 className="text-xs font-semibold uppercase text-[#8B949E] mb-2">
            Filters
          </h3>
          <nav className="flex flex-col gap-1">
            {["Upcoming Events", "Past Events"].map((filter, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-x-2 py-2 px-3 rounded-md text-sm cursor-pointer transition-colors duration-200 ${
                  (idx === 0 && activeFilter === "upcoming") ||
                  (idx === 1 && activeFilter === "past")
                    ? "bg-[#2E7C3E] text-white font-semibold"
                    : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]"
                }`}
                onClick={() => setActiveFilter(idx === 0 ? "upcoming" : "past")}
              >
                <span className="material-symbols-outlined text-base">
                  {idx === 0 ? "event_upcoming" : "history"}
                </span>
                <span>{filter}</span>
              </div>
            ))}
          </nav>

          <div className="border-t border-[#30363D] my-2"></div>

          {/* Categories */}
          <h3 className="text-xs font-semibold uppercase text-[#8B949E] mb-2">
            Categories
          </h3>
          <nav className="flex flex-col gap-1">
            {FILTER_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-x-2 py-2 px-3 rounded-md text-sm cursor-pointer text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22] transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-base">
                  {cat.icon}
                </span>
                <span>{cat.label}</span>
              </div>
            ))}
          </nav>

          <div className="border-t border-[#30363D] my-2"></div>

          {/* Date Filters */}
          <h3 className="text-xs font-semibold uppercase text-[#8B949E] mb-2">
            Date
          </h3>
          <nav className="flex flex-col gap-1">
            {DATE_FILTERS.map((date) => (
              <div
                key={date.id}
                className="flex items-center gap-x-2 py-2 px-3 rounded-md text-sm cursor-pointer text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22] transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-base">
                  {date.icon}
                </span>
                <span>{date.label}</span>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#E6EDF3] mb-2">
            Explore Campus Events
          </h1>
          <p className="text-[#8B949E] mb-8">
            Discover and manage events happening on campus.
          </p>

          <div className="flex flex-col gap-6">
            {Object.entries(groupedEvents).map(([section, sectionEvents]) => (
              <section key={section}>
                <h2 className="text-2xl font-bold text-[#E6EDF3] mb-4 pb-2 border-b border-[#30363D]">
                  {section}
                </h2>
                <div className="flex flex-col gap-4">
                  {sectionEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            ))}

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-[#30363D] bg-[#161B22] py-16 text-center mt-8">
              <span className="material-symbols-outlined text-5xl text-[#8B949E]">
                event_busy
              </span>
              <p className="text-base font-medium text-[#8B949E]">
                No more events to display.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
