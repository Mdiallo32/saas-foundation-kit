# Mantra Backend

Backend API server for Mantra legal practice management SaaS.

## Status

🚧 **In Development** — Currently in planning phase. Frontend is using mocked data.

---

## Architecture

### Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Hono.js (lightweight, Serverless-ready)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Auth**: Supabase Auth (JWT)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Testing**: Vitest

### Design Patterns
- **Repository Pattern** — Data access layer abstraction
- **Middleware** — Auth, validation, error handling
- **Type Safety** — Shared types from `packages/shared-types`

---

## Project Structure

```
apps/backend/
├── src/
│   ├── index.ts              # Server entry point
│   ├── routes/               # API endpoint handlers
│   │   ├── clients.ts        # GET/POST/PUT/DELETE /clients
│   │   ├── matters.ts        # Matter CRUD
│   │   ├── invoices.ts       # Invoice CRUD
│   │   ├── timesheets.ts     # Timesheet CRUD
│   │   └── auth.ts           # Login, signup, logout
│   ├── middleware/
│   │   ├── auth.ts           # JWT verification
│   │   ├── errorHandler.ts   # Global error handling
│   │   └── validation.ts     # Request body validation
│   ├── services/             # Business logic
│   │   ├── clientService.ts  # Client operations
│   │   ├── mattService.ts    # Matter operations
│   │   └── invoiceService.ts # Invoice generation
│   ├── db/
│   │   ├── schema.ts         # Drizzle schema
│   │   ├── client.ts         # Supabase client
│   │   └── migrations/       # SQL migrations
│   ├── lib/
│   │   ├── logger.ts         # Logging
│   │   ├── errors.ts         # Error definitions
│   │   └── utils.ts          # Helpers
│   └── types/                # Local TS types (extend shared-types)
├── migrations/               # SQL migrations directory
├── tests/                    # Test files
├── package.json
├── tsconfig.json
├── .env.example
└── README.md (this file)
```

---

## Getting Started

### Prerequisites
- Node.js ≥18
- npm or pnpm
- Supabase account + credentials

### Installation

```bash
cd apps/backend
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
```

### Environment Variables

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=mantra-files

# Server
PORT=3001
NODE_ENV=development
```

---

## Running

### Development
```bash
npm run dev
# Starts on http://localhost:3001
```

### Build
```bash
npm run build
```

### Start (Production)
```bash
npm start
```

### Tests
```bash
# Run once
npm run test

# Watch mode
npm run test:watch
```

---

## API Overview

### Authentication
```
POST /auth/login          # { email, password }
POST /auth/signup         # { email, password, name }
POST /auth/logout         # {}
GET  /auth/me             # Current user
```

### Clients
```
GET    /api/clients              # List all clients
GET    /api/clients/:id          # Get client detail
POST   /api/clients              # Create client
PUT    /api/clients/:id          # Update client
DELETE /api/clients/:id          # Delete client
```

### Matters
```
GET    /api/matters              # List matters
GET    /api/matters/:id          # Matter detail with financials
POST   /api/matters              # Create matter
PUT    /api/matters/:id          # Update matter
DELETE /api/matters/:id          # Delete matter
```

### Invoices
```
GET    /api/invoices             # List invoices
GET    /api/invoices/:id         # Invoice detail + PDF
POST   /api/invoices             # Create invoice
PUT    /api/invoices/:id         # Update status
DELETE /api/invoices/:id         # Delete invoice
POST   /api/invoices/:id/send    # Send invoice (email)
```

### Timesheets
```
GET    /api/timesheets          # List all
GET    /api/timesheets?matterId=X   # Filter by matter
POST   /api/timesheets         # Create timesheet
PUT    /api/timesheets/:id     # Update
DELETE /api/timesheets/:id     # Delete
```

---

## Database Schema

See `apps/backend/src/db/schema.ts` for Drizzle ORM definitions.

### Tables
- `users` — Firm collaborators
- `clients` — Firm clients
- `matters` — Legal matters/cases
- `timesheets` — Billable hours
- `invoices` — Generated invoices
- `invoice_items` — Line items in invoices
- `firm_settings` — Configuration

---

## Migrations

Run migrations:
```bash
# One-time setup
npm run migrate

# See migration status
npm run migrate:status
```

Create new migration:
```bash
npm run migrate:create -- create_clients_table
```

---

## Error Handling

All errors return consistent format:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Field 'email' is required",
    "details": {}
  }
}
```

Error codes:
- `UNAUTHORIZED` — Missing/invalid auth token
- `FORBIDDEN` — User lacks permission
- `NOT_FOUND` — Resource doesn't exist
- `INVALID_REQUEST` — Bad request body
- `CONFLICT` — Resource already exists
- `INTERNAL_SERVER_ERROR` — Server error

---

## File Uploads

Upload flow:
1. Frontend requests signed URL: `POST /api/uploads/sign`
2. Backend returns S3-style signed URL
3. Frontend uploads directly to R2
4. Frontend saves URL in database

```ts
// Frontend code
const { signedUrl } = await fetch("/api/uploads/sign", {
  method: "POST",
  body: JSON.stringify({ filename, contentType }),
}).then(r => r.json());

// Upload to R2
await fetch(signedUrl, {
  method: "PUT",
  body: file,
  headers: { "Content-Type": file.type },
});
```

---

## Testing

Tests use Vitest + testing utilities:

```bash
# Run all
npm run test

# Watch
npm run test:watch

# Single file
npx vitest run src/routes/__tests__/clients.test.ts
```

Example test:

```ts
import { describe, it, expect } from "vitest";
import { createTestClient } from "@/test/utils";

describe("Clients API", () => {
  it("lists clients", async () => {
    const client = createTestClient();
    const res = await client.get("/api/clients");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
```

---

## Deployment

### Supabase Edge Functions
Deploy handlers as serverless functions:

```bash
supabase functions deploy
```

### Self-Hosted (Docker)
```bash
docker build -t mantra-backend .
docker run -p 3001:3001 --env-file .env mantra-backend
```

### Fly.io
```bash
fly deploy
```

---

## Troubleshooting

### Connection Issues
```bash
# Test Supabase connection
npm run test:db
```

### Type Errors
```bash
# Regenerate types from Supabase
npm run types:generate
```

---

## Related Documentation

- [Frontend README](../../apps/frontend/README.md)
- [Shared Types](../../packages/shared-types/README.md)
- [Supabase Docs](https://supabase.com/docs)

---

**Status**: 🚧 In Development
