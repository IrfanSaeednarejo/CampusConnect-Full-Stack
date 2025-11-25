// src/pages/Help/ContactUs.jsx
import React from "react";
import Header from "../../components/layout/Header";
import { useNavigate } from "react-router-dom";

export default function ContactUs() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can handle form submission, e.g., send to API or save data
    alert("Message sent successfully!");
  };

  return (
    <div className="font-display text-text-primary-dark min-h-screen w-full bg-[#0d1117]">
      {/* HEADER */}
      <Header />

      <main className="flex flex-col gap-8 md:gap-12 py-8 md:py-16 px-4 md:px-10 max-w-[960px] mx-auto">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-[#e6edf3] leading-tight tracking-[-0.033em]">
            Send Us a Message
          </h1>
          <p className="text-[#8b949e] text-base md:text-lg">
            Have questions, feedback, or just want to say hello? We’d love to
            hear from you.
          </p>
        </div>

        {/* FORM */}
        <div className="w-full max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* NAME */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-[#e6edf3]"
              >
                Your Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md h-10 px-3 text-sm text-[#e6edf3] placeholder:text-[#8b949e] focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* EMAIL */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#e6edf3]"
              >
                Your Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md h-10 px-3 text-sm text-[#e6edf3] placeholder:text-[#8b949e] focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* TOPIC */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="topic"
                className="text-sm font-medium text-[#e6edf3]"
              >
                Topic
              </label>
              <select
                id="topic"
                name="topic"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md h-10 px-3 text-sm text-[#e6edf3] focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option>General Question</option>
                <option>Technical Support</option>
                <option>Partnership Inquiry</option>
                <option>Other</option>
              </select>
            </div>

            {/* MESSAGE */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="message"
                className="text-sm font-medium text-[#e6edf3]"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows="6"
                placeholder="Please describe your inquiry..."
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md p-3 text-sm text-[#e6edf3] placeholder:text-[#8b949e] focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row-reverse items-center gap-4 mt-4">
              <button
                type="submit"
                className="flex w-full sm:w-auto min-w-[84px] items-center justify-center rounded-md h-10 px-6 bg-green-600 text-white text-sm font-bold tracking-wide hover:bg-green-700 transition-colors"
              >
                Send Message
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex w-full sm:w-auto min-w-[84px] items-center justify-center rounded-md h-10 px-6 bg-[#30363d] text-white text-sm font-bold tracking-wide hover:bg-[#484f58] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
