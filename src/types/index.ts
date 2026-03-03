export type ClientType = "physical" | "company";

export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    type: ClientType;
    vatNumber?: string;
    nationalNumber?: string;
    createdAt: string;
}

export type MatterStatus = "open" | "in-progress" | "pending" | "closed";

export interface Matter {
    id: string;
    title: string;
    clientId: string;
    budgetTotal: number;
    budgetUsed: number;
    hourlyRate: number;
    status: MatterStatus;
}

export interface Timesheet {
    id: string;
    matterId: string;
    description: string;
    hours: number;
    rate: number;
    date: string;
    user: string;
}

export interface Invoice {
    id: string;
    matterId: string;
    reference: string;
    amountHT: number;
    vatRate: number;
    status: "draft" | "sent" | "paid";
    issuedAt: string;
    dueDate?: string;
    paidAt?: string | null;
    archivedAt?: string | null;
    kind?: "provision" | "final";
}

export interface Collaborator {
    id: string;
    name: string;
    email: string;
    role: string;
    hourlyRate: number;
    avatar?: string;
    matterIds: string[];
}

export interface DashboardStat {
    label: string;
    value: string;
    change: string;
    icon: any;
}

export interface ActivityItem {
    id: string;
    action: string;
    detail: string;
    user: string;
    time: string;
}
