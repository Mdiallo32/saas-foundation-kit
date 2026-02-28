import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fmtCurrency } from "@/lib/money";

export interface ProvisionInvoiceData {
    amountHT: number;
    issueDate: string;
    notes: string;
}

interface ProvisionInvoiceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: ProvisionInvoiceData) => void;
    isLoading?: boolean;
    budgetTotal?: number;
    budgetRemaining?: number;
}

const VAT_RATE = 0.21;

const ProvisionInvoiceModal = ({
    open,
    onOpenChange,
    onSave,
    isLoading,
    budgetTotal = 0,
    budgetRemaining = 0
}: ProvisionInvoiceModalProps) => {
    const [targetBudget, setTargetBudget] = useState("");
    const [amountHT, setAmountHT] = useState("");
    const [issueDate, setIssueDate] = useState("");
    const [notes, setNotes] = useState("");
    const [isAmountEdited, setIsAmountEdited] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
    const [submitted, setSubmitted] = useState(false);

    // Reset form when opened
    useEffect(() => {
        if (open) {
            setTargetBudget("");
            setAmountHT("");
            setIssueDate(format(new Date(), "yyyy-MM-dd"));
            setNotes("");
            setIsAmountEdited(false);
            setErrors({});
            setSubmitted(false);
        }
    }, [open]);

    const numTargetBudget = parseFloat(targetBudget);
    const numAmountHT = parseFloat(amountHT) || 0;
    const vatAmount = numAmountHT * VAT_RATE;
    const totalTTC = numAmountHT + vatAmount;

    const validate = () => {
        const e: Partial<Record<string, string>> = {};
        if (numAmountHT <= 0) e.amountHT = "Amount HT is required and must be greater than 0";
        if (!issueDate) e.issueDate = "Issue date is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // Implement calculation inside modal component using useMemo or simple derived state.
    const suggestedAmount = useMemo(() => {
        if (isNaN(numTargetBudget)) return 0;
        return Math.max(0, numTargetBudget - budgetRemaining);
    }, [numTargetBudget, budgetRemaining]);

    // When user enters a Target budget: Automatically compute suggested_amount. Prefill "Amount HT" field with suggested_amount.
    // If Target budget is empty: Keep manual Amount behavior.
    useEffect(() => {
        if (targetBudget !== "" && !isNaN(numTargetBudget) && !isAmountEdited) {
            setAmountHT(suggestedAmount > 0 ? suggestedAmount.toFixed(2) : "");
        }
    }, [targetBudget, numTargetBudget, suggestedAmount, isAmountEdited]);

    const projection = useMemo(() => {
        if (numAmountHT <= 0) return null;
        const projectedTotal = budgetTotal + numAmountHT;
        const projectedRemaining = budgetRemaining + numAmountHT;
        return {
            total: fmtCurrency(projectedTotal),
            remaining: fmtCurrency(projectedRemaining)
        };
    }, [budgetTotal, budgetRemaining, numAmountHT]);

    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        setSubmitted(true);
        if (!validate()) return;
        onSave({
            amountHT: numAmountHT,
            issueDate,
            notes,
        });
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setAmountHT(val);
        setIsAmountEdited(true);
        if (submitted) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next.amountHT;
                return next;
            });
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setIssueDate(val);
        if (submitted) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next.issueDate;
                return next;
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Provision Invoice</DialogTitle>
                    <DialogDescription>
                        Create a new provision invoice to increase the funded budget.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4" noValidate>
                    <div className="space-y-1.5">
                        <Label htmlFor="targetBudget">Target budget (optional)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <Input
                                id="targetBudget"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-7"
                                value={targetBudget}
                                onChange={(e) => setTargetBudget(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <p className="text-xs text-muted-foreground px-1">
                            Suggested top-up based on remaining budget.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="amountHT">
                            Amount HT <span className="text-destructive ml-0.5">*</span>
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <Input
                                id="amountHT"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-7"
                                value={amountHT}
                                onChange={handleAmountChange}
                                aria-invalid={!!errors.amountHT}
                            />
                        </div>
                        {errors.amountHT ? (
                            <p className="text-xs text-destructive px-1">{errors.amountHT}</p>
                        ) : targetBudget !== "" && !isNaN(numTargetBudget) && Math.abs(numAmountHT - suggestedAmount) >= 0.01 ? (
                            <p className="text-xs text-muted-foreground px-1">
                                Suggested amount: ${suggestedAmount.toFixed(2)}
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="issueDate">
                            Issue date <span className="text-destructive ml-0.5">*</span>
                        </Label>
                        <Input
                            id="issueDate"
                            type="date"
                            value={issueDate}
                            onChange={handleDateChange}
                            aria-invalid={!!errors.issueDate}
                        />
                        {errors.issueDate && <p className="text-xs text-destructive px-1">{errors.issueDate}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="e.g. Additional provisions for Q2"
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="rounded-md bg-muted/50 p-3 space-y-1 text-sm border">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount HT</span>
                            <span>${numAmountHT.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">VAT (21%)</span>
                            <span>${vatAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1 mt-1">
                            <span>Total TTC</span>
                            <span>${totalTTC.toFixed(2)}</span>
                        </div>
                    </div>

                    {projection && (
                        <p className="text-xs text-muted-foreground px-1">
                            After payment: Budget total {projection.total} • Remaining {projection.remaining}
                        </p>
                    )}

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Invoice"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProvisionInvoiceModal;
