import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import type { Invoice } from "@/lib/mock-matters";
import { fmtCurrency } from "@/lib/money";

const fmt = (n: number) => fmtCurrency(n, 2);

interface InvoiceCardProps {
  invoice: Invoice;
  onMarkPaid?: (id: string) => void;
}

const InvoiceCard = ({ invoice, onMarkPaid }: InvoiceCardProps) => {
  const vat = invoice.amountHT * invoice.vatRate;
  const ttc = invoice.amountHT + vat;

  return (
    <Card>
      <CardContent className="pt-5 pb-4 px-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-sm font-medium">{invoice.reference}</p>
          <Badge variant={invoice.status === "paid" ? "default" : "outline"} className="capitalize text-xs">
            {invoice.status}
          </Badge>
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount HT</span>
            <span>{fmt(invoice.amountHT)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">VAT (21%)</span>
            <span>{fmt(vat)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-border pt-1 mt-1">
            <span>Total TTC</span>
            <span>{fmt(ttc)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Issued {format(new Date(invoice.issuedAt), "dd MMM yyyy")}</span>
          {invoice.status === "pending" && onMarkPaid && (
            <Button variant="ghost" size="sm" onClick={() => onMarkPaid(invoice.id)}>
              <CheckCircle className="h-4 w-4 mr-1.5" /> Mark Paid
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceCard;
