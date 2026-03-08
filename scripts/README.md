# Database Scripts

Apply these scripts **in order** via the Supabase SQL Editor or CLI.

## Order of Execution

```
01_tables.sql           → Create all tables (base schema)
02_indexes.sql          → Performance indexes
03_functions.sql        → current_firm_id() RLS helper
04_triggers.sql         → (replaced by 09 — skip or apply anyway)
05_rls.sql              → Row-Level Security policies
06_r2_keys.sql          → Add Cloudflare R2 key columns
07_add_missing_columns.sql  → ⭐ Add all columns expected by repo.ts
08_rpc_functions.sql    → ⭐ RPC functions for atomic budget updates
09_update_triggers.sql  → ⭐ Improved handle_new_user trigger
```

Scripts marked ⭐ are the ones added to fix the schema gap.

## How to Apply

### Option A: Supabase Dashboard (recommended for first time)

1. Go to [supabase.com](https://supabase.com) → your project
2. Click **SQL Editor** in the left sidebar
3. Copy-paste each script in order
4. Click **Run**

### Option B: Supabase CLI

```bash
# Install CLI if needed
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>

# Apply a script
supabase db execute --file scripts/07_add_missing_columns.sql
```

### Option C: psql direct

```bash
psql "postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres" \
  -f scripts/07_add_missing_columns.sql
```

## Re-run Safety

All scripts use:
- `ADD COLUMN IF NOT EXISTS` → safe to re-run
- `CREATE INDEX IF NOT EXISTS` → safe to re-run
- `CREATE OR REPLACE FUNCTION` → safe to re-run
- `ON CONFLICT (id) DO NOTHING` → safe to re-run

## What Each Script Does

| Script | Purpose |
|--------|---------|
| `01_tables.sql` | Base tables (firms, profiles, clients, matters, timesheets, invoices, etc.) |
| `02_indexes.sql` | Indexes on firm_id, matter_id, status for fast queries |
| `03_functions.sql` | `current_firm_id()` — returns the firm of the current auth user (used by RLS) |
| `04_triggers.sql` | Basic `handle_new_user` — auto-creates profile on signup |
| `05_rls.sql` | Row-Level Security — users can only see their own firm's data |
| `06_r2_keys.sql` | Adds `logo_r2_key` (firms), `avatar_r2_key` (profiles), `pdf_r2_key` (invoices) |
| `07_add_missing_columns.sql` | Adds all fields expected by `repo.ts` mappers |
| `08_rpc_functions.sql` | `increment_matter_budget_used/total` — atomic budget updates |
| `09_update_triggers.sql` | Improved `handle_new_user` — sets name + role = 'admin' on signup |

## Gap Fixed by Script 07

These are the exact columns `repo.ts` expected but the base schema was missing:

| Table | Columns Added |
|-------|--------------|
| `firms` | `slogan`, `vat`, `address`, `email`, `phone`, `payment_terms`, `vat_rate`, `invoice_prefix`, `invoice_footer`, `show_slogan` |
| `profiles` | `name`, `role`, `hourly_rate` |
| `clients` | `email`, `phone`, `address`, `type`, `vat_number`, `national_number` |
| `matters` | `title`, `budget_total`, `budget_used`, `hourly_rate`, `status` |
| `timesheets` | `rate`, `date` |
| `invoices` | `matter_id`, `reference`, `amount_ht`, `vat_rate`, `kind`, `issued_at`, `due_date`, `paid_at`, `archived_at` |

## After Applying Scripts

Test that the schema works:

```sql
-- Should return column list with all new fields
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'matters'
ORDER BY ordinal_position;

-- Should show the RPC functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE 'increment_%';

-- Should show RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```
