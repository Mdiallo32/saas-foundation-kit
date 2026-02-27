import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import InvoiceCard from "@/components/invoices/InvoiceCard";
import type { Invoice } from "@/lib/mock-matters";

const InvoiceList = ({ invoices }: { invoices: Invoice[] }) => {
  if (invoices.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
        No invoices yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</p>
        <Button variant="outline" size="sm" className="gap-1.5">
          <FileText className="h-4 w-4" /> Generate Invoice
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {invoices.map((inv) => (
          <InvoiceCard key={inv.id} invoice={inv} />
        ))}
      </div>
    </div>
  );
};

export default InvoiceList;
