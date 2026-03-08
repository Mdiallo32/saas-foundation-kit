# Mantra Architecture Guide

Deep dive into Mantra's architecture, patterns, and design decisions.

---

## Table of Contents

1. [Monorepo Structure](#monorepo-structure)
2. [Data Flow](#data-flow)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Authentication](#authentication)
6. [File Uploads](#file-uploads)
7. [Deployment](#deployment)

---

## Monorepo Structure

Mantra uses a **monorepo** to keep frontend and backend tightly synchronized while maintaining separation of concerns.

```
mantra/
├── apps/
│   ├── frontend/        # React SPA (Vite)
│   └── backend/         # Node.js API (Hono)
├── packages/
│   ├── shared-types/    # TS types used by both
│   └── api-client/      # Typed fetch client (future)
├── supabase/
│   ├── functions/       # Serverless edge functions
│   ├── migrations/      # Database migrations
│   └── config.toml
└── README.md            # This document
```

### Why Monorepo?

✅ **Shared Types** — No version mismatches between frontend and backend types
✅ **Easy Refactoring** — Rename a field across both apps in one PR
✅ **Single Deployment** — Frontend and backend versions are always in sync
✅ **Simpler Development** — One `npm install`, all dependencies ready

### Workspace Management

Currently managed via npm (can upgrade to pnpm/yarn workspaces).

```bash
# Install all dependencies at once
npm install

# Run script in specific workspace
npm run -w apps/frontend dev
npm run -w apps/backend build
```

---

## Data Flow

### User → React Component → API → Database

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User Interaction (Click, Submit Form)                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. React Component                                              │
│    - Renders UI                                                 │
│    - Calls custom hook (useClients, useMutation)               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. TanStack Query Hook (apps/frontend/src/data/hooks.ts)        │
│    - Manages async state (loading, error, data)                │
│    - Caches results                                             │
│    - Handles retry logic                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Repository Layer (apps/frontend/src/data/repo.ts)            │
│    - Currently: Returns mock data                               │
│    - Future: Calls fetch("/api/endpoint")                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Backend API (apps/backend/)                                  │
│    - Validates request                                          │
│    - Executes business logic                                    │
│    - Queries database                                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Database (Supabase/PostgreSQL)                               │
│    - Stores and retrieves data                                  │
│    - Enforces constraints                                       │
│    - Triggers webhooks                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Layer Structure

```
Components (UI)
    ↓
Custom Hooks (useClients, useMutation)
    ↓
TanStack Query (useQuery, useMutation)
    ↓
Repository Pattern (repo.listClients)
    ↓
API / Mock Data
```

### Key Patterns

#### 1. Boundary Pattern (Error & Suspense)

**Location**: `apps/frontend/src/components/boundaries/`

All pages are wrapped with `PageBoundary` for consistent loading/error handling:

```tsx
export function PageBoundary({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ApiErrorBoundary onReset={reset}>
          <Suspense fallback={fallback || <DefaultLoader />}>
            {children}
          </Suspense>
        </ApiErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

**Benefits**:
- **Declarative** — Wrap page and get error/loading UI automatically
- **Recoverable** — Users can retry without page refresh
- **Composable** — Can nest multiple boundaries

#### 2. Repository Pattern (Data Access)

**Location**: `apps/frontend/src/data/repo.ts`

All data fetching goes through repository functions:

```ts
// Mock data (current)
export async function listClients() {
  return store.clients;
}

// Future (real API)
export async function listClients() {
  return fetch("/api/clients").then(r => r.json());
}
```

**Benefits**:
- **Single source of truth** — All API calls in one file
- **Easy to test** — Mock the repository, not Fetch API
- **Easy to migrate** — Swap mock ↔ real API without changing components

#### 3. TanStack Query Pattern

**Location**: `apps/frontend/src/data/hooks.ts`

Queries and mutations wrap repository functions:

```ts
export const useClients = () => {
  return useSuspenseQuery({
    queryKey: QUERY_KEYS.clients,
    queryFn: repo.listClients,
    retry: isRetryable,
    retryDelay: exponentialBackoff,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: repo.createClient,
    onSuccess: (newClient) => {
      // Invalidate stale queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.clients,
      });
      // Optimistically set new client
      queryClient.setQueryData(
        QUERY_KEYS.client(newClient.id),
        newClient
      );
    },
  });
};
```

**Benefits**:
- **Automatic caching** — No redundant API calls
- **Automatic retry** — Exponential backoff, auth errors not retried
- **Optimistic updates** — Update UI before API responds

#### 4. Form Pattern (React Hook Form + Zod)

**Location**: Component files using forms

```tsx
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

type FormData = z.infer<typeof formSchema>;

export function ClientForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "" },
  });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
}
```

**Benefits**:
- **Type-safe** — Form values and errors are typed
- **Validations** — Field-level and form-level validation
- **Error display** — Errors shown next to fields automatically

### Component Organization

```
apps/frontend/src/components/
├── boundaries/          # Error & suspense boundaries
├── clients/             # Client management
├── dashboard/           # Dashboard widgets
├── finance/             # Financial reporting
├── invoices/            # Invoice components
├── matters/             # Matter management
├── nav/                 # Navigation (sidebar, topbar)
├── settings/            # Settings forms
├── team/                # Team management
└── ui/                  # shadcn/ui primitives
```

Each domain (clients, matters, etc.) is self-contained:
- `ClientTable.tsx` — Renders list
- `ClientFormModal.tsx` — Create/edit form
- `ClientDetailCard.tsx` — Detail view

---

## Backend Architecture

### Planned Structure

```
apps/backend/
├── src/
│   ├── routes/          # API endpoints (HTTP handlers)
│   ├── middleware/      # Auth, validation, error handling
│   ├── services/        # Business logic
│   ├── db/              # Database queries & schema
│   └── lib/             # Utilities
└── migrations/          # SQL migrations
```

### Route Structure

```
GET  /api/clients              → list all
GET  /api/clients/:id          → get detail
POST /api/clients              → create
PUT  /api/clients/:id          → update
DELETE /api/clients/:id        → delete
```

Same pattern for `matters`, `invoices`, `timesheets`.

### Middleware Stack

```
Request
  ↓
