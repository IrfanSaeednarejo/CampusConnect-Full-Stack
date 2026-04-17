import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAuth } from "./redux/slices/authSlice";
import { useSocket } from "./hooks/useSocket";
import AppRoutes from "./routes/AppRoutes";

function AppWithSocket() {
  const dispatch = useDispatch();
  useSocket();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return <AppRoutes />;
}

export default AppWithSocket;
