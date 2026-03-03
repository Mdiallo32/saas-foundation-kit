import { Matter, Timesheet, Invoice } from "@/types";

export const mockMatters: Matter[] = [
  { id: "m1", title: "Smith v. Acme Corp", clientId: "1", budgetTotal: 25000, budgetUsed: 18200, hourlyRate: 350, status: "in-progress" },
  { id: "m2", title: "Meridian IP Licensing", clientId: "1", budgetTotal: 12000, budgetUsed: 3400, hourlyRate: 275, status: "open" },
  { id: "m3", title: "Greenfield Series B Advisory", clientId: "2", budgetTotal: 40000, budgetUsed: 40000, hourlyRate: 400, status: "closed" },
  { id: "m4", title: "Greenfield Employment Dispute", clientId: "2", budgetTotal: 15000, budgetUsed: 9800, hourlyRate: 300, status: "pending" },
  { id: "m5", title: "Lakeshore Real Estate Acquisition", clientId: "3", budgetTotal: 60000, budgetUsed: 22000, hourlyRate: 450, status: "in-progress" },
  { id: "m6", title: "Rivera Estate Planning", clientId: "4", budgetTotal: 8000, budgetUsed: 1500, hourlyRate: 250, status: "open" },
  { id: "m7", title: "Acme Trademark Filing", clientId: "5", budgetTotal: 5000, budgetUsed: 4900, hourlyRate: 200, status: "pending" },
];

export const mockTimesheets: Timesheet[] = [
  { id: "t1", matterId: "m1", description: "Initial case review & strategy", hours: 8, rate: 350, date: "2026-02-20", user: "Sarah Chen" },
  { id: "t2", matterId: "m1", description: "Witness deposition prep", hours: 12, rate: 350, date: "2026-02-18", user: "James Okafor" },
  { id: "t3", matterId: "m1", description: "Court filing & documentation", hours: 4.5, rate: 350, date: "2026-02-15", user: "Sarah Chen" },
  { id: "t4", matterId: "m1", description: "Discovery document review", hours: 16, rate: 350, date: "2026-02-10", user: "Emily Tran" },
  { id: "t5", matterId: "m2", description: "IP portfolio analysis", hours: 6, rate: 275, date: "2026-02-22", user: "David Kimura" },
  { id: "t6", matterId: "m4", description: "Employee interviews", hours: 10, rate: 300, date: "2026-02-19", user: "James Okafor" },
  { id: "t7", matterId: "m5", description: "Due diligence review", hours: 20, rate: 450, date: "2026-02-21", user: "Sarah Chen" },
  { id: "t8", matterId: "m7", description: "Trademark search & filing", hours: 14, rate: 200, date: "2026-02-17", user: "Emily Tran" },
];

export const mockInvoices: Invoice[] = [
  { id: "inv1", matterId: "m1", reference: "INV-2026-0401", amountHT: 8400, vatRate: 0.21, status: "paid", paidAt: "2026-02-10", issuedAt: "2026-02-01", kind: "provision" },
  { id: "inv2", matterId: "m1", reference: "INV-2026-0412", amountHT: 5600, vatRate: 0.21, status: "sent", issuedAt: "2026-02-15", dueDate: "2026-03-15", kind: "provision" },
  { id: "inv3", matterId: "m3", reference: "INV-2026-0320", amountHT: 40000, vatRate: 0.21, status: "paid", paidAt: "2026-01-25", issuedAt: "2026-01-20", kind: "provision" },
  { id: "inv4", matterId: "m4", reference: "INV-2026-0405", amountHT: 6000, vatRate: 0.21, status: "sent", issuedAt: "2026-02-10", dueDate: "2026-02-25", kind: "provision" }, // Overdue (Unpaid)
  { id: "inv5", matterId: "m5", reference: "INV-2026-0418", amountHT: 9000, vatRate: 0.21, status: "paid", paidAt: "2026-02-12", issuedAt: "2026-02-05", kind: "provision" },
  { id: "inv6", matterId: "m7", reference: "INV-2026-0422", amountHT: 2800, vatRate: 0.21, status: "sent", issuedAt: "2026-02-20", dueDate: "2026-03-20", kind: "provision" },
];
