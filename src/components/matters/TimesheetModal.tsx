import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { fmtCurrency } from "@/lib/money";
import { useCreateTimesheet } from "@/data/hooks";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface TimesheetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId: string;
  hourlyRate: number;
}

const fmt = (n: number) => fmtCurrency(n, 2);

const TimesheetModal = ({ open, onOpenChange, matterId, hourlyRate }: TimesheetModalProps) => {
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const { mutateAsync: createTimesheet, isPending } = useCreateTimesheet(matterId);
  const { toast } = useToast();

  const hoursNum = parseFloat(hours) || 0;
  const preview = useMemo(() => hoursNum * hourlyRate, [hoursNum, hourlyRate]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!description.trim()) e.description = "Description is required";
    if (!hours.trim()) e.hours = "Hours are required";
    else if (isNaN(parseFloat(hours)) || parseFloat(hours) <= 0) e.hours = "Enter valid hours";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    if (!validate()) return;

    try {
      await createTimesheet({
        description: description.trim(),
        hours: hoursNum,
        rate: hourlyRate,
        date: format(new Date(), "yyyy-MM-dd"),
        user: "Sarah Chen", // Should ideally come from auth context
      });
      toast({ title: "Time entry logged", description: "Matter budget has been updated." });
      onOpenChange(false);
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log time entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const reset = () => {
    setDescription("");
    setHours("");
    setErrors({});
    setSubmitted(false);
  };

  const set = (field: string, value: string) => {
    if (field === "description") setDescription(value);
    else setHours(value);
    if (submitted) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Log Time</DialogTitle>
          <DialogDescription>Add a new time entry for this matter.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="ts-desc">Description <span className="text-destructive">*</span></Label>
            <Input id="ts-desc" autoFocus value={description} onChange={(e) => set("description", e.target.value)} aria-invalid={!!errors.description} />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ts-hours">Hours <span className="text-destructive">*</span></Label>
            <Input id="ts-hours" type="number" min={0} step={0.25} placeholder="0" value={hours} onChange={(e) => set("hours", e.target.value)} aria-invalid={!!errors.hours} />
            {errors.hours && <p className="text-xs text-destructive">{errors.hours}</p>}
          </div>

          <Separator />

          {/* Amount preview */}
          <div className="rounded-md bg-muted/50 p-3 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{hoursNum > 0 ? `${hoursNum}h` : "0h"} × {fmt(hourlyRate)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base">
              <span>Amount</span>
              <span>{fmt(preview)}</span>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Logging..." : "Log Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TimesheetModal;
