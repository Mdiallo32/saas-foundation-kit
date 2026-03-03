import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { fmtCurrency } from "@/lib/money";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { ReceiptText } from "lucide-react";
import { getInvoiceDisplayStatus } from "@/lib/invoice-utils";
import { ResponsiveTableLayout, TableCard } from "@/components/ui/responsive-table-layout";
import InvoicePreviewModal from "@/components/invoices/InvoicePreviewModal";
import { mockInvoices, mockMatters } from "@/lib/mock-matters";
import { mockClients } from "@/lib/mock-clients";

import { useInvoices, useMatters, useClients } from "@/data/hooks";
import { Loader2 } from "lucide-react";

const fmt = (n: number) => fmtCurrency(n, 2);

const OpenInvoicesTable = () => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Live queries to match the archive invalidation
  const { data: invoicesData, isLoading: invLoading } = useInvoices();
  const { data: mattersData, isLoading: matLoading } = useMatters();
  const { data: clientsData, isLoading: cliLoading } = useClients();

  const isLoading = invLoading || matLoading || cliLoading;

  const data = (invoicesData || [])
    .filter(i => i.status !== "paid") // Only open invoices
    .map(inv => {
      const matter = mattersData?.find(m => m.id === inv.matterId);
      const client = clientsData?.find(c => c.id === matter?.clientId);
      return {
        id: inv.id,
        reference: inv.reference,
        client: client?.name || "Unknown",
        matter: matter?.title || "Unknown",
        amountTTC: inv.amountHT * (1 + inv.vatRate),
        status: inv.status,
        dueDate: inv.dueDate || inv.issuedAt,
      };
    });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading invoices...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return <TableEmptyState message="No open invoices." icon={ReceiptText} />;
  }

  const handleRowClick = (id: string) => {
    setSelectedInvoiceId(id);
    setIsPreviewOpen(true);
  };

  // Resolve objects for the modal from live query data
  const invoice = invoicesData?.find(i => i.id === selectedInvoiceId);
  const matter = mattersData?.find(m => m.id === invoice?.matterId);
  const client = clientsData?.find(c => c.id === matter?.clientId);

  return (
    <>
      <ResponsiveTableLayout
        desktop={
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
                <TableRow
                  key={inv.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50 focus-within:bg-muted/50"
                  onClick={() => handleRowClick(inv.id)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleRowClick(inv.id)}
                >
                  <TableCell className="font-mono text-xs">{inv.reference}</TableCell>
                  <TableCell>{inv.client}</TableCell>
                  <TableCell className="text-muted-foreground">{inv.matter}</TableCell>
                  <TableCell className="text-right font-semibold">{fmt(inv.amountTTC)}</TableCell>
                  <TableCell>
                    <Badge variant={getInvoiceDisplayStatus(inv) === "Unpaid" ? "destructive" : "outline"} className="capitalize text-xs">
                      {getInvoiceDisplayStatus(inv)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(inv.dueDate), "dd MMM yyyy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
        mobile={
          data.map((inv) => (
            <TableCard key={inv.id} onClick={() => handleRowClick(inv.id)} className="cursor-pointer active:scale-[0.98] transition-transform">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs">{inv.reference}</span>
                <Badge variant={getInvoiceDisplayStatus(inv) === "Unpaid" ? "destructive" : "outline"} className="capitalize text-xs">
                  {getInvoiceDisplayStatus(inv)}
                </Badge>
              </div>
              <p className="text-sm font-medium">{inv.client}</p>
              <p className="text-xs text-muted-foreground">{inv.matter}</p>
              <div className="flex justify-between text-xs">
                <span className="font-semibold">{fmt(inv.amountTTC)}</span>
                <span className="text-muted-foreground">Due {format(new Date(inv.dueDate), "dd MMM")}</span>
              </div>
            </TableCard>
          ))
        }
      />

      {invoice && matter && client && (
        <InvoicePreviewModal
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          invoice={invoice}
          matter={matter}
          client={client}
        />
      )}
    </>
  );
};

export default OpenInvoicesTable;
