import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext.jsx";
import { NotificationProvider } from "@/contexts/NotificationContext.jsx";
import { AgentProvider } from "@/contexts/AgentContext.jsx";
import { SocketProvider } from "@/contexts/SocketContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { AgentProvider } from "./contexts/AgentContext.jsx";
import { useSocket } from "./hooks/useSocket";

function AppWithSocket() {
  useSocket();
  return <AppRoutes />;
}

export default App;
