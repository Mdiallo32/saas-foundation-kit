import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);

interface OpenInvoice {
  id: string;
  reference: string;
  client: string;
  matter: string;
  amountTTC: number;
  status: "pending" | "overdue";
  dueDate: string;
}

const data: OpenInvoice[] = [
  { id: "1", reference: "INV-2026-0412", client: "Meridian Holdings", matter: "Smith v. Acme Corp", amountTTC: 6776, status: "pending", dueDate: "2026-03-15" },
  { id: "2", reference: "INV-2026-0405", client: "Greenfield Ventures", matter: "Employment Dispute", amountTTC: 7260, status: "overdue", dueDate: "2026-02-25" },
  { id: "3", reference: "INV-2026-0422", client: "Acme Corporation", matter: "Trademark Filing", amountTTC: 3388, status: "pending", dueDate: "2026-03-20" },
  { id: "4", reference: "INV-2026-0430", client: "Rivera Estate Group", matter: "Estate Planning", amountTTC: 1852, status: "pending", dueDate: "2026-03-28" },
];

const OpenInvoicesTable = () => (
  <>
    {/* Desktop */}
    <div className="hidden md:block rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Invoice</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Matter</TableHead>
            <TableHead className="text-right">Amount TTC</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell className="font-mono text-xs">{inv.reference}</TableCell>
              <TableCell>{inv.client}</TableCell>
              <TableCell className="text-muted-foreground">{inv.matter}</TableCell>
              <TableCell className="text-right font-semibold">{fmt(inv.amountTTC)}</TableCell>
              <TableCell>
                <Badge variant={inv.status === "overdue" ? "destructive" : "outline"} className="capitalize text-xs">
                  {inv.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{format(new Date(inv.dueDate), "dd MMM yyyy")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    {/* Mobile */}
    <div className="md:hidden space-y-3">
      {data.map((inv) => (
        <div key={inv.id} className="rounded-lg border border-border p-4 bg-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs">{inv.reference}</span>
            <Badge variant={inv.status === "overdue" ? "destructive" : "outline"} className="capitalize text-xs">
              {inv.status}
            </Badge>
          </div>
          <p className="text-sm font-medium">{inv.client}</p>
          <p className="text-xs text-muted-foreground">{inv.matter}</p>
          <div className="flex justify-between text-xs">
            <span className="font-semibold">{fmt(inv.amountTTC)}</span>
            <span className="text-muted-foreground">Due {format(new Date(inv.dueDate), "dd MMM")}</span>
          </div>
        </div>
      ))}
    </div>
  </>
);

export default OpenInvoicesTable;
