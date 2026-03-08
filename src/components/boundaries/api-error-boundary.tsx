import React from "react";
import { AlertTriangle, WifiOff, ShieldOff, ServerCrash, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Error classification helpers
// ---------------------------------------------------------------------------

/** Extract HTTP status from an error object if present. */
const getHttpStatus = (error: unknown): number | null => {
    if (!error || typeof error !== "object") return null;
    const e = error as Record<string, unknown>;
    if (typeof e.status === "number") return e.status;
    if (typeof e.statusCode === "number") return e.statusCode;
    // Supabase error shape: { code: string, status: number }
    if (typeof e.code === "number") return e.code as number;
    return null;
};

const isNetworkError = (error: unknown): boolean => {
    if (!(error instanceof Error)) return false;
    const msg = error.message.toLowerCase();
    return (
        msg.includes("network") ||
        msg.includes("fetch") ||
        msg.includes("failed to fetch") ||
        msg.includes("networkerror")
    );
};

// ---------------------------------------------------------------------------
// Error-specific UI configs
// ---------------------------------------------------------------------------

interface ErrorConfig {
    icon: React.ReactNode;
    title: string;
    description: string;
    canRetry: boolean;
}

const getErrorConfig = (error: unknown): ErrorConfig => {
    const status = getHttpStatus(error);

    if (isNetworkError(error)) {
        return {
            icon: <WifiOff className="h-6 w-6 text-orange-500" />,
            title: "No network connection",
            description: "Check your internet connection and try again.",
            canRetry: true,
        };
    }

    switch (status) {
        case 401:
            return {
                icon: <ShieldOff className="h-6 w-6 text-yellow-500" />,
                title: "Session expired",
                description: "Your session has expired. Please sign in again to continue.",
                canRetry: false,
            };
        case 403:
            return {
                icon: <ShieldOff className="h-6 w-6 text-yellow-500" />,
                title: "Access denied",
                description: "You don't have permission to view this content.",
                canRetry: false,
            };
        case 404:
            return {
                icon: <AlertTriangle className="h-6 w-6 text-muted-foreground" />,
                title: "Not found",
                description: "The requested resource could not be found.",
                canRetry: false,
            };
        case 429:
            return {
                icon: <AlertTriangle className="h-6 w-6 text-orange-500" />,
                title: "Too many requests",
                description: "Rate limit reached. Please wait a moment before trying again.",
                canRetry: true,
            };
        case 500:
        case 502:
        case 503:
        case 504:
            return {
                icon: <ServerCrash className="h-6 w-6 text-destructive" />,
                title: "Server error",
                description: "Something went wrong on our end. We're looking into it.",
                canRetry: true,
            };
        default:
            return {
                icon: <AlertTriangle className="h-6 w-6 text-destructive" />,
                title: "Something went wrong",
                description:
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred while loading this page.",
                canRetry: true,
            };
    }
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ApiErrorBoundaryProps {
    children: React.ReactNode;
    /** Called after internal state is reset — use to re-run the failed query. */
    onReset?: () => void;
}

interface ApiErrorBoundaryState {
    hasError: boolean;
    error: unknown;
}

export class ApiErrorBoundary extends React.Component<ApiErrorBoundaryProps, ApiErrorBoundaryState> {
    constructor(props: ApiErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: unknown): ApiErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
        const status = getHttpStatus(error);
        console.error("[ApiErrorBoundary]", { status, error, errorInfo });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        this.props.onReset?.();
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        const { icon, title, description, canRetry } = getErrorConfig(this.state.error);

        return (
            <div
                role="alert"
                aria-live="assertive"
                className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in duration-500"
            >
                <div className="rounded-full bg-muted p-3 mb-4">{icon}</div>

                <h3 className="text-lg font-semibold mb-2">{title}</h3>

                <p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>

                {canRetry && (
                    <Button
                        onClick={this.handleRetry}
                        variant="default"
                        size="sm"
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try again
                    </Button>
                )}

                {!canRetry && getHttpStatus(this.state.error) === 401 && (
                    <Button
                        onClick={() => (window.location.href = "/login")}
                        variant="default"
                        size="sm"
                    >
                        Sign in
                    </Button>
                )}
            </div>
        );
    }
}
