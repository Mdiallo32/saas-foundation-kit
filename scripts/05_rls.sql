-- Enable RLS and define policies for tenant tables

-- Enable RLS for all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies (firm_id must equal current_firm_id())
CREATE POLICY "Clients isolation" ON clients
    FOR ALL USING (firm_id = current_firm_id());

CREATE POLICY "Matters isolation" ON matters
    FOR ALL USING (firm_id = current_firm_id());

CREATE POLICY "Timesheets isolation" ON timesheets
    FOR ALL USING (firm_id = current_firm_id());

CREATE POLICY "Invoices isolation" ON invoices
    FOR ALL USING (firm_id = current_firm_id());

CREATE POLICY "Invoice items isolation" ON invoice_items
    FOR ALL USING (firm_id = current_firm_id());

CREATE POLICY "Assignments isolation" ON assignments
    FOR ALL USING (firm_id = current_firm_id());

CREATE POLICY "Activity log isolation" ON activity_log
    FOR ALL USING (firm_id = current_firm_id());

CREATE POLICY "Invitations isolation" ON invitations
    FOR ALL USING (firm_id = current_firm_id());

-- Profiles policy: user can read/update only their own row
CREATE POLICY "Profiles read own row" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Profiles update own row" ON profiles
    FOR UPDATE USING (id = auth.uid());
