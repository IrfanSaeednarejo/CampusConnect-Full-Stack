import { useEffect, useState } from "react";
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
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const savedTheme = window.localStorage.getItem("homeTheme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("homeTheme", isDark ? "dark" : "light");
    window.dispatchEvent(
      new CustomEvent("home-theme-change", {
        detail: { isDark },
      })
    );
  }, [isDark]);

  const featuredCourses = [
    {
      title: "Modern Web Development",
      category: "Web Development",
      level: "Intermediate",
      lessons: "36 Lessons",
      rating: "4.9",
      students: "2.3K Students",
      price: "$120",
      oldPrice: "$180",
      image: "/Web.jpg",
    },
    {
      title: "Practical Data Analysis",
      category: "Data Science",
      level: "Beginner",
      lessons: "28 Lessons",
      rating: "4.8",
      students: "1.8K Students",
      price: "$95",
      oldPrice: "$140",
      image: "/Data Analysis.jpg",
    },
    {
      title: "Career Readiness Blueprint",
      category: "Career Growth",
      level: "All Levels",
      lessons: "22 Lessons",
      rating: "4.9",
      students: "3.1K Students",
      price: "$80",
      oldPrice: "$125",
      image: "/Career Readiness Blueprint.jpg",
    },
  ];

  const faqs = [
    {
      question: "What can I do on CampusNexus?",
      answer:
        "Discover events, find mentors, join societies, and build your network in one platform.",
    },
    {
      question: "Who can use CampusNexus?",
      answer:
        "Students, mentors, and society heads can all join and use role-specific experiences.",
    },
    {
      question: "Is onboarding required?",
      answer:
        "Yes. After signup, onboarding helps personalize your experience before dashboard access.",
    },
  ];

  const handleGetStarted = (selectedRole) => {
    if (isAuthenticated) {
      if (!isValidRole(role)) {
        navigate("/login");
        return;
      }
      if (onboardingCompleted) {
        const dashboardUrl = getDashboardRoute(role);
        navigate(dashboardUrl);
      } else {
        navigate("/onboarding/welcome");
      }
    } else {
      navigate("/role-selection");
    }
  };

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0d1117] text-[#e6edf3]' : 'bg-[linear-gradient(180deg,#F8FAFC_0%,#EEF3F9_100%)] text-[#0F172A]'}`}>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:space-y-12 md:px-8 md:py-16 relative">
        {/* Toggle Button */}
        <button
          onClick={() => setIsDark((prev) => !prev)}
          className={`fixed top-4 left-24 z-[60] flex items-center gap-2 rounded-full p-3 transition-all duration-300 shadow-lg ${isDark ? 'bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff]' : 'bg-white border border-[#E2E8F0] hover:border-[#3B82F6]'}`}
          aria-label="Toggle theme"
        >
          <span className="text-xl">{isDark ? '☀️' : '🌙'}</span>
        </button>

        {/* Hero Section */}
        <section className={`relative overflow-hidden rounded-[2rem] border px-6 py-8 md:px-10 md:py-16 transition-all duration-300 shadow-[0_24px_70px_rgba(15,23,42,0.08)] ${isDark ? 'border-[#30363d] bg-[#161b22]' : 'border-[#D9E2EC] bg-white/80 backdrop-blur-xl'}`}>
          <div className={`absolute inset-0 -z-0 ${isDark ? 'bg-[radial-gradient(circle_at_top_right,_rgba(56,139,253,0.12)_0%,_rgba(22,27,34,0)_50%),radial-gradient(circle_at_bottom_left,_rgba(63,185,80,0.08)_0%,_rgba(22,27,34,0)_45%)]' : 'bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10)_0%,_rgba(248,250,252,0)_50%),radial-gradient(circle_at_bottom_left,_rgba(37,99,235,0.06)_0%,_rgba(248,250,252,0)_45%)]'}`} />
          <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div className="space-y-7">
              <div className="flex items-center gap-4">
                <img src="/Campus-Nexus Logo.png" alt="CampusNexus" className="h-14 w-14" />
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] transition-colors duration-300 ${isDark ? 'border-[#30363d] bg-[#0d1117] text-[#58a6ff]' : 'border-[#C7D2FE] bg-white text-[#1D4ED8]'}`}>
                  CAMPUS GROWTH PLATFORM
                </span>
              </div>
              <h1 className={`text-4xl font-extrabold leading-snug tracking-[-0.03em] md:text-6xl transition-colors duration-300 ${isDark ? 'text-[#e6edf3]' : 'text-[#1A202C]'}`}>
                Shape Your Future With The Right Knowledge
              </h1>
              <p className={`max-w-xl text-base leading-relaxed md:text-lg transition-colors duration-300 ${isDark ? 'text-[#8b949e]' : 'text-[#475569]'}`}>
                Discover events, mentoring, societies, and academic collaboration in one focused platform designed for university success.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button variant="primary" className={isDark ? "" : "bg-[#1D4ED8] text-white hover:bg-[#1E40AF] shadow-[0_10px_24px_rgba(29,78,216,0.18)]"} onClick={() => handleGetStarted("student")}>
                  I&apos;m a Student
                </Button>
                <Button variant="secondary" className={isDark ? "" : "border border-[#D6DEE8] bg-white text-[#0F172A] shadow-sm hover:border-[#C5D0DE] hover:bg-[#F8FAFC]"} onClick={() => handleGetStarted("mentor")}>
                  I&apos;m a Mentor
                </Button>
                <Button variant="secondary" className={isDark ? "" : "border border-[#D6DEE8] bg-white text-[#0F172A] shadow-sm hover:border-[#C5D0DE] hover:bg-[#F8FAFC]"} onClick={() => handleGetStarted("society_head")}>
                  I&apos;m a Society Head
                </Button>
              </div>

              <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-[#8b949e]' : 'text-[#4A5568]'}`}>
                Already have an account?{" "}
                <Link to="/login" className={`font-semibold hover:underline transition-colors duration-300 ${isDark ? 'text-[#58a6ff]' : 'text-[#1D4ED8]'}`}>
                  Log in
                </Link>
              </p>
            </div>

            <div className="relative">
              <div className={`mx-auto w-full max-w-md overflow-hidden rounded-[1.75rem] border p-3 transition-all duration-300 shadow-[0_24px_60px_rgba(15,23,42,0.10)] ${isDark ? 'border-[#30363d] bg-[#0d1117]' : 'border-[#DCE4EE] bg-white'}`}>
                <img
                  src="/Landing_page.jpg"
                  alt="Students collaborating"
                  className="h-[420px] w-full rounded-2xl object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className={`absolute -left-4 top-8 rounded-2xl border px-4 py-3 transition-all duration-300 shadow-[0_12px_24px_rgba(15,23,42,0.08)] ${isDark ? 'border-[#1f6feb] bg-[#0d1117]' : 'border-[#D6DEE8] bg-white'}`}>
                <p className={`text-xs font-semibold transition-colors duration-300 ${isDark ? 'text-[#58a6ff]' : 'text-[#1D4ED8]'}`}>Community Rating</p>
                <p className={`text-lg font-extrabold transition-colors duration-300 ${isDark ? 'text-[#e6edf3]' : 'text-[#1A202C]'}`}>4.9/5</p>
              </div>
              <div className={`absolute -right-4 bottom-10 rounded-2xl border px-4 py-3 transition-all duration-300 shadow-[0_12px_24px_rgba(15,23,42,0.08)] ${isDark ? 'border-[#238636] bg-[#0d1117]' : 'border-[#D6DEE8] bg-white'}`}>
                <p className={`text-xs font-semibold transition-colors duration-300 ${isDark ? 'text-[#3fb950]' : 'text-[#1D4ED8]'}`}>Active Learners</p>
                <p className={`text-lg font-extrabold transition-colors duration-300 ${isDark ? 'text-[#e6edf3]' : 'text-[#1A202C]'}`}>20K+</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={`grid grid-cols-2 gap-3 rounded-[1.75rem] border p-4 md:grid-cols-4 md:gap-4 md:p-8 transition-all duration-300 shadow-[0_20px_60px_rgba(15,23,42,0.07)] ${isDark ? 'border-[#30363d] bg-[#161b22]' : 'border-[#DCE4EE] bg-white/80 backdrop-blur-xl'}`}>
          {[
            { label: "Satisfaction Rate", value: "100%" },
            { label: "Years of Excellence", value: "12+" },
            { label: "Mentors & Peers", value: "20K+" },
            { label: "Courses Category", value: "90+" },
          ].map((item) => (
            <div key={item.label} className={`rounded-2xl border p-5 text-center transition-all duration-300 ${isDark ? 'border-[#30363d] bg-[#0d1117] hover:border-[#58a6ff] hover:shadow-[0_8px_20px_rgba(88,166,255,0.1)]' : 'border-[#DCE4EE] bg-white hover:border-[#93C5FD] hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]'}`}>
              <p className={`text-2xl font-extrabold md:text-3xl transition-colors duration-300 ${isDark ? 'text-[#e6edf3]' : 'text-[#1A202C]'}`}>{item.value}</p>
              <p className={`mt-2 text-xs font-medium md:text-sm transition-colors duration-300 ${isDark ? 'text-[#8b949e]' : 'text-[#475569]'}`}>{item.label}</p>
            </div>
          ))}
        </section>

        {/* Courses Section */}
        <section>
          <SectionHeader
            title="Courses Designed For Success"
            subtitle="Practical, career-focused learning tracks to help you grow faster on campus and beyond."
            isDark={isDark}
          />
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredCourses.map((course) => (
              <article
                key={course.title}
                className={`overflow-hidden rounded-2xl border shadow-lg transition-all duration-300 ${isDark ? 'border-[#30363d] bg-[#161b22] hover:border-[#58a6ff] hover:shadow-2xl' : 'border-[#E2E8F0] bg-white hover:border-[#3B82F6] hover:shadow-2xl'}`}
              >
                <img
                  src={course.image}
                  alt={course.title}
                  className="h-44 w-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors duration-300 ${isDark ? 'border-[#1f6feb] bg-[#0d1117] text-[#58a6ff]' : 'border-[#60A5FA] bg-white text-[#1E40AF]'}`}>
                      {course.category}
                    </span>
                    <span className={`text-xs font-medium transition-colors duration-300 ${isDark ? 'text-[#8b949e]' : 'text-[#4A5568]'}`}>{course.level}</span>
                  </div>
                  <h3 className={`text-lg font-bold leading-snug transition-colors duration-300 ${isDark ? 'text-[#e6edf3]' : 'text-[#1A202C]'}`}>{course.title}</h3>
                  <div className={`flex items-center justify-between text-sm transition-colors duration-300 ${isDark ? 'text-[#8b949e]' : 'text-[#4A5568]'}`}>
                    <span>{course.lessons}</span>
                    <span>{course.rating} ({course.students})</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className={`text-lg font-extrabold transition-colors duration-300 ${isDark ? 'text-[#e6edf3]' : 'text-[#1A202C]'}`}>
                      {course.price} <span className={`ml-1 text-sm font-medium line-through transition-colors duration-300 ${isDark ? 'text-[#8b949e]' : 'text-[#4A5568]'}`}>{course.oldPrice}</span>
                    </p>
                    <Button variant="secondary" onClick={() => handleGetStarted("student")}>
                      Enroll
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className={`grid grid-cols-1 gap-6 rounded-3xl border p-6 md:p-8 lg:grid-cols-2 shadow-lg transition-all duration-300 ${isDark ? 'border-[#30363d] bg-[#161b22]' : 'border-[#E2E8F0] bg-[#EDF2F7]'}`}>
          <div className={`overflow-hidden rounded-2xl border transition-all duration-300 ${isDark ? 'border-[#30363d]' : 'border-[#E2E8F0]'}`}>
            <img
              src="/Image.avif"
              alt="Learning progress"
              className="h-full min-h-[320px] w-full object-cover"
            />
          </div>
          <div className="space-y-4">
            <SectionHeader
              title="Powerful Features For Your Learning Journey"
              subtitle="Build your profile, attend events, and connect with mentors through one streamlined experience."
              isDark={isDark}
            />
            <ul className={`space-y-3 text-sm md:text-base transition-colors duration-300 ${isDark ? 'text-[#8b949e]' : 'text-[#4A5568]'}`}>
              <li className={`rounded-xl border p-4 transition-all duration-300 ${isDark ? 'border-[#30363d] bg-[#0d1117] hover:border-[#3fb950] hover:shadow-[0_8px_20px_rgba(63,185,80,0.1)]' : 'border-[#E2E8F0] bg-white hover:border-[#3B82F6] hover:shadow-[0_8px_20px_rgba(59,130,246,0.1)]'}`}>Personalized learning paths and role-based onboarding.</li>
              <li className={`rounded-xl border p-4 transition-all duration-300 ${isDark ? 'border-[#30363d] bg-[#0d1117] hover:border-[#3fb950] hover:shadow-[0_8px_20px_rgba(63,185,80,0.1)]' : 'border-[#E2E8F0] bg-white hover:border-[#3B82F6] hover:shadow-[0_8px_20px_rgba(59,130,246,0.1)]'}`}>Live sessions, webinars, and event participation tools.</li>
              <li className={`rounded-xl border p-4 transition-all duration-300 ${isDark ? 'border-[#30363d] bg-[#0d1117] hover:border-[#3fb950] hover:shadow-[0_8px_20px_rgba(63,185,80,0.1)]' : 'border-[#E2E8F0] bg-white hover:border-[#3B82F6] hover:shadow-[0_8px_20px_rgba(59,130,246,0.1)]'}`}>Progress dashboards and achievement tracking.</li>
              <li className={`rounded-xl border p-4 transition-all duration-300 ${isDark ? 'border-[#30363d] bg-[#0d1117] hover:border-[#3fb950] hover:shadow-[0_8px_20px_rgba(63,185,80,0.1)]' : 'border-[#E2E8F0] bg-white hover:border-[#3B82F6] hover:shadow-[0_8px_20px_rgba(59,130,246,0.1)]'}`}>Community networking with students, mentors, and societies.</li>
            </ul>
          </div>
        </section>

        {/* How It Works & Why Choose */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className={`rounded-3xl border p-6 md:p-8 shadow-lg transition-all duration-300 ${isDark ? 'border-[#30363d] bg-[#161b22]' : 'border-[#E2E8F0] bg-[#EDF2F7]'}`}>
            <SectionHeader
              title="How It Works"
              subtitle="A simple flow designed to get you productive from day one."
              isDark={isDark}
            />
            <div className={`mt-5 flex flex-col gap-3 border-l pl-5 transition-colors duration-300 ${isDark ? 'border-[#30363d]' : 'border-[#E2E8F0]'}`}>
              <StepItem
                number={1}
                title="Create Your Account"
                description="Sign up quickly and choose your role to begin your personalized journey."
                isDark={isDark}
              />
              <StepItem
                number={2}
                title="Explore & Discover"
                description="Browse events, mentors, and communities aligned with your goals."
                isDark={isDark}
              />
              <StepItem
                number={3}
                title="Connect & Grow"
                description="Collaborate, participate, and build long-term academic and professional value."
                isDark={isDark}
              />
            </div>
          </div>

          <div className={`rounded-3xl border p-6 md:p-8 shadow-lg transition-all duration-300 ${isDark ? 'border-[#30363d] bg-[#161b22]' : 'border-[#E2E8F0] bg-[#EDF2F7]'}`}>
            <SectionHeader
              title="Why Students Choose CampusNexus"
              subtitle="Everything you need to move from campus life to career readiness."
              isDark={isDark}
            />
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FeatureCard
                icon="Events"
                title="Event Management"
                description="Discover and manage campus events with clear workflows."
                isDark={isDark}
              />
              <FeatureCard
                icon="Mentoring"
                title="Find a Mentor"
                description="Connect with experienced guides for focused growth."
                isDark={isDark}
              />
              <FeatureCard
                icon="Network"
                title="Academic Networking"
                description="Build relationships with peers and future collaborators."
                isDark={isDark}
              />
              <FeatureCard
                icon="Societies"
                title="Society Engagement"
                description="Join communities and take leadership opportunities."
                isDark={isDark}
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className={`rounded-3xl border p-6 md:p-8 shadow-lg transition-all duration-300 ${isDark ? 'border-[#30363d] bg-[#161b22]' : 'border-[#E2E8F0] bg-[#EDF2F7]'}`}>
          <SectionHeader
            title="What Our Learners Say"
            subtitle="Real feedback from students and mentors using CampusNexus daily."
            isDark={isDark}
          />
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                quote: "I found the right mentor and got internship guidance in weeks.",
                author: "Areeba S.",
              },
              {
                quote: "Our society events finally feel organized and easy to manage.",
                author: "Hamza R.",
              },
              {
                quote: "The dashboard keeps my progress and opportunities in one view.",
                author: "Mariam K.",
              },
            ].map((item) => (
              <blockquote key={item.author} className={`rounded-2xl border p-5 transition-all duration-300 ${isDark ? 'border-[#30363d] bg-[#0d1117] hover:border-[#58a6ff] hover:shadow-[0_10px_30px_rgba(88,166,255,0.12)]' : 'border-[#E2E8F0] bg-white hover:border-[#3B82F6] hover:shadow-[0_10px_30px_rgba(59,130,246,0.12)]'}`}>
                <p className={`text-sm leading-relaxed transition-colors duration-300 ${isDark ? 'text-[#8b949e]' : 'text-[#4A5568]'}`}>&quot;{item.quote}&quot;</p>
                <footer className={`mt-4 text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-[#e6edf3]' : 'text-[#1A202C]'}`}>{item.author}</footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className={`rounded-3xl border p-6 md:p-8 shadow-lg transition-all duration-300 ${isDark ? 'border-[#30363d] bg-[#161b22]' : 'border-[#E2E8F0] bg-[#EDF2F7]'}`}>
          <SectionHeader
            title="Your Questions, Answered"
            subtitle="Everything frequently asked about getting started."
            isDark={isDark}
          />
          <div className="mt-8 space-y-4">
            {faqs.map((item) => (
              <details key={item.question} className={`group rounded-xl border px-5 py-4 transition-all duration-300 ${isDark ? 'border-[#30363d] bg-[#0d1117] hover:border-[#58a6ff] hover:shadow-[0_8px_20px_rgba(88,166,255,0.1)]' : 'border-[#E2E8F0] bg-white hover:border-[#3B82F6] hover:shadow-[0_8px_20px_rgba(59,130,246,0.1)]'}`}>
                <summary className={`cursor-pointer text-sm font-semibold transition-colors duration-200 md:text-base ${isDark ? 'text-[#e6edf3] group-hover:text-[#58a6ff]' : 'text-[#1A202C] group-hover:text-[#3B82F6]'}`}>
                  {item.question}
                </summary>
                <p className={`mt-3 text-sm leading-relaxed transition-colors duration-300 ${isDark ? 'text-[#8b949e]' : 'text-[#4A5568]'}`}>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className={`rounded-3xl border p-8 text-center md:p-12 shadow-lg transition-all duration-300 ${isDark ? 'border-[#30363d] bg-[linear-gradient(120deg,#161b22_0%,#1f2937_100%)]' : 'border-[#E2E8F0] bg-[linear-gradient(120deg,#EDF2F7_0%,#F7FAFC_100%)]'}`}>
          <h2 className={`text-3xl font-extrabold tracking-[-0.03em] md:text-4xl transition-colors duration-300 ${isDark ? 'text-[#e6edf3]' : 'text-[#1A202C]'}`}>
            Ready To Start Your Learning Journey?
          </h2>
          <p className={`mx-auto mt-4 max-w-2xl text-sm leading-relaxed md:text-base transition-colors duration-300 ${isDark ? 'text-[#8b949e]' : 'text-[#4A5568]'}`}>
            Join CampusNexus today and unlock opportunities through events, mentorship, and student communities.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" onClick={() => handleGetStarted("student")}>
              Get Started For Free
            </Button>
            <Button variant="secondary" onClick={() => navigate("/events")}>
              Explore Events
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
