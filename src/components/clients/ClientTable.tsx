import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Client } from "@/types";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { TableSkeleton } from "@/components/ui/skeleton-loaders";
import { Users } from "lucide-react";

interface ClientTableProps {
  clients: Client[];
  isLoading?: boolean;
}

const typeLabel = (c: Client) => (c.type === "company" ? "Company" : "Person");
const identifier = (c: Client) => c.type === "company" ? c.vatNumber ?? "—" : c.nationalNumber ?? "—";

import { ResponsiveTableLayout, TableCard } from "@/components/ui/responsive-table-layout";

const ClientTable = ({ clients, isLoading = false }: ClientTableProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <TableSkeleton columns={5} />;
  }

  if (clients.length === 0) {
    return <TableEmptyState message="No clients found." icon={Users} />;
  }

  return (
    <ResponsiveTableLayout
      desktop={
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Identifier</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((c) => (
              <TableRow key={c.id} className="cursor-pointer" onClick={() => navigate(`/clients/${c.id}`)}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  <Badge variant={c.type === "company" ? "default" : "secondary"} className="text-xs">
                    {typeLabel(c)}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{identifier(c)}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{format(new Date(c.createdAt), "dd MMM yyyy")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
      mobile={
        clients.map((c) => (
          <TableCard key={c.id} onClick={() => navigate(`/clients/${c.id}`)}>
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">{c.name}</p>
              <Badge variant={c.type === "company" ? "default" : "secondary"} className="text-xs">
                {typeLabel(c)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{c.email}</p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="font-mono">{identifier(c)}</span>
              <span>{format(new Date(c.createdAt), "dd MMM yyyy")}</span>
            </div>
          </TableCard>
        ))
      }
    />
  );
};


export default ClientTable;
