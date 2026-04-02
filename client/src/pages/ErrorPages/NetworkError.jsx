import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import ErrorPageShell from "../../components/error/ErrorPageShell";

export default function NetworkError() {
  const navigate = useNavigate();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <ErrorPageShell
      icon="wifi_off"
      iconClassName="text-[#f85149]"
      title="Network Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      actions={
        <>
          <Button variant="primary" onClick={handleRetry}>
            Try Again
          </Button>
          <Button variant="secondary" onClick={() => navigate("/")}>
            Go to Home
          </Button>
        </>
      }
      footer={
        <p className="text-sm text-text-secondary">
          If the problem persists, please{" "}
          <span
            onClick={() => navigate("/contact-us")}
            className="text-primary hover:underline cursor-pointer"
          >
            contact support
          </span>
        </p>
      }
    />
  );
}
