-- Indexes for MANTRA database

CREATE INDEX idx_profiles_firm_id ON profiles (firm_id);
CREATE INDEX idx_clients_firm_id ON clients (firm_id);
CREATE INDEX idx_matters_firm_id_client_id ON matters (firm_id, client_id);
CREATE INDEX idx_timesheets_matter_id ON timesheets (matter_id);
CREATE INDEX idx_invoices_firm_id_status ON invoices (firm_id, status);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items (invoice_id);
CREATE INDEX idx_assignments_matter_id_profile_id ON assignments (matter_id, profile_id);
CREATE INDEX idx_activity_log_firm_id ON activity_log (firm_id);
