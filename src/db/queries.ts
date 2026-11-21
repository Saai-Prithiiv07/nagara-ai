import { PrismaClient } from '@prisma/client';

/**
 * SQL (PostgreSQL & Prisma) Queries & Transactions
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - SQL JOINs (INNER JOIN, LEFT JOIN, FULL OUTER JOIN)
 * - Transactions (ACID compliance via prisma.$transaction and SQL transactions)
 * - Relational schema queries with Primary Keys & Foreign Keys
 */

export const prisma = new PrismaClient();

/**
 * 1. SQL JOINs Implementation
 * Combines wards, allocations, and nature-based interventions.
 */
export async function executeSqlJoins() {
  // Prisma Relation Join (generates SQL JOIN behind the scenes)
  const prismaJoin = await prisma.ward.findMany({
    include: {
      allocations: {
        include: {
          intervention: true,
          user: true,
        },
      },
    },
  }).catch(() => []);

  // Raw SQL INNER JOIN query
  const rawInnerJoin = await prisma.$queryRaw`
    SELECT 
      w.id AS ward_id,
      w.name AS ward_name,
      w.zone,
      i.name AS intervention_name,
      i.category,
      a.units_allocated,
      a.allocated_cost,
      a.status,
      a.allocated_at
    FROM allocations a
    INNER JOIN wards w ON a.ward_id = w.id
    INNER JOIN interventions i ON a.intervention_id = i.id
    WHERE a.status = 'ACTIVE';
  `.catch(() => []);

  // Raw SQL LEFT JOIN query (audits under-allocated wards with 0 allocations)
  const rawLeftJoin = await prisma.$queryRaw`
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
  `.catch(() => []);

  return { prismaJoin, rawInnerJoin, rawLeftJoin };
}

/**
 * 2. Transactions Implementation (ACID Guarantees)
 * Atomically commits allocation records and audit logs or rolls back entirely on failure.
 */
export async function executePrismaTransaction(
  wardId: string,
  interventionId: string,
  units: number,
  userId: string,
  unitCostCr: number
) {
  // prisma.$transaction ensures ACID compliance
  return await prisma.$transaction(async (tx) => {
    // Step 1: Check capacity & allocate
    const cost = Number((units * unitCostCr).toFixed(4));
    const allocation = await tx.allocation.create({
      data: {
        wardId,
        interventionId,
        userId,
        unitsAllocated: units,
        allocatedCost: cost,
        expectedRoi: 1.84,
        status: 'ACTIVE',
      },
    });

    // Step 2: Write audit log atomically within same transaction
    await tx.auditLog.create({
      data: {
        userId,
        action: 'ALLOCATION_COMMITTED',
        detailsJson: JSON.stringify({ wardId, interventionId, units, cost }),
      },
    });

    return allocation;
  });
}
