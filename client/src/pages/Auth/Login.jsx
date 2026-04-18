import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, selectIsAuthenticated } from "../../redux/slices/authSlice";
import { validateLoginForm } from "../../utils/authValidator";
import AuthCard from "../../components/auth/AuthCard";
import AuthShell from "../../components/auth/AuthShell";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const validation = validateLoginForm(form);
    return validation.errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const resultAction = await dispatch(loginUser({
        email: form.email,
        password: form.password
      }));

      if (loginUser.fulfilled.match(resultAction)) {
        navigate('/dashboard', { replace: true });
      } else {
        setErrors({ email: resultAction.payload || "Login failed" });
      }
    } catch (error) {
      console.error('Login error occurred', error);
      setErrors({ email: "An unexpected error occurred" });
    }
  };

  return (
    <AuthShell className="h-auto bg-[#0d1117] group/design-root overflow-x-hidden">
      <div className="px-4 flex flex-1 justify-center items-center py-10">
        <div className="layout-content-container flex flex-col w-full max-w-[384px] flex-1">
          <div className="flex flex-col items-center gap-4 text-center mb-8">
            <svg
              aria-hidden="true"
              className="octicon octicon-mark-github"
              data-view-component="true"
              height="48"
              version="1.1"
              viewBox="0 0 16 16"
              width="48"
            >
              <path
                d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.19.01-.82.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21-.15.46-.55.38A8.013 8.013 0 0 1 0 8c0-4.42 3.58-8 8-8Z"
                fill="#c9d1d9"
              ></path>
            </svg>
            <div className="flex flex-col gap-2">
              <p className="text-[#c9d1d9] text-2xl font-semibold leading-tight tracking-[-0.033em]">
                Sign In to CampusConnect
              </p>
              <p className="text-[#8b949e] text-sm font-normal leading-normal">
                Enter your credentials to access your personalized campus
                experience.
              </p>
            </div>
          </div>

          <AuthCard className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                error={errors.email}
              />

              <div className="flex flex-col w-full">
                <div className="flex justify-between items-baseline mb-2">
                  <p className="text-[#c9d1d9] text-sm font-medium leading-normal">
                    Password
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-[#58a6ff] text-xs font-normal leading-normal hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
                <FormField
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  error={errors.password}
                />
              </div>

              <FormActions
                onSubmit={handleSubmit}
                submitText="Sign in"
                submitVariant="primary"
                className="flex-col-reverse"
                onCancel={null}
              />
            </form>
          </AuthCard>

          <div className="flex justify-center mt-6 p-4 border border-[#30363d] rounded-lg">
            <p className="text-[#8b949e] text-sm">
              New to CampusConnect?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-[#58a6ff] hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
