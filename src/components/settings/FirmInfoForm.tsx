import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import LogoUploader from "@/components/settings/LogoUploader";
import { useSettings, useUpdateSettings } from "@/data/hooks";
import { Loader2 } from "lucide-react";

const FirmInfoForm = () => {
  const { data: settings } = useSettings();
  const { mutate, isPending } = useUpdateSettings();

  const [localValues, setValues] = useState<any>(null);

  const values = localValues ?? settings ?? {
    firmName: "",
    slogan: "",
    vat: "",
    address: "",
    email: "",
    phone: "",
  };

  const set = (k: keyof typeof values, v: string) => setValues((p: any) => ({ ...(p ?? values), [k]: v }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(values, {
      onSuccess: () => {
        setValues(null);
        toast({ title: "Saved", description: "Firm information updated." });
      }
    });
  };

  const fields: { key: keyof typeof values; label: string; type?: string; helper?: string }[] = [
    { key: "firmName", label: "Firm Name" },
    { key: "slogan", label: "Slogan", helper: "Displayed on invoices if enabled" },
    { key: "vat", label: "VAT Number" },
    { key: "address", label: "Address" },
    { key: "email", label: "Contact Email", type: "email" },
    { key: "phone", label: "Contact Phone", type: "tel" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-heading">Firm Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-1.5">
            <Label>Logo</Label>
            <LogoUploader />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={`firm-${f.key}`}>{f.label}</Label>
                {f.key === "address" ? (
                  <Textarea
                    id={`firm-${f.key}`}
                    rows={2}
                    value={values[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                ) : (
                  <Input
                    id={`firm-${f.key}`}
                    type={f.type ?? "text"}
                    value={values[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                )}
                {f.helper && <p className="text-xs text-muted-foreground">{f.helper}</p>}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FirmInfoForm;
