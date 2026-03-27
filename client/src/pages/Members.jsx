import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectFilteredMembers, setMembers, searchMembers } from "../redux/slices/memberSlice";
import SectionHeader from "../components/common/SectionHeader";
import MemberCard from "../components/common/MemberCard";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

// Ensure mock members are only seeded once per app lifetime
let membersInitialized = false;

export default function Members() {
  const dispatch = useDispatch();
  const members = useSelector(selectFilteredMembers);

  // Initialize mock members data in Redux
  useEffect(() => {
    // Only initialize once, and only if members list is empty
    if (!membersInitialized && members.length === 0) {
      membersInitialized = true;
      dispatch(setMembers([
        {
          id: 1,
          name: "John Smith",
          role: "Computer Science Student",
          interests: ["AI/ML", "Web Dev", "Open Source"],
          joinDate: "Jan 2024",
          followers: 234,
        },
        {
          id: 2,
          name: "Priya Patel",
          role: "Data Science Enthusiast",
          interests: ["Data Science", "Analytics", "Research"],
          joinDate: "Feb 2024",
          followers: 156,
        },
        {
          id: 3,
          name: "David Lee",
          role: "Aspiring Entrepreneur",
          interests: ["Startups", "Entrepreneurship", "Tech"],
          joinDate: "Dec 2023",
          followers: 289,
        },
        {
          id: 4,
          name: "Sophie Martin",
          role: "UX/UI Designer",
          interests: ["Design", "UX Research", "Product"],
          joinDate: "Jan 2024",
          followers: 178,
        },
        {
          id: 5,
          name: "Hassan Ali",
          role: "Full Stack Developer",
          interests: ["Web Dev", "DevOps", "Cloud"],
          joinDate: "Mar 2024",
          followers: 145,
        },
        {
          id: 6,
          name: "Emma Wilson",
          role: "Business Student",
          interests: ["Business", "Finance", "Leadership"],
          joinDate: "Feb 2024",
          followers: 167,
        },
      ]));
    }
  }, [dispatch, members.length]);

  return (
    <div className="w-full bg-[#0d1117] text-[#e6edf3] min-h-screen py-10 px-4 sm:px-10 md:px-20 lg:px-40">
      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <div className="mb-10">
          <SectionHeader
            title="Community Members"
            subtitle="Meet the talented students and professionals in the CampusConnect community."
            align="left"
          />
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              name={member.name}
              role={member.role}
              interests={member.interests}
              joinDate={member.joinDate}
              followers={member.followers}
            />
          ))}
        </div>

        {/* Search/Filter Section */}
        <Card className="mt-12 text-center">
          <h2 className="text-[#e6edf3] text-2xl font-bold mb-3">
            Find Your People
          </h2>
          <p className="text-[#8b949e] text-sm mb-6">
            Search for members by interests, skills, or field of study.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Search members..."
              className="flex-1"
            />
            <Button variant="primary">Search</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
