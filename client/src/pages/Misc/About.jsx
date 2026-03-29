import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../components/common/SectionHeader";
import Card from "../../components/common/Card";
import ValueCard from "../../components/common/ValueCard";
import StatDisplay from "../../components/common/StatDisplay";
import Button from "../../components/common/Button";
import api from "../../api/axios";

export default function AboutUs() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: "—",
    mentors: "—",
    societies: "—",
    events: "—",
  });

  // Fetch real platform stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, societiesRes, eventsRes, mentorsRes] = await Promise.allSettled([
          api.get("/users/search", { params: { limit: 0 } }),
          api.get("/societies"),
          api.get("/competitions"),
          api.get("/mentors"),
        ]);

        const extractCount = (res) => {
          if (res.status !== "fulfilled") return 0;
          const data = res.value.data?.data;
          if (!data) return 0;
          if (typeof data === "number") return data;
          if (Array.isArray(data)) return data.length;

          // Check for pagination object (from our paginate.js utility)
          if (data.pagination && typeof data.pagination.total === "number") {
            return data.pagination.total;
          }

          // Fallbacks for arrays nested in objects without pagination
          if (Array.isArray(data.docs)) return data.docs.length;
          if (Array.isArray(data.users)) return data.users.length;
          if (Array.isArray(data.societies)) return data.societies.length;
          if (Array.isArray(data.mentors)) return data.mentors.length;

          return 0;
        };

        setStats({
          students: extractCount(usersRes).toLocaleString(),
          societies: extractCount(societiesRes).toLocaleString(),
          events: extractCount(eventsRes).toLocaleString(),
          mentors: extractCount(mentorsRes).toLocaleString(),
        });
      } catch (err) {
        console.error("[About] Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="w-full bg-[#0d1117] text-[#e6edf3] min-h-screen py-10 px-4 sm:px-10 md:px-20 lg:px-40">
      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <SectionHeader
            title="About CampusConnect"
            subtitle="Connecting students, mentors, and societies to create a thriving campus ecosystem."
            align="left"
          />
        </div>

        {/* Mission Section */}
        <div className="flex flex-col gap-6 mb-12">
          <Card padding="p-6">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-[#8b949e] leading-relaxed">
              CampusConnect is dedicated to breaking down barriers and fostering
              meaningful connections across campus. We believe that every
              student deserves access to mentorship, opportunities, and a
              community that supports their growth. By uniting students,
              mentors, and societies on one platform, we empower our community
              to thrive academically and personally.
            </p>
          </Card>

          <Card padding="p-6">
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-[#8b949e] leading-relaxed">
              We envision a campus where every student feels connected,
              supported, and inspired to pursue their passions. A place where
              knowledge is shared freely, opportunities are accessible to all,
              and connections lead to lifelong friendships and professional
              relationships.
            </p>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValueCard
              title="Community"
              description="We believe in the power of community and collective growth."
            />
            <ValueCard
              title="Accessibility"
              description="Everyone deserves equal access to opportunities and mentorship."
            />
            <ValueCard
              title="Integrity"
              description="We operate with honesty and transparency in all our interactions."
            />
            <ValueCard
              title="Innovation"
              description="We continuously improve our platform to serve our community better."
            />
          </div>
        </div>

        {/* Stats Section — Live from DB */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">By The Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatDisplay stat={stats.students} label="Active Students" />
            <StatDisplay stat={stats.mentors} label="Mentors" />
            <StatDisplay stat={stats.societies} label="Societies" />
            <StatDisplay stat={stats.events} label="Events Hosted" />
          </div>
        </div>

        {/* Team Section */}
        <Card className="text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Team</h2>
          <p className="text-[#8b949e] mb-6">
            Interested in joining the CampusConnect team? We're always looking
            for passionate individuals to help us build the future of campus
            connectivity.
          </p>
          <div className="flex justify-center">
            <Button variant="primary" onClick={() => navigate("/contact-us")}>See Open Positions</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
