import { useState } from "react";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";
import SocietyPageHeader from "../../components/societies/SocietyPageHeader";
import SocietyTabs from "../../components/societies/SocietyTabs";

const NOTIFICATION_ITEMS = [
  {
    label: "Email notifications for new members",
    key: "newMembers",
  },
  { label: "Event reminders", key: "eventReminders" },
  { label: "Member requests", key: "memberRequests" },
  { label: "Weekly activity summary", key: "weeklySummary" },
];

export default function SocietySettings() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <SocietyPageHeader
        title="Settings"
        subtitle="Manage your society preferences"
        icon="settings"
        backPath="/society/dashboard"
      />

      {/* Tabs */}
      <SocietyTabs
        tabs={["general", "notifications", "privacy", "account"]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* General Tab */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">General Settings</h2>
              <div className="space-y-4">
                <FormField
                  label="Society Name"
                  type="text"
                  defaultValue="Tech Innovators Club"
                />
                <FormField
                  label="Description"
                  type="textarea"
                  rows={4}
                  defaultValue="A community of technology enthusiasts exploring cutting-edge innovations"
                />
                <FormField
                  label="Category"
                  type="select"
                  options={[
                    { value: "Technology", label: "Technology" },
                    { value: "Business", label: "Business" },
                    { value: "Arts", label: "Arts" },
                    { value: "Sports", label: "Sports" },
                  ]}
                />
                <FormActions
                  submitText="Save Changes"
                  onSubmit={() => {}}
                  submitClassName="bg-primary text-white hover:bg-primary/90"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                {NOTIFICATION_ITEMS.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <span className="text-white">{item.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Privacy Settings</h2>
              <div className="space-y-4">
                <FormField
                  label="Society Visibility"
                  type="select"
                  options={[
                    { value: "Public", label: "Public" },
                    { value: "Private", label: "Private" },
                    { value: "Hidden", label: "Hidden" },
                  ]}
                />
                <FormField
                  label="Member List Visibility"
                  type="select"
                  options={[
                    { value: "Everyone", label: "Everyone" },
                    { value: "Members Only", label: "Members Only" },
                    { value: "Admins Only", label: "Admins Only" },
                  ]}
                />
                <FormActions
                  submitText="Save Changes"
                  onSubmit={() => {}}
                  submitClassName="bg-primary text-white hover:bg-primary/90"
                />
              </div>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Account Settings</h2>
              <div className="space-y-4">
                <FormField
                  label="Email Address"
                  type="email"
                  defaultValue="admin@techinnovators.com"
                />
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Change Password
                  </label>
                  <button className="px-6 py-2 rounded-lg bg-surface-hover text-white font-medium hover:bg-surface-hover/80 transition-colors">
                    Update Password
                  </button>
                </div>
                <div className="pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Danger Zone
                  </h3>
                  <button className="px-6 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors">
                    Delete Society
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