Logger Middleware (log all requests)
  ↓
Auth Middleware (verify JWT token)
  ↓
Validation Middleware (validate request body)
  ↓
Route Handler
  ↓
Error Handler (catch and format errors)
  ↓
Response
```

### Service Layer

Business logic separated from HTTP handlers:

```ts
// apps/backend/src/services/clientService.ts
export async function createClient(data: CreateClientInput) {
  // Validate
  if (await clientExists(data.email)) {
    throw new ConflictError("Client already exists");
  }

  // Transform
  const client: Client = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Store
  await db.clients.insert(client);

  return client;
}
```

---

## Authentication

### Current (Frontend Only)

Mock user is hardcoded in `apps/frontend/src/context/auth.tsx`:

```tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<User>({
    id: "user-1",
    email: "sarah@chen.local",
    name: "Sarah Chen",
    role: "admin",
  });

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}
```

### Future (With Backend)

1. **Frontend** sends login credentials
2. **Backend** validates, returns JWT token
3. **Frontend** stores token in secure cookie
4. **Frontend** sends token in Authorization header on all requests
5. **Backend** verifies token middleware

```ts
// Middleware
function authMiddleware(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) throw new UnauthorizedError("Missing token");

  const payload = jwt.verify(token, JWT_SECRET);
  req.user = payload;
}
```

---

## File Uploads

### Architecture

```
User selects file
  ↓
Frontend requests signed URL
  ↓
Backend generates signed S3-style URL
  ↓
Frontend uploads directly to Cloudflare R2
  ↓
Frontend saves R2 URL in database
```

### Cloudflare R2 Setup

1. **Create R2 bucket** in Cloudflare dashboard
2. **Generate API tokens** (read/write)
3. **Set environment variables** in `.env`
4. **Create Edge Functions** to sign URLs

### Signed URL Flow

```ts
// Frontend
const response = await fetch("/api/uploads/sign", {
  method: "POST",
  body: JSON.stringify({
    filename: "avatar.jpg",
    contentType: "image/jpeg",
  }),
});
const { signedUrl } = await response.json();

// Upload directly to R2
await fetch(signedUrl, {
  method: "PUT",
  body: file,
  headers: { "Content-Type": "image/jpeg" },
});

// Save URL in database
await updateUserAvatar(currentUserId, signedUrl);
```

**Benefits**:
- **Security** — Backend controls who can upload
- **Bandwidth** — Offload uploads to R2, not your server
- **Flexibility** — Can generate different URLs for different files
- **Scalability** — R2 handles concurrent uploads

---

## Deployment

### Frontend (Vercel)

```
git push → GitHub
  ↓
Vercel detects changes
  ↓
Builds React SPA
  ↓
Deploys to CDN
  ↓
