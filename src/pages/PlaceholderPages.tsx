const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-64">
    <p className="text-muted-foreground text-lg">{title} — coming soon</p>
  </div>
);


export const MattersPage = () => <PlaceholderPage title="Matters" />;
export const TeamPage = () => <PlaceholderPage title="Team" />;
export const FinancePage = () => <PlaceholderPage title="Finance" />;
export const SettingsPage = () => <PlaceholderPage title="Settings" />;
