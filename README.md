# Mantra: Legal Practice Management SaaS

A modern, full-stack SaaS application for legal practice management. Built with a clean monorepo structure separating frontend and backend concerns.

> [!NOTE]
> **Current State**: Frontend is production-ready with mocked data. Backend is in development and ready for Supabase integration.

---

## 📚 Quick Links

- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Architecture](#-architecture)
- [Development Workflow](#-development-workflow)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🎯 Project Overview

Mantra provides a comprehensive solution for legal practices to:

- **👥 Manage Clients & Matters** — Track legal cases with budgets, status, and timesheets
- **💰 Financial Management** — Generate invoices, track revenue, and manage payments
- **👨‍💼 Team Collaboration** — Assign matters, track billable hours, manage roles
- **⚙️ Firm Administration** — Configure firm settings, invoice templates, payment terms

**Target Users**: Solo practitioners, small law firms, and larger practice groups.

---

## 🛠️ Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Framework** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (Radix UI-based) |
| **Data Fetching** | [TanStack Query v5](https://tanstack.com/query/) |
| **Router** | [React Router v6](https://reactrouter.com/) |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Testing** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |

### Backend
| Layer | Technology |
|-------|-----------|
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Storage** | [Cloudflare R2](https://www.cloudflare.com/en-gb/products/r2/) (S3-compatible) |
| **Edge Functions** | [Supabase Edge Functions](https://supabase.com/docs/guides/functions) (Deno) |
| **Auth** | Supabase Auth |
| **API Client** | TanStack Query + Fetch API |

---

## 📁 Project Structure

```
mantra/
│
├── apps/
│   ├── frontend/                    # React SPA (Vite)
│   │   ├── src/
│   │   │   ├── components/          # UI + feature components
│   │   │   │   ├── boundaries/      # Error & suspense boundaries
│   │   │   │   ├── clients/         # Client management UI
│   │   │   │   ├── dashboard/       # Dashboard widgets
│   │   │   │   ├── finance/         # Financial reporting
│   │   │   │   ├── invoices/        # Invoice generation
│   │   │   │   ├── matters/         # Matter management
│   │   │   │   ├── nav/             # Navigation (sidebar, topbar)
│   │   │   │   ├── settings/        # Settings forms
│   │   │   │   ├── team/            # Team management
│   │   │   │   └── ui/              # shadcn/ui primitives
│   │   │   ├── context/             # React Context (auth, theme)
│   │   │   ├── data/                # API hooks & repository layer
│   │   │   │   ├── repo.ts          # Mock repository (→ future API calls)
│   │   │   │   ├── hooks.ts         # TanStack Query hooks
│   │   │   │   └── query-keys.ts    # Query key definitions
│   │   │   ├── hooks/               # Custom React hooks
│   │   │   ├── layouts/             # App layout (sidebar, header)
│   │   │   ├── lib/                 # Utilities (formatting, constants)
│   │   │   ├── pages/               # Page components (routes)
│   │   │   ├── test/                # Test setup & utilities
│   │   │   ├── types/               # TypeScript definitions
│   │   │   ├── App.tsx              # Root component & router
│   │   │   ├── main.tsx             # Entry point
│   │   │   └── index.css            # Tailwind directives
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── components.json          # shadcn CLI config
│   │
│   └── backend/                     # Node.js / Supabase (FUTURE)
│       ├── src/
│       │   ├── routes/              # API endpoints
│       │   ├── middleware/          # Auth, validation, errors
│       │   ├── services/            # Business logic
│       │   ├── db/                  # Database queries & migrations
│       │   ├── lib/                 # Utilities
│       │   └── index.ts             # Server entry point
│       ├── migrations/              # Database migrations
│       ├── package.json
│       ├── tsconfig.json
│       └── .env.example
│
├── packages/
│   ├── shared-types/                # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── index.ts             # Export all types
│   │   │   └── types/
│   │   │       ├── client.ts
│   │   │       ├── matter.ts
│   │   │       ├── invoice.ts
│   │   │       └── user.ts
│   │   └── package.json
│   │
│   └── api-client/                  # Typed API client (FUTURE)
│       ├── src/
│       │   ├── client.ts            # API client factory
│       │   ├── endpoints/           # Typed API methods
│       │   └── types.ts
│       ├── package.json
│       └── tsconfig.json
│
├── supabase/                        # Supabase configuration
│   ├── functions/                   # Edge functions
│   │   ├── r2-sign-put/             # Generate signed R2 URLs (uploads)
│   │   ├── r2-sign-get/             # Generate signed R2 URLs (downloads)
│   │   └── _shared/                 # Shared utility code
│   ├── migrations/                  # Database migrations (SQL)
│   └── config.toml                  # Supabase config
│
├── docker-compose.yml               # Local dev: frontend + backend
├── .env.example                     # Root environment variables
├── package.json                     # Monorepo root
├── pnpm-workspace.yaml              # Workspace config (if using pnpm)
└── README.md                        # This file
```

### Directory Purpose Overview

| Directory | Purpose |
|-----------|---------|
| `apps/frontend/src/components` | React components - both UI primitives and feature-specific |
| `apps/frontend/src/data` | Data layer: mock repo + TanStack Query hooks |
| `apps/frontend/src/pages` | Route-level page components |
| `apps/frontend/src/lib` | Utilities: formatters, ID generators, mock data, constants |
| `apps/backend/src` | Node.js API server (future implementation) |
| `packages/shared-types` | Shared TS types used by both frontend & backend |
| `supabase/functions` | Serverless functions for file uploads, webhooks |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: ≥18 (check with `node --version`)
- **npm**: ≥9 or **pnpm** ≥8
- **Git**: Latest stable

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mantrasaas/mantra.git
   cd mantra
   ```

2. **Install dependencies**:
   ```bash
   # Using npm
   npm install

   # Or using pnpm (faster)
   pnpm install
   ```

3. **Setup environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

### Running Locally

#### Frontend Only (Current)
```bash
# Development server with HMR (hot reload)
npm run dev

# Opens at http://localhost:8080
```

#### Frontend + Backend (Future)
```bash
# Using docker-compose (requires Docker)
docker-compose up

# OR run separately in different terminals:

# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run dev:backend
```

### Common Tasks

| Task | Command |
|------|---------|
| **Build for production** | `npm run build` |
| **Preview production build** | `npm run preview` |
| **Run tests** | `npm run test` |
| **Watch tests** | `npm run test:watch` |
| **Lint code** | `npm run lint` |
| **Format code** | `npm run format` (if available) |

---

## 🏗️ Architecture

### High-Level Data Flow

```
User Interaction
    ↓
React Component
    ↓
React Hook Form / Controlled Input
    ↓
Custom Hook (useClients, useMutation, etc.)
    ↓
TanStack Query
    ↓
Repository Layer (repo.ts → future: API client)
    ↓
Mock Data / Supabase API
```

### Architectural Patterns

#### 1. **Boundary Pattern** (Page-Level Error & Suspense Handling)

All pages are wrapped with `PageBoundary` for consistent error and loading states:

```tsx
// apps/frontend/src/pages/ClientsPage.tsx
import { PageBoundary } from "@/components/boundaries/page-boundary";

export default function ClientsPage() {
  return (
    <PageBoundary fallback={<TablePageSkeleton />}>
      <ClientsContent />
    </PageBoundary>
  );
}
```

This provides:
- **Suspense integration** — Shows skeleton loaders while queries resolve
- **Error boundary** — Catches and displays API errors with retry button
- **Error reset** — TanStack Query can reset failed queries

#### 2. **Repository Pattern** (Data Access Layer)

All data fetching goes through a repository layer (`apps/frontend/src/data/repo.ts`):

```tsx
// Future: Switch from mock to real API
// Current: In-memory + localStorage
export async function listClients() {
  return store.clients;  // or: await fetch('/api/clients')
}
```

Benefits:
- **Easy to swap** mock data ↔ real API without changing components
- **Centralized logic** for data transformations
- **Testable** — Mock the repo, not external APIs

#### 3. **TanStack Query Pattern** (Server State Management)

Queries and mutations use TanStack Query for:
- **Automatic caching** — No redundant API calls
- **Refetching** — Invalidate stale queries after mutations
- **Retry logic** — Exponential backoff (excludes auth errors)
- **Loading states** — Via `useSuspenseQuery`

Example mutation pattern:

```tsx
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: repo.createClient,
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients });
      queryClient.setQueryData(QUERY_KEYS.client(newClient.id), newClient);
    },
  });
};
```

#### 4. **Form Pattern** (React Hook Form + Zod)

All forms follow this pattern:

```tsx
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { name: "", email: "" },
});
```

This provides:
- **Type-safe** form values
- **Built-in validation** at form level
- **Field-level errors** displayed next to inputs

---

## 🔑 Key Concepts

### Users & Roles

Current roles: `admin`, `lawyer`, `billing`

The mock user is hardcoded as:
- **Name**: Sarah Chen
- **Role**: admin
- **Location**: `apps/frontend/src/data/repo.ts`

Helper functions:
- `isAdminRole(role)` — Check if user is admin
- `normalizeRole(role)` — Maps legacy "master" → "admin"
- `formatUserRole(role)` — Displays role in UI

### Currency & Formatting

All financial values are:
- **Currency**: EUR (€) — Hardcoded in `apps/frontend/src/lib/money.ts`
- **Storage**: As cents (smallest unit) to avoid float precision issues
- **Display**: Formatted with `formatMoney(cents)` → "€1,234.56"

Example:
```tsx
import { formatMoney } from "@/lib/money";

