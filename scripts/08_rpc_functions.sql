-- ============================================================
-- Migration 08 — RPC functions used by repo.ts
-- ============================================================

-- ------------------------------------------------------------
-- increment_matter_budget_used
-- Called in repo.ts after createTimesheet:
--   supabase.rpc("increment_matter_budget_used", { p_matter_id, p_increment })
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_matter_budget_used(
    p_matter_id UUID,
    p_increment  NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE matters
    SET
        budget_used = budget_used + p_increment,
        updated_at  = NOW()
    WHERE id = p_matter_id
      AND firm_id = current_firm_id();  -- RLS guard: only update own firm

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Matter % not found or access denied', p_matter_id;
    END IF;
END;
$$;

-- ------------------------------------------------------------
-- increment_matter_budget_total
-- Called in repo.ts after markInvoicePaid (provision invoices):
--   supabase.rpc("increment_matter_budget_total", { p_matter_id, p_increment })
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_matter_budget_total(
    p_matter_id UUID,
    p_increment  NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE matters
    SET
        budget_total = budget_total + p_increment,
        updated_at   = NOW()
    WHERE id = p_matter_id
      AND firm_id = current_firm_id();  -- RLS guard: only update own firm

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Matter % not found or access denied', p_matter_id;
    END IF;
END;
$$;
