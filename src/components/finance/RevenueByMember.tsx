import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

interface MemberRevenue {
  name: string;
  hours: number;
  revenue: number;
  avgRate: number;
}

const data: MemberRevenue[] = [
  { name: "Sarah Chen", hours: 48.5, revenue: 21825, avgRate: 450 },
  { name: "James Okafor", hours: 36, revenue: 11700, avgRate: 325 },
  { name: "Emily Tran", hours: 34.5, revenue: 9660, avgRate: 280 },
  { name: "David Kimura", hours: 26, revenue: 7150, avgRate: 275 },
  { name: "Maria Lopez", hours: 18, revenue: 3600, avgRate: 200 },
];

const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").toUpperCase();

const RevenueByMember = () => (
  <>
    <div className="hidden md:block rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Member</TableHead>
            <TableHead className="text-right">Hours Billed</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Avg Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((m) => (
            <TableRow key={m.name}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials(m.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{m.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">{m.hours}h</TableCell>
              <TableCell className="text-right font-semibold">{fmt(m.revenue)}</TableCell>
              <TableCell className="text-right text-muted-foreground">{fmt(m.avgRate)}/hr</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    <div className="md:hidden space-y-3">
      {data.map((m) => (
        <div key={m.name} className="rounded-lg border border-border p-4 bg-card space-y-2">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials(m.name)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{m.name}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{m.hours}h billed</span>
            <span className="font-semibold text-foreground">{fmt(m.revenue)}</span>
          </div>
        </div>
      ))}
    </div>
  </>
);

export default RevenueByMember;
