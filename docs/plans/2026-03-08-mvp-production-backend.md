# MVP Production Backend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Deploy Mantra MVP to production with full backend integration, database migrations, triggers, and API endpoints replacing mocked data.

**Architecture:**
- Supabase PostgreSQL database with Row-Level Security (RLS)
- Node.js/Hono backend on Supabase Edge Functions + API server
- Triggers for automatic calculations (invoice totals, matter budgets)
- Frontend React app calls real API endpoints instead of repo.ts mocks
- Authentication via Supabase Auth + JWT

**Tech Stack:**
- Backend: Hono.js (lightweight, serverless-ready)
- Database: Supabase PostgreSQL
- ORM: Drizzle ORM (type-safe)
- Auth: Supabase Auth
- Deployment: Supabase (backend) + Vercel (frontend)
- Testing: Vitest + supertest (API testing)

---

## Execution Order & Dependencies

```
Phase 1: Database Setup
  ├─ Task 1: Create Supabase project & tables (migrations)
  ├─ Task 2: Setup Row-Level Security (RLS)
  └─ Task 3: Create database triggers (auto-calculations)

Phase 2: Backend API
  ├─ Task 4: Setup Hono.js server in apps/backend/
  ├─ Task 5: Create middleware (auth, validation, errors)
  ├─ Task 6-10: Create API endpoints (clients, matters, invoices, timesheets, collaborators)
  └─ Task 11: Integration tests for all endpoints

Phase 3: Frontend Integration
  ├─ Task 12: Update repo.ts to call real API
  ├─ Task 13: Update hooks.ts for real API errors
  └─ Task 14: E2E testing (frontend + backend)

Phase 4: Authentication
  ├─ Task 15: Implement Supabase Auth signup/login
  ├─ Task 16: Replace hardcoded user with real auth
  └─ Task 17: Add JWT token refresh

Phase 5: Deployment & Production
  ├─ Task 18: Deploy backend to Supabase Edge Functions
  ├─ Task 19: Deploy frontend to Vercel
  ├─ Task 20: Database migrations to production
  └─ Task 21: E2E testing on production

Critical Path: Tasks 1 → 2 → 3 → 4 → 5 → 6 → 12 → 18 → 19
```

---

## Phase 1: Database Setup

### Task 1: Create Database Schema (Migrations)

**Files:**
- Create: `supabase/migrations/001_create_tables.sql`
- Modify: `supabase/config.toml`
- Create: `docs/DATABASE.md` (schema documentation)

**Step 1: Write migration SQL**

```sql
-- supabase/migrations/001_create_tables.sql

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Firms table
CREATE TABLE IF NOT EXISTS firms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slogan VARCHAR(500),
  address VARCHAR(500),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255) NOT NULL UNIQUE,
  website VARCHAR(255),
  logo_url TEXT,
  tax_id VARCHAR(50),
  invoice_prefix VARCHAR(20) DEFAULT 'INV',
  invoice_footer TEXT,
  default_vat_rate DECIMAL(5,2) DEFAULT 0.19,
  payment_terms_days INT DEFAULT 30,
  currency VARCHAR(3) DEFAULT 'EUR',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Users/Collaborators table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'lawyer', 'billing')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  invited_at TIMESTAMP,
  joined_at TIMESTAMP,
  UNIQUE(firm_id, email)
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  website VARCHAR(255),
  address VARCHAR(500),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(firm_id, email)
);

-- Matters table
CREATE TABLE IF NOT EXISTS matters (
  id VARCHAR(20) PRIMARY KEY,
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'pending', 'closed', 'archived')) DEFAULT 'active',
  budget_cents BIGINT NOT NULL,
  hourly_rate_eur DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP,
  INDEX idx_firm_client (firm_id, client_id),
  INDEX idx_status (status)
);

-- Timesheets table
CREATE TABLE IF NOT EXISTS timesheets (
  id VARCHAR(20) PRIMARY KEY,
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  matter_id VARCHAR(20) NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours_worked DECIMAL(5,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_matter_date (matter_id, date),
  INDEX idx_user_date (user_id, date)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(20) PRIMARY KEY,
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
  total_cents BIGINT NOT NULL,
  tax_cents BIGINT DEFAULT 0,
  issued_at TIMESTAMP NOT NULL,
  due_date TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,
  paid_via_cents BIGINT,
  notes TEXT,
  footer_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_status (status),
  INDEX idx_client_date (client_id, issued_at),
  INDEX idx_due_date (due_date)
);

-- Invoice items (line items in invoice)
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id VARCHAR(20) NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  matter_id VARCHAR(20) REFERENCES matters(id) ON DELETE SET NULL,
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price_eur DECIMAL(10,2) NOT NULL,
  total_eur DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice-matter junction (invoices can span multiple matters)
CREATE TABLE IF NOT EXISTS invoice_matters (
  invoice_id VARCHAR(20) NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  matter_id VARCHAR(20) NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  PRIMARY KEY (invoice_id, matter_id)
);

-- Create indexes
CREATE INDEX idx_firms_created_at ON firms(created_at);
CREATE INDEX idx_users_firm_email ON users(firm_id, email);
CREATE INDEX idx_clients_firm ON clients(firm_id);
CREATE INDEX idx_timesheets_firm ON timesheets(firm_id);
CREATE INDEX idx_invoices_firm ON invoices(firm_id);
```

