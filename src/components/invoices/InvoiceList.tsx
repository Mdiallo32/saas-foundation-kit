import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import InvoiceCard from "@/components/invoices/InvoiceCard";
import { CardSkeleton } from "@/components/ui/skeleton-loaders";
import type { Invoice } from "@/lib/mock-matters";

interface InvoiceListProps {
  invoices: Invoice[];
  isLoading?: boolean;
  onAddProvision?: () => void;
  onMarkPaid?: (id: string) => void;
}

const InvoiceList = ({
  invoices,
  isLoading = false,
  onAddProvision,
  onMarkPaid,
}: InvoiceListProps) => {
  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (invoices.length === 0 && !onAddProvision) {
    return (
      <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
        No invoices yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
        </p>

        {onAddProvision && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddProvision}
          >
            <FileText className="h-4 w-4 mr-1.5" />
            Add provision invoice
          </Button>
        )}
      </div>

      {invoices.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {invoices.map((inv) => (
            <InvoiceCard key={inv.id} invoice={inv} onMarkPaid={onMarkPaid} />
          ))}
        </div>
      )}

      {invoices.length === 0 && (
        <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
          No invoices yet.
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
