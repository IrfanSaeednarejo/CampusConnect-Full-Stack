import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Card from "../../components/common/Card";
import CircularProgress from "../../components/common/CircularProgress";
import useHomeTheme from "../../hooks/useHomeTheme";
import { verifyCertificate } from "../../api/gamificationApi";

export default function VerifyCertificatePage() {
  const { code } = useParams();
  const isDark = useHomeTheme();
  const [state, setState] = useState({
    loading: true,
    error: "",
    certificate: null,
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setState({ loading: true, error: "", certificate: null });
        const { data } = await verifyCertificate(code);
        if (!active) return;
        setState({ loading: false, error: "", certificate: data.data });
      } catch (err) {
        if (!active) return;
        setState({
          loading: false,
          error: err?.message || "Certificate could not be verified.",
          certificate: null,
        });
      }
    };

    if (code) load();
    return () => {
      active = false;
    };
  }, [code]);

  if (state.loading) {
    return (
      <div className={`flex min-h-[70vh] items-center justify-center ${isDark ? "bg-background-dark" : "bg-background-light"}`}>
        <CircularProgress />
      </div>
    );
  }

  const certificate = state.certificate;

  return (
    <div className={`min-h-[70vh] ${isDark ? "bg-background-dark text-text-primary-dark" : "bg-background-light text-text-primary-light"}`}>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.22em] text-text-secondary-dark" : "text-xs font-semibold uppercase tracking-[0.22em] text-text-secondary-light"}>
            CampusNexus Verification
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Certificate Verification</h1>
          <p className={isDark ? "mx-auto mt-3 max-w-2xl text-sm text-text-secondary-dark" : "mx-auto mt-3 max-w-2xl text-sm text-text-secondary-light"}>
            Confirm certificate authenticity using its verification code and issuance record.
          </p>
        </div>

        {certificate ? (
          <Card className="mx-auto max-w-3xl" padding="p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-success">
                  <span className="material-symbols-outlined text-base">verified</span>
                  Verified
                </div>
                <h2 className="mt-4 text-3xl font-black">{certificate.title}</h2>
                <p className={isDark ? "mt-2 text-sm text-text-secondary-dark" : "mt-2 text-sm text-text-secondary-light"}>
                  Issued to {certificate.recipient?.displayName || "CampusNexus user"}
                </p>
              </div>
              <div className={isDark ? "flex h-16 w-16 items-center justify-center rounded-3xl bg-success/15 text-success" : "flex h-16 w-16 items-center justify-center rounded-3xl bg-success/10 text-success"}>
                <span className="material-symbols-outlined text-4xl">workspace_premium</span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className={`rounded-2xl border p-4 ${isDark ? "border-border-dark bg-background-dark" : "border-border-light bg-background-light"}`}>
                <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-dark" : "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light"}>
                  Certificate Type
                </p>
                <p className="mt-2 text-lg font-semibold">{certificate.type}</p>
              </div>
              <div className={`rounded-2xl border p-4 ${isDark ? "border-border-dark bg-background-dark" : "border-border-light bg-background-light"}`}>
                <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-dark" : "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light"}>
                  Verification Code
                </p>
                <p className="mt-2 text-lg font-semibold">{certificate.verificationCode}</p>
              </div>
              <div className={`rounded-2xl border p-4 ${isDark ? "border-border-dark bg-background-dark" : "border-border-light bg-background-light"}`}>
                <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-dark" : "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light"}>
                  Issued On
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : "Not available"}
                </p>
              </div>
              <div className={`rounded-2xl border p-4 ${isDark ? "border-border-dark bg-background-dark" : "border-border-light bg-background-light"}`}>
                <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-dark" : "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light"}>
                  Source
                </p>
                <p className="mt-2 text-lg font-semibold">{certificate.sourceModel || "CampusNexus"}</p>
              </div>
            </div>

            {(certificate.meta?.eventTitle || certificate.meta?.roleLabel || certificate.meta?.rank) && (
              <div className={`mt-6 rounded-2xl border p-5 ${isDark ? "border-border-dark bg-background-dark" : "border-border-light bg-background-light"}`}>
                <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-dark" : "text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-light"}>
                  Recognition Details
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  {certificate.meta?.eventTitle ? <p>Event: {certificate.meta.eventTitle}</p> : null}
                  {certificate.meta?.roleLabel ? <p>Recognition: {certificate.meta.roleLabel}</p> : null}
                  {certificate.meta?.rank ? <p>Rank: #{certificate.meta.rank}</p> : null}
                </div>
              </div>
            )}

            {certificate.pdfUrl ? (
              <a
                href={certificate.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex text-sm font-medium text-info hover:underline"
              >
                View certificate PDF
              </a>
            ) : null}
          </Card>
        ) : (
          <Card className="mx-auto max-w-2xl text-center" padding="p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-danger/10 text-danger">
              <span className="material-symbols-outlined text-4xl">error</span>
            </div>
            <h2 className="mt-5 text-2xl font-black">Certificate Not Verified</h2>
            <p className={isDark ? "mt-3 text-sm text-text-secondary-dark" : "mt-3 text-sm text-text-secondary-light"}>
              {state.error || "This certificate code is invalid, missing, or no longer active."}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
