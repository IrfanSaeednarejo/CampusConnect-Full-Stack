import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { getDashboardRoute, isValidRole } from "@/utils/authValidator";
import { getCompetitions } from "@/api/eventApi";
import { getMentors } from "@/api/mentoringApi";
import { getSocieties } from "@/api/societyApi";
import Button from "@/components/common/Button";
import StepItem from "@/components/common/StepItem";
import FeatureCard from "@/components/common/FeatureCard";
import SectionHeader from "@/components/common/SectionHeader";
import useHomeTheme from "@/hooks/useHomeTheme";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, role, onboardingCompleted } = useAuth();
  const isDark = useHomeTheme();
  const [platformStats, setPlatformStats] = useState({
    mentors: 0,
    events: 0,
    societies: 0,
  });

  useEffect(() => {
    let isMounted = true;

    const readTotal = (response) =>
      response?.data?.data?.pagination?.total ??
      response?.data?.pagination?.total ??
      0;

    const loadPlatformStats = async () => {
      try {
        const [mentorsRes, eventsRes, societiesRes] = await Promise.all([
          getMentors({ limit: 1 }),
          getCompetitions({ limit: 1 }),
          getSocieties({ limit: 1 }),
        ]);

        if (!isMounted) return;

        setPlatformStats({
          mentors: readTotal(mentorsRes),
          events: readTotal(eventsRes),
          societies: readTotal(societiesRes),
        });
      } catch (error) {
        if (!isMounted) return;
        setPlatformStats({ mentors: 0, events: 0, societies: 0 });
      }
    };

    loadPlatformStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatCount = (value) => {
    if (!value) return "0";
    return new Intl.NumberFormat("en", {
      notation: value >= 1000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const highlightStats = useMemo(
    () => [
      { label: "Live Events", value: formatCount(platformStats.events) },
      { label: "Mentor Profiles", value: formatCount(platformStats.mentors) },
      { label: "Student Societies", value: formatCount(platformStats.societies) },
    ],
    [platformStats]
  );

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
    <div
      className={`w-full min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-background-dark text-text-primary-dark"
          : "bg-background-light text-text-primary-light"
      }`}
    >
      <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-8 md:space-y-12 md:px-8 md:py-16">
        <section
          className={`relative overflow-hidden rounded-[2rem] border px-6 py-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition-all duration-300 md:px-10 md:py-16 ${
            isDark
              ? "border-border-dark bg-surface-dark"
              : "border-border-light bg-surface-light"
          }`}
        >
          <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div className="space-y-7">
              <div className="flex items-center gap-4">
                <img
                  src="/Campus-Nexus Logo.png"
                  alt="CampusNexus"
                  className="h-14 w-14"
                />
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] transition-colors duration-300 ${
                    isDark
                      ? "border-border-dark bg-background-dark text-info"
                      : "border-border-light bg-surface-light text-info"
                  }`}
                >
                  CAMPUS GROWTH PLATFORM
                </span>
              </div>
              <h1
                className={`text-4xl font-extrabold leading-snug tracking-[-0.03em] transition-colors duration-300 md:text-6xl ${
                  isDark ? "text-text-primary-dark" : "text-text-primary-light"
                }`}
              >
                Shape Your Future With The Right Knowledge
              </h1>
              <p
                className={`max-w-xl text-base leading-relaxed transition-colors duration-300 md:text-lg ${
                  isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
                }`}
              >
                Discover events, mentoring, societies, and academic collaboration
                in one focused platform designed for university success.
              </p>

              <div className="flex flex-wrap gap-3">
                {["Trusted by students", "Mentors on demand", "Communities that grow"].map((item) => (
                  <span
                    key={item}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors duration-300 ${
                      isDark
                        ? "border-border-dark bg-background-dark text-text-secondary-dark"
                        : "border-border-light bg-surface-light text-text-secondary-light"
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  variant="primary"
                  className={
                    isDark
                      ? ""
                      : "bg-info text-white hover:bg-primary-hover shadow-[0_10px_24px_rgba(37,99,235,0.18)]"
                  }
                  onClick={() => handleGetStarted("student")}
                >
                  I&apos;m a Student
                </Button>
                <Button
                  variant="secondary"
                  className={
                    isDark
                      ? ""
                      : "border border-border-light bg-surface-light text-text-primary-light shadow-sm hover:border-slate-300 hover:bg-slate-50"
                  }
                  onClick={() => handleGetStarted("mentor")}
                >
                  I&apos;m a Mentor
                </Button>
                <Button
                  variant="secondary"
                  className={
                    isDark
                      ? ""
                      : "border border-border-light bg-surface-light text-text-primary-light shadow-sm hover:border-slate-300 hover:bg-slate-50"
                  }
                  onClick={() => handleGetStarted("society_head")}
                >
                  I&apos;m a Society Head
                </Button>
              </div>

              <p
                className={`text-sm transition-colors duration-300 ${
                  isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
                }`}
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  className={`font-semibold transition-colors duration-300 hover:underline ${
                    isDark ? "text-info" : "text-info"
                  }`}
                >
                  Log in
                </Link>
              </p>
            </div>

            <div className="relative">
              <div
                className={`mx-auto w-full max-w-md overflow-hidden rounded-[1.75rem] border p-3 shadow-[0_24px_60px_rgba(15,23,42,0.10)] transition-all duration-300 ${
                  isDark
                    ? "border-border-dark bg-background-dark"
                    : "border-border-light bg-surface-light"
                }`}
              >
                <img
                  src="/Landing_page.jpg"
                  alt="Students collaborating"
                  className="h-[420px] w-full rounded-2xl object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div
                className={`absolute -left-4 top-8 rounded-2xl border px-4 py-3 shadow-[0_12px_24px_rgba(15,23,42,0.08)] transition-all duration-300 ${
                  isDark
                    ? "border-info/30 bg-background-dark"
                    : "border-border-light bg-surface-light"
                }`}
              >
                <p
                  className={`text-xs font-semibold transition-colors duration-300 ${
                    isDark ? "text-info" : "text-info"
                  }`}
                >
                  {highlightStats[0].label}
                </p>
                <p
                  className={`text-lg font-extrabold transition-colors duration-300 ${
                    isDark ? "text-text-primary-dark" : "text-text-primary-light"
                  }`}
                >
                  {highlightStats[0].value}
                </p>
              </div>
              <div
                className={`absolute -right-4 bottom-10 rounded-2xl border px-4 py-3 shadow-[0_12px_24px_rgba(15,23,42,0.08)] transition-all duration-300 ${
                  isDark
                    ? "border-primary/30 bg-background-dark"
                    : "border-border-light bg-surface-light"
                }`}
              >
                <p
                  className={`text-xs font-semibold transition-colors duration-300 ${
                    isDark ? "text-primary" : "text-primary"
                  }`}
                >
                  {highlightStats[1].label}
                </p>
                <p
                  className={`text-lg font-extrabold transition-colors duration-300 ${
                    isDark ? "text-text-primary-dark" : "text-text-primary-light"
                  }`}
                >
                  {highlightStats[1].value}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className={`grid grid-cols-2 gap-3 rounded-[1.75rem] border p-4 shadow-[0_20px_60px_rgba(15,23,42,0.07)] transition-all duration-300 md:grid-cols-4 md:gap-4 md:p-8 ${
            isDark
              ? "border-border-dark bg-surface-dark"
              : "border-border-light bg-surface-light/80 backdrop-blur-xl"
          }`}
        >
          {[
            { label: "Student Societies", value: highlightStats[2].value },
            { label: "Live Events", value: highlightStats[0].value },
            { label: "Mentor Profiles", value: highlightStats[1].value },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl border p-5 text-center transition-all duration-300 ${
                isDark
                  ? "border-border-dark bg-background-dark hover:border-primary/40 hover:shadow-[0_8px_20px_rgba(37,99,235,0.10)]"
                  : "border-border-light bg-white hover:border-slate-300 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]"
              }`}
            >
              <p
                className={`text-2xl font-extrabold transition-colors duration-300 md:text-3xl ${
                  isDark ? "text-text-primary-dark" : "text-text-primary-light"
                }`}
              >
                {item.value}
              </p>
              <p
                className={`mt-2 text-xs font-medium transition-colors duration-300 md:text-sm ${
                  isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
                }`}
              >
                {item.label}
              </p>
            </div>
          ))}
        </section>

        <section
          className={`grid grid-cols-1 gap-6 rounded-3xl border p-6 shadow-lg transition-all duration-300 md:p-8 lg:grid-cols-2 ${
            isDark
              ? "border-border-dark bg-surface-dark"
              : "border-border-light bg-[rgb(var(--color-surface-muted-light)/1)]"
          }`}
        >
          <div
            className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
              isDark ? "border-border-dark" : "border-border-light"
            }`}
          >
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
            <ul
              className={`space-y-3 text-sm transition-colors duration-300 md:text-base ${
                isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
              }`}
            >
              {[
                "Personalized learning paths and role-based onboarding.",
                "Live sessions, webinars, and event participation tools.",
                "Progress dashboards and achievement tracking.",
                "Community networking with students, mentors, and societies.",
              ].map((item) => (
                <li
                  key={item}
                  className={`rounded-xl border p-4 transition-all duration-300 ${
                    isDark
                      ? "border-border-dark bg-background-dark hover:border-primary/40 hover:shadow-[0_8px_20px_rgba(37,99,235,0.10)]"
                      : "border-border-light bg-white hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
                  }`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div
            className={`rounded-3xl border p-6 shadow-lg transition-all duration-300 md:p-8 ${
              isDark
                ? "border-border-dark bg-surface-dark"
                : "border-border-light bg-[rgb(var(--color-surface-muted-light)/1)]"
            }`}
          >
            <SectionHeader
              title="How It Works"
              subtitle="A simple flow designed to get you productive from day one."
              isDark={isDark}
            />
            <div
              className={`mt-5 flex flex-col gap-3 border-l pl-5 transition-colors duration-300 ${
                isDark ? "border-border-dark" : "border-border-light"
              }`}
            >
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

          <div
            className={`rounded-3xl border p-6 shadow-lg transition-all duration-300 md:p-8 ${
              isDark
                ? "border-border-dark bg-surface-dark"
                : "border-border-light bg-[rgb(var(--color-surface-muted-light)/1)]"
            }`}
          >
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

        <section
          className={`rounded-3xl border p-6 shadow-lg transition-all duration-300 md:p-8 ${
            isDark
              ? "border-border-dark bg-surface-dark"
              : "border-border-light bg-[rgb(var(--color-surface-muted-light)/1)]"
          }`}
        >
          <SectionHeader
            title="What Our Learners Say"
            subtitle="Real feedback from students and mentors using CampusNexus daily."
            isDark={isDark}
          />
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                quote:
                  "I found the right mentor and got internship guidance in weeks.",
                author: "Areeba S.",
              },
              {
                quote:
                  "Our society events finally feel organized and easy to manage.",
                author: "Hamza R.",
              },
              {
                quote:
                  "The dashboard keeps my progress and opportunities in one view.",
                author: "Mariam K.",
              },
            ].map((item) => (
              <blockquote
                key={item.author}
                className={`rounded-2xl border p-5 transition-all duration-300 ${
                  isDark
                    ? "border-border-dark bg-background-dark hover:border-primary/40 hover:shadow-[0_10px_30px_rgba(37,99,235,0.12)]"
                    : "border-border-light bg-white hover:border-slate-300 hover:shadow-[0_10px_30px_rgba(15,23,42,0.10)]"
                }`}
              >
                <p
                  className={`text-sm leading-relaxed transition-colors duration-300 ${
                    isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
                  }`}
                >
                  &quot;{item.quote}&quot;
                </p>
                <footer
                  className={`mt-4 text-sm font-semibold transition-colors duration-300 ${
                    isDark ? "text-text-primary-dark" : "text-text-primary-light"
                  }`}
                >
                  {item.author}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section
          className={`rounded-3xl border p-6 shadow-lg transition-all duration-300 md:p-8 ${
            isDark
              ? "border-border-dark bg-surface-dark"
              : "border-border-light bg-[rgb(var(--color-surface-muted-light)/1)]"
          }`}
        >
          <SectionHeader
            title="Your Questions, Answered"
            subtitle="Everything frequently asked about getting started."
            isDark={isDark}
          />
          <div className="mt-8 space-y-4">
            {faqs.map((item) => (
              <details
                key={item.question}
                className={`group rounded-xl border px-5 py-4 transition-all duration-300 ${
                  isDark
                    ? "border-border-dark bg-background-dark hover:border-primary/40 hover:shadow-[0_8px_20px_rgba(37,99,235,0.10)]"
                    : "border-border-light bg-white hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
                }`}
              >
                <summary
                  className={`cursor-pointer text-sm font-semibold transition-colors duration-200 md:text-base ${
                    isDark
                      ? "text-text-primary-dark group-hover:text-primary"
                      : "text-text-primary-light group-hover:text-primary"
                  }`}
                >
                  {item.question}
                </summary>
                <p
                  className={`mt-3 text-sm leading-relaxed transition-colors duration-300 ${
                    isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
                  }`}
                >
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section
          className={`rounded-3xl border p-8 text-center shadow-lg transition-all duration-300 md:p-12 ${
            isDark
              ? "border-border-dark bg-surface-dark"
              : "border-border-light bg-white"
          }`}
        >
          <h2
            className={`text-3xl font-extrabold tracking-[-0.03em] transition-colors duration-300 md:text-4xl ${
              isDark ? "text-text-primary-dark" : "text-text-primary-light"
            }`}
          >
            Ready To Start Your Learning Journey?
          </h2>
          <p
            className={`mx-auto mt-4 max-w-2xl text-sm leading-relaxed transition-colors duration-300 md:text-base ${
              isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
            }`}
          >
            Join CampusNexus today and unlock opportunities through events,
            mentorship, and student communities.
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
