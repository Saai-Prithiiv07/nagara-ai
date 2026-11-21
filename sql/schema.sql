-- ============================================================================
-- NAGARA AI - PostgreSQL Relational Database Schema
-- Concepts: Relational schema design with PK/FK, Normalization, Indexing
-- ============================================================================

-- 1. NORMALIZATION BASICS (1NF, 2NF, 3NF):
-- 1NF: All columns contain atomic, indivisible scalar values; no repeating groups.
-- 2NF: In 1NF and all non-key columns depend on the entirety of the primary key (no partial dependencies).
-- 3NF: In 2NF and all non-key columns depend ONLY on the primary key (no transitive dependencies).

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'PLANNER' CHECK (role IN ('ADMIN', 'PLANNER', 'AUDITOR', 'VIEWER')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wards (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    population INT NOT NULL CHECK (population > 0),
    area_km2 NUMERIC(8, 2) NOT NULL CHECK (area_km2 > 0),
    composite_risk NUMERIC(5, 2) NOT NULL CHECK (composite_risk BETWEEN 0 AND 100),
    heat_island_risk NUMERIC(5, 2) NOT NULL CHECK (heat_island_risk BETWEEN 0 AND 100),
    flood_risk NUMERIC(5, 2) NOT NULL CHECK (flood_risk BETWEEN 0 AND 100),
    water_stress_risk NUMERIC(5, 2) NOT NULL CHECK (water_stress_risk BETWEEN 0 AND 100),
    green_cover_pct NUMERIC(5, 2) NOT NULL CHECK (green_cover_pct BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interventions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit_cost_cr NUMERIC(10, 4) NOT NULL CHECK (unit_cost_cr > 0),
    max_capacity INT NOT NULL CHECK (max_capacity > 0),
    cooling_effect_c NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    co2_offset_tons NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    lifespan_years INT NOT NULL DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_id VARCHAR(50) NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
    intervention_id VARCHAR(50) NOT NULL REFERENCES interventions(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    units_allocated INT NOT NULL CHECK (units_allocated > 0),
    allocated_cost NUMERIC(12, 4) NOT NULL CHECK (allocated_cost > 0),
    expected_roi NUMERIC(8, 4) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    allocated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXING FOR QUERY PERFORMANCE:
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_wards_zone ON wards(zone);
CREATE INDEX IF NOT EXISTS idx_wards_composite_risk ON wards(composite_risk DESC);
CREATE INDEX IF NOT EXISTS idx_allocations_ward_status ON allocations(ward_id, status);
CREATE INDEX IF NOT EXISTS idx_allocations_intervention ON allocations(intervention_id);
CREATE INDEX IF NOT EXISTS idx_allocations_allocated_at ON allocations(allocated_at DESC);
