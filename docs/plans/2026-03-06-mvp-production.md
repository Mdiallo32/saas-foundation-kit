# Mantra MVP — Production Readiness Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the fully-mocked Mantra Legal SaaS into a production-ready MVP backed by Supabase (auth + database + RLS) with Vercel deployment.

**Architecture:** Supabase handles auth, PostgreSQL DB, and Row-Level Security for multi-tenancy. The existing Repository Pattern in `repo.ts` gets replaced with Supabase client calls. Frontend deploys to Vercel.

**Tech Stack:** React 18 + Vite + TypeScript + Supabase (auth/db) + Cloudflare R2 (files) + Vercel (hosting)

---

## AUDIT SUMMARY

### What exists ✅
- Full UI with all pages (dashboard, clients, matters, invoices, timesheets, team, settings)
- Repository pattern (`src/data/repo.ts`) — easy to swap for real DB
- TanStack Query hooks (`src/data/hooks.ts`) — no changes needed
- RBAC types (`admin` | `lawyer` | `billing`) — defined, not enforced
- Supabase edge functions for R2 signed URLs (put/get) — need wiring to UI
- EUR currency, Zod forms, shadcn/ui — production-ready

### What's missing ❌
- **Auth** — hardcoded "Sarah Chen" as admin
- **Database** — all data in-memory, resets on refresh
- **Multi-tenancy** — no firm isolation
- **RLS policies** — no data security
- **File upload UI** — R2 functions exist but not wired
- **PDF generation** — invoices have no PDF export
- **Env configuration** — no Supabase keys wired
- **Deployment** — not configured

---

## PHASE 1 — Supabase Setup + Database Schema

### Task 1: Install Supabase client

**Files:**
- Run: install command
- Create: `src/lib/supabase.ts`
- Modify: `.env.example`

**Step 1: Install dependency**
```bash
npm install @supabase/supabase-js
```

**Step 2: Create Supabase client**

Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Step 3: Update `.env.example`**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
```

**Step 4: Create `.env.local` with real values from Supabase dashboard**

**Step 5: Commit**
```bash
git add src/lib/supabase.ts .env.example package.json package-lock.json
git commit -m "feat: add Supabase client"
```

---

### Task 2: Database migrations — core schema

**Files:**
- Create: `supabase/migrations/20260306000001_initial_schema.sql`

**Step 1: Create migration file**

Create `supabase/migrations/20260306000001_initial_schema.sql`:
```sql
-- Firms (tenants)
CREATE TABLE firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  vat_number TEXT,
  vat_rate NUMERIC DEFAULT 21,
  invoice_prefix TEXT DEFAULT 'INV',
  payment_terms INTEGER DEFAULT 30,
  footer TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'lawyer', 'billing')),
  hourly_rate NUMERIC DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  type TEXT NOT NULL CHECK (type IN ('physical', 'company')) DEFAULT 'physical',
  vat_number TEXT,
  national_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Matters
CREATE TABLE matters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'in-progress', 'pending', 'closed')) DEFAULT 'open',
  budget_total NUMERIC DEFAULT 0,
  budget_used NUMERIC DEFAULT 0,
  hourly_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Timesheets
CREATE TABLE timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  description TEXT NOT NULL,
  hours NUMERIC NOT NULL,
  rate NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  amount_ht NUMERIC NOT NULL DEFAULT 0,
  vat_rate NUMERIC NOT NULL DEFAULT 21,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid')) DEFAULT 'draft',
  kind TEXT CHECK (kind IN ('provision', 'final')) DEFAULT 'final',
  issued_at TIMESTAMPTZ DEFAULT now(),
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Matter collaborators junction
CREATE TABLE matter_collaborators (
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (matter_id, profile_id)
);
```

**Step 2: Apply migration**
```bash
npx supabase db push
```
Expected: Migration applied successfully.

**Step 3: Commit**
```bash
git add supabase/migrations/
git commit -m "feat: add initial database schema"
```

---

### Task 3: Row-Level Security policies

**Files:**
- Create: `supabase/migrations/20260306000002_rls.sql`

**Step 1: Create RLS migration**

Create `supabase/migrations/20260306000002_rls.sql`:
```sql
-- Helper function: get current user's firm_id
CREATE OR REPLACE FUNCTION get_firm_id()
RETURNS UUID AS $$
  SELECT firm_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS on all tables
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE matter_collaborators ENABLE ROW LEVEL SECURITY;

