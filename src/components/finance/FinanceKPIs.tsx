import { DollarSign, FileText, TrendingUp, Users, Flame, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { mockTimesheets } from "@/lib/mock-matters";
import { mockCollaborators } from "@/lib/mock-team";
import { fmtCurrency } from "@/lib/money";

const rateByName = Object.fromEntries(mockCollaborators.map((c) => [c.name, c.hourlyRate]));

const totalRevenue = mockTimesheets.reduce((s, t) => s + t.hours * t.rate, 0);
const totalCost = mockTimesheets.reduce((s, t) => s + t.hours * (rateByName[t.user] ?? 0), 0);
const grossProfit = totalRevenue - totalCost;
const margin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;

const kpis = [
  { label: "Forecasted Profit", value: fmtCurrency(62400), sub: "This month", icon: DollarSign },
  { label: "Gross Profit", value: fmtCurrency(grossProfit), sub: `${margin}% margin`, icon: BarChart3 },
  { label: "Open Invoices", value: "4", sub: fmtCurrency(18276), icon: FileText },
  { label: "ROI", value: "138%", sub: "+6% vs last quarter", icon: TrendingUp },
  { label: "Revenue / Member", value: fmtCurrency(totalRevenue / mockCollaborators.length), sub: `${mockCollaborators.length} active members`, icon: Users },
  { label: "Monthly Burn", value: fmtCurrency(21900), sub: "Payroll + overhead", icon: Flame },
];

const FinanceKPIs = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
