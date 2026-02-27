import { format } from "date-fns";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import type { Timesheet } from "@/lib/mock-matters";
import { fmtCurrency } from "@/lib/money";

const fmt = fmtCurrency;

const TimesheetTable = ({ timesheets }: { timesheets: Timesheet[] }) => {
  if (timesheets.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
        No time entries yet.
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
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
              <TableRow key={t.id}>
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
      </div>

      <div className="md:hidden space-y-3">
        {timesheets.map((t) => (
          <div key={t.id} className="rounded-lg border border-border p-4 bg-card space-y-1.5">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium">{t.description}</p>
              <p className="text-sm font-semibold shrink-0 ml-3">{fmt(t.hours * t.rate)}</p>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t.user} · {t.hours}h @ {fmt(t.rate)}</span>
              <span>{format(new Date(t.date), "dd MMM")}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TimesheetTable;
