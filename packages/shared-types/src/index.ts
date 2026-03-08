/**
 * Shared types for Mantra Frontend & Backend
 *
 * This package contains all TypeScript types used by both the frontend (React)
 * and backend (Node.js) to ensure type safety across the API boundary.
 *
 * Import using:
 * - Frontend: import { Client } from "@/types";
 * - Backend: import { Client } from "@mantra/shared-types";
 */

// ============================================================================
// User & Auth
// ============================================================================

export type Role = "admin" | "lawyer" | "billing";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string; // R2 URL
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// ============================================================================
// Clients
// ============================================================================

export interface Client {
  id: string; // UUID
  firmId: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateClientInput = Omit<
  Client,
  "id" | "firmId" | "createdAt" | "updatedAt"
>;

export type UpdateClientInput = Partial<CreateClientInput>;

// ============================================================================
// Matters (Legal Cases)
// ============================================================================

export type MatterStatus = "active" | "pending" | "closed" | "archived";

export interface Matter {
  id: string; // m${random}
  firmId: string;
  clientId: string;
  title: string;
  description?: string;
  status: MatterStatus;
  budgetCents: number; // Stored as cents to avoid float precision
  hourlyRateEUR: number; // EUR per hour
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

export type CreateMatterInput = Omit<
  Matter,
  "id" | "firmId" | "createdAt" | "updatedAt" | "closedAt"
>;

export type UpdateMatterInput = Partial<CreateMatterInput>;

// ============================================================================
// Timesheets
// ============================================================================

export interface Timesheet {
  id: string; // t${random}
  firmId: string;
  matterId: string;
  userId: string;
  date: Date;
  hoursWorked: number; // e.g., 8.5
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateTimesheetInput = Omit<
  Timesheet,
  "id" | "firmId" | "createdAt" | "updatedAt"
>;

export type UpdateTimesheetInput = Partial<CreateTimesheetInput>;

// ============================================================================
// Invoices
// ============================================================================

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceEUR: number; // EUR per unit
  totalEUR: number; // quantity × unitPrice (cached for performance)
}

export interface Invoice {
  id: string; // inv${random}
  firmId: string;
  clientId: string;
  matterIds: string[]; // Can span multiple matters
  status: InvoiceStatus;
  items: InvoiceItem[];
  totalCents: number; // Sum of all items (stored as cents)
  taxCents: number; // VAT amount
  issuedAt: Date;
  dueDate: Date;
  paidAt?: Date;
  paidViaCents?: number; // Amount paid (might differ from total)
  notes?: string;
  footerText?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateInvoiceInput = Omit<
  Invoice,
  "id" | "firmId" | "createdAt" | "updatedAt" | "paidAt" | "paidViaCents"
>;

export type UpdateInvoiceInput = Partial<CreateInvoiceInput>;

// ============================================================================
// Collaborators / Team Members
// ============================================================================

export interface Collaborator {
  id: string; // u${random}
  firmId: string;
  userId?: string; // References User.id if they've signed up
  email: string;
  name: string;
  role: Role;
  avatar?: string; // R2 URL
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  invitedAt?: Date;
  joinedAt?: Date;
}

export type CreateCollaboratorInput = Omit<
  Collaborator,
  "id" | "firmId" | "userId" | "createdAt" | "updatedAt" | "joinedAt"
>;

export type UpdateCollaboratorInput = Partial<CreateCollaboratorInput>;

// ============================================================================
// Firm Settings
// ============================================================================

export interface FirmSettings {
  id: string;
  userId: string; // Admin user who created firm
  firmName: string;
  firmSlogan?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email: string;
  website?: string;
  logo?: string; // R2 URL
  taxId?: string; // VAT number, etc.
  // Invoice settings
  invoicePrefix: string; // e.g., "INV-"
  invoiceFooter?: string;
  defaultVATRate: number; // e.g., 0.19 for 19%
  paymentTermsDays: number; // e.g., 30
  currency: "EUR" | "USD" | "GBP"; // Future: make configurable
  // Preferences
  createdAt: Date;
  updatedAt: Date;
}

export type CreateFirmSettingsInput = Omit<
  FirmSettings,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateFirmSettingsInput = Partial<CreateFirmSettingsInput>;

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiError {
  code: string; // e.g., "NOT_FOUND", "UNAUTHORIZED"
  message: string;
  details?: Record<string, unknown>;
  status: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: null;
}

export interface ApiErrorResponse {
  error: ApiError;
  data?: null;
}

// ============================================================================
// Pagination
// ============================================================================

export interface PaginationParams {
  page: number; // 1-indexed
  limit: number; // Items per page
  sort?: string; // e.g., "name:asc"
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================================================
// Utilities & Helpers
// ============================================================================

/**
 * Check if role is admin
 */
export function isAdminRole(role: Role): boolean {
  return role === "admin";
}

/**
 * Format role for display
 */
export function formatRole(role: Role): string {
  const roleMap: Record<Role, string> = {
    admin: "Administrator",
    lawyer: "Lawyer",
    billing: "Billing Manager",
  };
  return roleMap[role];
}

/**
 * Get role permissions
 */
export function getRolePermissions(role: Role): string[] {
  const permissionMap: Record<Role, string[]> = {
    admin: [
      "read:all",
      "create:all",
      "update:all",
      "delete:all",
      "manage:team",
      "manage:settings",
    ],
    lawyer: ["read:own", "create:timesheets", "read:matters", "read:invoices"],
    billing: [
      "read:invoices",
      "create:invoices",
      "update:invoices",
      "read:clients",
      "read:matters",
    ],
  };
  return permissionMap[role];
}
