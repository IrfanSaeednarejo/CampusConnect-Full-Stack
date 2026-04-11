import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { getDashboardRoute, isValidRole } from "@/utils/authValidator";
import { useDispatch } from "react-redux";
import { setRole } from "@/redux/slices/authSlice";
import Button from "@/components/common/Button";
import StepItem from "@/components/common/StepItem";
import FeatureCard from "@/components/common/FeatureCard";
import SectionHeader from "@/components/common/SectionHeader";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, role, onboardingCompleted } = useAuth();
  const dispatch = useDispatch();

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
      // Not logged in → store role in Redux and go directly to signup
      dispatch(setRole(selectedRole));
      navigate("/signup", { state: { role: selectedRole } });
    }
  };
  return (
    <div className="w-full bg-background text-text-primary min-h-screen">
      {/* Hero Section */}
      <div className="relative flex min-h-[560px] flex-col items-center justify-center overflow-hidden px-4 py-20 md:px-10">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-background z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1f6feb]/20 via-[#EEF2FF] to-[#EEF2FF] z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#4F46E5]/15 via-transparent to-transparent z-0" />

        <div className="relative z-10 flex flex-col gap-6 text-center max-w-4xl mx-auto mt-10">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-surface border border-border self-center mb-4 transition-transform hover:scale-105 cursor-default">
            <span className="text-[#4338CA] text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Join the CampusConnect Beta
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#0F172A] via-[#4F46E5] to-[#475569]">
            Your Campus, <br className="hidden md:block" /> Connected.
          </h1>
          <h2 className="text-text-secondary text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto mt-2">
            The ultimate platform uniting students, mentors, and societies to
            help you connect and thrive in a vibrant campus ecosystem.
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <button
              className="px-8 py-3 rounded-lg bg-primary text-white font-bold text-base hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(46,160,67,0.4)] transition-all duration-200"
              onClick={() => handleGetStarted("student")}
            >
              I'm a Student
            </button>
            <button
              className="px-8 py-3 rounded-lg bg-surface border border-border text-text-primary font-bold text-base hover:bg-surface-hover hover:text-text-primary hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => handleGetStarted("mentor")}
            >
              I'm a Mentor
            </button>
            <button
              className="px-8 py-3 rounded-lg bg-surface border border-border text-text-primary font-bold text-base hover:bg-surface-hover hover:text-text-primary hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => handleGetStarted("society_head")}
            >
              I'm a Society Head
            </button>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="flex flex-col gap-10 px-4 py-20 md:px-10 bg-background max-w-6xl mx-auto relative relative z-10 w-full">
        <SectionHeader
          title="How It Works"
          subtitle="Getting started with CampusConnect is simple. Follow these steps to join our thriving community."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-6">
          <div className="flex justify-center md:justify-end pr-0 md:pr-10 relative">
            {/* Abstract decorative element for steps */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[rgba(35,134,54,0.1)] p-1 transform rotate-3 hover:rotate-6 transition-transform duration-500 shadow-2xl">
              <div className="w-full h-full rounded-xl bg-background border border-border flex items-center justify-center p-8">
                <span className="material-symbols-outlined text-8xl text-transparent bg-clip-text bg-gradient-to-tr from-[#4F46E5] to-[#4338CA]">
                  hub
                </span>
              </div>
            </div>
            {/* Glow behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 blur-3xl rounded-full -z-10" />
          </div>

          <div className="flex flex-col relative border-l-2 border-border pl-6 md:pl-10 ml-4 md:ml-0">
            <StepItem
              number={1}
              title="Create Your Account"
              description="Sign up in minutes and build your profile to showcase your academic skills, goals, and personal interests."
            />
            <StepItem
              number={2}
              title="Explore & Discover"
              description="Browse upcoming networking events, find mentors in your field, or discover active societies that match your passions."
            />
            <StepItem
              number={3}
              title="Connect & Grow"
              description="Join events, book mentoring sessions, and start building your network for academic success and professional growth."
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="flex flex-col gap-10 px-4 py-20 md:px-10 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto w-full">
          <SectionHeader
            title="Unlock Your University Potential"
            subtitle="Discover the tools you need to succeed. CampusConnect offers a suite of features designed to enhance your academic and social life."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <FeatureCard
              icon={<span className="material-symbols-outlined text-[40px]">event_available</span>}
              title="Event Management"
              description="Effortlessly discover, register for, and manage campus events, from society meetups to workshops."
            />
            <FeatureCard
              icon={<span className="material-symbols-outlined text-[40px]">school</span>}
              title="Find a Mentor"
              description="Connect with experienced mentors for guidance, or share your knowledge and guide fellow students."
            />
            <FeatureCard
              icon={<span className="material-symbols-outlined text-[40px]">group</span>}
              title="Academic Networking"
              description="Collaborate with peers on academic projects, and build your professional network before you graduate."
            />
            <FeatureCard
              icon={<span className="material-symbols-outlined text-[40px]">corporate_fare</span>}
              title="Society Engagement"
              description="Join and lead campus societies, manage active members, and promote cool initiatives to the university."
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 px-4 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-r from-[#1f6feb]/20 to-[#4F46E5]/20 blur-[100px] -z-10 rounded-full mix-blend-screen" />

        <div className="flex flex-col items-center justify-center gap-8 max-w-4xl mx-auto text-center border border-border bg-surface/50 backdrop-blur-sm rounded-3xl p-10 md:p-16 shadow-2xl">
          <div className="flex flex-col gap-3">
            <h2 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight">
              Ready to Join the Community?
            </h2>
            <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto">
              Sign up today, build your profile, and start forming connections that matter for your future.
            </p>
          </div>

          <button
            className="group relative px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:shadow-[0_0_60px_rgba(79,70,229,0.5)] overflow-hidden"
            onClick={() => navigate("/signup")}
          >
            <span className="relative z-10 flex items-center gap-2">
              Get Started for Free
              <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
            </span>
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent group-hover:animate-shimmer" />
          </button>
        </div>
      </div>
    </div>
  );
}