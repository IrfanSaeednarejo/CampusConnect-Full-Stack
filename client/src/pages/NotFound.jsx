import { Link } from "react-router-dom";
import Button from "../components/common/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-[#238636] mb-4">404</h1>
        <p className="text-3xl font-bold text-[#e6edf3] mb-8">Page Not Found</p>
        <p className="text-xl text-[#8b949e] mb-12">
          Sorry, the page you're looking for doesn't exist.
        </p>

        <Link to="/">
          <Button variant="primary" className="inline-block">
            Go Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