-- Firms: only own firm
CREATE POLICY "firm_isolation" ON firms
  FOR ALL USING (id = get_firm_id());

-- Profiles: only own firm members
CREATE POLICY "profiles_firm" ON profiles
  FOR ALL USING (firm_id = get_firm_id());

-- Clients: only own firm
CREATE POLICY "clients_firm" ON clients
  FOR ALL USING (firm_id = get_firm_id());

-- Matters: only own firm
CREATE POLICY "matters_firm" ON matters
  FOR ALL USING (firm_id = get_firm_id());

-- Timesheets: only own firm
CREATE POLICY "timesheets_firm" ON timesheets
  FOR ALL USING (firm_id = get_firm_id());

-- Invoices: only own firm
CREATE POLICY "invoices_firm" ON invoices
  FOR ALL USING (firm_id = get_firm_id());

-- Matter collaborators: only own firm (via matter)
CREATE POLICY "matter_collab_firm" ON matter_collaborators
  FOR ALL USING (
    matter_id IN (SELECT id FROM matters WHERE firm_id = get_firm_id())
  );

-- Admin-only: create/update profiles (role management)
CREATE POLICY "profiles_admin_write" ON profiles
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    AND firm_id = get_firm_id()
  );
```

**Step 2: Apply**
```bash
npx supabase db push
```

**Step 3: Commit**
```bash
git add supabase/migrations/
git commit -m "feat: add RLS policies for firm isolation"
```

---

## PHASE 2 — Authentication

### Task 4: Auth pages (Login + Signup)

**Files:**
- Create: `src/pages/LoginPage.tsx`
- Create: `src/pages/SignupPage.tsx`
- Modify: `src/App.tsx`

**Step 1: Create LoginPage**

Create `src/pages/LoginPage.tsx`:
```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8 border rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Mantra</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

**Step 2: Create auth context**

Create `src/hooks/useAuth.ts`:
```typescript
import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, session, loading }
}
```

**Step 3: Create ProtectedRoute component**

Create `src/components/auth/ProtectedRoute.tsx`:
```tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

**Step 4: Wire into App.tsx**

Modify `src/App.tsx` to add `/login` route and wrap AppLayout with ProtectedRoute:
```tsx
// Add import
import LoginPage from '@/pages/LoginPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// Add route before layout route
<Route path="/login" element={<LoginPage />} />

// Wrap layout route
<Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
  {/* existing routes */}
