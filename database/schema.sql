
-- RFE Spray Foam App - PostgreSQL Schema for Neon
-- This schema mirrors the data structure used in the Google Sheets backend.
-- It utilizes JSONB columns to allow for flexible schema evolution matching the frontend types.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Companies (Tenants)
-- Replaces Users_DB in GAS. Represents the company account.
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- Store bcrypt/argon2 hash
    company_name TEXT NOT NULL,
    email TEXT,
    crew_access_pin TEXT, -- For simple crew login
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Customers
-- Stores customer profiles.
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'Active',
    data JSONB NOT NULL, -- Full CustomerProfile object from types.ts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_customers_company ON customers(company_id);

-- 3. Estimates (Jobs)
-- Stores estimates, work orders, and invoices.
CREATE TABLE estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id), -- Optional relational link
    status TEXT NOT NULL, -- Draft, Work Order, Invoiced, Paid, Archived
    total_value NUMERIC(12, 2) DEFAULT 0,
    data JSONB NOT NULL, -- Full EstimateRecord object from types.ts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_estimates_company ON estimates(company_id);
CREATE INDEX idx_estimates_status ON estimates(status);

-- 4. Inventory
-- Warehouse items.
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity NUMERIC(10, 2) DEFAULT 0,
    unit TEXT,
    data JSONB NOT NULL, -- Full WarehouseItem object
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inventory_company ON inventory(company_id);

-- 5. Equipment
-- Tracked tools and machinery.
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'Available',
    data JSONB NOT NULL, -- Full EquipmentItem object (includes lastSeen)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_equipment_company ON equipment(company_id);

-- 6. Settings
-- Key-Value store for company configuration (Yields, Costs, Profile).
CREATE TABLE settings (
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    key TEXT NOT NULL, -- e.g., 'costs', 'yields', 'companyProfile', 'lifetime_usage'
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (company_id, key)
);

-- 7. Material Logs
-- Historical usage logs.
CREATE TABLE material_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    estimate_id UUID REFERENCES estimates(id),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    material_name TEXT,
    quantity NUMERIC(10, 2),
    data JSONB NOT NULL, -- Full MaterialUsageLogEntry object
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logs_company ON material_logs(company_id);

-- 8. Trial Memberships
-- For landing page signups.
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to update 'updated_at' column automatically
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_modtime BEFORE UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_customer_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_estimate_modtime BEFORE UPDATE ON estimates FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_inventory_modtime BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_equipment_modtime BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