**Step 2: Apply migration**

```bash
cd apps/backend
# Using Supabase CLI
supabase migration list
supabase migration new create_tables
# Copy SQL into supabase/migrations/timestamp_create_tables.sql
supabase db push
```

Expected output:
```
✓ Migrations completed successfully
```

**Step 3: Verify tables exist**

```bash
supabase db list
```

Expected: All 8 tables visible (firms, users, clients, matters, timesheets, invoices, invoice_items, invoice_matters)

**Step 4: Document schema**

Create `docs/DATABASE.md`:
```markdown
# Database Schema

## Tables

### firms
- `id` (UUID, PK)
- `name`, `email` (unique)
- `invoice_prefix`, `default_vat_rate`, `payment_terms_days`
- `created_by` (FK to auth.users)

### users
- `id` (UUID, PK)
- `firm_id` (FK)
- `auth_user_id` (FK to auth.users, nullable)
- `role` ('admin', 'lawyer', 'billing')
- UNIQUE(firm_id, email)

### clients
- `id` (UUID, PK)
- `firm_id` (FK)
- `email`, `name`
- UNIQUE(firm_id, email)

[... continue for all tables ...]
```

**Step 5: Commit**

```bash
git add supabase/migrations/
git add docs/DATABASE.md
git commit -m "feat: create database schema with migrations"
```

---

### Task 2: Setup Row-Level Security (RLS)

**Files:**
- Create: `supabase/migrations/002_enable_rls.sql`

**Step 1: Write RLS policies**

```sql
-- supabase/migrations/002_enable_rls.sql

-- Enable RLS on all tables
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_matters ENABLE ROW LEVEL SECURITY;

-- Firms: Users can only see their own firm
CREATE POLICY firms_select_own ON firms FOR SELECT
  USING (
    id IN (
      SELECT firm_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users can only see collaborators in their firm
CREATE POLICY users_select_own_firm ON users FOR SELECT
  USING (
    firm_id IN (
      SELECT firm_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Clients: Users can only see clients in their firm
CREATE POLICY clients_select_own_firm ON clients FOR SELECT
  USING (
    firm_id IN (
      SELECT firm_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Matters: Users can only see matters in their firm
CREATE POLICY matters_select_own_firm ON matters FOR SELECT
  USING (
    firm_id IN (
      SELECT firm_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Timesheets: Users can only see timesheets in their firm
CREATE POLICY timesheets_select_own_firm ON timesheets FOR SELECT
  USING (
    firm_id IN (
      SELECT firm_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Invoices: Users can only see invoices in their firm
CREATE POLICY invoices_select_own_firm ON invoices FOR SELECT
  USING (
    firm_id IN (
      SELECT firm_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Allow inserts only for authenticated users in their firm
CREATE POLICY clients_insert_own_firm ON clients FOR INSERT
  WITH CHECK (
    firm_id IN (
      SELECT firm_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY matters_insert_own_firm ON matters FOR INSERT
  WITH CHECK (
    firm_id IN (
      SELECT firm_id FROM users
      WHERE auth_user_id = auth.uid()
    )
  );
```

**Step 2: Apply migration**

```bash
supabase migration new enable_rls
# Copy SQL
supabase db push
```

**Step 3: Test RLS**

```bash
supabase start
# In SQL editor, test that rows are filtered by user
```

**Step 4: Commit**

```bash
git add supabase/migrations/002_enable_rls.sql
git commit -m "feat: enable row-level security on all tables"
```

---

### Task 3: Create Database Triggers

**Files:**
- Create: `supabase/migrations/003_create_triggers.sql`

