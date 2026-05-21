import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectAllSocieties, fetchSocieties } from "../redux/slices/societySlice";
import SectionHeader from "../components/common/SectionHeader";
import SocietyCardSimple from "../components/common/SocietyCardSimple";
import CTACard from "../components/common/CTACard";
import useHomeTheme from "../hooks/useHomeTheme";
import { useLanguage } from "../hooks/useLanguage";

export default function Societies() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDark = useHomeTheme();
  const { t } = useLanguage();
  const societiesData = useSelector(selectAllSocieties);
  const societies = Array.isArray(societiesData) ? societiesData : [];

  useEffect(() => {
    dispatch(fetchSocieties());
  }, [dispatch]);

  return (
    <div
      className={`w-full min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-background-dark text-text-primary-dark"
          : "bg-background-light text-text-primary-light"
      }`}
    >
      <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-10 md:px-14">
        <section
          className={`relative overflow-hidden rounded-[2rem] border px-6 py-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition-all duration-300 md:px-8 md:py-10 ${
            isDark
              ? "border-border-dark bg-surface-dark"
              : "border-border-light bg-white/95 backdrop-blur-xl"
          }`}
        >
          <div className={`absolute inset-0 ${isDark ? "bg-primary/5" : "bg-info/5"}`} />
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span
                className={`mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] transition-colors duration-300 ${
                  isDark
                    ? "border-border-dark bg-background-dark text-info"
                    : "border-info/20 bg-white text-info"
                }`}
              >
                {t("societies.badge")}
              </span>
              <SectionHeader
                title={t("societies.title")}
                subtitle={t("societies.subtitle")}
                align="left"
                isDark={isDark}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: t("societies.stats.activeGroups"), value: societies.length || "20+" },
                { label: t("societies.stats.studentReach"), value: "8K+" },
                { label: t("societies.stats.newOpenings"), value: t("societies.stats.weekly") },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border px-4 py-4 text-center transition-all duration-300 ${
                    isDark
                    ? "border-border-dark bg-background-dark"
                      : "border-border-light bg-slate-50"
                  }`}
                >
                  <p
                    className={`text-lg font-extrabold transition-colors duration-300 ${
                      isDark ? "text-text-primary-dark" : "text-text-primary-light"
                    }`}
                  >
                    {item.value}
                  </p>
                  <p
                    className={`mt-1 text-xs transition-colors duration-300 ${
                      isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2
              className={`text-2xl font-bold transition-colors duration-300 ${
                isDark ? "text-text-primary-dark" : "text-text-primary-light"
              }`}
            >
              {t("societies.explore")}
            </h2>
            <p
              className={`text-sm transition-colors duration-300 ${
                isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
              }`}
            >
              {t("societies.discover")}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                title: t("societies.card.leadership"),
                text: t("societies.card.leadershipText"),
              },
              {
                title: t("societies.card.networking"),
                text: t("societies.card.networkingText"),
              },
              {
                title: t("societies.card.opportunities"),
                text: t("societies.card.opportunitiesText"),
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-2xl border p-5 transition-all duration-300 ${
                  isDark
                    ? "border-border-dark bg-surface-dark"
                    : "border-border-light bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
                }`}
              >
                <h3 className={`text-base font-bold transition-colors duration-300 ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
                  {item.title}
                </h3>
                <p className={`mt-2 text-sm leading-relaxed transition-colors duration-300 ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {societies.length > 0 ? (
              societies.map((society) => (
                <Link key={society.id} to={`/societies/${society.id}`} className="block">
                  <SocietyCardSimple
                    isDark={isDark}
                    name={society.name}
                    category={society.category}
                    members={society.members}
                    description={society.description}
                    head={society.head}
                    onJoin={(event) => {
                      event.preventDefault();
                      navigate(`/societies/${society.id}`);
                    }}
                  />
                </Link>
              ))
            ) : (
              <div
                className={`col-span-full rounded-[1.75rem] border px-6 py-10 text-center transition-all duration-300 ${
                  isDark
                    ? "border-border-dark bg-surface-dark"
                    : "border-border-light bg-white shadow-[0_18px_44px_rgba(15,23,42,0.06)]"
                }`}
              >
                <div
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
                    isDark ? "bg-background-dark text-info" : "bg-slate-100 text-info"
                  }`}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                </div>
                <p className={`mt-4 text-base font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
                  {t("societies.emptyTitle")}
                </p>
                <p className={`mt-2 text-sm leading-6 ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                  {t("societies.emptyText")}
                </p>
              </div>
            )}
          </div>
        </section>

        <CTACard
          isDark={isDark}
          title={t("societies.ctaTitle")}
          description={t("societies.ctaText")}
          buttonText={t("societies.ctaButton")}
          className={isDark ? "shadow-[0_24px_60px_rgba(0,0,0,0.18)]" : "bg-white shadow-[0_20px_48px_rgba(15,23,42,0.08)]"}
        />
      </div>
    </div>
  );
}
