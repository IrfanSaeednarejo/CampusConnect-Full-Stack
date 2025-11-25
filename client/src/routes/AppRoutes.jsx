// AppRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Misc/Home.jsx";
import About from "../pages/Misc/About.jsx";
import ContactUs from "../pages/Help/ContactUs.jsx";
import PrivacyPolicy from "../pages/Misc/PrivacyPolicy.jsx";
import TermsOfService from "../pages/Misc/TermsOfService.jsx";
import Login from "../pages/Auth/Login.jsx";
import SignUp from "../pages/Auth/SignUp.jsx";
import ForgotPassword from "../pages/Auth/ForgotPassword.jsx";
import OnboardingWizardWelcome from "../pages/Onboarding/OnboardingWizardWelcome.jsx";
import ProfileSetup from "../pages/Onboarding/ProfileSetup.jsx";
import NotificationsSetup from "../pages/Onboarding/NotificationsSetup.jsx";
import OnboardingWizardComplete from "../pages/Onboarding/OnboardingWizardComplete.jsx";
import UserProfile from "../pages/Dashboard/UserProfile.jsx";
import DashboardIndex from "../pages/Dashboard/DashboardIndex.jsx";
import GenralDashboard from "../pages/Dashboard/GenralDashboard.jsx";
import RegisterEvent from "../pages/Events/RegisterEvent.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contactUs" element={<ContactUs />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/ResetPassword" element={<ForgotPassword />} />
      <Route path="/onboarding" element={<OnboardingWizardWelcome />} />
      <Route path="/onboarding/profilesetup" element={<ProfileSetup />} />
      <Route
        path="/onboarding/notificationssetup"
        element={<NotificationsSetup />}
      />
      <Route
        path="/onboarding/onboardingwizardcomplete"
        element={<OnboardingWizardComplete />}
      />
      <Route path="/dashboard/userprofile" element={<UserProfile />} />
      <Route path="/dashboard/dashboardindex" element={<DashboardIndex />} />
      <Route path="/dashboard/generaldashboard" element={<GenralDashboard />} />

      {/* --- Event Register Page with dynamic parameter --- */}
      <Route path="/events/:eventType" element={<RegisterEvent />} />
    </Routes>
  );
}
