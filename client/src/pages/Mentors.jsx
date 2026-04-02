import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAllMentors } from "../api/mentoringApi";
import SectionHeader from "../components/common/SectionHeader";
import MentorCard from "../components/common/MentorCard";
import CTACard from "../components/common/CTACard";
import LoginPromptModal from "../components/modals/LoginPromptModal";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useNotification } from "../contexts/NotificationContext";

export default function Mentors() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const { addNotification } = useNotification();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      try {
        const res = await getAllMentors();
        const items = res.data?.docs || res.data || [];
        setMentors(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error("Failed to load mentors:", err);
        setMentors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const handleRequestMentorship = (mentorId) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    addNotification({
      type: 'success',
      title: 'Request Sent',
      message: `Mentorship request sent successfully!`,
    });
  };

  const handleBecomeMentor = () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('postLoginRedirect', '/mentor-registration');
      setShowLoginModal(true);
      return;
    }
    if (role === 'mentor') {
      addNotification({
        type: 'info',
        title: 'Already a Mentor',
        message: 'You are already registered as a mentor. Visit your mentor dashboard to manage sessions.',
      });
      navigate('/mentor/dashboard');
      return;
    }
    navigate("/mentor-registration");
  };

  return (
    <div className="w-full bg-background text-[#e6edf3] min-h-screen py-10 px-4 sm:px-10 md:px-20 lg:px-40">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <SectionHeader
            title="Find a Mentor"
            subtitle="Connect with experienced mentors who can guide you through your academic and career journey."
            align="left"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-text-secondary">Loading mentors...</p>
          </div>
        ) : mentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mentors.map((mentor) => {
              const mId = mentor._id || mentor.id;
              const name = mentor.user?.profile?.displayName || mentor.name || "Mentor";
              const expertise = mentor.expertise?.join(", ") || mentor.specialization || "";
              const bio = mentor.bio || mentor.user?.profile?.bio || "";
              const availability = mentor.isAvailable ? "Available" : "Busy";
              const students = mentor.stats?.totalMentees || 0;

              return (
                <MentorCard
                  key={mId}
                  name={name}
                  expertise={expertise}
                  bio={bio}
                  availability={availability}
                  students={students}
                  onRequest={() => handleRequestMentorship(mId)}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
            <span className="material-symbols-outlined text-6xl text-text-secondary">
              people
            </span>
            <div>
              <p className="text-white text-lg font-bold">No mentors available yet</p>
              <p className="text-text-secondary text-sm">
                Be the first to register as a mentor and help fellow students!
              </p>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <CTACard
          title="Become a Mentor"
          description="Share your expertise and help fellow students achieve their goals."
          buttonText="Register as Mentor"
          onButtonClick={handleBecomeMentor}
        />
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Please log in or create an account to request mentorship or become a mentor."
      />
    </div>
  );
}
