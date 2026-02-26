import AppRoutes from "./Routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext.jsx";
import { NotificationProvider } from "@/contexts/NotificationContext.jsx";
import { AgentProvider } from "@/contexts/AgentContext.jsx";
import { SocketProvider } from "@/contexts/SocketContext.jsx";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <AgentProvider>
            <SocketProvider socketUrl={import.meta.env.VITE_SOCKET_URL || "wss://api.example.com/socket"}>
              <AppRoutes />
            </SocketProvider>
          </AgentProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
