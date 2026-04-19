import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./redux/slices/authSlice";
import { fetchUnreadCountThunk } from "./redux/slices/notificationSlice";
import { useSocket } from "./hooks/useSocket";
import AppRoutes from "./routes/AppRoutes";

function AppWithSocket() {
  const dispatch = useDispatch();
  useSocket();

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(checkAuth());
    } else {
      // Fetch initial unread count on successful authentication
      dispatch(fetchUnreadCountThunk());
    }
  }, [dispatch, isAuthenticated]);

  return <AppRoutes />;
}

export default AppWithSocket;
