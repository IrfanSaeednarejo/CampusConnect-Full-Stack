import React from "react";
import Badge from "../../common/Badge";
import Button from "../../common/Button";

export default function AccountInfoCard({ status, setStatus, memberships }) {
  return (
    <div className="bg-[#1c2620] border border-[#30363d] rounded-lg p-6 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-white">
          Account Status
        </span>
        <Badge color={status === "Active" ? "success" : "error"}>
          {status}
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-base text-[#8b949e]">Memberships</span>
        <span className="text-base text-white font-semibold">
          {memberships}
        </span>
      </div>
      <div className="flex gap-2 mt-2">
        <Button
          onClick={() =>
            setStatus(status === "Active" ? "Suspended" : "Active")
          }
          color={status === "Active" ? "error" : "success"}
        >
          {status === "Active" ? "Suspend" : "Activate"}
        </Button>
      </div>
    </div>
  );
}
