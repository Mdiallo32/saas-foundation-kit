import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryErrorResetBoundary } from "@tanstack/react-query";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    onReset?: () => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class QueryErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    handleReset = () => {
        this.props.onReset?.();
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in duration-500">
                    <div className="rounded-full bg-destructive/10 p-3 mb-4">
                        <svg
                            className="h-6 w-6 text-destructive"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                        {this.state.error?.message || "An unexpected error occurred while loading this page."}
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-95"
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

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

export function PageBoundary({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return (
        <QueryErrorResetBoundary>
            {({ reset }) => (
                <QueryErrorBoundary onReset={reset}>
                    <Suspense fallback={fallback || <DefaultLoader />}>
                        {children}
                    </Suspense>
                </QueryErrorBoundary>
            )}
        </QueryErrorResetBoundary>
    );
}
