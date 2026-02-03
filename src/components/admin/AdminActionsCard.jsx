import React from "react";
import Button from "../../common/Button";

export default function AdminActionsCard() {
  return (
    <div className="bg-[#1c2620] border border-[#30363d] rounded-lg p-6 flex flex-col gap-4 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-2">Admin Actions</h3>
      <div className="flex flex-wrap gap-3">
        <Button color="primary">Reset Password</Button>
        <Button color="warning">Force Logout</Button>
        <Button color="error">Delete User</Button>
      </div>
    </div>
  );
}
