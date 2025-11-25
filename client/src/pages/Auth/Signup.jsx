// src/pages/Auth/SignUp.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
export default function SignUp() {
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  // Error state
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear error on change
  };

  // Form validation
  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email))
      newErrors.email = "Email is invalid";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Confirm your password";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // TODO: Replace with API call
    console.log("Form Submitted:", form);
    alert("Sign Up Successful!");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light bg-[#161b22] p-4 font-display">
      <div className="flex w-full max-w-md flex-col gap-8 rounded-xl border border-[#3d5246] bg-[#161b22] p-8">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-white text-4xl font-black leading-tight">
            Create Your Account
          </h1>
          <p className="text-[#9eb7a9] text-base mt-2">
            Join CampusConnect and unlock powerful tools for campus success.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <InputField
            label="Full Name"
            name="fullName"
            placeholder="Enter your full name"
            value={form.fullName}
            onChange={handleChange}
            error={errors.fullName}
          />
          <InputField
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            placeholder="Minimum 8 characters"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />
          <InputField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          {/* Role Selection */}
          <div className="flex flex-col gap-2">
            <p className="text-white text-base font-medium">Select Your Role</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <RoleRadio
                name="role"
                value="student"
                label="Student"
                checked={form.role === "student"}
                onChange={handleChange}
              />
              <RoleRadio
                name="role"
                value="mentor"
                label="Mentor"
                checked={form.role === "mentor"}
                onChange={handleChange}
              />
              <RoleRadio
                name="role"
                value="society_head"
                label="Society Head"
                checked={form.role === "society_head"}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col gap-4 pt-4">
            <button
              type="submit"
              className="h-14 w-full rounded-lg bg-primary text-black font-bold hover:bg-primary/90 transition"
            >
              Sign Up
            </button>
            <p className="text-center text-[#9eb7a9]">
              Already have an account?{" "}
              <span
                className="text-primary font-medium cursor-pointer text-blue-500  hover:text-green-500 hover:underline"
                onClick={() => navigate("/login")}
              >
                Sign in
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

// Input Field Component
function InputField({
  label,
  name,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
}) {
  return (
    <label className="flex flex-col">
      <span className="text-white text-base pb-2">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-input w-full rounded-lg text-white p-4 h-14 border ${
          error ? "border-red-500" : "border-[#3d5246]"
        } bg-[#1c2620] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary`}
      />
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </label>
  );
}

// Role Radio Component
function RoleRadio({ name, value, label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 p-4 rounded-lg border border-[#3d5246] bg-[#1c2620] cursor-pointer checked:border-primary checked:ring-2 checked:ring-primary/50">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="form-radio h-5 w-5 border-[#9eb7a9] bg-transparent text-primary focus:ring-primary/50 focus:ring-offset-0"
      />
      <span className="text-white text-base">{label}</span>
    </label>
  );
}
