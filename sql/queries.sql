-- ============================================================================
-- NAGARA AI - Complex SQL Queries & Database Transactions
-- Concepts: SQL JOINs, Filtering, Ordering, Grouping, Transactions
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SQL JOINs: INNER JOIN
-- Combines Wards, Allocations, Interventions, and Approving Users.
-- Only returns records where an allocation matches all relational entities.
-- ----------------------------------------------------------------------------
SELECT 
    w.id AS ward_id,
    w.name AS ward_name,
    w.zone,
    i.name AS intervention_name,
    i.category,
    a.units_allocated,
    a.allocated_cost,
    a.status,
    u.full_name AS approved_by,
    a.allocated_at
FROM allocations a
INNER JOIN wards w ON a.ward_id = w.id
INNER JOIN interventions i ON a.intervention_id = i.id
INNER JOIN users u ON a.user_id = u.id
WHERE a.status = 'ACTIVE';

-- ----------------------------------------------------------------------------
-- 2. SQL JOINs: LEFT JOIN (Outer Join)
-- Returns all wards, including under-allocated wards that have received ZERO interventions,
-- which is critical for identifying spatial equity gaps.
-- ----------------------------------------------------------------------------
SELECT 
    w.id AS ward_id,
    w.name AS ward_name,
    w.zone,
    w.composite_risk,
    COALESCE(COUNT(a.id), 0) AS total_interventions_count,
    COALESCE(SUM(a.allocated_cost), 0.0) AS total_investment_cr
FROM wards w
LEFT JOIN allocations a ON w.id = a.ward_id AND a.status = 'ACTIVE'
GROUP BY w.id, w.name, w.zone, w.composite_risk
ORDER BY total_investment_cr ASC, w.composite_risk DESC;

-- ----------------------------------------------------------------------------
-- 3. FILTERING, ORDERING, AND GROUPING (WITH HAVING)
-- Aggregates municipal CapEx per zone, filtering for high-risk zones,
-- grouping by zone, filtering grouped totals with HAVING, and ordering by total investment.
-- ----------------------------------------------------------------------------
SELECT 
    w.zone,
    COUNT(DISTINCT w.id) AS total_wards_in_zone,
    ROUND(AVG(w.composite_risk), 2) AS avg_zone_risk,
    ROUND(AVG(w.heat_island_risk), 2) AS avg_heat_risk,
    SUM(a.units_allocated) AS total_units_deployed,
    ROUND(SUM(a.allocated_cost), 2) AS total_zone_investment_cr
FROM wards w
INNER JOIN allocations a ON w.id = a.ward_id
WHERE a.status = 'ACTIVE' AND w.composite_risk >= 30.0 -- Filtering individual rows
GROUP BY w.zone                                         -- Grouping
HAVING SUM(a.allocated_cost) >= 2.0                    -- Group-level filtering
ORDER BY total_zone_investment_cr DESC;                -- Ordering

-- ----------------------------------------------------------------------------
-- 4. ACID TRANSACTIONS
-- Atomically allocates budget and creates audit trail with row-level locking.
-- If any step fails or violates budget constraints, ROLLBACK guarantees data integrity.
-- ----------------------------------------------------------------------------
BEGIN TRANSACTION;

-- Step 1: Check and lock the target ward to avoid race conditions
SELECT id, composite_risk 
FROM wards 
WHERE id = 'ward-03' 
FOR UPDATE;

-- Step 2: Insert the new allocation
INSERT INTO allocations (
    id, ward_id, intervention_id, user_id, units_allocated, allocated_cost, expected_roi, status
) VALUES (
    gen_random_uuid(),
    'ward-03',
    'sponge-park',
    '00000000-0000-0000-0000-000000000001',
    2,
    3.60,
    1.45,
    'ACTIVE'
);

-- Step 3: Insert corresponding compliance audit log
INSERT INTO audit_logs (
    id, user_id, action, details_json
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'ALLOCATION_COMMITTED',
    '{"wardId":"ward-03","intervention":"sponge-park","units":2,"costCr":3.60}'
);

-- Step 4: Commit transaction atomically
COMMIT;