**Step 1: Write trigger SQL**

```sql
-- supabase/migrations/003_create_triggers.sql

-- Trigger: Update matter budget status when timesheet added
CREATE OR REPLACE FUNCTION update_matter_on_timesheet()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total hours & cost for matter
  UPDATE matters
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.matter_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_timesheet_insert
AFTER INSERT ON timesheets
FOR EACH ROW
EXECUTE FUNCTION update_matter_on_timesheet();

-- Trigger: Calculate invoice total when items added
CREATE OR REPLACE FUNCTION update_invoice_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET
    total_cents = (
      SELECT COALESCE(SUM(CAST(total_eur * 100 AS BIGINT)), 0)
      FROM invoice_items
      WHERE invoice_id = NEW.invoice_id
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.invoice_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoice_item_insert
AFTER INSERT ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_total();

CREATE TRIGGER trg_invoice_item_update
AFTER UPDATE ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_total();

CREATE TRIGGER trg_invoice_item_delete
AFTER DELETE ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_total();

-- Trigger: Update updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_firms_updated ON firms BEFORE UPDATE FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_users_updated ON users BEFORE UPDATE FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_clients_updated ON clients BEFORE UPDATE FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_matters_updated ON matters BEFORE UPDATE FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_invoices_updated ON invoices BEFORE UPDATE FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

**Step 2: Apply migration**

```bash
supabase migration new create_triggers
# Copy SQL
supabase db push
```

**Step 3: Test triggers**

Test via SQL editor that:
- Adding timesheet updates matter.updated_at
- Adding invoice_item updates invoice.total_cents
- Deleting invoice_item recalculates total

**Step 4: Commit**

```bash
git add supabase/migrations/003_create_triggers.sql
git commit -m "feat: create database triggers for auto-calculations"
```

---

## Phase 2: Backend API

### Task 4: Setup Hono.js Server

**Files:**
- Create: `apps/backend/src/index.ts`
- Create: `apps/backend/src/env.ts`
- Modify: `apps/backend/package.json`
- Create: `apps/backend/.env.example`

**Step 1: Install dependencies**

```bash
cd apps/backend
npm install hono @hono/node-server @supabase/supabase-js dotenv zod
npm install -D @types/node tsx vitest
```

**Step 2: Create environment config**

Create `apps/backend/src/env.ts`:
```ts
export const env = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  PORT: parseInt(process.env.PORT || '3001'),
  NODE_ENV: process.env.NODE_ENV || 'development',
};

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  throw new Error('Missing required environment variables');
}
```

**Step 3: Create server entry point**

Create `apps/backend/src/index.ts`:
```ts
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';
import { env } from './env';

const app = new Hono();

// Middleware
app.use(logger());

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes (will add in next tasks)
// app.route('/api/clients', clientRoutes);
// app.route('/api/matters', matterRoutes);
// etc.

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message,
    },
  }, 500);
});

const port = env.PORT;
console.log(`Server running at http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
```

**Step 4: Update package.json scripts**

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest"
  }
}
```

**Step 5: Create .env.example**

```bash
cat > .env.example << 'EOF'
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
JWT_SECRET=your-jwt-secret
PORT=3001
NODE_ENV=development
EOF
```

**Step 6: Test server starts**

```bash
cp .env.example .env.local
# Edit with real Supabase credentials
npm run dev
```

Expected output:
```
Server running at http://localhost:3001
```

Visit `http://localhost:3001/health` → should return `{"status":"ok",...}`

**Step 7: Commit**

```bash
git add apps/backend/src/index.ts apps/backend/src/env.ts
git add apps/backend/package.json apps/backend/.env.example
git commit -m "feat: setup Hono.js server with basic routing"
```

---

### Task 5: Create Middleware Stack

**Files:**
- Create: `apps/backend/src/middleware/auth.ts`
- Create: `apps/backend/src/middleware/validation.ts`
- Create: `apps/backend/src/middleware/errors.ts`
- Create: `apps/backend/src/lib/errors.ts`

**Step 1: Create error definitions**