</Route>
```

**Step 5: Run dev server and test login redirect**
```bash
npm run dev
```
Navigate to `/` — should redirect to `/login`.

**Step 6: Commit**
```bash
git add src/
git commit -m "feat: add Supabase auth with login page and protected routes"
```

---

### Task 5: Auth signup + onboarding (firm creation)

**Files:**
- Create: `src/pages/SignupPage.tsx`
- Create: `supabase/migrations/20260306000003_signup_function.sql`

**Step 1: Create DB function for signup**

Create `supabase/migrations/20260306000003_signup_function.sql`:
```sql
-- Called after user signs up to create firm + profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_firm_id UUID;
BEGIN
  -- Create firm from metadata
  INSERT INTO firms (name)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'firm_name', 'My Firm'))
  RETURNING id INTO new_firm_id;

  -- Create profile
  INSERT INTO profiles (id, firm_id, name, email, role)
  VALUES (
    NEW.id,
    new_firm_id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'admin'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Step 2: Apply migration**
```bash
npx supabase db push
```

**Step 3: Create SignupPage**

Create `src/pages/SignupPage.tsx`:
```tsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', firmName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name, firm_name: form.firmName } }
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created! Check your email.')
      navigate('/login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8 border rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-muted-foreground text-sm mt-1">Start your free trial</p>
        </div>
        <form onSubmit={handleSignup} className="space-y-4">
          {[
            { id: 'name', label: 'Your name', type: 'text', key: 'name' },
            { id: 'firmName', label: 'Firm name', type: 'text', key: 'firmName' },
            { id: 'email', label: 'Email', type: 'email', key: 'email' },
            { id: 'password', label: 'Password', type: 'password', key: 'password' },
          ].map(f => (
            <div key={f.id} className="space-y-2">
              <Label htmlFor={f.id}>{f.label}</Label>
              <Input id={f.id} type={f.type} value={form[f.key as keyof typeof form]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} required />
            </div>
          ))}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </Button>
        </form>
        <p className="text-sm text-center text-muted-foreground">
          Already have an account? <Link to="/login" className="underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
```

**Step 4: Add signup route in App.tsx**
```tsx
<Route path="/signup" element={<SignupPage />} />
```

**Step 5: Commit**
```bash
git add src/ supabase/migrations/
git commit -m "feat: add signup with auto firm creation via DB trigger"
```

---

## PHASE 3 — Replace Mock Data Layer with Supabase

### Task 6: Replace repo.ts — Settings + Current User

**Files:**
- Modify: `src/data/repo.ts`
- Create: `src/hooks/useCurrentUser.ts`

**Step 1: Create useCurrentUser hook**

Create `src/hooks/useCurrentUser.ts`:
```typescript
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type CurrentUser = {
  id: string
  name: string
  email: string
  role: string
  firmId: string
  avatarUrl?: string
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (!authUser) { setLoading(false); return }
      const { data } = await supabase
        .from('profiles')
        .select('id, name, email, role, firm_id, avatar_url')
        .eq('id', authUser.id)
        .single()
      if (data) {
        setUser({ id: data.id, name: data.name, email: data.email,
          role: data.role, firmId: data.firm_id, avatarUrl: data.avatar_url })
      }
      setLoading(false)
    })
  }, [])

  return { user, loading }
}
```

**Step 2: Replace settings functions in repo.ts**

In `src/data/repo.ts`, replace `getSettings` and `updateSettings` with Supabase calls:
```typescript
import { supabase } from '@/lib/supabase'

export async function getSettings(): Promise<FirmSettings> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase.from('profiles').select('firm_id').eq('id', user.id).single()
  const { data: firm } = await supabase.from('firms').select('*').eq('id', profile!.firm_id).single()
  return {
    firmName: firm!.name,
    email: firm!.email ?? '',
    phone: firm!.phone ?? '',
    address: firm!.address ?? '',
    vat: firm!.vat_number ?? '',
    vatRate: firm!.vat_rate ?? 21,
    invoicePrefix: firm!.invoice_prefix ?? 'INV',
    paymentTerms: firm!.payment_terms ?? 30,
    footer: firm!.footer ?? '',
    logoUrl: firm!.logo_url,
  }
}

export async function updateSettings(payload: Partial<FirmSettings>): Promise<FirmSettings> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase.from('profiles').select('firm_id').eq('id', user.id).single()
  const { data: firm } = await supabase.from('firms').update({
    name: payload.firmName, email: payload.email, phone: payload.phone,
    address: payload.address, vat_number: payload.vat, vat_rate: payload.vatRate,
    invoice_prefix: payload.invoicePrefix, payment_terms: payload.paymentTerms,
    footer: payload.footer,
  }).eq('id', profile!.firm_id).select().single()
  return getSettings()
}
```

**Step 3: Commit**
```bash
git add src/
git commit -m "feat: replace settings with Supabase firms table"
```

---

### Task 7: Replace repo.ts — Clients

**Files:**
- Modify: `src/data/repo.ts` (client functions)

**Step 1: Replace client functions**
```typescript
export async function listClients(): Promise<Client[]> {
  const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data.map(r => ({
    id: r.id, name: r.name, email: r.email ?? '', phone: r.phone ?? '',
    address: r.address ?? '', type: r.type, vatNumber: r.vat_number,
    nationalNumber: r.national_number, createdAt: r.created_at,
  }))
}

export async function getClient(id: string): Promise<Client> {
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).single()
  if (error) throw error
  return { id: data.id, name: data.name, email: data.email ?? '', phone: data.phone ?? '',
    address: data.address ?? '', type: data.type, vatNumber: data.vat_number,
    nationalNumber: data.national_number, createdAt: data.created_at }
}

export async function createClient(payload: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
  const { data: profile } = await supabase.from('profiles').select('firm_id')
    .eq('id', (await supabase.auth.getUser()).data.user!.id).single()
  const { data, error } = await supabase.from('clients').insert({
    firm_id: profile!.firm_id, name: payload.name, email: payload.email,
    phone: payload.phone, address: payload.address, type: payload.type,
    vat_number: payload.vatNumber, national_number: payload.nationalNumber,
  }).select().single()
  if (error) throw error
  return getClient(data.id)
}

export async function updateClient(id: string, payload: Partial<Client>): Promise<Client> {
  const { error } = await supabase.from('clients').update({
    name: payload.name, email: payload.email, phone: payload.phone,
    address: payload.address, type: payload.type, vat_number: payload.vatNumber,
    national_number: payload.nationalNumber,
  }).eq('id', id)
  if (error) throw error
  return getClient(id)
}
```

**Step 2: Run dev and test clients page loads from DB**

**Step 3: Commit**
```bash
git add src/data/repo.ts
git commit -m "feat: replace client mock with Supabase"
```

---

### Task 8: Replace repo.ts — Matters + Timesheets

**Files:**
- Modify: `src/data/repo.ts` (matter + timesheet functions)

**Step 1: Replace matter functions**
```typescript
export async function listMatters(): Promise<Matter[]> {
  const { data, error } = await supabase.from('matters').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data.map(r => ({ id: r.id, title: r.title, clientId: r.client_id,
    status: r.status, budgetTotal: r.budget_total, budgetUsed: r.budget_used, hourlyRate: r.hourly_rate }))
}

export async function getMatter(id: string): Promise<Matter> {
  const { data, error } = await supabase.from('matters').select('*').eq('id', id).single()
  if (error) throw error
  return { id: data.id, title: data.title, clientId: data.client_id, status: data.status,
    budgetTotal: data.budget_total, budgetUsed: data.budget_used, hourlyRate: data.hourly_rate }
}

export async function createMatter(payload: Omit<Matter, 'id' | 'budgetUsed'>): Promise<Matter> {
  const { data: profile } = await supabase.from('profiles').select('firm_id')
    .eq('id', (await supabase.auth.getUser()).data.user!.id).single()
  const { data, error } = await supabase.from('matters').insert({
    firm_id: profile!.firm_id, client_id: payload.clientId, title: payload.title,
    status: payload.status, budget_total: payload.budgetTotal, hourly_rate: payload.hourlyRate,
  }).select().single()
  if (error) throw error
  return getMatter(data.id)
}

export async function updateMatterStatus(id: string, status: MatterStatus): Promise<Matter> {
  const { error } = await supabase.from('matters').update({ status }).eq('id', id)
  if (error) throw error
  return getMatter(id)
}
```

**Step 2: Replace timesheet functions**
```typescript
export async function listTimesheets(matterId: string): Promise<Timesheet[]> {
  const { data, error } = await supabase.from('timesheets').select('*, profiles(name)')
    .eq('matter_id', matterId).order('date', { ascending: false })
  if (error) throw error
  return data.map(r => ({ id: r.id, matterId: r.matter_id,
    description: r.description, user: r.profiles?.name ?? 'Unknown',
    hours: r.hours, rate: r.rate, date: r.date }))
}

export async function createTimesheet(matterId: string, payload: Omit<Timesheet, 'id' | 'matterId' | 'user'>): Promise<Timesheet> {
  const authUser = (await supabase.auth.getUser()).data.user!
  const { data: profile } = await supabase.from('profiles').select('firm_id').eq('id', authUser.id).single()
  const { data, error } = await supabase.from('timesheets').insert({
    firm_id: profile!.firm_id, matter_id: matterId, user_id: authUser.id,
    description: payload.description, hours: payload.hours, rate: payload.rate, date: payload.date,
  }).select().single()
  if (error) throw error
  // Update matter budget_used
  const matter = await getMatter(matterId)
  await supabase.from('matters').update({
    budget_used: matter.budgetUsed + payload.hours * payload.rate
  }).eq('id', matterId)
  const ts = await listTimesheets(matterId)
  return ts.find(t => t.id === data.id)!
}
```

**Step 3: Commit**
```bash
git add src/data/repo.ts
git commit -m "feat: replace matters and timesheets with Supabase"
```

---

### Task 9: Replace repo.ts — Invoices

**Files:**
- Modify: `src/data/repo.ts` (invoice functions)

**Step 1: Replace invoice functions**
```typescript
export async function listInvoices(matterId?: string): Promise<Invoice[]> {
  let query = supabase.from('invoices').select('*').order('issued_at', { ascending: false })
  if (matterId) query = query.eq('matter_id', matterId)
  const { data, error } = await query
  if (error) throw error
  return data.map(r => ({ id: r.id, matterId: r.matter_id, reference: r.reference,
    amountHT: r.amount_ht, vatRate: r.vat_rate, status: r.status, kind: r.kind,
    issuedAt: r.issued_at, dueDate: r.due_date, paidAt: r.paid_at, archivedAt: r.archived_at }))
}

export async function getInvoice(id: string): Promise<Invoice> {
  const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single()
  if (error) throw error
  return { id: data.id, matterId: data.matter_id, reference: data.reference,
    amountHT: data.amount_ht, vatRate: data.vat_rate, status: data.status, kind: data.kind,
    issuedAt: data.issued_at, dueDate: data.due_date, paidAt: data.paid_at, archivedAt: data.archived_at }
}

export async function createProvisionInvoice(matterId: string): Promise<Invoice> {
  const authUser = (await supabase.auth.getUser()).data.user!
  const { data: profile } = await supabase.from('profiles').select('firm_id, firms(invoice_prefix, payment_terms)')
    .eq('id', authUser.id).single() as any
  const prefix = profile.firms?.invoice_prefix ?? 'INV'
  const terms = profile.firms?.payment_terms ?? 30
  const ref = `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + terms)
  const { data, error } = await supabase.from('invoices').insert({
    firm_id: profile.firm_id, matter_id: matterId, reference: ref,
    amount_ht: 0, vat_rate: 21, status: 'draft', kind: 'provision',
    issued_at: new Date().toISOString(), due_date: dueDate.toISOString(),
  }).select().single()
  if (error) throw error
  return getInvoice(data.id)
}

