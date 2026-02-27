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

export const mockClients: Client[] = [
  { id: "1", name: "Meridian Holdings Ltd", email: "legal@meridian.com", phone: "+44 20 7946 0958", address: "12 King's Road, London EC2V 8AB", type: "company", vatNumber: "GB123456789", createdAt: "2026-01-15" },
  { id: "2", name: "Greenfield Ventures", email: "info@greenfield.co", phone: "+44 20 7123 4567", address: "8 Victoria Street, Manchester M1 2EQ", type: "company", vatNumber: "GB987654321", createdAt: "2026-02-01" },
  { id: "3", name: "John Lakeshore", email: "john@lakeshore.io", phone: "+1 212 555 0147", address: "350 Fifth Avenue, New York, NY 10118", type: "physical", nationalNumber: "90.01.15-123.45", createdAt: "2025-11-20" },
  { id: "4", name: "Rivera Estate Group", email: "office@riveraestate.com", phone: "+34 91 555 1234", address: "Calle Mayor 10, Madrid 28013", type: "company", vatNumber: "ES12345678A", createdAt: "2025-12-08" },
  { id: "5", name: "Marie Dupont", email: "marie.dupont@email.com", phone: "+32 2 555 0198", address: "Rue de la Loi 42, 1000 Brussels", type: "physical", nationalNumber: "85.07.22-456.78", createdAt: "2026-02-10" },
];
