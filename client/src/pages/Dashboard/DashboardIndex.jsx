// Dashboard.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUserProfile } from "../../redux/slices/userSlice";
import { selectUpcomingEvents, setUpcomingEvents } from "../../redux/slices/eventSlice";
import { selectRecentActivity, setRecentActivity } from "../../redux/slices/dashboardSlice";
import Sidebar from "../../components/layout/Sidebar.jsx"; // unified shared Sidebar
import Button from "../../components/common/Button";
import Avatar from "../../components/common/Avatar";

const DashboardIndex = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux selectors
  const profile = useSelector(selectUserProfile);
  const upcomingEvents = useSelector(selectUpcomingEvents);
  const recentActivity = useSelector(selectRecentActivity);

  // Fetch real data from backend
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { default: api } = await import("../../api/axios");
        const res = await api.get("/competitions", { params: { limit: 3 } });
        const data = res.data?.data?.docs || res.data?.data || [];
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(e => ({
            id: e._id,
            title: e.title,
            date: e.startAt ? new Date(e.startAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "TBD"
          }));
          dispatch(setUpcomingEvents(mapped));
        }
      } catch (err) {
        console.error("[DashboardIndex] Failed to fetch events:", err);
      }
    };
    loadEvents();
    // Activity feed — no backend API exists yet, so we show empty state
    if (recentActivity.length === 0) {
      dispatch(setRecentActivity([]));
    }
  }, [dispatch, recentActivity.length]);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border-dark bg-surface-dark/80 backdrop-blur-sm lg:hidden">
        <div className="container mx-auto flex items-center justify-between whitespace-nowrap px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-4 text-text-primary-dark cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="size-6 text-primary">
                <svg
                  fill="none"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 6H42L36 24L42 42H6L12 24L6 6Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2 className="text-text-primary-dark text-lg font-bold tracking-[-0.015em]">
                CampusConnect
              </h2>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-4">
            <button className="flex max-w-lg cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 border border-border-dark bg-surface-dark text-text-primary-dark hover:bg-border-dark text-sm font-bold px-2.5">
              <span className="material-symbols-outlined text-xl">
                notifications
              </span>
            </button>
            <div
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/profile/view")}
            >
              <Avatar
                src={profile?.picture || "/default-avatar.png"}
                size="10"
                border={true}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar profile={profile} />

        {/* Dashboard Content */}
        <div className="flex flex-col flex-1">
          {/* Desktop Header */}
          <header className="sticky top-0 z-50 w-full border-b border-border-dark bg-surface-dark/80 backdrop-blur-sm hidden lg:block bg-black text-white">
            <div className="container mx-auto flex items-center justify-end whitespace-nowrap px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex flex-1 items-center justify-end gap-4">
                <label className="hidden flex-col min-w-40 !h-10 max-w-64 sm:flex">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                    <div className="text-white flex border border-border-dark bg-black items-center justify-center pl-3 rounded-l-lg border-r-0">
                      <span className="material-symbols-outlined text-xl">
                        search
                      </span>
                    </div>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary-dark focus:outline-0 focus:ring-1 focus:ring-primary border border-border-dark bg-background-dark h-full placeholder:text-text-secondary-dark px-2 rounded-l-none border-l-0 text-sm font-normal leading-normal"
                      placeholder="Search..."
                    />
                  </div>
                </label>
                <button className="flex max-w-lg cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 border border-border-dark bg-surface-dark text-text-primary-dark hover:bg-border-dark text-sm font-bold px-2.5">
                  <span className="material-symbols-outlined text-xl">
                    notifications
                  </span>
                </button>
                <div
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate("/profile/view")}
                >
                  <Avatar
                    src={profile?.picture || "/default-avatar.png"}
                    size="10"
                    border={true}
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Main Dashboard Section */}
          <main className="layout-container flex h-full grow flex-col bg-black text-white">
            <div className="container mx-auto flex flex-1 justify-center px-4 py-8 sm:px-6 lg:px-8">
              <div className="layout-content-container flex w-full flex-col max-w-7xl flex-1">
                {/* Welcome */}
                <div className="mb-8">
                  <p className="text-text-primary-dark text-4xl font-black leading-tight tracking-[-0.033em]">
                    Welcome back, {profile?.name || "User"}!
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Left Column */}
                  <div className="flex flex-col gap-6 lg:col-span-2">
                    {/* Upcoming Events */}
                    <div className="flex flex-col rounded-lg border bg-gray-900 bg-surface-dark">
                      <div className="border-b border-border-dark px-4 pb-3 pt-5 sm:px-6">
                        <h2 className="text-text-primary-dark text-[22px] font-bold leading-tight tracking-[-0.015em]">
                          Upcoming Events
                        </h2>
                      </div>
                      <div className="flex flex-col divide-y divide-border-dark">
                        {upcomingEvents.slice(0, 3).map((event) => (
                          <EventItem key={event.id} title={event.title} date={event.date} />
                        ))}
                      </div>
                    </div>

                    {/* My Mentoring */}
                    <div className="flex flex-col rounded-lg border border-border-dark bg-surface-dark bg-gray-900">
                      <div className="border-b border-border-dark px-4 pb-3 pt-5 sm:px-6">
                        <h2 className="text-text-primary-dark text-[22px] font-bold leading-tight tracking-[-0.015em]">
                          My Mentoring
                        </h2>
                      </div>
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col items-center gap-3 rounded-lg border border-border-dark bg-black p-6 text-center">
                          <span className="material-symbols-outlined text-4xl text-text-secondary-dark">school</span>
                          <p className="text-text-secondary-dark text-sm">
                            No mentoring sessions scheduled. Find a mentor to get started!
                          </p>
                          <Button
                            variant="secondary"
                            className="mt-2 h-auto py-2 text-sm"
                            onClick={() => navigate("/mentors")}
                          >
                            Find a Mentor
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 rounded-lg border border-border-dark bg-surface-dark p-4 sm:p-6">
                      <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg h-10 bg-green-600 text-white text-sm font-bold hover:bg-green-800">
                        <span className="material-symbols-outlined text-xl">
                          add_circle
                        </span>
                        <span>Create Event</span>
                      </button>
                      <Button
                        variant="secondary"
                        className="w-full gap-2"
                      >
                        <span className="material-symbols-outlined text-xl">
                          person_search
                        </span>
                        <span>Find a Mentor</span>
                      </Button>
                    </div>
                    <RecentActivity activities={recentActivity} />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// Event Item Component
