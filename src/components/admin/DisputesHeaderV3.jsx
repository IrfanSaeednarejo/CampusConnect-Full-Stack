import React from "react";

export default function DisputesHeaderV3() {
  return (
    <header className="flex flex-wrap justify-between gap-4 mb-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-white text-3xl font-bold leading-tight tracking-tight">
          User Disputes & Complaints
        </h1>
        <p className="text-[#8b949e] text-base font-normal leading-normal">
          Review, resolve, and track complaints or requests for refunds.
        </p>
      </div>
    </header>
  );
}
