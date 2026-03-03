import { Invoice } from "@/types";

/**
 * Derived UI label for invoice status based on standardized logic.
 * Requirements:
 * - Persisted status values: draft | sent | paid
 * - Derived UI label "Unpaid" when: status === "sent" AND today > due_date AND paid_at is null
 */
export function getInvoiceDisplayStatus(invoice: Pick<Invoice, "status" | "dueDate" | "paidAt">) {
    if (invoice.status === "paid" || !!invoice.paidAt) return "Paid";
    if (invoice.status === "draft") return "Draft";

    // Check for "Unpaid" (derived from sent + overdue)
    if (invoice.status === "sent" && invoice.dueDate) {
        const today = new Date().toISOString().split("T")[0];
        if (today > invoice.dueDate && !invoice.paidAt) {
            return "Unpaid";
        }
    }

    // Fallback to persisting status label
    return invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1);
}
