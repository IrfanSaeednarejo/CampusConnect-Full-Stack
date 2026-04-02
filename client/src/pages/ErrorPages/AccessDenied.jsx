import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { getDashboardRoute } from "../../utils/authValidator";
import Button from "../../components/common/Button";
import ErrorPageShell from "../../components/error/ErrorPageShell";

export default function AccessDenied() {
  const navigate = useNavigate();
  const { role, isAuthenticated } = useAuth();

  const handleGoBack = () => {
    if (isAuthenticated && role) {
      const dashboardRoute = getDashboardRoute(role);
      navigate(dashboardRoute);
    } else {
      navigate('/');
    }
  };

  return (
    <ErrorPageShell
      icon="block"
      iconClassName="text-danger"
      title="Access Denied"
      message="You don't have permission to access this page. Please check your account role or contact support."
      actions={
        <>
          <Button variant="primary" onClick={handleGoBack}>
            {isAuthenticated ? "Go to Dashboard" : "Go to Home"}
          </Button>
          {!isAuthenticated && (
            <Button variant="secondary" onClick={() => navigate("/login")}>
              Log In
            </Button>
          )}
        </>
      }
    />
  );
}
