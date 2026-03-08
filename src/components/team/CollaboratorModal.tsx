import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCollaborator, useUpdateCollaborator, useUser } from "@/data/hooks";
import { useToast } from "@/hooks/use-toast";
import type { Collaborator } from "@/types";
import { isAdminRole } from "@/types";
import { formatUserRole } from "@/lib/role";

interface CollaboratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaborator?: Collaborator;
}

const roles = ["Admin", "Lawyer", "Billing"] as const;

type Fields = { name: string; email: string; role: string; hourlyRate: string };
const empty: Fields = { name: "", email: "", role: "", hourlyRate: "" };

const CollaboratorModal = ({ open, onOpenChange, collaborator }: CollaboratorModalProps) => {
  const isEdit = !!collaborator;
  const { data: user } = useUser();
  const isAdmin = isAdminRole(user.role);

  const [values, setValues] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const { mutateAsync: createCollab, isPending: isCreating } = useCreateCollaborator();
  const { mutateAsync: updateCollab, isPending: isUpdating } = useUpdateCollaborator();
  const isPending = isCreating || isUpdating;
  const { toast } = useToast();

  useEffect(() => {
    if (open && collaborator) {
      setValues({
        name: collaborator.name,
        email: collaborator.email,
        role: formatUserRole(collaborator.role),
        hourlyRate: collaborator.hourlyRate.toString(),
      });
    } else if (!open) {
      setValues(empty);
      setErrors({});
      setSubmitted(false);
    }
  }, [open, collaborator]);

  const validate = () => {
    const e: Partial<Record<keyof Fields, string>> = {};
    if (!values.name.trim()) e.name = "Full name is required";
    if (!values.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = "Invalid email";
    if (!values.role) e.role = "Select a role";
    const rate = Number(values.hourlyRate);
    if (values.hourlyRate.trim() && (isNaN(rate) || rate < 0)) e.hourlyRate = "Enter a valid rate (min 0)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    if (!validate()) return;

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      role: values.role,
      hourlyRate: values.hourlyRate.trim() ? Number(values.hourlyRate) : 0,
    };

    try {
      if (isEdit && collaborator) {
        await updateCollab({ id: collaborator.id, ...payload });
        toast({ title: "Collaborator updated", description: `${payload.name}'s profile has been updated.` });
      } else {
        await createCollab(payload);
        toast({ title: "Collaborator added", description: `${payload.name} has been added to the team.` });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save collaborator. Please try again.",
        variant: "destructive",
      });
    }
  };

  const set = <K extends keyof Fields>(k: K, v: string) => {
    setValues((prev) => ({ ...prev, [k]: v }));
    if (submitted) setErrors((prev) => { const n = { ...prev }; delete n[k]; return n; });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {!isAdmin ? "View Collaborator" : isEdit ? "Edit Collaborator" : "Add Collaborator"}
          </DialogTitle>
          <DialogDescription>
            {!isAdmin
              ? "View team member's information."
              : isEdit
                ? "Update team member's information."
                : "Invite a new team member to the firm."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="collab-name">Full Name <span className="text-destructive">*</span></Label>
            <Input
              id="collab-name"
              autoFocus
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              disabled={!isAdmin}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="collab-email">Email <span className="text-destructive">*</span></Label>
            <Input
              id="collab-email"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              disabled={!isAdmin}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="collab-role">Role <span className="text-destructive">*</span></Label>
              <Select value={values.role} onValueChange={(v) => set("role", v)} disabled={!isAdmin}>
                <SelectTrigger id="collab-role" aria-invalid={!!errors.role}>
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
              <Input
                id="collab-rate"
                type="number"
                min={0}
                placeholder="e.g. 150"
                value={values.hourlyRate}
                onChange={(e) => set("hourlyRate", e.target.value)}
                disabled={!isAdmin}
                aria-invalid={!!errors.hourlyRate}
              />
              {errors.hourlyRate && <p className="text-xs text-destructive">{errors.hourlyRate}</p>}
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isAdmin ? "Cancel" : "Close"}
            </Button>
            {isAdmin && (
              <Button type="submit" disabled={isPending}>
                {isPending ? (isEdit ? "Saving..." : "Adding...") : (isEdit ? "Save Changes" : "Add Member")}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CollaboratorModal;
