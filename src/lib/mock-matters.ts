export interface Matter {
  id: string;
  title: string;
  clientId: string;
  budgetTotal: number;
  budgetUsed: number;
  status: "open" | "in-progress" | "pending" | "closed";
}

export const mockMatters: Matter[] = [
  { id: "m1", title: "Smith v. Acme Corp", clientId: "1", budgetTotal: 25000, budgetUsed: 18200, status: "in-progress" },
  { id: "m2", title: "Meridian IP Licensing", clientId: "1", budgetTotal: 12000, budgetUsed: 3400, status: "open" },
  { id: "m3", title: "Greenfield Series B Advisory", clientId: "2", budgetTotal: 40000, budgetUsed: 40000, status: "closed" },
  { id: "m4", title: "Greenfield Employment Dispute", clientId: "2", budgetTotal: 15000, budgetUsed: 9800, status: "pending" },
  { id: "m5", title: "Lakeshore Real Estate Acquisition", clientId: "3", budgetTotal: 60000, budgetUsed: 22000, status: "in-progress" },
  { id: "m6", title: "Rivera Estate Planning", clientId: "4", budgetTotal: 8000, budgetUsed: 1500, status: "open" },
  { id: "m7", title: "Acme Trademark Filing", clientId: "5", budgetTotal: 5000, budgetUsed: 4900, status: "pending" },
];