export async function updateInvoice(id: string, payload: Partial<Invoice>): Promise<Invoice> {
  const { error } = await supabase.from('invoices').update({
    amount_ht: payload.amountHT, vat_rate: payload.vatRate, status: payload.status,
    due_date: payload.dueDate, kind: payload.kind,
  }).eq('id', id)
  if (error) throw error
  return getInvoice(id)
}

export async function markInvoicePaid(id: string): Promise<Invoice> {
  const { error } = await supabase.from('invoices').update({
    status: 'paid', paid_at: new Date().toISOString()
  }).eq('id', id)
  if (error) throw error
  return getInvoice(id)
}

export async function archiveInvoice(id: string): Promise<Invoice> {
  const { error } = await supabase.from('invoices').update({
    archived_at: new Date().toISOString()
  }).eq('id', id)
  if (error) throw error
  return getInvoice(id)
}
```

**Step 2: Commit**
```bash
git add src/data/repo.ts
git commit -m "feat: replace invoices with Supabase"
```

---

### Task 10: Replace repo.ts — Team

**Files:**
- Modify: `src/data/repo.ts` (team functions)

**Step 1: Replace team functions**
```typescript
export async function listTeam(): Promise<Collaborator[]> {
  const { data, error } = await supabase.from('profiles').select('*, matter_collaborators(matter_id)')
    .order('name')
  if (error) throw error
  return data.map(r => ({ id: r.id, name: r.name, email: r.email, role: r.role,
    hourlyRate: r.hourly_rate, avatarUrl: r.avatar_url,
    matterIds: r.matter_collaborators?.map((mc: any) => mc.matter_id) ?? [] }))
}

