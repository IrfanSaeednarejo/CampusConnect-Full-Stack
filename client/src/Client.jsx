import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./redux/slices/authSlice";
import { useSocket } from "./hooks/useSocket";
import AppRoutes from "./routes/AppRoutes";

function AppWithSocket() {
  const dispatch = useDispatch();
  useSocket();

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(checkAuth());
    }
  }, [dispatch, isAuthenticated]);

  return <AppRoutes />;
}

export default AppWithSocket;
