import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import InvoiceTemplatePreview from "@/components/settings/InvoiceTemplatePreview";

const InvoiceTemplateForm = () => {
  const [vatRate, setVatRate] = useState("21");
  const [prefix, setPrefix] = useState("INV-");
  const [paymentTerms, setPaymentTerms] = useState("14");
  const [footerNote, setFooterNote] = useState("Payment is due within the specified terms. Late payments may incur interest as permitted by law.");
  const [showSlogan, setShowSlogan] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Saved", description: "Invoice template settings updated." });
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
                <Input id="inv-vat" value={vatRate} onChange={(e) => setVatRate(e.target.value)} />
                <p className="text-xs text-muted-foreground">Standard Belgian/EU rate is 21%</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-prefix">Invoice Prefix</Label>
                <Input id="inv-prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-terms">Payment Terms (days)</Label>
                <Input id="inv-terms" type="number" min={1} value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch id="inv-slogan" checked={showSlogan} onCheckedChange={setShowSlogan} />
                <Label htmlFor="inv-slogan" className="cursor-pointer">Show slogan on invoice</Label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inv-footer">Footer Note</Label>
              <Textarea id="inv-footer" rows={3} value={footerNote} onChange={(e) => setFooterNote(e.target.value)} />
              <p className="text-xs text-muted-foreground">Legal disclaimer shown at the bottom of every invoice</p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="sm">Save Template</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <InvoiceTemplatePreview prefix={prefix} showSlogan={showSlogan} vatRate={vatRate} footerNote={footerNote} />
      </div>
    </div>
  );
};

export default InvoiceTemplateForm;
