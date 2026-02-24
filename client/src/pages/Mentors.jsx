import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectAllMentors, setMentors } from "../redux/slices/mentoringSlice";
import SectionHeader from "../components/common/SectionHeader";
import MentorCard from "../components/common/MentorCard";
import CTACard from "../components/common/CTACard";

export default function Mentors() {
  const dispatch = useDispatch();
  const mentors = useSelector(selectAllMentors);

  // Initialize mock mentors data in Redux
  useEffect(() => {
    if (mentors.length === 0) {
      dispatch(setMentors([
        {
          id: 1,
          name: "Dr. Sarah Johnson",
          expertise: "Artificial Intelligence & ML",
          bio: "PhD in Computer Science with 8 years of industry experience.",
          availability: "Weekends",
          students: 12,
        },
        {
          id: 2,
          name: "Prof. Michael Chen",
          expertise: "Web Development",
          bio: "Full-stack developer and tech educator with passion for mentoring.",
          availability: "Evenings",
          students: 18,
        },
        {
          id: 3,
          name: "Emily Rodriguez",
          expertise: "Product Management",
          bio: "Senior PM at tech startup, helping students break into PM roles.",
          availability: "Saturdays",
          students: 9,
        },
        {
          id: 4,
          name: "Alex Kumar",
          expertise: "Data Science",
          bio: "Data scientist with 5+ years in analytics and business intelligence.",
          availability: "Flexible",
          students: 15,
        },
        {
          id: 5,
          name: "Lisa Wang",
          expertise: "Entrepreneurship",
          bio: "Founder of two startups, now mentoring aspiring entrepreneurs.",
          availability: "Weekends",
          students: 11,
        },
        {
          id: 6,
          name: "James Thompson",
          expertise: "Cloud Architecture",
          bio: "AWS Solutions Architect sharing knowledge about cloud technologies.",
          availability: "Evenings",
          students: 13,
        },
      ]));
    }
  }, [dispatch, mentors.length]);

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

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mentors.map((mentor) => (
            <MentorCard
              key={mentor.id}
              name={mentor.name}
              expertise={mentor.expertise}
              bio={mentor.bio}
              availability={mentor.availability}
              students={mentor.students}
            />
          ))}
        </div>

        {/* CTA Section */}
        <CTACard
          title="Become a Mentor"
          description="Share your expertise and help fellow students achieve their goals."
          buttonText="Register as Mentor"
        />
      </div>
    </div>
  );
}