Create `apps/backend/src/lib/errors.ts`:
```ts
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const errors = {
  UNAUTHORIZED: (msg?: string) =>
    new ApiError('UNAUTHORIZED', msg || 'Unauthorized', 401),
  FORBIDDEN: (msg?: string) =>
    new ApiError('FORBIDDEN', msg || 'Forbidden', 403),
  NOT_FOUND: (msg?: string) =>
    new ApiError('NOT_FOUND', msg || 'Not found', 404),
  CONFLICT: (msg?: string) =>
    new ApiError('CONFLICT', msg || 'Conflict', 409),
  VALIDATION_ERROR: (details?: Record<string, unknown>) =>
    new ApiError('VALIDATION_ERROR', 'Validation failed', 400, details),
  INTERNAL_ERROR: (msg?: string) =>
    new ApiError('INTERNAL_SERVER_ERROR', msg || 'Internal server error', 500),
};
```

**Step 2: Create auth middleware**

Create `apps/backend/src/middleware/auth.ts`:
```ts
import { Context, Next } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { env } from '../env';
import { errors } from '../lib/errors';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw errors.UNAUTHORIZED('Missing authorization header');
  }

  const token = authHeader.slice(7);

  // Verify JWT with Supabase
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const {
    data: { user },
    error,
  } = await supabase.auth.admin.getUserById(token);

  if (error || !user) {
    throw errors.UNAUTHORIZED('Invalid token');
  }

  // Store user in context
  c.set('user', user);

  await next();
}

export function getUser(c: Context) {
  return c.get('user');
}
```

**Step 3: Create validation middleware**

Create `apps/backend/src/middleware/validation.ts`:
```ts
import { Context, Next } from 'hono';
import { ZodSchema } from 'zod';
import { errors } from '../lib/errors';

export function validateBody(schema: ZodSchema) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const result = schema.safeParse(body);

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          const path = err.path.join('.');
          fieldErrors[path] = err.message;
        });
        throw errors.VALIDATION_ERROR(fieldErrors);
      }

      c.set('validated', result.data);
      await next();
    } catch (err) {
      if (err instanceof errors.ApiError) throw err;
      throw errors.VALIDATION_ERROR();
    }
  };
}

export function getValidated<T>(c: Context): T {
  return c.get('validated');
}
```

**Step 4: Create error handler middleware**

Create `apps/backend/src/middleware/errors.ts`:
```ts
import { Context } from 'hono';
import { ApiError } from '../lib/errors';

export function formatError(error: unknown) {
  if (error instanceof ApiError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  console.error('Unhandled error:', error);
  return {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    },
  };
}

export function errorHandler(c: Context, error: unknown) {
  if (error instanceof ApiError) {
    return c.json(formatError(error), error.status);
  }

  return c.json(formatError(error), 500);
}
```

**Step 5: Update index.ts to use middleware**

Modify `apps/backend/src/index.ts`:
```ts
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';
import { env } from './env';
import { errorHandler } from './middleware/errors';
import { authMiddleware } from './middleware/auth';

const app = new Hono();

app.use(logger());

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// Protected routes (use authMiddleware)
const api = new Hono();
api.use(authMiddleware);

// Routes will go here
// api.route('/clients', clientRoutes);

app.route('/api', api);

app.onError(errorHandler);

serve({ fetch: app.fetch, port: env.PORT });
```

**Step 6: Commit**

```bash
git add apps/backend/src/middleware/
git add apps/backend/src/lib/errors.ts
git add apps/backend/src/index.ts
git commit -m "feat: add auth, validation, and error handling middleware"
```

---

### Task 6-10: Create API Endpoints

Due to length, I'll show the pattern for ONE endpoint (Clients). Apply same pattern for Matters, Invoices, Timesheets, Collaborators.

**Task 6: Clients CRUD**

**Files:**
- Create: `apps/backend/src/routes/clients.ts`
- Create: `apps/backend/src/services/clientService.ts`
- Create: `apps/backend/src/routes/clients.test.ts`

**Step 1: Write integration test first (TDD)**

