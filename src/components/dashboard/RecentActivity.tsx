import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recentActivity } from "@/lib/mock-data";
import { Clock } from "lucide-react";

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-display">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Clock className="h-8 w-8 mb-2" aria-hidden="true" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <ul role="list" aria-label="Recent activity" className="divide-y">
            {recentActivity.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 px-6 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">{item.user}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
