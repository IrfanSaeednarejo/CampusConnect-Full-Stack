import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { sendVerificationEmailThunk } from "../../redux/slices/authSlice";
import useHomeTheme from "../../hooks/useHomeTheme";
import { getButtonClassName } from "../common/Button";
import { useLanguage } from "../../hooks/useLanguage";

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useNotification();
  const isDark = useHomeTheme();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // If already verified or no user, hide the banner
  if (!user || user.emailVerified) return null;

  const handleResend = async () => {
    setLoading(true);
    try {
      await dispatch(sendVerificationEmailThunk()).unwrap();
      showSuccess(t("emailBanner.success"));
      setSent(true);
    } catch (error) {
      showError(error || t("emailBanner.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`z-50 flex w-full flex-col items-center justify-center gap-3 border-b px-4 py-3 text-sm sm:flex-row md:gap-4 ${
        isDark ? "border-warning/25 bg-warning/10" : "border-warning/20 bg-warning/5"
      }`}
    >
      <div className="flex items-center gap-2 text-warning">
        <span className="material-symbols-outlined text-lg">warning</span>
        <p className="font-medium text-warning">
          {t("emailBanner.message")}
        </p>
      </div>
      <button 
        onClick={handleResend}
        disabled={loading || sent}
        className={getButtonClassName({
          variant: "outline",
          size: "sm",
          className: "whitespace-nowrap border-warning/40 text-warning hover:bg-warning/10",
        })}
      >
        {loading ? t("emailBanner.sending") : sent ? t("emailBanner.sent") : t("emailBanner.resend")}
      </button>
    </div>
  );
}
