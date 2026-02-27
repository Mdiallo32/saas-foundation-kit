import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CollaboratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roles = ["Senior Partner", "Partner", "Associate", "Junior Associate", "Paralegal"] as const;

type Fields = { name: string; email: string; role: string; hourlyRate: string };
const empty: Fields = { name: "", email: "", role: "", hourlyRate: "" };

const CollaboratorModal = ({ open, onOpenChange }: CollaboratorModalProps) => {
  const [values, setValues] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e: Partial<Record<keyof Fields, string>> = {};
    if (!values.name.trim()) e.name = "Name is required";
    if (!values.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = "Invalid email";
    if (!values.role) e.role = "Select a role";
    const rate = Number(values.hourlyRate);
    if (!values.hourlyRate.trim() || isNaN(rate) || rate <= 0) e.hourlyRate = "Enter a valid rate";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    if (!validate()) return;
    onOpenChange(false);
    setValues(empty);
    setErrors({});
    setSubmitted(false);
  };

  const set = <K extends keyof Fields>(k: K, v: string) => {
    setValues((prev) => ({ ...prev, [k]: v }));
    if (submitted) setErrors((prev) => { const n = { ...prev }; delete n[k]; return n; });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Collaborator</DialogTitle>
          <DialogDescription>Invite a new team member to the firm.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="collab-name">Name <span className="text-destructive">*</span></Label>
            <Input id="collab-name" value={values.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="collab-email">Email <span className="text-destructive">*</span></Label>
            <Input id="collab-email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Role <span className="text-destructive">*</span></Label>
              <Select value={values.role} onValueChange={(v) => set("role", v)}>
                <SelectTrigger aria-invalid={!!errors.role}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="collab-rate">Hourly Rate <span className="text-destructive">*</span></Label>
              <Input id="collab-rate" type="number" min={0} placeholder="e.g. 150" value={values.hourlyRate} onChange={(e) => set("hourlyRate", e.target.value)} aria-invalid={!!errors.hourlyRate} />
              {errors.hourlyRate && <p className="text-xs text-destructive">{errors.hourlyRate}</p>}
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Add Member</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CollaboratorModal;
