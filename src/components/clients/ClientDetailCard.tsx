import { format } from "date-fns";
import { Mail, Phone, MapPin, Hash, CalendarDays, User, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Client } from "@/lib/mock-clients";

const Row = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-start gap-3 text-sm">
    <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

const ClientDetailCard = ({ client }: { client: Client }) => {
  const isCompany = client.type === "company";

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">{client.name}</CardTitle>
          <Badge variant={isCompany ? "default" : "secondary"} className="text-xs">
            {isCompany ? "Company" : "Person"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid sm:grid-cols-2 gap-4">
        <Row icon={Mail} label="Email" value={client.email} />
        <Row icon={Phone} label="Phone" value={client.phone} />
        <Row icon={MapPin} label="Address" value={client.address} />
        {isCompany ? (
          <Row icon={Building2} label="VAT Number" value={client.vatNumber ?? "—"} />
        ) : (
          <Row icon={User} label="National Number" value={client.nationalNumber ?? "—"} />
        )}
        <Row icon={CalendarDays} label="Created" value={format(new Date(client.createdAt), "dd MMM yyyy")} />
      </CardContent>
    </Card>
  );
};

export default ClientDetailCard;
