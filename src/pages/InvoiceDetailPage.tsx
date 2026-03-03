import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Trash2, Printer } from "lucide-react";
import { useInvoice, useMatter, useClient, useSettings, useUpdateInvoiceStatus, useMarkInvoicePaid, useArchiveInvoice } from "@/data/hooks";
import { format } from "date-fns";
import { fmtCurrency } from "@/lib/money";
import { getInvoiceDisplayStatus } from "@/lib/invoice-utils";
import { useToast } from "@/hooks/use-toast";

const InvoiceDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const { data: invoice, isLoading: invLoading } = useInvoice(id!);
    const { data: matter, isLoading: matLoading } = useMatter(invoice?.matterId || "");
    const { data: client, isLoading: cliLoading } = useClient(matter?.clientId || "");
    const { data: settings, isLoading: setLoading } = useSettings();

    const { mutate: updateStatus, isPending: updating } = useUpdateInvoiceStatus();
    const { mutate: markPaid, isPending: paying } = useMarkInvoicePaid();
    const { mutate: archive, isPending: archiving } = useArchiveInvoice();

    const loading = invLoading || matLoading || cliLoading || setLoading;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-2" />
                <p className="text-muted-foreground mt-4">Loading invoice details...</p>
            </div>
        );
    }

    if (!invoice || !matter || !client || !settings) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Invoice or related data not found.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
            </div>
        );
    }

    const vat = invoice.amountHT * invoice.vatRate;
    const ttc = invoice.amountHT + vat;

    const handleAction = (status: "draft" | "sent" | "paid") => {
        if (status === "paid") {
            markPaid(invoice.id, {
                onSuccess: () => toast({ title: "Invoice marked as paid" })
            });
        } else {
            updateStatus({ id: invoice.id, status }, {
                onSuccess: () => toast({ title: `Invoice status updated to ${status}` })
            });
        }
    };

    const handleArchive = () => {
        archive(invoice.id, {
            onSuccess: () => {
                toast({ title: "Invoice archived" });
                navigate("/finance");
            }
        });
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="h-4 w-4 mr-2" /> Print
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={handleArchive}
                        disabled={updating || paying || archiving}
                    >
                        <Trash2 className="h-4 w-4 mr-2" /> Archive
                    </Button>
                </div>
            </div>

            <div className="bg-card border rounded-lg shadow-sm p-8 space-y-8">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold">{settings.firmName}</h1>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{settings.address}</p>
                        <p className="text-sm text-muted-foreground">VAT: {settings.vat}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-tight">Invoice</h2>
                        <p className="font-mono text-sm">{invoice.reference}</p>
                        <p className="text-sm">Status: <span className="font-medium">{getInvoiceDisplayStatus(invoice).toUpperCase()}</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Bill To</h3>
                        <div>
                            <p className="font-bold">{client.name}</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{client.address}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Issue Date</p>
                            <p className="text-sm font-medium">{format(new Date(invoice.issuedAt), "dd MMM yyyy")}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due Date</p>
                            <p className="text-sm font-medium">{invoice.dueDate ? format(new Date(invoice.dueDate), "dd MMM yyyy") : "-"}</p>
                        </div>
                    </div>
                </div>

                <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="text-left font-medium py-3 px-4">Description</th>
                                <th className="text-right font-medium py-3 px-4">Initial Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            <tr>
                                <td className="py-4 px-4 font-medium">Provision for matter budget: {matter.title}</td>
                                <td className="py-4 px-4 text-right">{fmtCurrency(invoice.amountHT, 2)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="bg-muted/10 p-6 flex flex-col items-end space-y-2">
                        <div className="flex justify-between w-64 text-sm">
                            <span className="text-muted-foreground">Subtotal HT</span>
                            <span>{fmtCurrency(invoice.amountHT, 2)}</span>
                        </div>
                        <div className="flex justify-between w-64 text-sm">
                            <span className="text-muted-foreground">VAT ({(invoice.vatRate * 100).toFixed(0)}%)</span>
                            <span>{fmtCurrency(vat, 2)}</span>
                        </div>
                        <div className="flex justify-between w-64 font-bold text-lg border-t border-muted-foreground/20 mt-4 pt-4">
                            <span>Total TTC</span>
                            <span>{fmtCurrency(ttc, 2)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t no-print">
                    <Button
                        variant="secondary"
                        onClick={() => handleAction("paid")}
                        disabled={updating || paying || invoice.status === "paid"}
                    >
                        Mark as Paid
                    </Button>
                    <Button
                        variant="default"
                        onClick={() => handleAction("sent")}
                        disabled={updating || paying || invoice.status === "sent" || invoice.status === "paid"}
                    >
                        Send Invoice
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailPage;
