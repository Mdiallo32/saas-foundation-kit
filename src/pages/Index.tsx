import { useSuspenseQuery } from "@tanstack/react-query";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

// Shared fetch function (simulating an API call)
const fetchDashboardStats = async () => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true };
};

const Index = () => {
  // TanStack Query v5 useSuspenseQuery pattern
  // This hook will automatically trigger the nearest Suspense & ErrorBoundary
  const { data, refetch } = useSuspenseQuery({
    queryKey: ["dashboard-init"],
    queryFn: fetchDashboardStats,
  });

  const triggerError = () => {
    // We can simulate an error by throwing or rejecting the query
    // For this demo, we'll just throw a simple error
    throw new Error("This is a simulated error to showcase the Error Boundary!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's an overview of your practice.</p>
        </div>
      </div>

      {/* Components can now be written in the "happy path" without manual loading states */}
      <SummaryCards />
      <RecentActivity />
    </div>
  );
};

export default Index;
