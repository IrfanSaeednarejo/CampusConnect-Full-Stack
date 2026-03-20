import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectAllSocieties, setSocieties } from "../redux/slices/societySlice";
import SectionHeader from "../components/common/SectionHeader";
import SocietyCardSimple from "../components/common/SocietyCardSimple";
import CTACard from "../components/common/CTACard";

export default function Societies() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const societies = useSelector(selectAllSocieties);

  // Initialize mock societies data in Redux
  useEffect(() => {
    if (societies.length === 0) {
      dispatch(setSocieties([
        {
          id: 1,
          name: "Tech Club",
          category: "Technology",
          members: 245,
          description:
            "For students passionate about technology, coding, and innovation.",
          head: "Alex Kumar",
        },
        {
          id: 2,
          name: "Entrepreneurship Society",
          category: "Business",
          members: 178,
          description: "Supporting student entrepreneurs and startup initiatives.",
          head: "Lisa Wang",
        },
        {
          id: 3,
          name: "Data Science Club",
          category: "STEM",
          members: 156,
          description:
            "Learn and discuss data science, analytics, and machine learning.",
          head: "Dr. Sarah Johnson",
        },
        {
          id: 4,
          name: "Design & UX Society",
          category: "Creative",
          members: 132,
          description: "For designers and UX enthusiasts to collaborate and learn.",
          head: "Sophie Martin",
        },
        {
          id: 5,
          name: "Web Development Club",
          category: "Technology",
          members: 198,
          description:
            "Learn modern web development, frameworks, and best practices.",
          head: "Michael Chen",
        },
        {
          id: 6,
          name: "Business & Finance Club",
          category: "Business",
          members: 167,
          description:
            "Discuss business trends, finance, and career opportunities.",
          head: "Emma Wilson",
        },
      ]));
    }
  }, [dispatch, societies.length]);

  return (
    <div className="w-full bg-[#0d1117] text-[#e6edf3] min-h-screen py-10 px-4 sm:px-10 md:px-20 lg:px-40">
      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <div className="mb-10">
          <SectionHeader
            title="Campus Societies"
            subtitle="Join societies that match your interests and expand your network."
            align="left"
          />
        </div>

        {/* Societies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {societies.map((society) => (
            <Link
              key={society.id}
              to={`/societies/${society.id}`}
              className="block"
            >
              <SocietyCardSimple
                name={society.name}
                category={society.category}
                members={society.members}
                description={society.description}
                head={society.head}
                onJoin={(event) => {
                  event.preventDefault();
                  navigate(`/societies/${society.id}`);
                }}
              />
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <CTACard
          title="Start a New Society"
          description="Have an idea for a society? We'd love to help you launch it!"
          buttonText="Create Society"
        />
      </div>
    </div>
  );
}
