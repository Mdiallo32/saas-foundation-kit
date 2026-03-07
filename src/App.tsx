import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/auth";
import AppLayout from "./layouts/AppLayout";
import LoginPage from "./pages/LoginPage";
import Index from "./pages/Index";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import MattersPage from "./pages/MattersPage";
import MatterDetailPage from "./pages/MatterDetailPage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import TeamPage from "./pages/TeamPage";
import FinancePage from "./pages/FinancePage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import { PageBoundary } from "@/components/boundaries/page-boundary";
import { DashboardSkeleton, TablePageSkeleton } from "@/components/ui/skeleton-loaders";

const queryClient = new QueryClient();

const AppRoutes = () => {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground text-sm">Chargement...</p>
            </div>
        );
    }

    if (!session) {
        return <LoginPage />;
    }

    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<PageBoundary fallback={<DashboardSkeleton />}><Index /></PageBoundary>} />
                <Route path="/clients" element={<PageBoundary fallback={<TablePageSkeleton />}><ClientsPage /></PageBoundary>} />
                <Route path="/clients/:id" element={<PageBoundary><ClientDetailPage /></PageBoundary>} />
                <Route path="/matters" element={<PageBoundary fallback={<TablePageSkeleton />}><MattersPage /></PageBoundary>} />
                <Route path="/matters/:id" element={<PageBoundary><MatterDetailPage /></PageBoundary>} />
                <Route path="/invoices/:id" element={<PageBoundary><InvoiceDetailPage /></PageBoundary>} />
                <Route path="/team" element={<PageBoundary><TeamPage /></PageBoundary>} />
                <Route path="/finance" element={<FinancePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
