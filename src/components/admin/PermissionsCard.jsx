import React from "react";
import Switch from "../../common/Switch";
import Button from "../../common/Button";

export default function PermissionsCard({ permissions, onChange, onSave }) {
  return (
    <div className="bg-card-dark border border-border-dark rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">
          Permissions &amp; Access Control
        </h3>
        <Button
          variant="link"
          className="text-sm text-link-dark hover:underline px-0 py-0 h-auto min-w-0"
          onClick={onSave}
        >
          Save Changes
        </Button>
      </div>
      <div className="space-y-4">
        {permissions.map((p, idx) => (
          <div
            key={p.title}
            className="flex items-center justify-between p-3 bg-background-dark rounded-md border border-border-dark"
          >
            <div>
              <p className="text-sm font-medium text-white">{p.title}</p>
              <p className="text-xs text-text-secondary-dark">{p.desc}</p>
            </div>
            <Switch
              checked={p.checked}
              onChange={(val) => onChange(idx, val)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
