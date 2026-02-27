import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fmtCurrency } from "@/lib/money";

const data = [
  { month: "Sep", revenue: 52000, costs: 19000 },
  { month: "Oct", revenue: 61000, costs: 20500 },
  { month: "Nov", revenue: 58000, costs: 21000 },
  { month: "Dec", revenue: 72000, costs: 21500 },
  { month: "Jan", revenue: 68000, costs: 22000 },
  { month: "Feb", revenue: 84320, costs: 21900 },
];

const FinanceTrendCard = ({ timeframe }: { timeframe: string }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-heading">Revenue vs Costs</CardTitle>
      <p className="text-xs text-muted-foreground">{timeframe}</p>
    </CardHeader>
    <CardContent className="pt-2">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} className="text-muted-foreground" />
            <Tooltip
              formatter={(value: number) => fmtCurrency(value)}
              }
              contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "hsl(var(--border))" }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
            <Area type="monotone" dataKey="costs" name="Costs" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.1)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

export default FinanceTrendCard;
