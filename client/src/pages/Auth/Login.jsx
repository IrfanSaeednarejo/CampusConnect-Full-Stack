// src/pages/Auth/SignIn.jsx
import React, { createRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";

export default function Login() {
  const navigate = useNavigate();

  // Refs for uncontrolled inputs
  const emailRef = createRef();
  const passwordRef = createRef();
  const passwordToggleRef = createRef();

  // Toggle password visibility
  const togglePassword = () => {
    const input = passwordRef.current;
    input.type = input.type === "password" ? "text" : "password";
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    if (!email || !password) {
      alert("Please fill in all fields!");
      return;
    }

    console.log("Email:", email, "Password:", password);
    alert("Login successful!");
    navigate("/onboarding"); // Redirect after login
  };

  return (
    <div className="font-display bg-background-light bg-[#161b22] min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="flex flex-col w-full max-w-[400px] gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo />
          <h1 className="text-white text-2xl font-semibold tracking-tight">
            Sign In to CampusConnect
          </h1>
          <p className="text-gray-400 text-sm">
            Enter your credentials to access your personalized campus
            experience.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-4 border border-gray-700 bg-[#161b22] rounded-lg p-6"
        >
          {/* Email */}
          <div className="flex flex-col w-full">
            <label className="text-white text-sm font-medium pb-2">
              Email Address
            </label>
            <input
              ref={emailRef}
              type="email"
              placeholder="Enter your email"
              className="form-input w-full h-12 px-3 text-white placeholder-gray-400 bg-[#1c2620] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col w-full relative">
            <label className="text-white text-sm font-medium pb-2 flex justify-between items-baseline">
              Password{" "}
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-green-500 text-xs hover:underline"
              >
                Forgot?
              </button>
            </label>
            <input
              ref={passwordRef}
              type="password"
              placeholder="Enter your password"
              className="form-input w-full h-12 px-3 text-white placeholder-gray-400 bg-[#1c2620] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            />
            <button
              type="button"
              ref={passwordToggleRef}
              onClick={togglePassword}
              className="absolute right-3 top-9 text-gray-400 hover:text-white text-sm"
            >
              Show
            </button>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-lg h-12 px-5 bg-primary hover:bg-green-700 text-white text-sm font-bold tracking-wide transition-colors"
          >
            Sign In
          </button>
        </form>

        <div className="flex justify-center p-4 border border-gray-700 rounded-lg">
          <p className="text-gray-400 text-sm">
            New to CampusConnect?{" "}
            <Link
              className=" text-blue-500  hover:text-green-500 hover:underline"
              to="/signUp"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Logo Component
const Logo = () => (
  <svg
    className="h-12 w-12 text-green-500"
    fill="currentColor"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
  </svg>
);
