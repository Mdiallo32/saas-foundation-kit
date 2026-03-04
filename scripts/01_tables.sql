-- Create tables for MANTRA SaaS

CREATE TABLE firms (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    firm_id UUID REFERENCES firms(id),
    email TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE clients (
    id UUID PRIMARY KEY,
    firm_id UUID REFERENCES firms(id),
    name TEXT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE matters (
    id UUID PRIMARY KEY,
    firm_id UUID REFERENCES firms(id),
    client_id UUID REFERENCES clients(id),
    name TEXT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE assignments (
    id UUID PRIMARY KEY,
    firm_id UUID REFERENCES firms(id),
    matter_id UUID REFERENCES matters(id),
    profile_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE timesheets (
    id UUID PRIMARY KEY,
    firm_id UUID REFERENCES firms(id),
    matter_id UUID REFERENCES matters(id),
    profile_id UUID REFERENCES profiles(id),
    hours NUMERIC,
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    firm_id UUID REFERENCES firms(id),
    client_id UUID REFERENCES clients(id),
    amount NUMERIC,
    status TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY,
    firm_id UUID REFERENCES firms(id),
    invoice_id UUID REFERENCES invoices(id),
    description TEXT,
    amount NUMERIC,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE invitations (
    id UUID PRIMARY KEY,
    firm_id UUID REFERENCES firms(id),
    email TEXT NOT NULL,
    token TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE activity_log (
    id UUID PRIMARY KEY,
    firm_id UUID REFERENCES firms(id),
    action TEXT NOT NULL,
    profile_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
