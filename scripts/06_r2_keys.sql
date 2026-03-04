-- Add Cloudflare R2 file keys to existing tables

ALTER TABLE firms
    ADD COLUMN logo_r2_key TEXT;

ALTER TABLE profiles
    ADD COLUMN avatar_r2_key TEXT;

ALTER TABLE invoices
    ADD COLUMN pdf_r2_key TEXT;
