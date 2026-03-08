import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ApiErrorBoundary } from "./api-error-boundary";

const DefaultLoader = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="space-y-3">
            <Skeleton className="h-9 w-[250px]" />
            <Skeleton className="h-4 w-[350px]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[128px] rounded-xl" />
            <Skeleton className="h-[128px] rounded-xl" />
            <Skeleton className="h-[128px] rounded-xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
);

/**
 * PageBoundary wraps page-level content with three layers:
 *  1. QueryErrorResetBoundary   — lets TanStack Query reset stale queries on retry
 *  2. ApiErrorBoundary          — catches thrown errors, shows HTTP-aware fallback UI
 *  3. Suspense                  — shows skeleton while useSuspenseQuery resolves
 */
export function PageBoundary({
    children,
    fallback,
}: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) {
    return (
        <QueryErrorResetBoundary>
            {({ reset }) => (
                <ApiErrorBoundary onReset={reset}>
                    <Suspense fallback={fallback || <DefaultLoader />}>
                        {children}
                    </Suspense>
                </ApiErrorBoundary>
            )}
        </QueryErrorResetBoundary>
    );
}
