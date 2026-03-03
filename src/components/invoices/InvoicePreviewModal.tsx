import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fmtCurrency } from "@/lib/money";
import { useSettings, useUpdateInvoiceStatus, useMarkInvoicePaid, useArchiveInvoice, useUpdateInvoice } from "@/data/hooks";
import { Invoice, Matter, Client } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { getInvoiceDisplayStatus } from "@/lib/invoice-utils";
import { Trash2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface InvoicePreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    invoice: Invoice;
    matter: Matter;
    client: Client;
}

const InvoicePreviewModal = ({ open, onOpenChange, invoice, matter, client }: InvoicePreviewModalProps) => {
    const { data: settings } = useSettings();
    const { mutate: updateStatus, isPending: updating } = useUpdateInvoiceStatus();
    const { mutate: markPaid, isPending: paying } = useMarkInvoicePaid();
    const { mutate: archive, isPending: archiving } = useArchiveInvoice();
    const { mutate: updateInvoice, isPending: updatingInvoice } = useUpdateInvoice();
    const { toast } = useToast();

    const [dueDate, setDueDate] = useState(invoice.dueDate || "");

    useEffect(() => {
        setDueDate(invoice.dueDate || "");
    }, [invoice.dueDate]);

    if (!settings) return null;

    const vat = invoice.amountHT * invoice.vatRate;
    const ttc = invoice.amountHT + vat;

    const handleAction = (status: "draft" | "sent" | "paid") => {
        if (status === "paid") {
            markPaid(invoice.id, {
                onSuccess: () => {
                    toast({ title: "Invoice marked as paid", description: "The matter budget has been updated." });
                    onOpenChange(false);
                }
            });
        } else {
            updateStatus({ id: invoice.id, status }, {
                onSuccess: () => {
                    if (status === "sent") {
                        toast({ title: "Invoice sent", description: "The invoice state has been updated to sent." });
                    } else if (status === "draft") {
                        toast({ title: "Invoice saved as draft" });
                    }
                    onOpenChange(false);
                }
            });
        }
    };

    const handleArchive = () => {
        archive(invoice.id, {
            onSuccess: () => {
                toast({ title: "Invoice archived", description: "The invoice has been removed from active lists." });
                onOpenChange(false);
            }
        });
    };

    const handleUpdate = () => {
        updateInvoice({ id: invoice.id, dueDate }, {
            onSuccess: () => {
                toast({ title: "Invoice updated", description: "Changes have been saved." });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-background">
                <DialogHeader>
                    <DialogTitle>Invoice Preview - {invoice.reference}</DialogTitle>
                    <DialogDescription>
                        Review the invoice details before sending.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4 border rounded-md p-6 mt-2 bg-card text-card-foreground">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{settings.firmName}</h3>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{settings.address}</p>
                            <p className="text-sm text-muted-foreground">VAT: {settings.vat}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <h3 className="font-semibold text-lg">Billed to:</h3>
                            <p className="text-sm">{client.name}</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{client.address}</p>
                        </div>
                    </div>

                    <div className="border-t pt-4 flex gap-8">
                        <div>
                            <p className="text-sm text-muted-foreground">Matter</p>
                            <p className="font-medium text-sm">{matter.title}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Issue Date</p>
                            <p className="font-medium text-sm">{format(new Date(invoice.issuedAt), "dd MMM yyyy")}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Due Date</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <Input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="h-7 py-0 px-2 text-xs w-28"
                                />
                                {dueDate !== invoice.dueDate && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-primary"
                                        onClick={handleUpdate}
                                        disabled={updatingInvoice}
                                    >
                                        <Save className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-0.5 border"
                                style={{
                                    backgroundColor: invoice.status === "paid" ? "#dcfce7" : getInvoiceDisplayStatus(invoice) === "Unpaid" ? "#fee2e2" : invoice.status === "sent" ? "#dbeafe" : "#f1f5f9",
                                    color: invoice.status === "paid" ? "#166534" : getInvoiceDisplayStatus(invoice) === "Unpaid" ? "#991b1b" : invoice.status === "sent" ? "#1e40af" : "#475569",
                                    borderColor: invoice.status === "paid" ? "#bbf7d0" : getInvoiceDisplayStatus(invoice) === "Unpaid" ? "#fecaca" : invoice.status === "sent" ? "#bfdbfe" : "#e2e8f0"
                                }}
                            >
                                {getInvoiceDisplayStatus(invoice).toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="border rounded-md mt-6 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="text-left font-medium py-2 px-4">Description</th>
                                    <th className="text-right font-medium py-2 px-4">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-3 px-4">Provision for matter budget</td>
                                    <td className="py-3 px-4 text-right">{fmtCurrency(invoice.amountHT, 2)}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="bg-muted/30 p-4 space-y-2 flex flex-col items-end">
                            <div className="flex justify-between w-48 text-sm">
                                <span className="text-muted-foreground">Total HT</span>
                                <span>{fmtCurrency(invoice.amountHT, 2)}</span>
                            </div>
                            <div className="flex justify-between w-48 text-sm">
                                <span className="text-muted-foreground">VAT ({(invoice.vatRate * 100).toFixed(0)}%)</span>
                                <span>{fmtCurrency(vat, 2)}</span>
                            </div>
                            <div className="flex justify-between w-48 font-medium text-base border-t mt-2 pt-2">
                                <span>Total TTC</span>
                                <span>{fmtCurrency(ttc, 2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex sm:justify-between items-center mt-2 border-t pt-4">
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={handleArchive}
                            disabled={updating || paying || archiving}
                            title="Archive Invoice"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => handleAction("draft")}
                            disabled={updating || paying || archiving}
                        >
                            Save as draft
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => handleAction("paid")}
                            disabled={updating || paying}
                        >
                            Mark as paid
                        </Button>
                        <Button
                            variant="default"
                            onClick={() => handleAction("sent")}
                            disabled={updating || paying}
                        >
                            Send Invoice
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InvoicePreviewModal;
