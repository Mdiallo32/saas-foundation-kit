import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/nav/AppSidebar";
import { Topbar } from "@/components/nav/Topbar";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
