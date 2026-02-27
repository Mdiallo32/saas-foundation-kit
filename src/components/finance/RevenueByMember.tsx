import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockTimesheets } from "@/lib/mock-matters";
import { mockCollaborators } from "@/lib/mock-team";
import { fmtCurrency } from "@/lib/money";

const fmt = fmtCurrency;

const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").toUpperCase();

interface MemberRow {
  name: string;
  hours: number;
  revenue: number;
  cost: number;
  profit: number;
  avgRate: number;
}

const rateByName = Object.fromEntries(mockCollaborators.map((c) => [c.name, c.hourlyRate]));

const data: MemberRow[] = (() => {
  const map = new Map<string, { hours: number; revenue: number; cost: number }>();
  for (const t of mockTimesheets) {
    const prev = map.get(t.user) ?? { hours: 0, revenue: 0, cost: 0 };
    const costRate = rateByName[t.user] ?? 0;
    map.set(t.user, {
      hours: prev.hours + t.hours,
      revenue: prev.revenue + t.hours * t.rate,
      cost: prev.cost + t.hours * costRate,
    });
  }
  return Array.from(map.entries())
    .map(([name, v]) => ({
      name,
      hours: v.hours,
      revenue: v.revenue,
      cost: v.cost,
      profit: v.revenue - v.cost,
      avgRate: v.hours > 0 ? Math.round(v.revenue / v.hours) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
})();

const RevenueByMember = () => (
  <>
    <div className="hidden md:block rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Member</TableHead>
            <TableHead className="text-right">Hours</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead className="text-right">Profit</TableHead>
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
              <TableCell className="text-right text-muted-foreground">{fmt(m.cost)}</TableCell>
              <TableCell className="text-right font-semibold text-emerald-600">{fmt(m.profit)}</TableCell>
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
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Cost: {fmt(m.cost)}</span>
            <span className="font-semibold text-emerald-600">Profit: {fmt(m.profit)}</span>
          </div>
        </div>
      ))}
    </div>
  </>
);

export default RevenueByMember;
