import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import ErrorPageShell from "../../components/error/ErrorPageShell";

export default function ServiceUnavailable() {
  const navigate = useNavigate();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <ErrorPageShell
      icon="engineering"
      iconClassName="text-[#ffa657]"
      code="503"
      title="Service Unavailable"
      message="We're currently performing maintenance to improve your experience. We'll be back shortly!"
      actions={
        <>
          <Button variant="primary" onClick={handleRetry}>
            Check Again
          </Button>
          <Button variant="secondary" onClick={() => navigate("/")}>
            Go to Home
          </Button>
        </>
      }
      footer={
        <div className="p-4 bg-surface rounded-lg border border-border">
          <p className="text-sm text-text-secondary">
            📅 Scheduled maintenance usually takes 15-30 minutes
          </p>
        </div>
      }
    />
  );
}