export async function createCollaborator(payload: Omit<Collaborator, 'id' | 'matterIds'>): Promise<Collaborator> {
  // Invite via Supabase Auth (sends invite email)
  const { data: authUser } = await supabase.auth.getUser()
  const { data: myProfile } = await supabase.from('profiles').select('firm_id').eq('id', authUser.user!.id).single()
  // Create profile directly (admin function — in production use admin SDK or edge function)
  const { data, error } = await supabase.from('profiles').insert({
    id: crypto.randomUUID(), // temp — real flow uses Supabase invite
    firm_id: myProfile!.firm_id,
    name: payload.name, email: payload.email, role: payload.role,
    hourly_rate: payload.hourlyRate, avatar_url: payload.avatarUrl,
  }).select().single()
  if (error) throw error
  return { id: data.id, name: data.name, email: data.email, role: data.role,
    hourlyRate: data.hourly_rate, avatarUrl: data.avatar_url, matterIds: [] }
}

export async function updateCollaborator(id: string, payload: Partial<Collaborator>): Promise<Collaborator> {
  const { error } = await supabase.from('profiles').update({
    name: payload.name, role: payload.role, hourly_rate: payload.hourlyRate,
  }).eq('id', id)
  if (error) throw error
  const all = await listTeam()
  return all.find(c => c.id === id)!
}
```

**Step 2: Commit**
```bash
git add src/data/repo.ts
git commit -m "feat: replace team with Supabase profiles"
```

---

### Task 11: Remove all mock data imports

**Files:**
- Modify: `src/data/repo.ts`
- Delete: `src/lib/mock-clients.ts`, `src/lib/mock-matters.ts`, `src/lib/mock-team.ts` (optional, or just remove imports)

**Step 1: Remove mock imports and in-memory stores from top of repo.ts**

Delete these lines:
```typescript
import { mockClients } from '@/lib/mock-clients'
import { mockMatters, ... } from '@/lib/mock-matters'
import { mockCollaborators } from '@/lib/mock-team'

