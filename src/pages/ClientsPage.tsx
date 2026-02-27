import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClientTable from "@/components/clients/ClientTable";
import ClientFormModal from "@/components/clients/ClientFormModal";
import { mockClients } from "@/lib/mock-clients";

const ClientsPage = () => {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(
    () =>
      mockClients.filter((c) => {
        const q = search.toLowerCase();
        const id = (c.type === "company" ? c.vatNumber : c.nationalNumber) ?? "";
        return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || id.toLowerCase().includes(q);
      }),
    [search],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight font-heading">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">{mockClients.length} total clients</p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> New Client
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          aria-label="Search clients"
        />
      </div>

      <ClientTable clients={filtered} />
      <ClientFormModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
};

export default ClientsPage;
