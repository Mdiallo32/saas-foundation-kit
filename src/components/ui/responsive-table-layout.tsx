import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveTableLayoutProps {
    desktop: React.ReactNode;
    mobile: React.ReactNode;
    className?: string;
}

export function ResponsiveTableLayout({ desktop, mobile, className }: ResponsiveTableLayoutProps) {
    return (
        <div className={className}>
            <div className="hidden md:block rounded-lg border border-border overflow-hidden">
                {desktop}
            </div>
            <div className="md:hidden space-y-3">
                {mobile}
            </div>
        </div>
    );
}

interface TableCardProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export function TableCard({ children, onClick, className }: TableCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "rounded-lg border border-border p-4 bg-card transition-colors hover:bg-muted/30",
                onClick ? "cursor-pointer" : "cursor-default",
                "flex flex-col gap-2",
                className
            )}
        >
            {children}
        </div>
    );
}

