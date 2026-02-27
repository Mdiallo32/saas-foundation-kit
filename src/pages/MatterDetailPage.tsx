import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, AlertTriangle, Download } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MatterBudgetCards from "@/components/matters/MatterBudgetCards";
import BudgetProgress from "@/components/matters/BudgetProgress";
import TimesheetTable from "@/components/matters/TimesheetTable";
import TimesheetModal from "@/components/matters/TimesheetModal";
import InvoiceList from "@/components/invoices/InvoiceList";
import { mockMatters, mockTimesheets, mockInvoices, type Timesheet } from "@/lib/mock-matters";
import { mockClients } from "@/lib/mock-clients";

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
  const [tsModalOpen, setTsModalOpen] = useState(false);

  const matter = mockMatters.find((m) => m.id === id);
  const client = matter ? mockClients.find((c) => c.id === matter.clientId) : undefined;
  const timesheets = useMemo(() => mockTimesheets.filter((t) => t.matterId === id), [id]);
  const invoices = useMemo(() => mockInvoices.filter((i) => i.matterId === id), [id]);

  if (!matter) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Matter not found.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/matters")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Matters
        </Button>
      </div>
    );
  }

  const remaining = matter.budgetTotal - matter.budgetUsed;
  const pct = matter.budgetTotal > 0 ? (matter.budgetUsed / matter.budgetTotal) * 100 : 0;
  const showWarning = pct >= 80;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/matters")} aria-label="Back to matters">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight font-heading">{matter.title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{client?.name ?? "Unknown client"}</p>
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

      {/* Timesheets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold font-heading">Timesheets</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => downloadTimesheetsCSV(timesheets, matter.id)} disabled={timesheets.length === 0}>
              <Download className="h-4 w-4 mr-1.5" /> Download CSV
            </Button>
            <Button size="sm" onClick={() => setTsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Log Time
            </Button>
          </div>
        </div>
        <TimesheetTable timesheets={timesheets} />
      </div>

      {/* Invoices */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold font-heading">Invoices</h2>
        <InvoiceList invoices={invoices} />
      </div>

      <TimesheetModal open={tsModalOpen} onOpenChange={setTsModalOpen} hourlyRate={matter.hourlyRate} />
    </div>
  );
};

export default MatterDetailPage;
