-- ============================================================
-- Migration 07 — Add missing columns to match repo.ts expectations
-- Run AFTER: 01_tables, 02_indexes, 03_functions, 04_triggers, 05_rls, 06_r2_keys
-- ============================================================

-- ------------------------------------------------------------
-- firms: settings fields
-- ------------------------------------------------------------
ALTER TABLE firms
    ADD COLUMN IF NOT EXISTS slogan         TEXT,
    ADD COLUMN IF NOT EXISTS vat            TEXT,
    ADD COLUMN IF NOT EXISTS address        TEXT,
    ADD COLUMN IF NOT EXISTS email          TEXT,
    ADD COLUMN IF NOT EXISTS phone          TEXT,
    ADD COLUMN IF NOT EXISTS payment_terms  INT     DEFAULT 14,
    ADD COLUMN IF NOT EXISTS vat_rate       NUMERIC DEFAULT 21,
    ADD COLUMN IF NOT EXISTS invoice_prefix TEXT    DEFAULT 'INV-',
    ADD COLUMN IF NOT EXISTS invoice_footer TEXT,
    ADD COLUMN IF NOT EXISTS show_slogan    BOOLEAN DEFAULT true;

-- ------------------------------------------------------------
-- profiles: user identity + billing
-- ------------------------------------------------------------
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS name        TEXT,
    ADD COLUMN IF NOT EXISTS role        TEXT NOT NULL DEFAULT 'lawyer'
                                         CHECK (role IN ('admin', 'lawyer', 'billing')),
    ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC DEFAULT 0;

-- ------------------------------------------------------------
-- clients: contact + legal info
-- ------------------------------------------------------------
ALTER TABLE clients
    ADD COLUMN IF NOT EXISTS email           TEXT,
    ADD COLUMN IF NOT EXISTS phone           TEXT,
    ADD COLUMN IF NOT EXISTS address         TEXT,
    ADD COLUMN IF NOT EXISTS type            TEXT DEFAULT 'company'
                                             CHECK (type IN ('company', 'individual')),
    ADD COLUMN IF NOT EXISTS vat_number      TEXT,
    ADD COLUMN IF NOT EXISTS national_number TEXT;

-- ------------------------------------------------------------
-- matters: budget tracking + rate
-- Note: repo.ts uses (title ?? name) so we keep both;
--       new rows should populate title.
-- ------------------------------------------------------------
ALTER TABLE matters
    ADD COLUMN IF NOT EXISTS title        TEXT,
    ADD COLUMN IF NOT EXISTS budget_total NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS budget_used  NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS hourly_rate  NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS status       TEXT    DEFAULT 'open'
                                          CHECK (status IN ('open', 'closed', 'archived'));

-- Back-fill title from name for existing rows
UPDATE matters SET title = name WHERE title IS NULL;

-- ------------------------------------------------------------
-- timesheets: rate + date
-- ------------------------------------------------------------
ALTER TABLE timesheets
    ADD COLUMN IF NOT EXISTS rate NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS date DATE;

-- ------------------------------------------------------------
-- invoices: full invoice model
-- ------------------------------------------------------------
ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS matter_id   UUID REFERENCES matters(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reference   TEXT,
    ADD COLUMN IF NOT EXISTS amount_ht   NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS vat_rate    NUMERIC DEFAULT 21,
    ADD COLUMN IF NOT EXISTS kind        TEXT DEFAULT 'final'
                                         CHECK (kind IN ('provision', 'final')),
    ADD COLUMN IF NOT EXISTS issued_at   DATE,
    ADD COLUMN IF NOT EXISTS due_date    DATE,
    ADD COLUMN IF NOT EXISTS paid_at     TIMESTAMP,
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;

-- Index on matter_id for invoice lookups by matter
CREATE INDEX IF NOT EXISTS idx_invoices_matter_id ON invoices (matter_id);

-- Index on archived_at for listInvoices filter (.is("archived_at", null))
CREATE INDEX IF NOT EXISTS idx_invoices_archived_at ON invoices (archived_at) WHERE archived_at IS NULL;
