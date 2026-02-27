import { DollarSign, FileText, TrendingUp, Users, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const kpis = [
  { label: "Forecasted Profit", value: fmt(62400), sub: "This month", icon: DollarSign },
  { label: "Open Invoices", value: "4", sub: fmt(18276), icon: FileText },
  { label: "ROI", value: "138%", sub: "+6% vs last quarter", icon: TrendingUp },
  { label: "Revenue / Member", value: fmt(16864), sub: "5 active members", icon: Users },
  { label: "Monthly Burn", value: fmt(21900), sub: "Payroll + overhead", icon: Flame },
];

const FinanceKPIs = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
    {kpis.map((k) => (
      <Card key={k.label}>
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
            <k.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="text-xl font-semibold tracking-tight">{k.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{k.sub}</p>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default FinanceKPIs;