Create `apps/backend/src/routes/clients.test.ts`:
```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { clientRoutes } from './clients';

const app = new Hono().route('/clients', clientRoutes);

describe('Clients API', () => {
  let firmId: string;
  let clientId: string;

  beforeAll(async () => {
    // Setup test data
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create test firm
    const { data: firm } = await supabase
      .from('firms')
      .insert([{ name: 'Test Firm', email: 'test@firm.local' }])
      .select()
      .single();

    firmId = firm.id;
  });

  it('POST /clients - creates new client', async () => {
    const res = await app.request(new Request(new URL('http://localhost/clients'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firmId,
        name: 'Sarah Chen',
        email: 'sarah@example.com',
      }),
    }));

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.data.name).toBe('Sarah Chen');
    clientId = data.data.id;
  });

  it('GET /clients - lists clients', async () => {
    const res = await app.request(
      new Request(new URL(`http://localhost/clients`), { method: 'GET' })
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('GET /clients/:id - gets single client', async () => {
    const res = await app.request(
      new Request(new URL(`http://localhost/clients/${clientId}`), {
        method: 'GET',
      })
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.id).toBe(clientId);
  });

  it('PUT /clients/:id - updates client', async () => {
    const res = await app.request(
      new Request(new URL(`http://localhost/clients/${clientId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Sarah Chen Updated' }),
      })
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.name).toBe('Sarah Chen Updated');
  });

  it('DELETE /clients/:id - deletes client', async () => {
    const res = await app.request(
      new Request(new URL(`http://localhost/clients/${clientId}`), {
        method: 'DELETE',
      })
    );

    expect(res.status).toBe(200);
  });
});
```

**Step 2: Create service layer**

Create `apps/backend/src/services/clientService.ts`:
```ts
import { createClient } from '@supabase/supabase-js';
import { env } from '../env';
import { errors } from '../lib/errors';
import * as z from 'zod';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

export const createClientSchema = z.object({
  firmId: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

export async function createClient(input: CreateClientInput) {
  const { data, error } = await supabase
    .from('clients')
    .insert([input])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      // Unique violation
      throw errors.CONFLICT('Client with this email already exists');
    }
    throw errors.INTERNAL_ERROR(error.message);
  }

  return data;
}

export async function listClients(firmId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('firm_id', firmId)
    .order('created_at', { ascending: false });

  if (error) throw errors.INTERNAL_ERROR(error.message);
  return data;
}

export async function getClient(firmId: string, clientId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('firm_id', firmId)
    .eq('id', clientId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw errors.NOT_FOUND('Client not found');
    }
    throw errors.INTERNAL_ERROR(error.message);
  }

  return data;
}

export async function updateClient(
  firmId: string,
  clientId: string,
  input: Partial<CreateClientInput>
) {
  const { data, error } = await supabase
    .from('clients')
    .update(input)
    .eq('firm_id', firmId)
    .eq('id', clientId)
    .select()
    .single();

  if (error) throw errors.INTERNAL_ERROR(error.message);
  return data;
}

export async function deleteClient(firmId: string, clientId: string) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('firm_id', firmId)
    .eq('id', clientId);

  if (error) throw errors.INTERNAL_ERROR(error.message);
}
```

**Step 3: Create routes**

Create `apps/backend/src/routes/clients.ts`:
```ts
import { Hono } from 'hono';
import { validateBody, getValidated } from '../middleware/validation';
import { getUser } from '../middleware/auth';
import * as clientService from '../services/clientService';
import { errors } from '../lib/errors';

export const clientRoutes = new Hono();

// Get user's firm
async function getFirmId(c: any) {
  const user = getUser(c);
  // In real app, get from users table
  // For now, assume first query param
  const firmId = c.req.query('firmId');
  if (!firmId) throw errors.FORBIDDEN('No firm ID provided');
  return firmId;
}

// POST /api/clients - Create
clientRoutes.post(
  '/',
  validateBody(clientService.createClientSchema),
  async (c) => {
    const data = getValidated<clientService.CreateClientInput>(c);
    const client = await clientService.createClient(data);
    return c.json({ data: client }, 201);
  }
);

// GET /api/clients - List
clientRoutes.get('/', async (c) => {
  const firmId = await getFirmId(c);
  const clients = await clientService.listClients(firmId);
  return c.json({ data: clients });
});

// GET /api/clients/:id - Get one
clientRoutes.get('/:id', async (c) => {
  const firmId = await getFirmId(c);
  const client = await clientService.getClient(firmId, c.req.param('id'));
  return c.json({ data: client });
});

// PUT /api/clients/:id - Update
clientRoutes.put(
  '/:id',
  validateBody(clientService.createClientSchema.partial()),
  async (c) => {
    const firmId = await getFirmId(c);
    const data = getValidated(c);
    const client = await clientService.updateClient(firmId, c.req.param('id'), data);
    return c.json({ data: client });
  }
);

// DELETE /api/clients/:id - Delete
clientRoutes.delete('/:id', async (c) => {
  const firmId = await getFirmId(c);
  await clientService.deleteClient(firmId, c.req.param('id'));
  return c.json({ success: true });
});
```

**Step 4: Register routes in main app**

Modify `apps/backend/src/index.ts`:
```ts
import { clientRoutes } from './routes/clients';

