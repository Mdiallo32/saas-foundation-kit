import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FinanceKPIs from "@/components/finance/FinanceKPIs";
import OpenInvoicesTable from "@/components/finance/OpenInvoicesTable";
import RevenueByMember from "@/components/finance/RevenueByMember";
import FinanceTrendCard from "@/components/finance/FinanceTrendCard";

const timeframes = [
  { value: "30d", label: "Last 30 days" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
] as const;

const FinancePage = () => {
  const [timeframe, setTimeframe] = useState("30d");
  const tfLabel = timeframes.find((t) => t.value === timeframe)?.label ?? "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
          <p className="text-sm text-muted-foreground mt-1">Firm performance &amp; forecasting</p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeframes.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <FinanceKPIs />
      <FinanceTrendCard timeframe={tfLabel} />

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Open Invoices</h2>
        <OpenInvoicesTable />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Revenue by Team Member</h2>
        <RevenueByMember />
      </div>
    </div>
  );
};

export default FinancePage;
