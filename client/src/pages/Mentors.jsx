import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectAllMentors, fetchMentors, selectMentoringLoading } from "../redux/slices/mentoringSlice";
import SectionHeader from "../components/common/SectionHeader";
import MentorCard from "../components/common/MentorCard";
import CTACard from "../components/common/CTACard";

export default function Mentors() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const mentors = useSelector(selectAllMentors) || [];
  const loading = useSelector(selectMentoringLoading);

  useEffect(() => {
    dispatch(fetchMentors({ limit: 12 }));
  }, [dispatch]);

  return (
    <div className="w-full bg-[#0d1117] text-[#e6edf3] min-h-screen py-10 px-4 sm:px-10 md:px-20 lg:px-40">
      <div className="max-w-[960px] mx-auto">
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
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-4 border-[#3fb950] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#8b949e]">Loading mentors...</p>
          </div>
        ) : mentors.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <span className="material-symbols-outlined text-4xl text-[#3d444d]">school</span>
            <p className="text-[#8b949e]">No mentors available at the moment.</p>
          </div>
        ) : (
          /* Mentors Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor._id}
                mentor={mentor}
              />
            ))}
          </div>
        )}

        {/* CTA Section */}
        <CTACard
          title="Become a Mentor"
          description="Share your expertise and help fellow students achieve their goals."
          buttonText="Register as Mentor"
          onButtonClick={() => navigate("/mentor/register")}
        />
      </div>
    </div>
  );
}
