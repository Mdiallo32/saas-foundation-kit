import { format } from "date-fns";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import type { Timesheet } from "@/lib/mock-matters";
import { fmtCurrency } from "@/lib/money";

import { TableEmptyState } from "@/components/ui/table-empty-state";
import { TableSkeleton } from "@/components/ui/skeleton-loaders";
import { Clock } from "lucide-react";

const fmt = fmtCurrency;

import { ResponsiveTableLayout, TableCard } from "@/components/ui/responsive-table-layout";

const TimesheetTable = ({ 
  timesheets, 
  isLoading = false,
  highlightedId = null
}: { 
  timesheets: Timesheet[]; 
  isLoading?: boolean;
  highlightedId?: string | null;
}) => {
  if (isLoading) {
    return <TableSkeleton columns={6} />;
  }

  if (timesheets.length === 0) {
    return <TableEmptyState message="No time entries yet." icon={Clock} />;
  }

  return (
    <ResponsiveTableLayout
      desktop={
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Hours</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timesheets.map((t) => (
              <TableRow key={t.id} className={t.id === highlightedId ? "bg-primary/5 animate-pulse transition-colors" : ""}>
                <TableCell className="text-muted-foreground">{format(new Date(t.date), "dd MMM yyyy")}</TableCell>
                <TableCell className="font-medium">{t.description}</TableCell>
                <TableCell>{t.user}</TableCell>
                <TableCell className="text-right">{t.hours}</TableCell>
                <TableCell className="text-right">{fmt(t.rate)}</TableCell>
                <TableCell className="text-right font-semibold">{fmt(t.hours * t.rate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
      mobile={
        timesheets.map((t) => (
          <TableCard key={t.id} className={t.id === highlightedId ? "ring-2 ring-primary/20 animate-pulse" : ""}>
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium">{t.description}</p>
              <p className="text-sm font-semibold shrink-0 ml-3">{fmt(t.hours * t.rate)}</p>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t.user} · {t.hours}h @ {fmt(t.rate)}</span>
              <span>{format(new Date(t.date), "dd MMM")}</span>
            </div>
          </TableCard>
        ))
      }
    />
  );
};


export default TimesheetTable;
