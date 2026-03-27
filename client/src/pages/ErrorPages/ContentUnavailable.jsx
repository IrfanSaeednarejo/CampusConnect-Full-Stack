import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import ErrorPageShell from "../../components/error/ErrorPageShell";

export default function ContentUnavailable() {
  const navigate = useNavigate();

  return (
    <ErrorPageShell
      icon="cloud_off"
      iconClassName="text-[#8b949e]"
      code="404"
      title="Content Unavailable"
      message="This content is not available right now. It may have been moved or removed."
      actions={
        <>
          <Button variant="primary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/")}
          >
            Go to Home
          </Button>
        </>
      }
    />
  );
}
