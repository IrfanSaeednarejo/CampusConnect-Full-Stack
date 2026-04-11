import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import ErrorPageShell from "../../components/error/ErrorPageShell";

export default function SessionExpired() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Clear any existing auth data
    localStorage.removeItem('authState');
    navigate('/login');
  };

  return (
    <ErrorPageShell
      icon="schedule"
      iconClassName="text-text-primary"
      title="Session Expired"
      message="Your session has expired for security reasons. Please log in again to continue."
      actions={
        <>
          <Button variant="primary" onClick={handleLogin}>
            Log In Again
          </Button>
          <Button variant="secondary" onClick={() => navigate("/")}>
            Go to Home
          </Button>
        </>
      }
    />
  );
}
