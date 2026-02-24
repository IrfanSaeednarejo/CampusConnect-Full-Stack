import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { getDashboardRoute } from "../../utils/authValidator";
import Button from "../../components/common/Button";
import ErrorPageShell from "../../components/error/ErrorPageShell";

export default function Forbidden() {
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
      icon="do_not_disturb"
      iconClassName="text-[#da3633]"
      code="403"
      title="Forbidden"
      message="You are not authorized to access this resource. Contact your administrator if you believe this is an error."
      actions={
        <>
          <Button variant="primary" onClick={handleGoBack}>
            {isAuthenticated ? "Go to Dashboard" : "Go to Home"}
          </Button>
          <Button variant="secondary" onClick={() => navigate("/contact-us")}>
            Contact Support
          </Button>
        </>
      }
    />
  );
}
