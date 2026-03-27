import AppRoutes from "./routes/AppRoutes";
import { useSocket } from "./hooks/useSocket";

function AppWithSocket() {
  useSocket();
  return <AppRoutes />;
}

export default AppWithSocket;
