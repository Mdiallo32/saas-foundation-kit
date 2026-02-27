import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import type { Client } from "@/lib/mock-clients";

interface ClientTableProps {
  clients: Client[];
}

const ClientTable = ({ clients }: ClientTableProps) => {
  const navigate = useNavigate();

  if (clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        No clients found.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>VAT Number</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((c) => (
              <TableRow key={c.id} className="cursor-pointer" onClick={() => navigate(`/clients/${c.id}`)}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell className="font-mono text-xs">{c.vatNumber}</TableCell>
                <TableCell>{format(new Date(c.createdAt), "dd MMM yyyy")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile stacked cards */}
      <div className="md:hidden space-y-3">
        {clients.map((c) => (
          <div key={c.id} className="rounded-lg border border-border p-4 space-y-1.5 bg-card">
            <p className="font-medium text-sm">{c.name}</p>
            <p className="text-xs text-muted-foreground">{c.email}</p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="font-mono">{c.vatNumber}</span>
              <span>{format(new Date(c.createdAt), "dd MMM yyyy")}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ClientTable;
