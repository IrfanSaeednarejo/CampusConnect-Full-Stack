import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-background flex flex-col justify-between p-4 text-text-primary">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 px-2 pt-2">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuByHDKs6VLKKg0tivmOOz9TQ-8vono2ty3KY16w06RsABgFGlPaZBbajp_j7DnJ8M2TWVe9YUs_ziqa5E1inc09THc6UAqVQpNASwI1BAPi-du_2FupZ21f-RAAHcnZdVlgytCuoAILhOCB7Op93usaVvDKvYhPdJDKDxMdnVNYB7gSi_c6jZuNe67pgvBT9L6vc4htdTQ6s4lXm7w6g3jooaDixQvdx8VJwcO2ZUQ0ILQly30bWli-W6oMNM_8tzX6_8haj1KXJUk")',
            }}
          ></div>
          <h1 className="text-white text-lg font-semibold">CampusConnect</h1>
        </div>
        <nav className="flex flex-col gap-2">
          <Link
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors"
            to="/events"
          >
            <span className="material-symbols-outlined text-xl text-text-secondary">
              calendar_month
            </span>
            <span className="text-sm font-medium">Events</span>
          </Link>
          <Link
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors"
            to="/student/notifications"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl text-text-secondary">
                notifications
              </span>
              <span className="text-sm font-medium">Notifications</span>
            </div>
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-primary rounded-full">
              3
            </span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors"
            to="/mentors"
          >
            <span className="material-symbols-outlined text-xl text-text-secondary">
              groups
            </span>
            <span className="text-sm font-medium">Mentors</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors"
            to="/societies"
          >
            <span className="material-symbols-outlined text-xl text-text-secondary">
              diversity_3
            </span>
            <span className="text-sm font-medium">Societies</span>
          </Link>
        </nav>
      </div>

      <div className="flex-grow">
        <hr className="border-t border-[#21262d] my-4" />
        <div className="flex flex-col gap-1 mb-6">
          <h2 className="px-3 text-xs font-semibold uppercase text-text-secondary tracking-wider mb-1">
            Society HQ
          </h2>
          <nav className="flex flex-col gap-1">
            <Link
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-surface-hover transition-colors"
              to="/society/manage"
            >
              <span className="material-symbols-outlined text-lg text-text-secondary">
                article
              </span>
              <span>Content Management</span>
            </Link>
            <div className="flex flex-col">
              <p className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary">
                <span className="material-symbols-outlined text-lg text-text-secondary">
                  group
                </span>
                <span>Manage Members</span>
              </p>
              <div className="flex flex-col mt-1 pl-4 border-l border-[#21262d] ml-4">
                <Link
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-hover transition-colors text-text-secondary hover:text-text-primary"
                  to="/society/member-requests"
                >
                  <span>-</span>
                  <span>Member Requests</span>
                </Link>
                <Link
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-hover transition-colors text-text-secondary hover:text-text-primary"
                  to="/society/profile"
                >
                  <span>-</span>
                  <span>Society Profile</span>
                </Link>
                <Link
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-hover transition-colors text-text-secondary hover:text-text-primary"
                  to="/society/settings"
                >
                  <span>-</span>
                  <span>Society Settings</span>
                </Link>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary">
                <span className="material-symbols-outlined text-lg text-text-secondary">
                  how_to_reg
                </span>
                <span>Event Registrations</span>
              </p>
              <div className="flex flex-col mt-1 pl-4 border-l border-[#21262d] ml-4">
                <Link
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-hover transition-colors text-text-secondary hover:text-text-primary"
                  to="/society/events"
                >
                  <span>-</span>
                  <span>All Events</span>
                </Link>
                <Link
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-hover transition-colors text-text-secondary hover:text-text-primary"
                  to="/society/create"
                >
                  <span>-</span>
                  <span>Create Event</span>
                </Link>
              </div>
            </div>
          </nav>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="px-3 text-xs font-semibold uppercase text-text-secondary tracking-wider mb-1">
            Mentor HQ
          </h2>
          <nav className="flex flex-col gap-1">
            <Link
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-surface-hover transition-colors"
              to="/mentor/dashboard"
            >
              <span className="material-symbols-outlined text-lg text-text-secondary">
                school
              </span>
              <span>Mentor Dashboard</span>
            </Link>
            <div className="flex flex-col">
              <p className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary">
                <span className="material-symbols-outlined text-lg text-text-secondary">
                  person_add
                </span>
                <span>Manage Mentees</span>
              </p>
              <div className="flex flex-col mt-1 pl-4 border-l border-[#21262d] ml-4">
                <Link
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-hover transition-colors text-text-secondary hover:text-text-primary"
                  to="/mentor-mentees"
                >
                  <span>-</span>
                  <span>All Mentees</span>
                </Link>
                <Link
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-hover transition-colors text-text-secondary hover:text-text-primary"
                  to="/mentor-events"
                >
                  <span>-</span>
                  <span>Mentor Events</span>
                </Link>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="flex items-center gap-3 px-3 py-2 text-sm text-text-primary">
                <span className="material-symbols-outlined text-lg text-text-secondary">
                  forum
                </span>
                <span>Mentorship Sessions</span>
              </p>
              <div className="flex flex-col mt-1 pl-4 border-l border-[#21262d] ml-4">
                <Link
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-hover transition-colors text-text-secondary hover:text-text-primary"
                  to="/mentor-sessions"
                >
                  <span>-</span>
                  <span>Mentor Sessions</span>
                </Link>
                <Link
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-hover transition-colors text-text-secondary hover:text-text-primary"
                  to="/my-sessions"
                >
                  <span>-</span>
                  <span>My Sessions</span>
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <hr className="border-t border-[#21262d] my-4" />
        <nav className="flex flex-col gap-1">
          <Link
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors"
            to="/profile/view"
          >
            <span className="material-symbols-outlined text-xl text-text-secondary">
              settings
            </span>
            <span className="text-sm font-medium">Settings</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors"
            to="/logout"
          >
            <span className="material-symbols-outlined text-xl text-text-secondary">
              logout
            </span>
            <span className="text-sm font-medium">Logout</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
