import SettingsTabs from "@/components/settings/SettingsTabs";

const SettingsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="text-sm text-muted-foreground mt-1">Manage firm profile and invoice templates</p>
    </div>
    <SettingsTabs />
  </div>
);

export default SettingsPage;
