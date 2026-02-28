import { LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableEmptyStateProps {
    message?: string;
    icon?: LucideIcon;
    className?: string;
}

export function TableEmptyState({
    message = "No results found.",
    icon: Icon = Inbox,
    className
}: TableEmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center h-40 w-full text-sm text-muted-foreground",
            className
        )}>
            <Icon className="h-8 w-8 mb-2 opacity-20" />
            <p>{message}</p>
        </div>
    );
}
