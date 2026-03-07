# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mantra is a Legal Practice Management SaaS application. It is currently in a **mocked state** with all data stored in-memory and persisted to `localStorage` for settings only. This makes it an ideal starting point for backend integration.

## Build Commands

- `npm run dev` - Start Vite development server (port 8080)
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run Vitest tests once
- `npm run test:watch` - Run Vitest in watch mode

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Vite + React 18 (SPA) |
| Language | TypeScript |
| Styling | Tailwind CSS 3.4 |
| UI Components | shadcn/ui (based on Radix UI) |
| Data Fetching | TanStack Query v5 |
| Navigation | React Router DOM v6 |
| Forms | React Hook Form + Zod |
| Testing | Vitest + Testing Library |

## Architecture

### Data Layer

The application uses a **Repository Pattern** for data access:

- `src/data/repo.ts` - Repository functions that simulate an API with in-memory stores and artificial delays
- `src/data/hooks.ts` - TanStack Query hooks wrapping repository functions
- `src/data/query-keys.ts` - Centralized query key definitions

**Key pattern**: All data hooks use `useSuspenseQuery` for automatic loading state handling via page boundaries.

### Component Structure

```
src/
├── components/
│   ├── ui/            # shadcn/ui primitives (Button, Input, Dialog, etc.)
│   ├── boundaries/    # PageBoundary for error/loading states
│   ├── clients/       # Client-specific components
│   ├── dashboard/     # Dashboard widgets
│   ├── finance/       # Finance page components
│   ├── invoices/      # Invoice-related components
│   ├── matters/       # Matter-specific components
│   ├── nav/           # Navigation components
│   ├── settings/      # Settings form components
│   └── team/          # Team management components
├── data/              # Repository and query hooks
├── hooks/             # Custom React hooks
├── layouts/           # AppLayout with sidebar
├── lib/               # Utilities (cn(), formatters, mock data)
├── pages/             # Route components
├── types/             # TypeScript type definitions
└── test/              # Test setup
```

### Page Boundaries

All pages are wrapped in `PageBoundary` from `src/components/boundaries/page-boundary.tsx`, which provides:
- React Suspense integration for loading states
- Error boundary with retry functionality
- Consistent skeleton loaders via `fallback` prop

Example:
```tsx
<Route path="/clients" element={
  <PageBoundary fallback={<TablePageSkeleton />}>
    <ClientsPage />
  </PageBoundary>
} />
```

### Form Pattern

Forms use React Hook Form with Zod validation:

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { name: "" },
});
```

### Mutation Pattern

After mutations, invalidate related queries to trigger refetches:

```tsx
const queryClient = useQueryClient();
return useMutation({
  mutationFn: repo.createClient,
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients });
    queryClient.setQueryData(QUERY_KEYS.client(data.id), data);
  },
});
```

## Role System

Current roles: `admin`, `lawyer`, `billing`

- `src/types/index.ts` - `isAdminRole()` helper
- `src/lib/role.ts` - `normalizeRole()` and `formatUserRole()` for legacy compatibility (maps "master" to "admin")
- Current user is hardcoded in `src/data/repo.ts` as "Sarah Chen" with "admin" role

## Key Conventions

### Import Aliases

- `@/components` - UI components
- `@/components/ui` - shadcn/ui primitives
- `@/lib` - Utilities including `cn()` from `utils.ts`
- `@/hooks` - Custom React hooks
- `@/data` - Repository and query hooks
- `@/types` - TypeScript definitions
- `@/layouts` - Layout components
- `@/pages` - Route pages

### Styling

- Use Tailwind CSS utility classes
- Use `cn()` utility from `@/lib/utils` for conditional class merging
- shadcn/ui components use CSS variables defined in `src/index.css`
- Theme colors use HSL format in CSS variables

### Currency

Hardcoded to **EUR (€)** in `src/lib/money.ts`:
- `formatMoney(cents)` - Formats cents to EUR string
- `formatMoneyRange(min, max)` - Formats a range

### ID Generation

- Clients: `crypto.randomUUID()`
- Matters: `m${Math.random().toString(36).substr(2, 5)}`
- Timesheets: `t${Math.random().toString(36).substr(2, 5)}`
- Invoices: `inv${Math.random().toString(36).substr(2, 5)}`
- Collaborators: `u${Math.random().toString(36).substr(2, 5)}`

## Supabase Edge Functions

Located in `supabase/functions/`:

- `r2-sign-put/` - Generates signed URLs for uploading to Cloudflare R2 (firm logos, avatars, invoice PDFs)
- `r2-sign-get/` - Generates signed URLs for retrieving from R2

Both functions verify user authentication and firm membership before generating signed URLs.

## Testing

Tests use Vitest with jsdom environment:

- `src/test/setup.ts` - Test configuration including `matchMedia` mock
- Run single test: `npx vitest run src/path/to/test.ts`
- Tests use `@testing-library/react` and `@testing-library/jest-dom`

## Mock Data

Mock data is defined in:
- `src/lib/mock-clients.ts` - Client data
- `src/lib/mock-matters.ts` - Matters, timesheets, and invoices
- `src/lib/mock-team.ts` - Collaborators

The repository initializes its in-memory stores from these mock files on load.

## Settings Persistence

Settings (firm info, invoice template) are persisted to `localStorage` under the key `"firm_settings"`. All other data is in-memory only and resets on page refresh.

## Adding New shadcn/ui Components

Use the shadcn CLI (configured in `components.json`):

```bash
npx shadcn add <component-name>
```

Components are installed to `src/components/ui/` with the existing style configuration (slate base, CSS variables enabled).
