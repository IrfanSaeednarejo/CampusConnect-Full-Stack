import Card from "../common/Card";
import useHomeTheme from "../../hooks/useHomeTheme";
import { Link } from "react-router-dom";

export default function CertificateCard({ certificate }) {
  const isDark = useHomeTheme();
  return (
    <Card padding="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-dark" : "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light"}>
            {certificate.type}
          </p>
          <h3 className={isDark ? "mt-2 text-lg font-semibold text-text-primary-dark" : "mt-2 text-lg font-semibold text-text-primary-light"}>
            {certificate.title}
          </h3>
          <p className={isDark ? "mt-2 text-xs text-text-secondary-dark" : "mt-2 text-xs text-text-secondary-light"}>
            Code: {certificate.verificationCode}
          </p>
        </div>
        <div className={isDark ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-success/15 text-success" : "flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success"}>
          <span className="material-symbols-outlined text-2xl">workspace_premium</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        <Link to={`/verify-certificate/${certificate.verificationCode}`} className="inline-flex text-sm font-medium text-info hover:underline">
          Verify certificate
        </Link>
        {certificate.pdfUrl ? (
          <a href={certificate.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex text-sm font-medium text-info hover:underline">
            View certificate
          </a>
        ) : (
          <p className={isDark ? "text-xs text-text-secondary-dark" : "text-xs text-text-secondary-light"}>
            PDF generation is pending for this certificate.
          </p>
        )}
      </div>
    </Card>
  );
}
