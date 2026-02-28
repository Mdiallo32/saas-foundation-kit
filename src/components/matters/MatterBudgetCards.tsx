import { DollarSign, TrendingDown, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/skeleton-loaders";
import type { Matter } from "@/lib/mock-matters";
import { fmtCurrency } from "@/lib/money";

const fmt = fmtCurrency;

const MatterBudgetCards = ({ matter, isLoading = false }: { matter?: Matter; isLoading?: boolean }) => {
  if (isLoading || !matter) {
    return (
      <div className="grid sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const remaining = matter.budgetTotal - matter.budgetUsed;
  const pct = matter.budgetTotal > 0 ? Math.round((matter.budgetUsed / matter.budgetTotal) * 100) : 0;

  const cards = [
    { label: "Budget Total (Funded)", value: fmt(matter.budgetTotal), icon: DollarSign, sub: `Base Rate: ${fmt(matter.hourlyRate)}/hr` },
    { label: "Consumed", value: fmt(matter.budgetUsed), icon: TrendingDown, sub: `${pct}% consumed` },
    { label: "Remaining", value: fmt(remaining), icon: Clock, sub: remaining > 0 ? `~${Math.floor(remaining / matter.hourlyRate)} hrs left` : "Exhausted" },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
              <c.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-xl font-semibold tracking-tight">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MatterBudgetCards;
