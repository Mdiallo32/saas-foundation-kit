import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/clients": "Clients",
  "/matters": "Matters",
  "/team": "Team",
  "/finance": "Finance",
  "/settings": "Settings",
};

export function Topbar() {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? "Page";

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-4"
    >
      <SidebarTrigger className="shrink-0" />
      <Separator orientation="vertical" className="h-5" />
      <h1 className="font-display text-lg font-semibold tracking-tight">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Search">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