const price = 123456; // 1234.56 EUR
console.log(formatMoney(price)); // "€1,234.56"
```

### ID Generation

Each entity uses a different ID scheme for clarity:

```ts
// apps/frontend/src/lib/id-generators.ts
Clients:        crypto.randomUUID()              // UUID format
Matters:        m${random36}                     // e.g., m7k3zx
Timesheets:     t${random36}                     // e.g., t4k2wx
Invoices:       inv${random36}                   // e.g., inv9m1l
Collaborators:  u${random36}                     // e.g., u5k8pq
```

### Settings & Persistence

**Firm Settings** are persisted to `localStorage`:

```ts
const settings = {
  firmName: "Chen & Associates",
  firmLogo: "https://r2.example.com/logos/...",
  invoicePrefix: "INV",
  defaultVAT: 0.19,
  paymentTermsDays: 30,
};
localStorage.setItem("firm_settings", JSON.stringify(settings));
```

**All other data** (clients, matters, invoices) is in-memory only and resets on page refresh.

### File Uploads (Cloudflare R2)

File uploads use signed URLs via Supabase Edge Functions:

1. **Frontend** → calls `/api/r2-sign-put` (edge function)
2. **Edge function** → verifies auth, returns signed S3-style URL
3. **Frontend** → uploads directly to R2 using signed URL
4. **Frontend** → saves R2 URL in database

Files stored:
- Firm logos
- User avatars
- Invoice PDFs (future)

---

## 📝 Data Models

### Client
```ts
interface Client {
  id: string;                  // UUID
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
```

### Matter
```ts
interface Matter {
  id: string;                  // m${random}
  clientId: string;
  title: string;
  description?: string;
  status: "active" | "pending" | "closed";
  budgetCents: number;         // in cents
  rate: number;                // hourly rate in EUR
  createdAt: Date;
  updatedAt: Date;
}
```

### Invoice
```ts
interface Invoice {
  id: string;                  // inv${random}
  clientId: string;
  matterIds: string[];
  status: "draft" | "sent" | "paid" | "overdue";
  amountCents: number;         // in cents
  issuedAt: Date;
  dueDate: Date;
  paidAt?: Date;
  templateId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Timesheet
```ts
interface Timesheet {
  id: string;                  // t${random}
  matterId: string;
  userId: string;
  date: Date;
  hoursWorked: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Collaborator
```ts
interface Collaborator {
  id: string;                  // u${random}
  email: string;
  name: string;
  role: "admin" | "lawyer" | "billing";
  avatar?: string;             // R2 URL
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🧪 Testing

### Test Setup

Tests use **Vitest** with **jsdom** environment:

```bash
# Run all tests once
npm run test

# Watch mode (re-run on file changes)
npm run test:watch

# Run specific test file
npx vitest run src/components/__tests__/ClientTable.test.tsx
```

### Testing Patterns

**Component Test**:
```tsx
import { render, screen } from "@testing-library/react";
import { ClientTable } from "@/components/clients/ClientTable";
import { QueryClientProvider } from "@tanstack/react-query";

it("renders client table", () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ClientTable clients={mockClients} />
    </QueryClientProvider>
  );
  expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
});
```

**Hook Test**:
```tsx
import { renderHook, waitFor } from "@testing-library/react";
import { useClients } from "@/data/hooks";

it("fetches clients", async () => {
  const { result } = renderHook(() => useClients());

  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

Test utilities are in `apps/frontend/src/test/`:
- `setup.ts` — Vitest configuration
- `mock-data.ts` — Reusable test data

---

## 🔐 Authentication & Authorization

### Current State
- **Auth**: Hardcoded mock user (Sarah Chen, admin)
- **Location**: `apps/frontend/src/context/auth.tsx`
- **Future**: Supabase Auth

### Role-Based Logic

Check user role before rendering:

```tsx
import { isAdminRole } from "@/types";
import { useAuth } from "@/context/auth";

function AdminPanel() {
  const { user } = useAuth();

  if (!isAdminRole(user.role)) {
    return <div>Access Denied</div>;
  }

  return <AdminContent />;
}
```

---

## 📦 Adding Dependencies

### Frontend

```bash
# Add UI component
npx shadcn-ui@latest add button

# Add general dependency
npm install axios
```

**Note**: shadcn components are pre-configured to use:
- **Base color**: Slate
- **Theme**: CSS variables
- **Output**: `apps/frontend/src/components/ui/`

### Backend (When Started)

```bash
cd apps/backend
npm install express dotenv
```

---

## 🚢 Deployment

### Frontend

#### Vercel (Recommended)
```bash
vercel deploy
```

Or connect GitHub repo for automatic deployments on push.

#### Docker
```bash
npm run build
docker build -t mantra-frontend .
docker run -p 3000:8080 mantra-frontend
```

### Backend (Future)

#### Supabase Edge Functions
```bash
supabase functions deploy
```

#### Self-Hosted (Node.js)
```bash
npm run build
npm run start
```

---

## 🤝 Contributing

### Branch Strategy

- `main` — Production branch (protected)
- `develop` — Integration branch
- `feat/` — Feature branches
- `fix/` — Bug fix branches
- `chore/` — Maintenance branches

Example:
```bash
git checkout -b feat/new-feature
# Make changes...
git commit -m "feat: add new feature"
git push origin feat/new-feature
# Create PR to develop
```

### Code Style

- **Formatting**: ESLint (run `npm run lint`)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS utilities
- **Components**: Functional, hooks-based

### Commit Convention

```
feat: add new feature
fix: fix bug
chore: maintenance task
docs: documentation update
test: add/update tests
refactor: code refactoring (no behavior change)
```

---

## 📚 Learning Resources

### Getting Started with Stack
- [React Docs](https://react.dev/) — React fundamentals
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs) — Styling reference
- [React Router](https://reactrouter.com/docs/) — Client-side routing
- [React Hook Form](https://react-hook-form.com/form-builder) — Form patterns
- [TanStack Query](https://tanstack.com/query/latest) — Data fetching

### SaaS Pattern
- [shadcn/ui Components](https://ui.shadcn.com/) — Component library
- [Supabase Docs](https://supabase.com/docs) — Backend-as-a-service

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8080
# macOS/Linux:
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows (PowerShell):
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Node Modules Issue
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Rebuild TS
npx tsc --noEmit
```

---

## 📄 License

MIT License — See LICENSE file for details.

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mantrasaas/mantra/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mantrasaas/mantra/discussions)
- **Email**: support@mantra.local

---

**Last Updated**: March 2026
