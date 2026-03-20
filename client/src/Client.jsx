import AppRoutes from "./routes/AppRoutes.jsx";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { AgentProvider } from "./contexts/AgentContext.jsx";
import { SocketProvider } from "./contexts/SocketContext.jsx";

const socketUrl = import.meta.env.VITE_SOCKET_URL;

if (!socketUrl) {
  throw new Error("VITE_SOCKET_URL is not configured. Please set it in your environment.");
}

function ErrorBoundary({ children }) {
  return children;
}
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <AgentProvider>
            <SocketProvider socketUrl={socketUrl}>
              <AppRoutes />
            </SocketProvider>
          </AgentProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
