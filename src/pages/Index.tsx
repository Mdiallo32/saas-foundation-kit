import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, DollarSign, Clock } from "lucide-react";

const stats = [
  { label: "Active Matters", value: "24", icon: Briefcase },
  { label: "Total Clients", value: "128", icon: Users },
  { label: "Revenue (MTD)", value: "$84,320", icon: DollarSign },
  { label: "Billable Hours", value: "312h", icon: Clock },
];

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold font-display">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;
