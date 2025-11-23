// src/components/Footer/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="flex items-center justify-center px-5 py-5 text-center border-t border-solid border-[#161b22] bg-[#0d1117]">
      <p className="text-[#8b949e] text-xs font-normal leading-normal">
        © 2024 CampusConnect. All rights reserved. |
        <Link className="hover:text-[#e6edf3] mx-1" to="/privacy">
          Privacy Policy
        </Link>
        |
        <Link className="hover:text-[#e6edf3] mx-1" to="/terms">
          Terms of Service
        </Link>
        |
        <Link className="hover:text-[#e6edf3] mx-1" to="/contactUs">
          Contact Us
        </Link>
      </p>
    </footer>
  );
};

export default Footer;
