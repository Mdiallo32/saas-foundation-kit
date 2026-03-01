export const QUERY_KEYS = {
    clients: ["clients"] as const,
    client: (id: string) => ["clients", id] as const,
    matters: ["matters"] as const,
    matter: (id: string) => ["matters", id] as const,
    timesheets: (matterId: string) => ["timesheets", { matterId }] as const,
    invoices: (matterId: string) => ["invoices", { matterId }] as const,
    team: ["team"] as const,
    dashboardStats: ["dashboard", "stats"] as const,
    recentActivity: ["dashboard", "activity"] as const,
    settings: ["settings"] as const,
};