// In protected API section:
api.route('/clients', clientRoutes);
```

**Step 5: Run tests**

```bash
npm run test
```

Expected: All tests pass ✅

**Step 6: Commit**

```bash
git add apps/backend/src/routes/clients.ts
git add apps/backend/src/services/clientService.ts
git add apps/backend/src/routes/clients.test.ts
git commit -m "feat: add clients CRUD endpoints with tests"
```

---

**For Tasks 7-10:** Follow same pattern for:
- Task 7: Matters endpoints
- Task 8: Invoices endpoints
- Task 9: Timesheets endpoints
- Task 10: Collaborators endpoints

(Each ~same structure, ~30 minutes each)

---

### Task 11: Integration Tests

**Files:**
- Create: `apps/backend/src/integration.test.ts`

**Test creating a complete flow:** Firm → Client → Matter → Timesheet → Invoice

---

## Phase 3: Frontend Integration

### Task 12: Update Repository Layer

**Files:**
- Modify: `apps/frontend/src/data/repo.ts`
- Create: `apps/frontend/src/lib/api-client.ts`

**Step 1: Create API client**

Create `apps/frontend/src/lib/api-client.ts`:
```ts
import { AuthResponse } from '@mantra/shared-types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let authToken: string | null = localStorage.getItem('auth_token');

export function setAuthToken(token: string) {
  authToken = token;
  localStorage.setItem('auth_token', token);
}

export function getAuthToken() {
  return authToken;
}

export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API Error');
  }

  const data = await response.json();
  return data.data;
}

export const api = {
  // Clients
  listClients: (firmId: string) =>
    apiCall(`/api/clients?firmId=${firmId}`),
  getClient: (firmId: string, id: string) =>
    apiCall(`/api/clients/${id}?firmId=${firmId}`),
  createClient: (data: any) =>
    apiCall('/api/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (firmId: string, id: string, data: any) =>
    apiCall(`/api/clients/${id}?firmId=${firmId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteClient: (firmId: string, id: string) =>
    apiCall(`/api/clients/${id}?firmId=${firmId}`, { method: 'DELETE' }),

  // Add same for matters, invoices, timesheets, collaborators
};
```

**Step 2: Update repo.ts to use real API**

Modify `apps/frontend/src/data/repo.ts` first 50 lines:
```ts
import { api } from '@/lib/api-client';
import { Client, Matter, Invoice, Timesheet, Collaborator } from '@mantra/shared-types';

// Mock current user (will be replaced with real auth in Task 15)
const CURRENT_USER_ID = 'user-1';
const CURRENT_FIRM_ID = 'firm-1';

export async function listClients(): Promise<Client[]> {
  try {
    return await api.listClients(CURRENT_FIRM_ID);
  } catch (error) {
    console.error('Failed to list clients:', error);
    throw error;
  }
}

export async function getClient(id: string): Promise<Client> {
  return api.getClient(CURRENT_FIRM_ID, id);
}

export async function createClient(input: any): Promise<Client> {
  return api.createClient({ ...input, firmId: CURRENT_FIRM_ID });
}

// Continue for all other functions...
```

**Step 3: Commit**

```bash
git add apps/frontend/src/lib/api-client.ts
git add apps/frontend/src/data/repo.ts
git commit -m "feat: update repository to call real backend API"
```

---

### Task 13: Update Error Handling

**Files:**
- Modify: `apps/frontend/src/data/hooks.ts`
- Modify: `apps/frontend/src/components/boundaries/api-error-boundary.tsx`

Update retry logic to handle real API errors (401, 403, network, etc.)

---

### Task 14: E2E Testing (Frontend + Backend)

Write tests that:
1. Create client via API
2. List clients in UI
3. Update client
4. Delete client

---

## Phase 4: Authentication

### Task 15-17: Supabase Auth Integration

(Implement signup/login with Supabase Auth)

---

## Phase 5: Deployment & Production

### Task 18-21: Deploy to Production

---

## Critical Success Criteria

- ✅ All API endpoints working locally
- ✅ Database triggers calculating correctly
- ✅ Frontend calling real API (not mocks)
- ✅ Authentication working
- ✅ RLS policies enforcing data isolation
- ✅ E2E tests passing on production
- ✅ No console errors in production

---

## Rollback Plan

If issues in production:
1. Revert frontend to use mocks (fast rollback)
2. Backend stays on staging
3. Fix issues
4. Re-deploy

---

**Total estimated time: 3-4 weeks**

Next steps: Choose execution model (subagent-driven vs parallel session)
