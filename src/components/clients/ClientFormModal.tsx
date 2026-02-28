import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateClient, useUpdateClient } from "@/data/hooks";
import { useToast } from "@/hooks/use-toast";
import { ClientType, Client } from "@/types";

interface ClientFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  initialData?: Client;
}

const baseFields = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone", type: "tel", required: false },
  { name: "address", label: "Address", type: "text", required: false },
] as const;

type FieldName = "name" | "email" | "phone" | "address" | "vatNumber" | "nationalNumber";

const ClientFormModal = ({ open, onOpenChange, mode = "create", initialData }: ClientFormModalProps) => {
  const isEdit = mode === "edit";
  const [clientType, setClientType] = useState<ClientType>("company");
  const [values, setValues] = useState<Record<FieldName, string>>({
    name: "", email: "", phone: "", address: "", vatNumber: "", nationalNumber: "",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldName | "type", string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const { mutate: createClient, isPending: isCreating } = useCreateClient();
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient();
  const isPending = isCreating || isUpdating;
  const { toast } = useToast();

  useEffect(() => {
    if (open && isEdit && initialData) {
      setClientType(initialData.type);
      setValues({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone || "",
        address: initialData.address || "",
        vatNumber: initialData.vatNumber || "",
        nationalNumber: initialData.nationalNumber || "",
      });
    } else if (!open) {
      reset();
    }
  }, [open, isEdit, initialData]);

  const validate = () => {
    const e: Partial<Record<FieldName, string>> = {};
    if (!values.name.trim()) e.name = "Name is required";
    if (!values.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = "Invalid email";
    if (clientType === "company" && !values.vatNumber.trim()) e.vatNumber = "VAT number is required";
    if (clientType === "physical" && !values.nationalNumber.trim()) e.nationalNumber = "National number is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    if (!validate()) return;

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      type: clientType,
      ...(clientType === "company" ? { vatNumber: values.vatNumber.trim() } : { nationalNumber: values.nationalNumber.trim() }),
    };

    if (isEdit && initialData) {
      updateClient({ id: initialData.id, ...payload }, {
        onSuccess: (data) => {
          toast({ title: "Client updated", description: `${data.name} has been updated.` });
          onOpenChange(false);
        }
      });
    } else {
      createClient(payload, {
        onSuccess: (data) => {
          toast({ title: "Client created", description: `${data.name} has been added.` });
          onOpenChange(false);
          reset();
        }
      });
    }
  };

  const reset = () => {
    setValues({ name: "", email: "", phone: "", address: "", vatNumber: "", nationalNumber: "" });
    setClientType("company");
    setErrors({});
    setSubmitted(false);
  };

  const handleChange = (field: FieldName, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (submitted) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Client" : "New Client"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the client's information." : "Fill in the details to add a new client."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Client type selector */}
          <div className="space-y-1.5">
            <Label htmlFor="clientType">Client type<span className="text-destructive ml-0.5">*</span></Label>
            <Select value={clientType} onValueChange={(v) => setClientType(v as ClientType)}>
              <SelectTrigger id="clientType" autoFocus>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="physical">Physical person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {baseFields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <Label htmlFor={f.name}>
                {f.label}
                {f.required && <span className="text-destructive ml-0.5">*</span>}
              </Label>
              <Input
                id={f.name}
                type={f.type}
                value={values[f.name]}
                onChange={(e) => handleChange(f.name, e.target.value)}
                aria-invalid={!!errors[f.name]}
              />
              {errors[f.name] && <p className="text-xs text-destructive">{errors[f.name]}</p>}
            </div>
          ))}

          {/* Conditional identifier field */}
          {clientType === "company" ? (
            <div className="space-y-1.5">
              <Label htmlFor="vatNumber">VAT Number<span className="text-destructive ml-0.5">*</span></Label>
              <Input
                id="vatNumber"
                value={values.vatNumber}
                onChange={(e) => handleChange("vatNumber", e.target.value)}
                aria-invalid={!!errors.vatNumber}
              />
              {errors.vatNumber && <p className="text-xs text-destructive">{errors.vatNumber}</p>}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="nationalNumber">National Number<span className="text-destructive ml-0.5">*</span></Label>
              <Input
                id="nationalNumber"
                value={values.nationalNumber}
                onChange={(e) => handleChange("nationalNumber", e.target.value)}
                placeholder="e.g. 90.01.15-123.45"
                aria-invalid={!!errors.nationalNumber}
              />
              {errors.nationalNumber && <p className="text-xs text-destructive">{errors.nationalNumber}</p>}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Client" : "Create Client")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientFormModal;
