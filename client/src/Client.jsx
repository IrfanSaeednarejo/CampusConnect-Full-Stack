import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./redux/slices/authSlice";
import { fetchUnreadCountThunk } from "./redux/slices/notificationSlice";
import { useSocket } from "./hooks/useSocket";
import useHomeTheme from "./hooks/useHomeTheme";
import AppRoutes from "./routes/AppRoutes";

import { Toaster } from "react-hot-toast";

function AppWithSocket() {
  const dispatch = useDispatch();
  useSocket();
  const isDark = useHomeTheme();

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(checkAuth());
    } else {
      // Fetch initial unread count on successful authentication
      dispatch(fetchUnreadCountThunk());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "16px",
            border: `1px solid ${isDark ? "rgba(148,163,184,0.22)" : "rgba(148,163,184,0.18)"}`,
            background: isDark ? "rgb(22 27 34)" : "rgb(255 255 255)",
            color: isDark ? "rgb(230 237 243)" : "rgb(15 23 42)",
            boxShadow: isDark
              ? "0 20px 45px rgba(0,0,0,0.28)"
              : "0 18px 42px rgba(15,23,42,0.12)",
          },
        }}
      />
      <AppRoutes />
    </>
  );
}

export default AppWithSocket;
