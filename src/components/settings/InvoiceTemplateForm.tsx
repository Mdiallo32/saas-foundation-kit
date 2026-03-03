import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import InvoiceTemplatePreview from "@/components/settings/InvoiceTemplatePreview";
import { useSettings, useUpdateSettings } from "@/data/hooks";
import { Loader2 } from "lucide-react";

const InvoiceTemplateForm = () => {
  const { data: settings } = useSettings();
  const { mutate, isPending } = useUpdateSettings();

  const [localValues, setValues] = useState<any>(null);

  const values = localValues ?? settings ?? {
    vatRate: 21,
    invoicePrefix: "INV-",
    paymentTerms: 14,
    invoiceFooter: "Payment is due within the specified terms. Late payments may incur interest as permitted by law.",
    showSlogan: true,
  };

  const set = (k: string, v: any) => setValues((p: any) => ({ ...(p ?? values), [k]: v }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...values };
    payload.paymentTerms = parseInt(String(payload.paymentTerms), 10);
    payload.vatRate = parseFloat(String(payload.vatRate));

    mutate(payload, {
      onSuccess: () => {
        setValues(null);
        toast({ title: "Saved", description: "Invoice template settings updated." });
      }
    });
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-base font-heading">Invoice Template</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="inv-vat">Default VAT Rate (%)</Label>
                <Input id="inv-vat" value={values.vatRate} onChange={(e) => set("vatRate", e.target.value)} />
                <p className="text-xs text-muted-foreground">Standard Belgian/EU rate is 21%</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-prefix">Invoice Prefix</Label>
                <Input id="inv-prefix" value={values.invoicePrefix} onChange={(e) => set("invoicePrefix", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-terms">Payment Terms (days)</Label>
                <Input id="inv-terms" type="number" min={1} value={values.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)} />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  id="inv-slogan"
                  checked={values.showSlogan}
                  onCheckedChange={(c) => set("showSlogan", c)}
                />
                <Label htmlFor="inv-slogan" className="cursor-pointer">Show slogan on invoice</Label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inv-footer">Footer Note</Label>
              <Textarea
                id="inv-footer"
                rows={3}
                value={values.invoiceFooter}
                onChange={(e) => set("invoiceFooter", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Legal disclaimer shown at the bottom of every invoice</p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Template
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <InvoiceTemplatePreview
          prefix={values.invoicePrefix}
          showSlogan={values.showSlogan}
          vatRate={String(values.vatRate)}
          footerNote={values.invoiceFooter}
          paymentTerms={values.paymentTerms}
        />
      </div>
    </div>
  );
};

export default InvoiceTemplateForm;
