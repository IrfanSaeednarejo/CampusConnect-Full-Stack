// src/pages/Auth/ForgotPassword.jsx
import React, { createRef } from "react";
import { KeyRound, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const emailRef = createRef(); // Uncontrolled input
  const navigate = useNavigate(); // For navigation

  const handleSubmit = (e) => {
    e.preventDefault();

    const email = emailRef.current.value;

    if (!email) {
      alert("Please enter your email!");
      return;
    }

    console.log("Sending password reset link to:", email);
    alert("Password reset link sent to " + email);

    navigate("/login"); // Redirect to login after submission
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col items-center justify-center p-4 bg-[#161b22] font-display">
      <div className="flex flex-col items-center justify-center py-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 text-center">
          <KeyRound size={40} className="text-white" />
          <p className="font-bold text-white text-lg">CampusConnect</p>
        </div>

        {/* Form Container */}
        <div className="mt-8 w-full max-w-sm rounded-xl border border-border-dark bg-card-dark p-6 sm:p-8 shadow-2xl">
          {/* Headings */}
          <div className="flex flex-col gap-3">
            <p className="text-white text-2xl font-bold">
              Forgot Your Password?
            </p>
            <p className="text-gray-400 text-sm">
              Enter your registered email and we’ll send you a reset link.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
            {/* Email Input */}
            <label className="flex flex-col w-full">
              <p className="text-white text-sm font-medium pb-2">
                Email Address
              </p>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 text-gray-500 w-4 h-4" />
                <input
                  ref={emailRef}
                  type="email"
                  name="email"
                  placeholder="yourname@university.edu"
                  className="form-input w-full h-10 pl-10 pr-3 rounded-lg text-text-dark bg-input-dark border border-border-dark placeholder-gray-500 focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
            </label>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => navigate("/ResetPassword")}
              className="w-full h-10 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-700 active:scale-[0.98] shadow-md transition"
            >
              Send Reset Link
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-blue-500 text-sm hover:text-green-500 hover:underline"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