const clients = [...mockClients]
const matters = [...]
// etc
```

**Step 2: Run `npm run build` and fix any TypeScript errors**

**Step 3: Commit**
```bash
git add src/
git commit -m "chore: remove in-memory mock stores"
```

---

## PHASE 4 — RBAC Enforcement

### Task 12: Role-based UI guards

**Files:**
- Create: `src/hooks/useRole.ts`
- Create: `src/components/auth/RoleGuard.tsx`
- Modify: nav and action buttons

**Step 1: Create useRole hook**

Create `src/hooks/useRole.ts`:
```typescript
import { useCurrentUser } from './useCurrentUser'

export function useRole() {
  const { user } = useCurrentUser()
  return {
    role: user?.role,
    isAdmin: user?.role === 'admin',
    isLawyer: user?.role === 'lawyer' || user?.role === 'admin',
    isBilling: user?.role === 'billing' || user?.role === 'admin',
  }
}
```

**Step 2: Create RoleGuard component**

Create `src/components/auth/RoleGuard.tsx`:
```tsx
import { useRole } from '@/hooks/useRole'

type Props = {
  require: 'admin' | 'lawyer' | 'billing'
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ require, children, fallback = null }: Props) {
  const { isAdmin, isLawyer, isBilling } = useRole()
  const allowed = require === 'admin' ? isAdmin : require === 'lawyer' ? isLawyer : isBilling
  return allowed ? <>{children}</> : <>{fallback}</>
}
```

**Step 3: Wrap admin-only actions**

In `src/pages/TeamPage.tsx`, wrap invite button:
```tsx
import { RoleGuard } from '@/components/auth/RoleGuard'
// ...
<RoleGuard require="admin">
  <Button onClick={openInviteDialog}>Invite member</Button>
