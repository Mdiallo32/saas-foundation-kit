import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClientDetailCard from "@/components/clients/ClientDetailCard";
import MatterTable from "@/components/matters/MatterTable";
import { mockClients } from "@/lib/mock-clients";
import { mockMatters } from "@/lib/mock-matters";

const ClientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const client = mockClients.find((c) => c.id === id);
  const matters = useMemo(() => mockMatters.filter((m) => m.clientId === id), [id]);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Client not found.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/clients")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/clients")} aria-label="Back to clients">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight font-heading">{client.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{matters.length} matter{matters.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-1.5" /> Edit
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Create Matter
          </Button>
        </div>
      </div>

      <ClientDetailCard client={client} />

      {/* Matters */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold font-heading">Related Matters</h2>
        <MatterTable matters={matters} />
      </div>
    </div>
  );
};

export default ClientDetailPage;
