import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { sendVerificationEmailThunk } from "../../redux/slices/authSlice";

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // If already verified or no user, hide the banner
  if (!user || user.emailVerified) return null;

  const handleResend = async () => {
    setLoading(true);
    try {
      await dispatch(sendVerificationEmailThunk()).unwrap();
      showSuccess("Verification email sent! Check your inbox.");
      setSent(true);
    } catch (error) {
      showError(error || "Failed to send verification email. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#8a6a1c]/20 border-b border-[#d29922]/50 px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 text-sm z-50">
      <div className="flex items-center gap-2 text-[#d29922]">
        <span className="material-symbols-outlined text-lg">warning</span>
        <p className="font-medium">
          Please verify your email address to secure your account and unlock all features.
        </p>
      </div>
      <button 
        onClick={handleResend}
        disabled={loading || sent}
        className="px-3 py-1 bg-transparent border border-[#d29922] text-[#d29922] rounded hover:bg-[#d29922]/10 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {loading ? "Sending..." : sent ? "Sent!" : "Resend Email"}
      </button>
    </div>
  );
}
