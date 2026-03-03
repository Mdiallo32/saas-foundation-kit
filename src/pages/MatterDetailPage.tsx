import { useState, useMemo, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, AlertTriangle, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import MatterBudgetCards from "@/components/matters/MatterBudgetCards";
import BudgetProgress from "@/components/matters/BudgetProgress";
import TimesheetTable from "@/components/matters/TimesheetTable";
import TimesheetModal from "@/components/matters/TimesheetModal";
import InvoiceList from "@/components/invoices/InvoiceList";
import ProvisionInvoiceModal, { type ProvisionInvoiceData } from "@/components/invoices/ProvisionInvoiceModal";
import InvoicePreviewModal from "@/components/invoices/InvoicePreviewModal";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { type Timesheet, type MatterStatus } from "@/types";
import { useMatter, useTimesheets, useInvoices, useClients, useUpdateMatterStatus, useCreateProvisionInvoice, useMarkInvoicePaid } from "@/data/hooks";
import { TableSkeleton } from "@/components/ui/skeleton-loaders";

function downloadTimesheetsCSV(timesheets: Timesheet[], matterId: string) {
  const header = "Date,Collaborator,Hours,Description,Amount";
  const rows = timesheets.map((t) =>
    [format(new Date(t.date), "yyyy-MM-dd"), t.user, t.hours, `"${t.description}"`, (t.hours * t.rate).toFixed(2)].join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `timesheets-${matterId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const MatterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tsModalOpen, setTsModalOpen] = useState(false);
  const [provisionModalOpen, setProvisionModalOpen] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

  // Queries
  const { data: matter } = useMatter(id!);
  const { data: clients } = useClients();

  // Mutations
  const { mutate: updateStatus } = useUpdateMatterStatus();
  const { mutate: createProvision, isPending: invoiceLoading } = useCreateProvisionInvoice(id!);
  const { mutate: markPaid } = useMarkInvoicePaid();

  const client = clients.find((c) => c.id === matter.clientId);

  const uiStatus = useMemo(() => {
    if (matter.status === "closed") return "Closed";
    if (matter.status === "pending") return "On hold";
    return "Active";
  }, [matter.status]);

  const handleStatusChange = (val: string) => {
    if (val === "Closed") {
      setConfirmCloseOpen(true);
    } else {
      const status: MatterStatus = val === "On hold" ? "pending" : "in-progress";
      updateStatus({ id: matter.id, status }, {
        onSuccess: () => toast({ title: "Matter status updated" })
      });
    }
  };

  const [previewInvoice, setPreviewInvoice] = useState<any>(null);

  const handleAddProvision = (data: ProvisionInvoiceData) => {
    createProvision({ amountHT: data.amountHT, issuedAt: data.issueDate }, {
      onSuccess: (newInvoice) => {
        setProvisionModalOpen(false);
        setPreviewInvoice(newInvoice);
      }
    });
  };

  const handleMarkPaid = (invoiceId: string) => {
    markPaid(invoiceId, {
      onSuccess: () => toast({ title: "Provision received. Budget updated." })
    });
  };

  const remaining = matter.budgetTotal - matter.budgetUsed;
  const pct = matter.budgetTotal > 0 ? (matter.budgetUsed / matter.budgetTotal) * 100 : 0;
  const showWarning = pct >= 80;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/matters")} aria-label="Back to matters">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{matter.title}</h1>
              <Badge variant={uiStatus === "Closed" ? "secondary" : uiStatus === "On hold" ? "outline" : "default"}>
                {uiStatus}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{client?.name ?? "Unknown client"}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={uiStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="On hold">On hold</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setProvisionModalOpen(true)}>
            <FileText className="h-4 w-4 mr-1.5" /> Fund Budget
          </Button>
          <div title={uiStatus === "Closed" ? "This matter is closed." : undefined}>
            <Button size="sm" onClick={() => setTsModalOpen(true)} disabled={uiStatus === "Closed"}>
              <Plus className="h-4 w-4 mr-1.5" /> Log Time
            </Button>
          </div>
        </div>
      </div>

      {/* Warning */}
      {showWarning && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Budget is {Math.round(pct)}% consumed — only <strong>${remaining.toLocaleString()}</strong> remaining.
          </AlertDescription>
        </Alert>
      )}

      {/* Budget */}
      <MatterBudgetCards matter={matter} />
      <BudgetProgress matter={matter} />

      <Suspense fallback={<TableSkeleton rows={3} />}>
        <MatterTimesheetsSection matterId={matter.id} />
      </Suspense>

      <Suspense fallback={<TableSkeleton rows={3} />}>
        <MatterInvoicesSection
          matterId={matter.id}
          onAddProvision={() => setProvisionModalOpen(true)}
          handleMarkPaid={handleMarkPaid}
        />
      </Suspense>

      <TimesheetModal
        open={tsModalOpen}
        onOpenChange={setTsModalOpen}
        matterId={matter.id}
        hourlyRate={matter.hourlyRate}
      />

      <ProvisionInvoiceModal
        open={provisionModalOpen}
        onOpenChange={setProvisionModalOpen}
        onSave={handleAddProvision}
        isLoading={invoiceLoading}
        budgetTotal={matter.budgetTotal}
        budgetRemaining={remaining}
      />

      <AlertDialog open={confirmCloseOpen} onOpenChange={setConfirmCloseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this matter?</AlertDialogTitle>
            <AlertDialogDescription>
              Closing a matter usually stops time entries. You can reopen it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              updateStatus({ id: matter.id, status: "closed" }, {
                onSuccess: () => toast({ title: "Matter closed" })
              });
            }}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {previewInvoice && client && (
        <InvoicePreviewModal
          open={!!previewInvoice}
          onOpenChange={(open) => !open && setPreviewInvoice(null)}
          invoice={previewInvoice}
          matter={matter}
          client={client}
        />
      )}
    </div>
  );
};

interface MatterSectionProps {
  matterId: string;
}

const MatterTimesheetsSection = ({ matterId }: MatterSectionProps) => {
  const { data: timesheets } = useTimesheets(matterId);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Timesheets</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-muted-foreground"
          onClick={() => downloadTimesheetsCSV(timesheets, matterId)}
          disabled={timesheets.length === 0}
        >
          <Download className="h-3.5 w-3.5 mr-1.5" /> Download CSV
        </Button>
      </div>
      <TimesheetTable timesheets={timesheets} />
    </div>
  );
};

interface MatterInvoicesSectionProps extends MatterSectionProps {
  onAddProvision: () => void;
  handleMarkPaid: (invoiceId: string) => void;
}

const MatterInvoicesSection = ({ matterId, onAddProvision, handleMarkPaid }: MatterInvoicesSectionProps) => {
  const { data: invoices } = useInvoices(matterId);
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium">Invoices</h2>
      <InvoiceList
        invoices={invoices}
        onAddProvision={onAddProvision}
        onMarkPaid={handleMarkPaid}
      />
    </div>
  );
};

export default MatterDetailPage;
