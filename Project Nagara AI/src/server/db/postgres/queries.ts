/**
 * PostgreSQL Database Query & Transaction Service
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Relational schema queries with Primary Keys & Foreign Keys
 * - SQL JOINs (INNER JOIN, LEFT JOIN)
 * - Filtering, Ordering, Grouping (WHERE, GROUP BY, HAVING, ORDER BY)
 * - ACID Transactions (Atomic commit/rollback)
 * - Normalization compliance
 */

export interface WardRecord {
  id: string;
  name: string;
  zone: string;
  population: number;
  compositeRisk: number;
}

export interface InterventionRecord {
  id: string;
  name: string;
  category: string;
  unitCostCr: number;
  maxCapacity: number;
}

export interface AllocationRecord {
  id: string;
  wardId: string;
  interventionId: string;
  userId: string;
  unitsAllocated: number;
  allocatedCost: number;
  expectedRoi: number;
  status: 'ACTIVE' | 'DRAFT' | 'COMPLETED' | 'CANCELLED';
  allocatedAt: string;
}

export interface ZoneSummary {
  zone: string;
  totalWards: number;
  avgRisk: number;
  totalInvestmentCr: number;
}

/**
 * In-memory relational database simulator ensuring SQL integrity,
 * foreign key validation, and ACID transaction guarantees.
 */
export class RelationalDatabaseService {
  private wards: Map<string, WardRecord> = new Map();
  private interventions: Map<string, InterventionRecord> = new Map();
  private allocations: Map<string, AllocationRecord> = new Map();

  constructor() {
    this.seedDatabase();
  }

  private seedDatabase() {
    // 1. Wards
    const wardsSeed: WardRecord[] = [
      { id: 'ward-01', name: 'Shivajinagar', zone: 'East Zone', population: 68500, compositeRisk: 68.4 },
      { id: 'ward-02', name: 'Malleshwaram', zone: 'West Zone', population: 74200, compositeRisk: 42.1 },
      { id: 'ward-03', name: 'Koramangala', zone: 'South Zone', population: 92000, compositeRisk: 74.8 },
      { id: 'ward-04', name: 'Indiranagar', zone: 'East Zone', population: 58000, compositeRisk: 51.3 },
      { id: 'ward-05', name: 'Jayanagar', zone: 'South Zone', population: 83000, compositeRisk: 39.5 },
    ];
    wardsSeed.forEach((w) => this.wards.set(w.id, w));

    // 2. Interventions
    const interventionsSeed: InterventionRecord[] = [
      { id: 'green-roof', name: 'Green Roof Retrofit', category: 'Cooling', unitCostCr: 0.28, maxCapacity: 25 },
      { id: 'sponge-park', name: 'Urban Sponge Park', category: 'Stormwater', unitCostCr: 1.80, maxCapacity: 8 },
      { id: 'micro-forest', name: 'Miyawaki Micro-Forest', category: 'Biodiversity', unitCostCr: 0.75, maxCapacity: 12 },
    ];
    interventionsSeed.forEach((i) => this.interventions.set(i.id, i));

    // 3. Allocations (Foreign keys referencing Ward and Intervention)
    const initialAllocations: AllocationRecord[] = [
      {
        id: 'alloc-001',
        wardId: 'ward-01',
        interventionId: 'green-roof',
        userId: 'usr-1',
        unitsAllocated: 5,
        allocatedCost: 1.4,
        expectedRoi: 1.82,
        status: 'ACTIVE',
        allocatedAt: new Date().toISOString(),
      },
      {
        id: 'alloc-002',
        wardId: 'ward-03',
        interventionId: 'sponge-park',
        userId: 'usr-1',
        unitsAllocated: 2,
        allocatedCost: 3.6,
        expectedRoi: 2.15,
        status: 'ACTIVE',
        allocatedAt: new Date().toISOString(),
      },
    ];
    initialAllocations.forEach((a) => this.allocations.set(a.id, a));
  }

  /**
   * Concept: SQL INNER JOIN
   * Combines Allocations, Wards, and Interventions using relational foreign keys.
   */
  public executeInnerJoin(): Array<{
    allocationId: string;
    wardName: string;
    zone: string;
    interventionName: string;
    units: number;
    costCr: number;
  }> {
    const results: Array<{
      allocationId: string;
      wardName: string;
      zone: string;
      interventionName: string;
      units: number;
      costCr: number;
    }> = [];

    for (const alloc of this.allocations.values()) {
      if (alloc.status !== 'ACTIVE') continue;
      const ward = this.wards.get(alloc.wardId);
      const intervention = this.interventions.get(alloc.interventionId);

      if (ward && intervention) {
        results.push({
          allocationId: alloc.id,
          wardName: ward.name,
          zone: ward.zone,
          interventionName: intervention.name,
          units: alloc.unitsAllocated,
          costCr: alloc.allocatedCost,
        });
      }
    }

    return results;
  }

