import { describe, it, expect } from 'vitest';
import { runOptimisationEngine, calculateGini } from '../engine';
import { NEIGHBOURHOODS } from '../../../data/neighbourhoods';
import { INTERVENTIONS } from '../../../data/interventions';
import { SCENARIO_PRESETS } from '../../scenarios/scenarioEngine';
import { BudgetConfig } from '../../../types';

describe('NAGARA AI Sustainability Decision Engine Audit', () => {
  const baseConfig: BudgetConfig = {
    totalBudgetCr: 25,
    equityWeight: 0.5,
    activeInterventions: ['urban-forest', 'green-roof', 'rainwater-harvest', 'drainage-sponge'],
    riskFocus: 'balanced'
  };

  // 1. Explicit cost & documented assumptions
  it('1. verifies every intervention has an explicit cost and documented benefit assumptions', () => {
    expect(INTERVENTIONS.length).toBe(4);
    INTERVENTIONS.forEach(item => {
      expect(item.unitCostCr).toBeGreaterThan(0);
      expect(item.maxUnitsPerWard).toBeGreaterThan(0);
      expect(item.impactPerUnit.heatReductionC).toBeGreaterThanOrEqual(0);
      expect(item.impactPerUnit.floodMitigationPct).toBeGreaterThanOrEqual(0);
      expect(item.impactPerUnit.waterSecurityMLD).toBeGreaterThanOrEqual(0);
      expect(item.impactPerUnit.greenCoverGainPct).toBeGreaterThanOrEqual(0);
      expect(item.coBenefits.length).toBeGreaterThan(0);
      expect(typeof item.suitabilityScore).toBe('function');
    });
  });

  // 2. Budget constraint strict invariance
  it('2. guarantees the planner never allocates more than the available budget across varied scenarios', () => {
    const testBudgets = [1, 5, 15, 25, 50, 75, 100];
    testBudgets.forEach(budget => {
      const result = runOptimisationEngine(NEIGHBOURHOODS, { ...baseConfig, totalBudgetCr: budget });
      expect(result.totalCostCr).toBeLessThanOrEqual(budget);
      expect(result.remainingBudgetCr).toBeGreaterThanOrEqual(0);
      expect(result.totalCostCr + result.remainingBudgetCr).toBeCloseTo(budget, 1);
    });
  });

  // 3. Neighbourhood suitability affects selection
  it('3. verifies neighbourhood suitability affects intervention selection', () => {
    const result = runOptimisationEngine(NEIGHBOURHOODS, {
      ...baseConfig,
      totalBudgetCr: 10
    });
    // Sponge drainage should be prioritized for wards with high flood risk (Koramangala, Bellandur, Yelahanka)
    const spongeAllocs = result.allocations.filter(a => a.interventionId === 'drainage-sponge');
    spongeAllocs.forEach(a => {
      const ward = NEIGHBOURHOODS.find(w => w.id === a.wardId)!;
      expect(ward.baselineFloodRisk).toBeGreaterThanOrEqual(50);
    });
  });

  // 4. Equity preference affects allocation meaningfully
  it('4. verifies equity preference shifts capital toward highly vulnerable wards', () => {
    // Run with 0% equity (pure efficiency)
    const resultEfficiency = runOptimisationEngine(NEIGHBOURHOODS, {
      ...baseConfig,
      equityWeight: 0.0
    });

    // Run with 100% equity (Rawlsian priority to vulnerable)
    const resultEquity = runOptimisationEngine(NEIGHBOURHOODS, {
      ...baseConfig,
      equityWeight: 1.0
    });

    // Identify high vulnerability wards (socioEconomicVulnerability >= 75)
    const vulnerableWardIds = NEIGHBOURHOODS
      .filter(w => w.socioEconomicVulnerability >= 75)
      .map(w => w.id);

    const spendVulnerableEfficiency = resultEfficiency.allocations
      .filter(a => vulnerableWardIds.includes(a.wardId))
      .reduce((sum, a) => sum + a.costCr, 0);

    const spendVulnerableEquity = resultEquity.allocations
      .filter(a => vulnerableWardIds.includes(a.wardId))
      .reduce((sum, a) => sum + a.costCr, 0);

    // Equity run must allocate equal or significantly more capital to vulnerable wards
    expect(spendVulnerableEquity).toBeGreaterThanOrEqual(spendVulnerableEfficiency);
  });

  // 5. Extreme rainfall changes relative importance of flood mitigation
  it('5. verifies extreme rainfall increases the allocation to flood mitigation', () => {
    const baselineResult = runOptimisationEngine(NEIGHBOURHOODS, baseConfig, SCENARIO_PRESETS['baseline']);
    const monsoonResult = runOptimisationEngine(NEIGHBOURHOODS, baseConfig, SCENARIO_PRESETS['extreme-monsoon']);

    const baselineDrainageSpend = baselineResult.allocations
      .filter(a => a.interventionId === 'drainage-sponge')
      .reduce((sum, a) => sum + a.costCr, 0);

    const monsoonDrainageSpend = monsoonResult.allocations
      .filter(a => a.interventionId === 'drainage-sponge')
      .reduce((sum, a) => sum + a.costCr, 0);

    // Monsoonal cloudburst should increase or maintain top-tier sponge drainage allocation
    expect(monsoonDrainageSpend).toBeGreaterThanOrEqual(baselineDrainageSpend);
  });

  // 6. Severe drought changes relative importance of water conservation
  it('6. verifies severe drought prioritises rainwater recharge and water security', () => {
    const baselineResult = runOptimisationEngine(NEIGHBOURHOODS, baseConfig, SCENARIO_PRESETS['baseline']);
    const droughtResult = runOptimisationEngine(NEIGHBOURHOODS, baseConfig, SCENARIO_PRESETS['severe-drought']);

    const baselineWaterSpend = baselineResult.allocations
      .filter(a => a.interventionId === 'rainwater-harvest')
      .reduce((sum, a) => sum + a.costCr, 0);

    const droughtWaterSpend = droughtResult.allocations
      .filter(a => a.interventionId === 'rainwater-harvest')
      .reduce((sum, a) => sum + a.costCr, 0);

    expect(droughtWaterSpend).toBeGreaterThanOrEqual(baselineWaterSpend);
  });

  // 7. Increased urban heat changes relative importance of cooling and green infrastructure
  it('7. verifies urban heatwave prioritises cooling and pocket forests', () => {
    const heatwaveResult = runOptimisationEngine(NEIGHBOURHOODS, baseConfig, SCENARIO_PRESETS['urban-heatwave']);

    const coolingSpend = heatwaveResult.allocations
      .filter(a => a.interventionId === 'urban-forest' || a.interventionId === 'green-roof')
      .reduce((sum, a) => sum + a.costCr, 0);

    expect(coolingSpend).toBeGreaterThan(0);
    // Industrial Heat Island Peenya should receive cooling intervention
    const peenyaCooling = heatwaveResult.allocations.find(
      a => a.wardId === 'ward-peenya' && (a.interventionId === 'urban-forest' || a.interventionId === 'green-roof')
    );
    expect(peenyaCooling).toBeDefined();
  });

  // 8. Budget reductions cause the planner to reconsider allocations
  it('8. verifies budget reductions cause the planner to reconsider allocation', () => {
    const fullBudgetResult = runOptimisationEngine(NEIGHBOURHOODS, { ...baseConfig, totalBudgetCr: 50 });
    const austerityResult = runOptimisationEngine(NEIGHBOURHOODS, { ...baseConfig, totalBudgetCr: 10 });

    expect(austerityResult.totalCostCr).toBeLessThanOrEqual(10);
    expect(austerityResult.allocations.length).toBeLessThan(fullBudgetResult.allocations.length);
  });

  // 9. Explanations are generated from current calculated results
  it('9. verifies recommendation explanations are dynamically generated from calculated results', () => {
    const result = runOptimisationEngine(NEIGHBOURHOODS, baseConfig);
    expect(result.allocations.length).toBeGreaterThan(0);
    result.allocations.forEach(alloc => {
      expect(alloc.selectionReason).toContain(alloc.wardName);
      expect(alloc.selectionReason.length).toBeGreaterThan(15);
      expect(alloc.marginalBenefitScore).toBeGreaterThan(0);
    });
  });

  // 10. Repeatability / Determinism: The same inputs produce the exact same results
  it('10. verifies repeatable deterministic results from identical inputs', () => {
    const run1 = runOptimisationEngine(NEIGHBOURHOODS, baseConfig, SCENARIO_PRESETS['baseline']);
    const run2 = runOptimisationEngine(NEIGHBOURHOODS, baseConfig, SCENARIO_PRESETS['baseline']);

    expect(run1.totalCostCr).toBe(run2.totalCostCr);
    expect(run1.remainingBudgetCr).toBe(run2.remainingBudgetCr);
    expect(run1.allocations.length).toBe(run2.allocations.length);
    expect(run1.allocations).toEqual(run2.allocations);
    expect(run1.overallSustainabilityIndex).toEqual(run2.overallSustainabilityIndex);
  });

  // 11. Edge case: Zero budget
  it('11. handles zero budget edge case safely', () => {
    const resultZero = runOptimisationEngine(NEIGHBOURHOODS, { ...baseConfig, totalBudgetCr: 0 });
    expect(resultZero.totalCostCr).toBe(0);
    expect(resultZero.remainingBudgetCr).toBe(0);
    expect(resultZero.allocations.length).toBe(0);
    expect(resultZero.budgetUtilizationPct).toBe(0);
  });

  // 12. Edge case: Very small budget (less than cheapest intervention of ₹0.28 Cr)
  it('12. handles very small budgets safely without exceptions', () => {
    const resultSmall = runOptimisationEngine(NEIGHBOURHOODS, { ...baseConfig, totalBudgetCr: 0.15 });
    expect(resultSmall.totalCostCr).toBe(0);
    expect(resultSmall.remainingBudgetCr).toBe(0.15);
    expect(resultSmall.allocations.length).toBe(0);
  });

  // 13. Edge case: No available active interventions
  it('13. handles empty active interventions safely', () => {
    const resultEmptyInterventions = runOptimisationEngine(NEIGHBOURHOODS, {
      ...baseConfig,
      activeInterventions: []
    });
    expect(resultEmptyInterventions.allocations.length).toBe(0);
    expect(resultEmptyInterventions.totalCostCr).toBe(0);
  });

  // 14. Edge case: Extremely high scenario intensity
  it('14. clamps and handles extreme scenario multipliers safely', () => {
    const extremeScenario = {
      id: 'extreme-monsoon' as const,
      name: 'Super Cloudburst 10x',
      tagline: 'Extreme Test',
      description: 'Super-cell thunderstorm',
      rainfallMultiplier: 15.0, // beyond normal
      heatMultiplier: 8.0,
      waterStressMultiplier: 10.0,
      budgetMultiplier: 0.5
    };

    const result = runOptimisationEngine(NEIGHBOURHOODS, baseConfig, extremeScenario);
    expect(result.totalCostCr).toBeLessThanOrEqual(baseConfig.totalBudgetCr * 0.5);
    expect(result.cityFloodRisk.after).toBeLessThanOrEqual(100);
    expect(result.cityHeatRisk.after).toBeLessThanOrEqual(100);
    expect(result.cityWaterStress.after).toBeLessThanOrEqual(100);
  });

  // 15. Edge case: Missing or invalid input values
  it('15. handles invalid and undefined inputs safely', () => {
    const resultUndefined = runOptimisationEngine(NEIGHBOURHOODS, undefined, undefined);
    expect(resultUndefined).toBeDefined();
    expect(resultUndefined.totalCostCr).toBe(0);

    const resultNaNBudget = runOptimisationEngine(NEIGHBOURHOODS, {
      ...baseConfig,
      totalBudgetCr: NaN
    });
    expect(resultNaNBudget.totalCostCr).toBe(0);
  });

  // 16. Gini coefficient mathematical properties
  it('16. verifies spatial Gini coefficient behaves correctly', () => {
    // Perfectly equal benefits -> Gini = 0
    const equalValues = [50, 50, 50, 50, 50];
    expect(calculateGini(equalValues)).toBe(0);

    // Highly unequal benefits -> Gini approaches 1
    const skewedValues = [0, 0, 0, 0, 100];
    const giniSkewed = calculateGini(skewedValues);
    expect(giniSkewed).toBeGreaterThan(0.6);

    // Empty array edge case
    expect(calculateGini([])).toBe(0);
  });
});
