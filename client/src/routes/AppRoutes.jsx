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
    </Routes>
  );
}
