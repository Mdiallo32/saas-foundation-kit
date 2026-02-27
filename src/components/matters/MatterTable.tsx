import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import type { Matter } from "@/lib/mock-matters";
import { mockClients } from "@/lib/mock-clients";

const statusVariant: Record<Matter["status"], "default" | "secondary" | "outline" | "destructive"> = {
  open: "default",
  "in-progress": "secondary",
  pending: "outline",
  closed: "destructive",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const clientName = (id: string) => mockClients.find((c) => c.id === id)?.name ?? "Unknown";

interface MatterTableProps {
  matters: Matter[];
  showClient?: boolean;
}

const MatterTable = ({ matters, showClient = false }: MatterTableProps) => {
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
              {showClient && <TableHead>Client</TableHead>}
              <TableHead>Budget Initial</TableHead>
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
                  {showClient && <TableCell className="text-muted-foreground">{clientName(m.clientId)}</TableCell>}
                  <TableCell>{fmt(m.budgetTotal)}</TableCell>
                  <TableCell className={remaining <= 0 ? "text-destructive font-semibold" : ""}>
                    {fmt(remaining)}
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
              {showClient && (
                <p className="text-xs text-muted-foreground">{clientName(m.clientId)}</p>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Initial: {fmt(m.budgetTotal)}</span>
                <span className={remaining <= 0 ? "text-destructive font-semibold" : ""}>
                  Remaining: {fmt(remaining)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MatterTable;
