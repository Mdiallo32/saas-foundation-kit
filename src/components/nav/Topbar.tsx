import { useLocation } from "react-router-dom";
import { useSettings } from "@/data/hooks";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/clients": "Clients",
  "/matters": "Matters",
  "/team": "Team",
  "/finance": "Finance",
  "/settings": "Settings",
  "/profile": "Profile",
};

export function Topbar() {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? "Page";
  const { data: settings } = useSettings();
  const firmName = settings?.firmName || "Lexicon";

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

      <div className="ml-auto flex items-center pr-2">
        <span className="font-display text-sm font-semibold tracking-tight text-muted-foreground uppercase">
          {firmName}
        </span>
      </div>
    </header>
  );
}
