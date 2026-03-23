import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import ErrorPageShell from "../../components/error/ErrorPageShell";

export default function ServerError() {
  const navigate = useNavigate();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <ErrorPageShell
      icon="error"
      iconClassName="text-[#f85149]"
      code="500"
      title="Server Error"
      message="Oops! Something went wrong on our end. Our team has been notified and is working to fix the issue."
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
        <p className="text-sm text-[#8b949e]">
          Error persisting?{" "}
          <span
            onClick={() => navigate("/contact-us")}
            className="text-[#238636] hover:underline cursor-pointer"
          >
            Contact support
          </span>
        </p>
      }
    />
  );
}
