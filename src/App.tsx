import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Index from "./pages/Index";
import { PageBoundary } from "@/components/boundaries/page-boundary";
import SettingsPage from "./pages/SettingsPage";
import FinancePage from "./pages/FinancePage";
import TeamPage from "./pages/TeamPage";
import MattersPage from "./pages/MattersPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import MatterDetailPage from "./pages/MatterDetailPage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

import { DashboardSkeleton, TablePageSkeleton } from "@/components/ui/skeleton-loaders";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
