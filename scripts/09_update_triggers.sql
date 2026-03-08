-- ============================================================
-- Migration 09 — Update handle_new_user trigger
-- Replaces the minimal version in 04_triggers.sql
-- ============================================================

-- Drop old trigger + function first to allow full replacement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Updated function: creates profile with name + default role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        -- Use display_name from metadata if available (e.g. Google OAuth),
        -- otherwise fall back to the part before @ in the email
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        'admin'  -- First user of a firm is always admin
    )
    ON CONFLICT (id) DO NOTHING;  -- Safe re-run guard

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