const EventItem = ({ title, date }) => (
  <div className="flex items-center gap-4 px-4 min-h-[72px] py-3 justify-between sm:px-6">
    <div className="flex flex-1 items-center gap-4 overflow-hidden">
      <div className="text-text-primary-dark flex items-center justify-center rounded-lg bg-border-dark shrink-0 size-12">
        <span className="material-symbols-outlined">event</span>
      </div>
      <div className="flex flex-col justify-center overflow-hidden">
        <p className="text-text-primary-dark text-base font-medium leading-normal truncate">
          {title}
        </p>
        <p className="text-text-secondary-dark text-sm font-normal leading-normal truncate">
          {date}
        </p>
      </div>
    </div>
    <button className="text-sm font-medium leading-normal text-green-600 hover:underline shrink-0">
      View Details
    </button>
  </div>
);

// Recent Activity Component
const RecentActivity = ({ activities = [] }) => (
  <div className="flex flex-col rounded-lg border border-border-dark bg-surface-dark">
    <div className="border-b border-border-dark px-4 pb-3 pt-5 sm:px-6">
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
        Recent Activity
      </h3>
    </div>
    <div className="flex flex-col divide-y divide-border-dark">
      {activities.map((activity) => (
        <ActivityItem
          key={activity.id}
          img={activity.img}
          icon={activity.icon}
          text={activity.text}
          time={activity.time}
        />
      ))}
    </div>
  </div>
);

const ActivityItem = ({ img, icon, text, time }) => (
  <div className="flex items-start gap-4 p-4 sm:p-6">
    {img ? (
      <Avatar
        src={img}
        size="8"
        className="shrink-0 mt-1"
      />
    ) : (
      <div className="text-text-primary-dark flex items-center justify-center rounded-full bg-border-dark size-8 shrink-0 mt-1">
        <span className="material-symbols-outlined text-lg">{icon}</span>
      </div>
    )}
    <div className="flex flex-col">
      <p className="text-sm text-text-primary-dark">{text}</p>
      <p className="text-xs text-text-secondary-dark">{time}</p>
    </div>
  </div>
);

export default DashboardIndex;
