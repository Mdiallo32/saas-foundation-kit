import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import type { Matter } from "@/lib/mock-matters";

const statusVariant: Record<Matter["status"], "default" | "secondary" | "outline" | "destructive"> = {
  open: "default",
  "in-progress": "secondary",
  pending: "outline",
  closed: "destructive",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const MatterTable = ({ matters }: { matters: Matter[] }) => {
  if (matters.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No matters yet.
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Title</TableHead>
              <TableHead>Budget Remaining</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matters.map((m) => {
              const remaining = m.budgetTotal - m.budgetUsed;
              return (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.title}</TableCell>
                  <TableCell className={remaining <= 0 ? "text-destructive font-semibold" : ""}>
                    {fmt(remaining)} <span className="text-muted-foreground text-xs">/ {fmt(m.budgetTotal)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[m.status]} className="capitalize text-xs">
                      {m.status.replace("-", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {matters.map((m) => {
          const remaining = m.budgetTotal - m.budgetUsed;
          return (
            <div key={m.id} className="rounded-lg border border-border p-4 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{m.title}</p>
                <Badge variant={statusVariant[m.status]} className="capitalize text-xs">
                  {m.status.replace("-", " ")}
                </Badge>
              </div>
              <p className={`text-xs ${remaining <= 0 ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                {fmt(remaining)} remaining of {fmt(m.budgetTotal)}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MatterTable;
