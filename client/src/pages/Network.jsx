import React from "react";
import NetworkTabs from "../components/network/NetworkTabs";
import useHomeTheme from "../hooks/useHomeTheme";

export default function Network() {
  const isDark = useHomeTheme();

  return (
    <div
      className={`w-full min-h-full px-4 py-10 sm:px-10 lg:px-20 ${
        isDark
          ? "bg-background-dark text-text-primary-dark"
          : "bg-background-light text-text-primary-light"
      }`}
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-4">
          <div className="mb-10">
            <h1
              className={`mb-2 text-3xl font-bold tracking-tight ${
                isDark ? "text-text-primary-dark" : "text-text-primary-light"
              }`}
            >
              Professional Network
            </h1>
            <p
              className={
                isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
              }
            >
              Build your academic graph and discover new opportunities.
            </p>
          </div>
          <NetworkTabs />
        </div>
      </div>
    </div>
  );
}