</RoleGuard>
```

In `src/pages/SettingsPage.tsx`, wrap save button:
```tsx
<RoleGuard require="admin">
  <Button type="submit">Save changes</Button>
</RoleGuard>
```

**Step 4: Commit**
```bash
git add src/
git commit -m "feat: add role-based UI guards (admin/lawyer/billing)"
```

---

## PHASE 5 — File Storage (R2)

### Task 13: Wire R2 upload to firm logo in Settings

**Files:**
- Modify: `src/pages/SettingsPage.tsx`
- Modify: `supabase/functions/r2-sign-put/index.ts` (verify it's correct)

**Step 1: Add logo upload to SettingsPage**

In `src/pages/SettingsPage.tsx`, add file input with upload handler:
```tsx
async function uploadLogo(file: File) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/r2-sign-put`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session!.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: `logos/${Date.now()}-${file.name}`, contentType: file.type }),
  })
  const { signedUrl, publicUrl } = await res.json()
  await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
  await supabase.from('firms').update({ logo_url: publicUrl })
    .eq('id', currentUser.firmId)
}
```

**Step 2: Commit**
```bash
git add src/pages/SettingsPage.tsx
git commit -m "feat: add firm logo upload via R2"
```

---

## PHASE 6 — Invoice PDF (Optional but recommended for MVP)

### Task 14: Basic invoice PDF export

**Files:**
- Run: `npm install @react-pdf/renderer`
- Create: `src/components/invoices/InvoicePDF.tsx`
- Modify: `src/pages/InvoiceDetailPage.tsx`

**Step 1: Install**
```bash
npm install @react-pdf/renderer
```

**Step 2: Create InvoicePDF component**

Create `src/components/invoices/InvoicePDF.tsx`:
```tsx
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import type { Invoice, Matter, Client, FirmSettings } from '@/types'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold' },
  label: { fontSize: 10, color: '#666' },
  value: { fontSize: 12 },
  table: { marginTop: 20 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 8 },
  total: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
})

export function InvoicePDFDoc({ invoice, matter, client, settings }: {
  invoice: Invoice; matter: Matter; client: Client; settings: FirmSettings
}) {
  const vat = invoice.amountHT * (invoice.vatRate / 100)
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{settings.firmName}</Text>
            <Text style={styles.label}>{settings.address}</Text>
            <Text style={styles.label}>{settings.email}</Text>
          </View>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.label}>{invoice.reference}</Text>
            <Text style={styles.label}>Issued: {new Date(invoice.issuedAt).toLocaleDateString()}</Text>
          </View>
        </View>
        <View>
          <Text style={styles.label}>Bill to:</Text>
          <Text style={styles.value}>{client.name}</Text>
          <Text style={styles.label}>{client.address}</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={{ flex: 3 }}>Description</Text>
            <Text style={{ flex: 1, textAlign: 'right' }}>Amount</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ flex: 3 }}>{matter.title}</Text>
            <Text style={{ flex: 1, textAlign: 'right' }}>€{(invoice.amountHT / 100).toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.total}>
          <View>
            <Text>Subtotal: €{(invoice.amountHT / 100).toFixed(2)}</Text>
            <Text>VAT ({invoice.vatRate}%): €{(vat / 100).toFixed(2)}</Text>
            <Text style={{ fontWeight: 'bold' }}>Total: €{((invoice.amountHT + vat) / 100).toFixed(2)}</Text>
          </View>
        </View>
        <Text style={[styles.label, { marginTop: 60 }]}>{settings.footer}</Text>
      </Page>
    </Document>
  )
}

export async function downloadInvoicePDF(props: Parameters<typeof InvoicePDFDoc>[0]) {
  const blob = await pdf(<InvoicePDFDoc {...props} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url
  a.download = `${props.invoice.reference}.pdf`; a.click()
  URL.revokeObjectURL(url)
}
```

