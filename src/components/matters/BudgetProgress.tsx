import { Progress } from "@/components/ui/progress";
import type { Matter } from "@/lib/mock-matters";

const BudgetProgress = ({ matter }: { matter: Matter }) => {
  const pct = matter.budgetTotal > 0 ? Math.min(100, Math.round((matter.budgetUsed / matter.budgetTotal) * 100)) : 0;
  const isWarning = pct >= 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Budget consumption</span>
        <span className={`font-semibold ${isWarning ? "text-destructive" : ""}`}>{pct}%</span>
      </div>
      <Progress value={pct} className={`h-2.5 ${isWarning ? "[&>div]:bg-destructive" : ""}`} />
    </div>
  );
};

export default BudgetProgress;
