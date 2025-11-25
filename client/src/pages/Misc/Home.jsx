import React from "react";
import Header from "../../components/layout/Header.jsx";
import Footer from "../../components/layout/Footer.jsx";

const heroButtons = [
  { label: "Get started", primary: true, action: "/signUp" },
  { label: "Book a demo", primary: false, action: "/contactUs" },
];

const steps = [
  {
    title: "Create your profile",
    desc: "Share your interests, academic focus, and goals so the platform can tailor recommendations.",
  },
  {
    title: "Discover communities",
    desc: "Find societies, mentors, and study groups that align with where you want to grow.",
  },
  {
    title: "Engage & grow",
    desc: "Register for events, build relationships, and track your progress in one dashboard.",
  },
];

const featureCards = [
  {
    icon: "calendar_month",
    title: "Events hub",
    desc: "Browse curated activities, sync to your calendar, and get notified in real time.",
  },
  {
    icon: "person_search",
    title: "Smart mentor match",
    desc: "Pair with mentors using shared interests, goals, and availability.",
  },
  {
    icon: "workspace_premium",
    title: "Society toolkit",
    desc: "Manage members, approvals, announcements, and sponsorship updates effortlessly.",
  },
  {
    icon: "insights",
    title: "Actionable analytics",
    desc: "Understand engagement trends across events, societies, and mentorship programs.",
  },
];

const stats = [
  { label: "Active students", value: "18K+" },
  { label: "Mentor connections", value: "4.2K" },
  { label: "Societies onboarded", value: "320+" },
  { label: "Avg. satisfaction", value: "4.8/5" },
];

const testimonials = [
  {
    quote:
      "CampusConnect centralised our society workflows and doubled our event turnout in one term.",
    author: "Lana Gupta · Robotics Society Lead",
  },
  {
    quote:
      "Mentor matching finally feels personal. I found a data-science mentor within a week.",
    author: "Ethan Brown · Year 2 Computer Science",
  },
];

const Home = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#030712] text-white">
      <Header />
      <main className="flex-1">
        <section className="px-4 py-12 sm:px-10 md:px-16 lg:px-28 xl:px-40">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-white/80">
                <span className="size-2 rounded-full bg-green-400" />
                Newly launched mentor cohorts
              </div>
              <div className="space-y-6">
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                  A professional home for vibrant campus communities.
                </h1>
                <p className="text-base text-white/70 sm:text-lg">
                  CampusConnect brings students, mentors, and societies together
                  with sleek tools for events, guidance, and collaboration.
                  Designed with a modern workflow-first mindset so your campus
                  feels cohesive from day one.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {heroButtons.map((btn) => (
                  <a
                    key={btn.label}
                    href={btn.action}
                    className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                      btn.primary
                        ? "bg-green-500 text-black hover:bg-green-400"
                        : "border border-white/20 text-white hover:bg-white/10"
                    }`}
                  >
                    {btn.label}
                  </a>
                ))}
              </div>
              <div className="flex flex-wrap gap-6 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="min-w-[120px]">
                    <p className="text-2xl font-bold text-white sm:text-3xl">
                      {stat.value}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-white/60">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#050b16]/80 p-6 shadow-2xl shadow-green-500/10 backdrop-blur">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-widest text-green-400">
                  Unified campus control
                </p>
                <h2 className="text-2xl font-semibold">
                  All your communities, one dashboard.
                </h2>
                <ul className="space-y-4 text-sm text-white/70">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-400">
                      done_all
                    </span>
                    Real-time analytics, approvals, and outreach for every
                    society.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-400">
                      bolt
                    </span>
                    Automation for RSVP reminders, mentor nudges, and reporting.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-400">
                      key
                    </span>
                    Secure role-based access for admins, mentors, and members.
                  </li>
                </ul>
              </div>
              <div className="mt-8 rounded-2xl border border-white/5 bg-black/30 p-5 text-sm text-white/70">
                <p>
                  “This feels like Notion meets Slack, but built for campus.”
                </p>
                <p className="mt-2 text-xs text-white/50">
                  Product Council · 2025 Beta Cohort
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-[#050914] px-4 py-12 sm:px-10 md:px-16 lg:px-28 xl:px-40">
          <div className="max-w-4xl space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              How it works
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Built for velocity across admissions, societies, and support.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-2xl border border-white/5 bg-white/[0.04] p-6 backdrop-blur"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white/80">
                    0{index + 1}
                  </span>
                  <p className="text-sm text-white/60">Step {index + 1}</p>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-white/70">{step.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 py-12 sm:px-10 md:px-16 lg:px-28 xl:px-40">
          <div className="max-w-4xl space-y-4">
            <p className="text-sm font-semibold text-green-400">
              Platform superpowers
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              A clean, premium workspace for every stakeholder.
            </h2>
            <p className="text-white/70">
              CampusConnect integrates scheduling, messaging, analytics, and
              approvals so you don’t have to stitch together multiple tools.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {featureCards.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 transition hover:border-green-500/40"
              >
                <span className="material-symbols-outlined text-3xl text-green-400">
                  {feature.icon}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-white/70">{feature.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-white/5 bg-[#04060b] px-4 py-12 sm:px-10 md:px-16 lg:px-28 xl:px-40">
          <div className="max-w-4xl space-y-6">
            <p className="text-sm font-semibold text-green-400">Voices</p>
            <h2 className="text-3xl font-bold text-white">
              What thriving communities say
            </h2>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <blockquote
                key={testimonial.author}
                className="rounded-2xl border border-white/5 bg-white/[0.04] p-6 text-sm text-white/70"
              >
                “{testimonial.quote}”
                <footer className="mt-4 text-xs uppercase tracking-widest text-white/50">
                  {testimonial.author}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-10 md:px-16 lg:px-32">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-transparent p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="absolute inset-0 opacity-20 blur-3xl" />
            <div className="relative space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                Launch in weeks, not semesters
              </p>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Give your campus a professional-grade platform today.
              </h2>
              <p className="text-white/80">
                Onboard students, societies, and admins with guided setup flows
                and enterprise security.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="/signUp"
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  Start free pilot
                </a>
                <a
                  href="/contactUs"
                  className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Talk to us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