**Step 3: Add download button in InvoiceDetailPage**
```tsx
import { downloadInvoicePDF } from '@/components/invoices/InvoicePDF'
// ...
<Button variant="outline" onClick={() => downloadInvoicePDF({ invoice, matter, client, settings })}>
  Download PDF
</Button>
```

**Step 4: Commit**
```bash
git add src/ package.json package-lock.json
git commit -m "feat: add invoice PDF download"
```

---

## PHASE 7 — Production Deployment

### Task 15: Configure Vercel deployment

**Files:**
- Create: `vercel.json`

**Step 1: Create vercel.json for SPA routing**

Create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Step 2: Push to GitHub (if not done)**
```bash
git remote -v  # verify remote exists
git push origin main
```

**Step 3: Create Vercel project via CLI**
```bash
npx vercel --prod
```
Follow prompts: link to GitHub repo, root = `./`, build = `npm run build`, output = `dist`.

**Step 4: Set environment variables in Vercel dashboard**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Step 5: Redeploy**
```bash
npx vercel --prod
```

**Step 6: Commit**
```bash
git add vercel.json
git commit -m "chore: add Vercel SPA routing config"
```

---

### Task 16: Deploy Supabase Edge Functions

**Files:**
- Modify: `supabase/functions/r2-sign-put/index.ts` (add CORS headers)
- Modify: `supabase/functions/r2-sign-get/index.ts` (add CORS headers)

**Step 1: Add CORS to edge functions**

In both `index.ts` files, add at top of handler:
```typescript
if (req.method === 'OPTIONS') {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, content-type',
    }
  })
}
```

**Step 2: Set secrets in Supabase**
```bash
npx supabase secrets set R2_ACCOUNT_ID=xxx R2_ACCESS_KEY_ID=xxx R2_SECRET_ACCESS_KEY=xxx R2_BUCKET_NAME=xxx
```

**Step 3: Deploy functions**
```bash
npx supabase functions deploy r2-sign-put
npx supabase functions deploy r2-sign-get
```

**Step 4: Commit**
```bash
git add supabase/functions/
git commit -m "chore: add CORS headers to edge functions"
```

---

### Task 17: Final checks before launch

**Step 1: Run build and fix errors**
```bash
npm run build
```
Expected: No TypeScript errors, build succeeds.

**Step 2: Run lint**
```bash
npm run lint
```
Fix any errors found.

**Step 3: Test critical flows in production URL**
- [ ] Signup → creates firm + admin profile
- [ ] Login → redirects to dashboard
- [ ] Create client → appears in list
- [ ] Create matter → linked to client
- [ ] Add timesheet → updates budget
- [ ] Create invoice → downloadable PDF
- [ ] Settings save → persists firm data
- [ ] Logout → redirects to login

**Step 4: Add logout button to nav**

In `src/layouts/AppLayout.tsx` or nav component, add:
```tsx
import { supabase } from '@/lib/supabase'
// ...
<Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
  Logout
</Button>
```

**Step 5: Final commit + tag**
```bash
git add src/
git commit -m "feat: add logout button to nav"
git tag v0.1.0-mvp
git push origin main --tags
```

---

## PHASE 8 — Post-MVP Backlog (not in scope)

- Email notifications (Supabase + Resend)
- Stripe billing / subscription management
- Team invite flow (Supabase Auth admin.inviteUserByEmail)
- Calendar / scheduling
- Document management (R2 + versioning)
- Audit log
- Multi-language support
- Mobile responsiveness audit

---

## Execution Summary

| Phase | Tasks | Key Output |
|-------|-------|-----------|
| 1 - DB Setup | 1-3 | Supabase schema + RLS |
| 2 - Auth | 4-5 | Login/signup + firm creation |
| 3 - Data Layer | 6-11 | Real DB replacing all mocks |
| 4 - RBAC | 12 | Role guards in UI |
| 5 - Files | 13 | Logo upload via R2 |
| 6 - PDF | 14 | Invoice PDF download |
| 7 - Deploy | 15-17 | Vercel + Supabase prod |
