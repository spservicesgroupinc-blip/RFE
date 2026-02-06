-- 6. Material Logs Table
CREATE TABLE IF NOT EXISTS material_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id TEXT, -- Can be estimate UUID or null
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data JSONB NOT NULL DEFAULT '{}', -- Stores material name, quantity, unit, logged_by
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logs_company ON material_logs(company_id);
