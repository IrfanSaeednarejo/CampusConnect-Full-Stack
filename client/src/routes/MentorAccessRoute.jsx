import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../contexts/AuthContext.jsx";
import useHomeTheme from "../hooks/useHomeTheme";
import {
  fetchMyMentorProfile,
  selectMyMentorProfile,
} from "../redux/slices/mentoringSlice";

export default function MentorAccessRoute() {
  const dispatch = useDispatch();
  const { isAuthenticated, roles, loading: authLoading } = useAuth();
  const mentorProfile = useSelector(selectMyMentorProfile);
  const isDark = useHomeTheme();
  const isMentor = Array.isArray(roles) && roles.includes("mentor");
  const [checkingProfile, setCheckingProfile] = useState(() => isMentor && !mentorProfile);

  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated || !isMentor) {
      setCheckingProfile(false);
      return () => {
        isMounted = false;
      };
    }

    if (mentorProfile) {
      setCheckingProfile(false);
      return () => {
        isMounted = false;
      };
    }

    setCheckingProfile(true);
    dispatch(fetchMyMentorProfile()).finally(() => {
      if (isMounted) {
        setCheckingProfile(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [dispatch, isAuthenticated, isMentor, mentorProfile]);

  if (authLoading || checkingProfile) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isDark ? "bg-background-dark" : "bg-background-light"}`}>
        <div
          className={`flex flex-col items-center gap-4 rounded-3xl border px-8 py-7 ${
            isDark
              ? "border-border-dark bg-surface-dark"
              : "border-border-light bg-surface-light shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
          }`}
        >
          <div
            className={`h-8 w-8 animate-spin rounded-full border-4 border-t-transparent ${
              isDark ? "border-primary-dark" : "border-primary-light"
            }`}
          />
          <p className={`text-sm ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
            Checking mentor access...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isMentor || !mentorProfile) {
    return <Navigate to="/error/access-denied" replace />;
  }

  if (mentorProfile.isActive === false) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
