import { Client, Matter, Timesheet, Invoice, Collaborator, MatterStatus } from "@/types";
import { mockClients } from "@/lib/mock-clients";
import { mockMatters, mockTimesheets, mockInvoices } from "@/lib/mock-matters";
import { mockCollaborators } from "@/lib/mock-team";

// --- In-memory Store ---
let clients: Client[] = [...mockClients];
let matters: Matter[] = [...mockMatters];
let timesheets: Timesheet[] = [...mockTimesheets];
let invoices: Invoice[] = [...mockInvoices];
let team: Collaborator[] = [...mockCollaborators];

// --- Helper ---
const delay = (ms: number = 200) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Repository Functions ---

// Settings
const DEFAULT_SETTINGS = {
    firmName: "Carter & Associates LLP",
    slogan: "Trusted counsel, measurable results.",
    vat: "GB123456789",
    address: "12 King's Road, London EC2V 8AB",
    email: "info@carterassociates.com",
    phone: "+44 20 7946 0958",
};

export const getSettings = async () => {
    await delay(100);
    const stored = localStorage.getItem("firm_settings");
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            // ignore JSON parse error
        }
    }
    return DEFAULT_SETTINGS;
};

export const updateSettings = async (payload: typeof DEFAULT_SETTINGS) => {
    await delay(300);
    localStorage.setItem("firm_settings", JSON.stringify(payload));
    return payload;
};

// Clients
export const listClients = async (): Promise<Client[]> => {
    await delay();
    return [...clients];
};

export const getClient = async (id: string): Promise<Client | undefined> => {
    await delay();
    return clients.find((c) => c.id === id);
};

export const createClient = async (payload: Omit<Client, "id" | "createdAt">): Promise<Client> => {
    await delay(300);
    const newClient: Client = {
        ...payload,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString().split("T")[0],
    };
    clients = [newClient, ...clients];
    return newClient;
};

export const updateClient = async (id: string, payload: Partial<Omit<Client, "id" | "createdAt">>): Promise<Client> => {
    await delay(300);
    const index = clients.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Client not found");

    const updatedClient = { ...clients[index], ...payload };
    clients[index] = updatedClient;
    return updatedClient;
};

// Matters
export const listMatters = async (): Promise<Matter[]> => {
    await delay();
    return [...matters];
};

export const getMatter = async (id: string): Promise<Matter | undefined> => {
    await delay();
    return matters.find((m) => m.id === id);
};

export const createMatter = async (payload: Omit<Matter, "id" | "budgetUsed">): Promise<Matter> => {
    await delay(300);
    const newMatter: Matter = {
        ...payload,
        id: `m${Math.random().toString(36).substr(2, 5)}`,
        budgetUsed: 0,
    };
    matters = [newMatter, ...matters];
    return newMatter;
};

export const updateMatterStatus = async (id: string, status: MatterStatus): Promise<Matter> => {
    await delay(200);
    const index = matters.findIndex((m) => m.id === id);
    if (index === -1) throw new Error("Matter not found");

    const updatedMatter = { ...matters[index], status };
    matters[index] = updatedMatter;
    return updatedMatter;
};

// Timesheets
export const listTimesheets = async (matterId: string): Promise<Timesheet[]> => {
    await delay();
    return timesheets.filter((t) => t.matterId === matterId);
};

export const createTimesheet = async (matterId: string, payload: Omit<Timesheet, "id" | "matterId">): Promise<Timesheet> => {
    await delay(300);
    const newTimesheet: Timesheet = {
        ...payload,
        id: `t${Math.random().toString(36).substr(2, 5)}`,
        matterId,
    };
    timesheets = [newTimesheet, ...timesheets];

    // Update matter budget used
    const index = matters.findIndex((m) => m.id === matterId);
    if (index !== -1) {
        matters[index] = {
            ...matters[index],
            budgetUsed: matters[index].budgetUsed + (newTimesheet.hours * newTimesheet.rate),
        };
    }

    return newTimesheet;
};

// Invoices
export const listInvoices = async (matterId: string): Promise<Invoice[]> => {
    await delay();
    return invoices.filter((i) => i.matterId === matterId);
};

export const createProvisionInvoice = async (matterId: string, payload: Pick<Invoice, "amountHT" | "issuedAt">): Promise<Invoice> => {
    await delay(300);
    const newInvoice: Invoice = {
        id: `inv${Math.random().toString(36).substr(2, 5)}`,
        matterId,
        reference: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
        amountHT: payload.amountHT,
        vatRate: 0.21,
        status: "pending",
        issuedAt: payload.issuedAt,
        kind: "provision",
    };
    invoices = [newInvoice, ...invoices];
    return newInvoice;
};

export const markInvoicePaid = async (id: string): Promise<Invoice> => {
    await delay(200);
    const index = invoices.findIndex((i) => i.id === id);
    if (index === -1) throw new Error("Invoice not found");

    const updatedInvoice = { ...invoices[index], status: "paid" as const };
    invoices[index] = updatedInvoice;

    // If it's a provision invoice, increase the matter budget total
    if (updatedInvoice.kind === "provision") {
        const matterIndex = matters.findIndex((m) => m.id === updatedInvoice.matterId);
        if (matterIndex !== -1) {
            matters[matterIndex] = {
                ...matters[matterIndex],
                budgetTotal: matters[matterIndex].budgetTotal + updatedInvoice.amountHT,
            };
        }
    }

    return updatedInvoice;
};

// Team
export const listTeam = async (): Promise<Collaborator[]> => {
    await delay();
    return [...team];
};

export const createCollaborator = async (payload: Omit<Collaborator, "id" | "matterIds">): Promise<Collaborator> => {
    await delay(300);
    const newCollaborator: Collaborator = {
        ...payload,
        id: `u${Math.random().toString(36).substr(2, 5)}`,
        matterIds: [],
    };
    team = [newCollaborator, ...team];
    return newCollaborator;
};
