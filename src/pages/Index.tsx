import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

const Index = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Welcome back
        </h2>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your practice.
        </p>
      </div>

      <SummaryCards />
      <RecentActivity />
    </div>
  );
};

export default Index;
