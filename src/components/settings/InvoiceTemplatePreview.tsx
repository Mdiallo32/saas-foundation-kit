import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PreviewProps {
  prefix: string;
  showSlogan: boolean;
  vatRate: string;
  footerNote: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);

const InvoiceTemplatePreview = ({ prefix, showSlogan, vatRate, footerNote }: PreviewProps) => {
  const amountHT = 8500;
  const rate = parseFloat(vatRate) || 21;
  const vat = amountHT * (rate / 100);
  const ttc = amountHT + vat;

  return (
    <Card className="bg-muted/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* Header */}
        <div>
          <p className="font-semibold">Carter & Associates LLP</p>
          {showSlogan && <p className="text-xs text-muted-foreground italic">Trusted counsel, measurable results.</p>}
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{prefix}2026-0501</span>
          <span>Due: 14 days</span>
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal (HT)</span>
            <span>{fmt(amountHT)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">VAT ({rate}%)</span>
            <span>{fmt(vat)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total TTC</span>
            <span>{fmt(ttc)}</span>
          </div>
        </div>

        {footerNote && (
          <>
            <Separator />
            <p className="text-xs text-muted-foreground">{footerNote}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceTemplatePreview;