Live at mantra.vercel.app
```

**Benefits**:
- Edge caching
- Automatic HTTPS
- Preview deployments for PRs
- Easy rollback

### Backend (Supabase Edge Functions)

```
supabase functions deploy
  ↓
Deno runtime
  ↓
Deployed globally (Deno Deploy)
  ↓
Database: PostgreSQL (Supabase)
```

**Benefits**:
- No server management
- Auto-scaling
- Global edge locations
- Easy integration with Supabase

### Database (Supabase)

```
Migrations pushed to GitHub
  ↓
Supabase CI/CD
  ↓
Migrations run on production
  ↓
Data persisted
```

---

## Testing Strategy

### Frontend

- **Unit**: Component behavior (Vitest + Testing Library)
- **Integration**: Hook + query behavior
- **E2E**: User workflows (Playwright) — future

```bash
npm run test                 # All tests
npm run test -- --ui        # UI runner
```

### Backend

- **Unit**: Service functions
- **Integration**: Endpoint + database
- **E2E**: Full API workflow

```bash
cd apps/backend
npm run test
```

### Testing Best Practices

1. **Test behavior**, not implementation
2. **Mock external APIs** (Supabase, R2)
3. **Use factories** for test data
4. **Test error cases** — not just happy path
5. **Keep tests DRY** — shared setup functions

---

## Error Handling

### Frontend

1. **Component boundary** catches errors
2. **Shows user-friendly message**
3. **Provides retry button**

```tsx
<ApiErrorBoundary onReset={reset}>
  <Page />
</ApiErrorBoundary>
```

### Backend

1. **Middleware catches errors**
2. **Formats consistent JSON response**
3. **Logs to monitoring service**

```ts
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Client not found",
    "status": 404
  }
}
```

### Error Recovery

| Error | Frontend | Backend |
|-------|----------|---------|
| Network | Retry, queue mutation | Auto-retry |
| Auth (401) | Redirect to login | Reject request |
| Validation (400) | Show field errors | Reject with details |
| Server (500) | Show error, retry | Log, return generic error |

---

## Performance

### Frontend Optimizations

1. **Code splitting** — Routes loaded on-demand
2. **Component memoization** — React.memo for expensive renders
3. **Query caching** — TanStack Query prevents refetches
4. **Image optimization** — Next-gen formats via Vercel

### Backend Optimizations

1. **Database indexes** — Fast queries
2. **Connection pooling** — Reuse DB connections
3. **Caching** — Redis for hot data (future)
4. **Pagination** — Don't load all records

---

## Security

### Frontend

- **CORS** — Only allow requests from own domain
- **HTTPS** — All requests encrypted
- **XSS Prevention** — Sanitize user input
- **CSRF Prevention** — Use SameSite cookies

### Backend

- **Authentication** — JWT tokens
- **Authorization** — Check user can access resource
- **Input validation** — Zod schemas
- **SQL injection** — Use parameterized queries
- **Rate limiting** — Prevent abuse

### Database

- **Row-Level Security (RLS)** — Users can only see own data
- **Encryption at rest** — Supabase encrypts backups
- **Encryption in transit** — HTTPS + TLS

---

## Environment & Configuration

### Development

```bash
# .env.local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=local-key
NODE_ENV=development
```

### Production

```bash
# .env
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-key
NODE_ENV=production
```

---

## Decision Log

### Monorepo (vs Separate Repos)

✅ **Chosen**: Monorepo
✓ Shared types stay in sync
✓ Easier to refactor across apps
✓ Single `npm install`

### React 18 (vs Vue, Svelte)

✅ **Chosen**: React
✓ Large ecosystem
✓ Enterprise-ready
✓ Familiar to most developers

### TanStack Query (vs SWR, Redux)

✅ **Chosen**: TanStack Query
✓ Built for async server state
✓ Automatic caching & retry
✓ Works great with Suspense

### Supabase (vs Firebase, Custom Backend)

✅ **Chosen**: Supabase
✓ Open-source (can self-host)
✓ Native PostgreSQL (complex queries)
✓ Great DX (auto-generated types)
✓ Edge functions for serverless

---

## Future Improvements

- [ ] TypeScript monorepo setup (npm workspaces)
- [ ] Backend API fully implemented
- [ ] E2E tests with Playwright
- [ ] Image optimization pipeline
- [ ] PDF generation (invoices)
- [ ] Email templates (Resend)
- [ ] Analytics (PostHog)
- [ ] Error tracking (Sentry)

---

**Last Updated**: March 2026
