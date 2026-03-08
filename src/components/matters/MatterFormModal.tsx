import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateMatter, useClients } from "@/data/hooks";
import { useToast } from "@/hooks/use-toast";

interface MatterFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialClientId?: string;
}

type Fields = {
  clientId: string;
  title: string;
  description: string;
  budgetInitial: string;
  hourlyRate: string;
};

const empty: Fields = { clientId: "", title: "", description: "", budgetInitial: "", hourlyRate: "" };

const MatterFormModal = ({ open, onOpenChange, initialClientId }: MatterFormModalProps) => {
  const [values, setValues] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const { mutateAsync: createMatter, isPending } = useCreateMatter();
  const { data: clients } = useClients();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      if (initialClientId) {
        setValues({ ...empty, clientId: initialClientId });
      } else {
        setValues(empty);
      }
    }
  }, [open, initialClientId]);

  const validate = () => {
    const e: Partial<Record<keyof Fields, string>> = {};
    if (!values.clientId) e.clientId = "Select a client";
    if (!values.title.trim()) e.title = "Title is required";
    if (!values.budgetInitial.trim()) e.budgetInitial = "Budget is required";
    else if (isNaN(Number(values.budgetInitial)) || Number(values.budgetInitial) <= 0) e.budgetInitial = "Enter a valid amount";
    if (values.hourlyRate && (isNaN(Number(values.hourlyRate)) || Number(values.hourlyRate) <= 0))
      e.hourlyRate = "Enter a valid rate";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    if (!validate()) return;

    try {
      const data = await createMatter({
        title: values.title.trim(),
        clientId: values.clientId,
        budgetTotal: Number(values.budgetInitial),
        hourlyRate: values.hourlyRate ? Number(values.hourlyRate) : 0,
        status: "open",
      });
      toast({ title: "Matter created", description: `${data.title} has been added.` });
      onOpenChange(false);
      reset();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create matter", variant: "destructive" });
    }
  };

  const reset = () => {
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
          <DialogTitle>New Matter</DialogTitle>
          <DialogDescription>Create a new legal matter for a client.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Client */}
          <div className="space-y-1.5">
            <Label htmlFor="matter-client">Client <span className="text-destructive">*</span></Label>
            <Select
              value={values.clientId}
              onValueChange={(v) => set("clientId", v)}
              disabled={!!initialClientId}
            >
              <SelectTrigger id="matter-client" autoFocus aria-invalid={!!errors.clientId}>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && <p className="text-xs text-destructive">{errors.clientId}</p>}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="matter-title">Title <span className="text-destructive">*</span></Label>
            <Input id="matter-title" value={values.title} onChange={(e) => set("title", e.target.value)} aria-invalid={!!errors.title} />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="matter-desc">Description</Label>
            <Textarea id="matter-desc" rows={3} value={values.description} onChange={(e) => set("description", e.target.value)} />
          </div>

          {/* Budget & Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="matter-budget">Budget Initial <span className="text-destructive">*</span></Label>
              <Input id="matter-budget" type="number" min={0} placeholder="0" value={values.budgetInitial} onChange={(e) => set("budgetInitial", e.target.value)} aria-invalid={!!errors.budgetInitial} />
              {errors.budgetInitial && <p className="text-xs text-destructive">{errors.budgetInitial}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="matter-rate">Hourly Rate</Label>
              <Input id="matter-rate" type="number" min={0} placeholder="0" value={values.hourlyRate} onChange={(e) => set("hourlyRate", e.target.value)} aria-invalid={!!errors.hourlyRate} />
              {errors.hourlyRate && <p className="text-xs text-destructive">{errors.hourlyRate}</p>}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Matter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MatterFormModal;
