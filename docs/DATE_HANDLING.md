# Date Handling Standardization

This document describes how dates are handled consistently across the Mantra application.

## Overview

The application now standardizes date handling by:
1. **Accepting both Date objects and ISO 8601 strings** in TypeScript interfaces (for backward compatibility)
2. **Parsing strings to Date objects** in data mappers (repository layer)
3. **Using date-fns for formatting** in React components

## Type Definitions

All date-related fields in interfaces now accept `Date | string`:

```typescript
// Before
createdAt: string;

// After
createdAt: Date | string;
```

This applies to:
- `Client.createdAt`
- `Timesheet.date`
- `Invoice.issuedAt`
- `Invoice.dueDate`
- `Invoice.paidAt`
- `Invoice.archivedAt`
- `ActivityItem.time`

## Date Parsing

The `src/lib/date.ts` module provides utilities for consistent date handling:

### parseDate(value)
Converts a date string or Date object to a Date instance.

```typescript
import { parseDate } from "@/lib/date";

const dateStr = "2025-01-15T10:30:00Z";
const date = parseDate(dateStr); // Returns Date object
const nullDate = parseDate(null); // Returns null
```

### ensureDate(value)
Like `parseDate`, but throws an error if the value is falsy.

```typescript
import { ensureDate } from "@/lib/date";

const date = ensureDate("2025-01-15"); // Returns Date
const date2 = ensureDate(null); // Throws Error
```

### dateToISOString(date)
Converts a Date to ISO string (YYYY-MM-DD format).

```typescript
import { dateToISOString } from "@/lib/date";

const isoStr = dateToISOString(new Date()); // "2025-01-15"
const isoStr2 = dateToISOString("2025-01-15T10:30:00Z"); // "2025-01-15"
```

### Utility Functions

```typescript
import { daysBetween, isInPast, isInFuture, isToday } from "@/lib/date";

// Calculate days between two dates
const days = daysBetween("2025-01-01", "2025-01-15"); // 14

// Check if date is in the past/future
const past = isInPast("2025-01-01"); // true
const future = isInFuture("2025-12-31"); // true
const today = isToday("2025-01-15"); // true/false depending on current date
```

## Component Usage

Use **date-fns** for formatting dates in components:

```typescript
import { format } from "date-fns";
import { parseDate } from "@/lib/date";

function InvoiceRow({ invoice }) {
  const issuedDate = parseDate(invoice.issuedAt);

  return (
    <div>
      {/* Format date for display */}
      <p>Issued: {issuedDate ? format(issuedDate, "dd MMM yyyy") : "N/A"}</p>

      {/* Or use date-fns directly with the date */}
      <p>Due: {format(parseDate(invoice.dueDate), "dd MMM yyyy")}</p>
    </div>
  );
}
```

## Data Mapper Usage

In `src/data/repo.ts`, mappers now parse strings to Date objects:

```typescript
const mapInvoice = (row: Record<string, unknown>): Invoice => ({
  id: row.id as string,
  // ...
  issuedAt: parseDate(row.issued_at as string) ?? new Date(),
  dueDate: (row.due_date as string | null) ? parseDate(row.due_date as string) : undefined,
  paidAt: (row.paid_at as string | null) ? parseDate(row.paid_at as string) : null,
});
```

## Migration Guide

### For Existing Components

If you have code that expects strings:

**Before:**
```typescript
// This worked when dates were strings
const dateStr = invoice.issuedAt; // Was a string
const parts = dateStr.split("T");
```

**After:**
```typescript
// Now dates are parsed to Date objects
import { format } from "date-fns";

const dateStr = format(invoice.issuedAt, "yyyy-MM-dd");
// Or keep the original approach with parseDate:
const dateParsed = parseDate(invoice.issuedAt);
const dateStr = dateToISOString(dateParsed);
```

### For API Responses

The mappers in `repo.ts` handle the conversion from Supabase strings to Date objects automatically:

```typescript
// Supabase returns: { created_at: "2025-01-15T10:30:00Z" }
// Mapper converts to: { createdAt: Date(2025-01-15T10:30:00Z) }
```

## Benefits

1. **Type Safety**: Consistent types across the application
2. **Backward Compatibility**: Accepts both Date and string inputs
3. **Easier Comparisons**: Can compare Date objects directly
4. **Better Formatting**: Use date-fns methods instead of string manipulation
5. **Reduced Bugs**: No more string parsing inconsistencies

## Examples

### Invoice Due Date Check

```typescript
import { isInPast } from "@/lib/date";

function InvoiceStatus({ invoice }) {
  const isOverdue = isInPast(invoice.dueDate);

  return <div className={isOverdue ? "text-red-600" : "text-green-600"}>
    {isOverdue ? "Overdue" : "On Time"}
  </div>;
}
```

### Calculate Invoice Age

```typescript
import { daysBetween } from "@/lib/date";

function InvoiceAge({ invoice }) {
  const days = daysBetween(invoice.issuedAt);

  return <p>Issued {days} days ago</p>;
}
```

### Format Dates in Lists

```typescript
import { format } from "date-fns";
import { parseDate } from "@/lib/date";

function ClientTable({ clients }) {
  return (
    <table>
      {clients.map(client => (
        <tr key={client.id}>
          <td>{client.name}</td>
          <td>{format(parseDate(client.createdAt) || new Date(), "dd MMM yyyy")}</td>
        </tr>
      ))}
    </table>
  );
}
```

## Testing

When writing tests, create Date objects or use ISO strings:

```typescript
const mockClient = {
  id: "1",
  name: "Test Client",
  createdAt: new Date("2025-01-15"), // Use Date object
  // or
  createdAt: "2025-01-15T10:30:00Z", // Use ISO string
};
```