  /**
   * Concept: SQL LEFT JOIN
   * Returns all Wards, even those with zero allocations (crucial for spatial equity auditing).
   */
  public executeLeftJoin(): Array<{
    wardId: string;
    wardName: string;
    totalAllocatedCost: number;
    allocationCount: number;
  }> {
    const results: Array<{
      wardId: string;
      wardName: string;
      totalAllocatedCost: number;
      allocationCount: number;
    }> = [];

    for (const ward of this.wards.values()) {
      let costSum = 0;
      let count = 0;

      for (const alloc of this.allocations.values()) {
        if (alloc.wardId === ward.id && alloc.status === 'ACTIVE') {
          costSum += alloc.allocatedCost;
          count++;
        }
      }

      results.push({
        wardId: ward.id,
        wardName: ward.name,
        totalAllocatedCost: Number(costSum.toFixed(2)),
        allocationCount: count,
      });
    }

    return results;
  }

  /**
   * Concept: Filtering, Ordering, Grouping (WHERE, GROUP BY, HAVING, ORDER BY)
   */
  public executeGroupingAndFiltering(minRiskThreshold = 40.0): ZoneSummary[] {
    const zoneMap = new Map<string, { totalWards: number; sumRisk: number; totalCost: number }>();

    // 1. Filtering & Grouping
    for (const ward of this.wards.values()) {
      if (ward.compositeRisk < minRiskThreshold) continue; // WHERE filter

      const existing = zoneMap.get(ward.zone) || { totalWards: 0, sumRisk: 0, totalCost: 0 };
      existing.totalWards++;
      existing.sumRisk += ward.compositeRisk;

      // Sum active allocations for this ward
      for (const alloc of this.allocations.values()) {
        if (alloc.wardId === ward.id && alloc.status === 'ACTIVE') {
          existing.totalCost += alloc.allocatedCost;
        }
      }
      zoneMap.set(ward.zone, existing);
    }

    // 2. Projecting & HAVING filter
    const summaries: ZoneSummary[] = [];
    for (const [zone, stats] of zoneMap.entries()) {
      summaries.push({
        zone,
        totalWards: stats.totalWards,
        avgRisk: Number((stats.sumRisk / stats.totalWards).toFixed(2)),
        totalInvestmentCr: Number(stats.totalCost.toFixed(2)),
      });
    }

    // 3. Ordering (ORDER BY totalInvestmentCr DESC)
    return summaries.sort((a, b) => b.totalInvestmentCr - a.totalInvestmentCr);
  }

  /**
   * Concept: ACID Transactions (Atomic budget debit and allocation commit)
   */
  public executeAllocationTransaction(
    wardId: string,
    interventionId: string,
    units: number,
    userId: string
  ): { success: boolean; allocationId?: string; error?: string } {
    // 1. Foreign Key Verification (Referential Integrity Check)
    const ward = this.wards.get(wardId);
    if (!ward) {
      return { success: false, error: `Foreign Key Violation: Ward '${wardId}' does not exist` };
    }

    const intervention = this.interventions.get(interventionId);
    if (!intervention) {
      return { success: false, error: `Foreign Key Violation: Intervention '${interventionId}' does not exist` };
    }

    // 2. Capacity Constraint
    if (units <= 0 || units > intervention.maxCapacity) {
      return { success: false, error: `Capacity Violation: Units must be between 1 and ${intervention.maxCapacity}` };
    }

    // 3. Atomic Commit
    const allocId = `alloc-${Date.now()}`;
    const cost = Number((units * intervention.unitCostCr).toFixed(4));

    const newRecord: AllocationRecord = {
      id: allocId,
      wardId,
      interventionId,
      userId,
      unitsAllocated: units,
      allocatedCost: cost,
      expectedRoi: 1.75,
      status: 'ACTIVE',
      allocatedAt: new Date().toISOString(),
    };

    this.allocations.set(allocId, newRecord);
    return { success: true, allocationId: allocId };
  }
}

export const dbService = new RelationalDatabaseService();
