-- Enable UUID extension (still useful if we want to generate them)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Authentication & Tenant Root)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(), -- flexible ID
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    company_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    crew_pin TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    email TEXT
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY, -- Removed DEFAULT uuid to allow client-side ID or simple string
    company_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    status TEXT DEFAULT 'Active',
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Estimates Table
CREATE TABLE IF NOT EXISTS estimates (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_id TEXT, -- REFERENCES customers(id) -- Relax FK for now to avoid order issues during sync
    date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Draft',
    execution_status TEXT DEFAULT 'Not Started',
    total_value NUMERIC(15, 2) DEFAULT 0,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(), -- Inventory items might not have IDs in legacy, so default is good if missing
    company_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity NUMERIC(15, 2) DEFAULT 0,
    data JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Settings Table
CREATE TABLE IF NOT EXISTS settings (
    company_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (company_id, key)
);

-- 6. Logs (from schema_logs.sql merged here for simplicity)
CREATE TABLE IF NOT EXISTS material_logs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_estimates_company ON estimates(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_company ON inventory(company_id);
CREATE INDEX IF NOT EXISTS idx_logs_company ON material_logs(company_id);
