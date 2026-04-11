import { Link } from "react-router-dom";

export default function SharedFooter() {
  return (
    <footer className="flex items-center justify-center px-5 py-5 text-center border-t border-solid border-background bg-background lg:pb-5 pb-20 w-full mt-auto">
      <p className="text-text-secondary text-xs font-normal leading-normal">
        © {new Date().getFullYear()} CampusConnect. All rights reserved. |
        <Link className="hover:text-text-primary ml-1" to="/privacy">
          Privacy Policy
        </Link>{" "}
        |
        <Link className="hover:text-text-primary ml-1" to="/terms">
          Terms of Service
        </Link>{" "}
        |
        <Link className="hover:text-text-primary ml-1" to="/contact-us">
          Contact Us
        </Link>
      </p>
    </footer>
  );
}
