import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { getDashboardRoute, isValidRole } from "@/utils/authValidator";
import Button from "@/components/common/Button";
import StepItem from "@/components/common/StepItem";
import FeatureCard from "@/components/common/FeatureCard";
import SectionHeader from "@/components/common/SectionHeader";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, role, onboardingCompleted } = useAuth();

  const handleGetStarted = (selectedRole) => {
    // If already logged in, validate role and navigate to appropriate dashboard
    if (isAuthenticated) {
      // Validate role integrity
      if (!isValidRole(role)) {
        // Invalid role - redirect to login for security
        navigate("/login");
        return;
      }

      if (onboardingCompleted) {
        // User is authenticated and onboarded - navigate to their role dashboard
        const dashboardUrl = getDashboardRoute(role);
        navigate(dashboardUrl);
      } else {
        // User is authenticated but not onboarded - go to onboarding
        navigate("/onboarding/welcome");
      }
    } else {
      // Not logged in - go to signup with role selection
      navigate("/role-selection");
    }
  };
  return (
    <div className="w-full bg-[#0d1117] text-[#e6edf3] min-h-screen">
      {/* Hero Section */}
      <div
        className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-start justify-end px-4 pb-10 md:px-10 md:gap-8"
        style={{
          backgroundImage:
            "linear-gradient(rgba(13, 17, 23, 0.15) 0%, rgba(13, 17, 23, 0.5) 100%), url('/Image/Connect.png')",
          backgroundColor: "#161b22",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="flex flex-col gap-2 text-left">
          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
            Your Campus, Connected.
          </h1>
          <h2 className="text-[#8b949e] text-sm md:text-base font-normal leading-normal">
            The ultimate platform uniting students, mentors, and societies to
            help you connect and thrive in a vibrant campus ecosystem.
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button 
            variant="primary"
            onClick={() => handleGetStarted("student")}
          >
            I'm a Student
          </Button>
          <Button 
            variant="secondary"
            onClick={() => handleGetStarted("mentor")}
          >
            I'm a Mentor
          </Button>
          <Button 
            variant="secondary"
            onClick={() => handleGetStarted("society_head")}
          >
            I'm a Society Head
          </Button>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="flex flex-col gap-6 px-4 py-10 md:px-10">
        <SectionHeader
          title="How It Works"
          subtitle="Getting started with CampusNexus is simple. Follow these steps to join our community."
        />

        <div className="flex flex-col gap-2 border-l border-[#30363d] pl-4">
          <StepItem
            number={1}
            title="Create Your Account"
            description="Sign up in minutes and build your profile to showcase your skills and interests."
          />
          <StepItem
            number={2}
            title="Explore & Discover"
            description="Browse upcoming events, find mentors in your field, or discover societies that match your passions."
          />
          <StepItem
            number={3}
            title="Connect & Grow yes"
            description="Join events, connect with mentors, and start building your network for academic and professional success."
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="flex flex-col gap-6 px-4 py-10 md:px-10">
        <SectionHeader
          title="Unlock Your University Potential"
          subtitle="Discover the tools you need to succeed. CampusNexus offers a suite of features designed to enhance your academic and social life."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-0">
          <FeatureCard
            icon="📅"
            title="Event Management"
            description="Effortlessly discover, create, and manage campus events, from society meetups to academic workshops."
          />
          <FeatureCard
            icon="🤝"
            title="Find a Mentor"
            description="Connect with experienced mentors for guidance, or share your knowledge and guide fellow students on their journey."
          />
          <FeatureCard
            icon="👥"
            title="Academic Networking"
            description="Collaborate with peers and faculty on academic projects, and build your professional network before you graduate."
          />
          <FeatureCard
            icon="🏛️"
            title="Society Engagement"
            description="Join and lead societies, manage members, and promote initiatives to the wider university community."
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-10">
        <div className="flex flex-col justify-end gap-6 px-4 py-10 md:gap-8 md:px-10 md:py-20">
          <SectionHeader
            title="Ready to Join the Community?"
            subtitle="Sign up today and start building connections that matter."
            align="center"
          />

          <div className="flex flex-1 justify-center">
            <Button variant="primary" className="grow">
              Get Started for Free
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}