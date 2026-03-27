import AppRoutes from "./routes/AppRoutes.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { AgentProvider } from "./contexts/AgentContext.jsx";
import { useSocket } from "./hooks/useSocket";

function AppWithSocket() {
  useSocket();
  return <AppRoutes />;
}

function App() {
  return (
    <ErrorBoundary>
      <AgentProvider>
        <AppWithSocket />
      </AgentProvider>
    </ErrorBoundary>
  );
}

export default App;
