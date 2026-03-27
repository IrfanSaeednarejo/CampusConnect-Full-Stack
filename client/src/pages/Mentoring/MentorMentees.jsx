import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectMentees, setMentees } from "../../redux/slices/mentoringSlice";
import MentorTopBar from "../../components/mentoring/MentorTopBar";

export default function MentorMentees() {
  const dispatch = useDispatch();
  const mentees = useSelector(selectMentees);

  useEffect(() => {
    if (mentees.length === 0) {
      dispatch(setMentees([
        {
          id: 1,
          name: "John Doe",
          email: "john@university.edu",
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
          specialization: "Web Development",
          sessionsCompleted: 5,
          rating: 4.9,
          status: "Active",
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@university.edu",
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
          specialization: "React Development",
          sessionsCompleted: 3,
          rating: 4.8,
          status: "Active",
        },
        {
          id: 3,
          name: "Alex Johnson",
          email: "alex@university.edu",
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
          specialization: "JavaScript",
          sessionsCompleted: 2,
          rating: 4.7,
          status: "Inactive",
        },
      ]));
    }
  }, [dispatch, mentees.length]);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-[#c9d1d9] group/design-root overflow-x-hidden bg-[#112118]">
      <div className="layout-container flex h-full grow flex-col">
        {/* TopNavBar */}
        <MentorTopBar backPath="/mentor/dashboard" />

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1">
            {/* Page Heading */}
            <div className="mb-8">
              <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                My Mentees
              </h1>
              <p className="text-[#9eb7a9] text-base font-normal leading-normal">
                View and manage all your active and past mentees
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-xl">
                <p className="text-[#9eb7a9] text-sm mb-1">Total Mentees</p>
                <p className="text-white text-3xl font-bold">
                  {mentees.length}
                </p>
              </div>
              <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-xl">
                <p className="text-[#9eb7a9] text-sm mb-1">Active Mentees</p>
                <p className="text-white text-3xl font-bold">
                  {mentees.filter((m) => m.status === "Active").length}
                </p>
              </div>
              <div className="p-5 bg-[#161b22] border border-[#30363d] rounded-xl">
                <p className="text-[#9eb7a9] text-sm mb-1">Avg Rating</p>
                <p className="text-white text-3xl font-bold">4.8⭐</p>
              </div>
            </div>

            {/* Mentees Table */}
            <div className="flex flex-col gap-4">
              {mentees.map((mentee) => (
                <div
                  key={mentee.id}
                  className="flex items-center justify-between p-5 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-[#1dc964] transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={mentee.image}
                      alt={mentee.name}
                      className="w-14 h-14 rounded-full border border-[#30363d]"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">
                        {mentee.name}
                      </h3>
                      <p className="text-[#9eb7a9] text-sm">{mentee.email}</p>
                      <p className="text-[#9eb7a9] text-sm">
                        {mentee.specialization}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 mr-4">
                    <div className="text-center">
                      <p className="text-[#9eb7a9] text-sm">Sessions</p>
                      <p className="text-white font-bold">
                        {mentee.sessionsCompleted}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[#9eb7a9] text-sm">Rating</p>
                      <p className="text-yellow-400 font-bold">
                        {mentee.rating}⭐
                      </p>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          mentee.status === "Active"
                            ? "bg-[#1dc964]/20 text-[#1dc964]"
                            : "bg-[#9eb7a9]/20 text-[#9eb7a9]"
                        }`}
                      >
                        {mentee.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
