-- SQL helper functions for multi-tenant RLS

CREATE OR REPLACE FUNCTION current_firm_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_firm_id UUID;
BEGIN
    SELECT firm_id INTO v_firm_id
    FROM profiles
    WHERE id = auth.uid();
    
    RETURN v_firm_id;
END;
$$;
