import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MatterTable from "@/components/matters/MatterTable";
import MatterFormModal from "@/components/matters/MatterFormModal";
import { useMatters, useClients } from "@/data/hooks";

const MattersPage = () => {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const { data: matters } = useMatters();
  const { data: clients } = useClients();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return matters.filter((m) => {
      const client = clients.find((c) => c.id === m.clientId);
      return (
        m.title.toLowerCase().includes(q) ||
        client?.name.toLowerCase().includes(q) ||
        m.status.includes(q)
      );
    });
  }, [search, matters, clients]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Matters</h1>
          <p className="text-sm text-muted-foreground mt-1">{matters.length} total matters</p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> New Matter
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search matters…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          aria-label="Search matters"
        />
      </div>

      <MatterTable matters={filtered} showClient />
      <MatterFormModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
};

export default MattersPage;
