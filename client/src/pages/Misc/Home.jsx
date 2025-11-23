import React from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const Home = () => {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden font-display bg-background-light  bg-[#0d1117] ">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Header Component */}
            <Header />

            {/* Hero Section */}
            <div className="py-10">
              <div className="@container">
                <div className="@[480px]:p-4">
                  <div
                    className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-start justify-end px-4 pb-10 @[480px]:px-10"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(13, 17, 23, 0.4) 0%, rgba(13, 17, 23, 0.8) 100%)",
                      backgroundColor: "#161b22",
                    }}
                  >
                    <div className="flex flex-col gap-2 text-left">
                      <h1 className="text-[#e6edf3] text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                        Your Campus, Connected.
                      </h1>
                      <h2 className="text-[#8b949e] text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                        The ultimate platform uniting students, mentors, and
                        societies to help you connect and thrive in a vibrant
                        campus ecosystem.
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {[
                        "I'm a Student",
                        "I'm a Mentor",
                        "I'm a Society Head",
                      ].map((text, idx) => (
                        <button
                          key={idx}
                          className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] ${
                            idx === 0
                              ? "bg-primary text-white hover:bg-[#2ea043]"
                              : "bg-[#161b22] text-[#e6edf3] border border-[#30363d] hover:bg-[#21262d]"
                          }`}
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="flex flex-col gap-6 px-4 py-10 @container">
              <div className="flex flex-col gap-2 text-left">
                <h1 className="text-[#e6edf3] tracking-light text-2xl font-bold leading-tight">
                  How It Works
                </h1>
                <p className="text-[#8b949e] text-sm font-normal leading-normal max-w-[720px]">
                  Getting started with CampusConnect is simple. Follow these
                  steps to join our community.
                </p>
              </div>
              <div className="flex flex-col gap-4 border-l border-[#30363d] pl-4">
                {[
                  {
                    title: "Create Your Account",
                    desc: "Sign up in minutes and build your profile to showcase your skills and interests.",
                  },
                  {
                    title: "Explore & Discover",
                    desc: "Browse upcoming events, find mentors in your field, or discover societies that match your passions.",
                  },
                  {
                    title: "Connect & Grow",
                    desc: "Join events, connect with mentors, and start building your network for academic and professional success.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 mt-4 first:mt-0"
                  >
                    <div className="flex-shrink-0 size-6 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center text-primary text-sm font-semibold">
                      {idx + 1}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <h2 className="text-[#e6edf3] text-sm font-bold leading-tight">
                        {item.title}
                      </h2>
                      <p className="text-[#8b949e] text-xs font-normal leading-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Section */}
            <div className="flex flex-col gap-6 px-4 py-10 @container">
              <div className="flex flex-col gap-2">
                <h1 className="text-[#e6edf3] tracking-light text-2xl font-bold leading-tight">
                  Unlock Your University Potential
                </h1>
                <p className="text-[#8b949e] text-sm font-normal leading-normal max-w-[720px]">
                  Discover the tools you need to succeed. CampusConnect offers a
                  suite of features designed to enhance your academic and social
                  life.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-0">
                {[
                  {
                    icon: "calendar_month",
                    title: "Event Management",
                    desc: "Effortlessly discover, create, and manage campus events, from society meetups to academic workshops.",
                  },
                  {
                    icon: "handshake",
                    title: "Find a Mentor",
                    desc: "Connect with experienced mentors for guidance, or share your knowledge and guide fellow students on their journey.",
                  },
                  {
                    icon: "groups",
                    title: "Academic Networking",
                    desc: "Collaborate with peers and faculty on academic projects, and build your professional network before you graduate.",
                  },
                  {
                    icon: "account_balance",
                    title: "Society Engagement",
                    desc: "Join and lead societies, manage members, and promote initiatives to the wider university community.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-2 p-2">
                    <div className="text-primary size-8 flex items-center justify-center">
                      <span className="material-symbols-outlined !text-3xl">
                        {item.icon}
                      </span>
                    </div>
                    <h2 className="text-[#e6edf3] text-sm font-bold leading-tight">
                      {item.title}
                    </h2>
                    <p className="text-[#8b949e] text-xs font-normal leading-normal">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="py-10">
              <div className="@container">
                <div className="flex flex-col justify-end gap-6 px-4 py-10 @[480px]:gap-8 @[480px]:px-10 @[480px]:py-20">
                  <div className="flex flex-col gap-2 text-center items-center">
                    <h1 className="text-[#e6edf3] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
                      Ready to Join the Community?
                    </h1>
                    <p className="text-[#8b949e] text-base font-normal leading-normal max-w-[720px]">
                      Sign up today and start building connections that matter.
                    </p>
                  </div>
                  <div className="flex flex-1 justify-center">
                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] grow hover:bg-[#2ea043]">
                      <span className="truncate">Get Started for Free</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Component */}
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
