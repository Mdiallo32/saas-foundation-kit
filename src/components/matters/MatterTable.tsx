import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import type { Matter } from "@/lib/mock-matters";
import { mockClients } from "@/lib/mock-clients";
import { fmtCurrency } from "@/lib/money";

import { TableEmptyState } from "@/components/ui/table-empty-state";
import { TableSkeleton } from "@/components/ui/skeleton-loaders";
import { FolderOpen } from "lucide-react";

const statusVariant: Record<Matter["status"], "default" | "secondary" | "outline" | "destructive"> = {
  open: "default",
  "in-progress": "secondary",
  pending: "outline",
  closed: "destructive",
};

const fmt = fmtCurrency;

const clientName = (id: string) => mockClients.find((c) => c.id === id)?.name ?? "Unknown";

interface MatterTableProps {
  matters: Matter[];
  showClient?: boolean;
  isLoading?: boolean;
}

import { ResponsiveTableLayout, TableCard } from "@/components/ui/responsive-table-layout";

const MatterTable = ({ matters, showClient = false, isLoading = false }: MatterTableProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <TableSkeleton columns={showClient ? 5 : 4} />;
  }

  if (matters.length === 0) {
    return <TableEmptyState message="No matters yet." icon={FolderOpen} />;
  }

  return (
    <ResponsiveTableLayout
      desktop={
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
                <TableRow key={m.id} className="cursor-pointer" onClick={() => navigate(`/matters/${m.id}`)}>
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
      }
      mobile={
        matters.map((m) => {
          const remaining = m.budgetTotal - m.budgetUsed;
          return (
            <TableCard key={m.id} onClick={() => navigate(`/matters/${m.id}`)}>
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
            </TableCard>
          );
        })
      }
    />
  );
};


export default MatterTable;
