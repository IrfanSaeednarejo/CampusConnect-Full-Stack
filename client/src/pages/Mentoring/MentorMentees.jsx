import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectAllSessions, selectMentoringLoading, fetchSessionsThunk } from "../../redux/slices/mentoringSlice";
import MentorTopBar from "../../components/mentoring/MentorTopBar";
import SharedFooter from "../../components/common/SharedFooter";

export default function MentorMentees() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sessions = useSelector(selectAllSessions);
  const loading = useSelector(selectMentoringLoading);

  useEffect(() => {
    dispatch(fetchSessionsThunk());
  }, [dispatch]);

  const mentees = useMemo(() => {
    const menteeMap = {};

    sessions.forEach(session => {
      // Find mentee details
      const menteeObj = session.menteeId || session.student;
      if (!menteeObj || !menteeObj._id) return;

      const mId = menteeObj._id;

      if (!menteeMap[mId]) {
        menteeMap[mId] = {
          id: mId,
          name: menteeObj.profile?.displayName || "Student",
          email: menteeObj.email || "No email",
          image: menteeObj.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${menteeObj.profile?.displayName || "1"}`,
          specialization: menteeObj.academic?.department || "Student",
          sessionsCompleted: 0,
          totalRating: 0,
          ratingCount: 0,
          status: "Inactive", // active if currently has pending/confirmed sessions
        };
      }

      const m = menteeMap[mId];
      if (session.status === "completed") {
        m.sessionsCompleted += 1;
        if (session.reviewId?.rating) {
          m.totalRating += session.reviewId.rating;
          m.ratingCount += 1;
        }
      } else if (session.status === "pending" || session.status === "confirmed") {
        m.status = "Active";
      }
    });

    return Object.values(menteeMap).map(m => ({
      ...m,
      rating: m.ratingCount > 0 ? (m.totalRating / m.ratingCount).toFixed(1) : 0
    }));
  }, [sessions]);

  const activeCount = mentees.filter((m) => m.status === "Active").length;
  const overallRating = mentees.length > 0
    ? (mentees.reduce((sum, m) => sum + parseFloat(m.rating), 0) / mentees.length).toFixed(1)
    : 0;

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-text-primary group/design-root overflow-x-hidden bg-background">
      <div className="layout-container flex h-full grow flex-col">
        {/* TopNavBar */}
        <MentorTopBar backPath="/mentor/dashboard" />

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1">
            {/* Page Heading */}
            <div className="mb-8">
              <h1 className="text-text-primary text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                My Mentees
              </h1>
              <p className="text-text-secondary text-base font-normal leading-normal">
                View and manage all your active and past mentees
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-5 bg-surface border border-border rounded-xl">
                <p className="text-text-secondary text-sm mb-1">Total Mentees</p>
                <p className="text-text-primary text-3xl font-bold">
                  {mentees.length}
                </p>
              </div>
              <div className="p-5 bg-surface border border-border rounded-xl">
                <p className="text-text-secondary text-sm mb-1">Active Mentees</p>
                <p className="text-text-primary text-3xl font-bold">
                  {loading ? "..." : activeCount}
                </p>
              </div>
              <div className="p-5 bg-surface border border-border rounded-xl">
                <p className="text-text-secondary text-sm mb-1">Avg Rating</p>
                <p className="text-text-primary text-3xl font-bold">
                  {loading ? "..." : overallRating > 0 ? `${overallRating}⭐` : "—"}
                </p>
              </div>
            </div>

            {/* Loading/Empty States */}
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-text-secondary">Loading mentees...</p>
              </div>
            ) : mentees.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
                <span className="material-symbols-outlined text-6xl text-text-secondary">
                  school
                </span>
                <div>
                  <p className="text-text-primary text-lg font-bold">No mentees yet</p>
                  <p className="text-text-secondary text-sm">
                    Students will appear here once they book a session with you.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {mentees.map((mentee) => (
                  <div
                    key={mentee.id}
                    className="flex items-center justify-between p-5 bg-surface border border-border rounded-xl hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <img
                        src={mentee.image}
                        alt={mentee.name}
                        className="w-14 h-14 rounded-full border border-border"
                      />
                      <div className="flex-1">
                        <h3 className="text-text-primary font-semibold text-lg capitalize">
                          {mentee.name}
                        </h3>
                        <p className="text-text-secondary text-sm">{mentee.email}</p>
                        <p className="text-text-secondary text-sm capitalize">
                          {mentee.specialization}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 mr-4">
                      <div className="text-center">
                        <p className="text-text-secondary text-sm">Sessions</p>
                        <p className="text-text-primary font-bold">
                          {mentee.sessionsCompleted}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-text-secondary text-sm">Rating</p>
                        <p className="text-yellow-400 font-bold">
                          {mentee.rating > 0 ? `${mentee.rating}⭐` : "—"}
                        </p>
                      </div>
                      <div className="w-20 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${mentee.status === "Active"
                              ? "bg-primary/20 text-primary"
                              : "bg-text-secondary/20 text-text-secondary"
                            }`}
                        >
                          {mentee.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <SharedFooter />
      </div>
    </div>
  );
}
