import {
  Neighbourhood,
  InterventionType,
  BudgetConfig,
  ScenarioParams,
  OptimisationResult,
  AllocationItem,
  RejectedAlternative,
  BeforeAfterMetric
} from '../../types';
import { NEIGHBOURHOODS } from '../../data/neighbourhoods';
import { INTERVENTIONS } from '../../data/interventions';

export function runOptimisationEngine(
  wards: Neighbourhood[] = NEIGHBOURHOODS,
  config?: BudgetConfig,
  scenario?: ScenarioParams
): OptimisationResult {
  const startTime = performance.now();
  const auditLog: string[] = [];

  // Edge case safety & input sanitization
  const safeWards = Array.isArray(wards) ? wards.filter(w => w && w.id) : [];
  if (safeWards.length === 0) {
    auditLog.push('No valid wards provided. Terminating engine.');
    return createEmptyResult([], 0, auditLog, performance.now() - startTime);
  }

  // Safe budget sanitization
  const rawBudget = config && typeof config.totalBudgetCr === 'number' && !isNaN(config.totalBudgetCr)
    ? Math.max(0, config.totalBudgetCr)
    : 0;

  // Safe equity weight clamping [0, 1]
  const rawEquity = config && typeof config.equityWeight === 'number' && !isNaN(config.equityWeight)
    ? Math.max(0, Math.min(1, config.equityWeight))
    : 0.5;

  const rawActive = config && Array.isArray(config.activeInterventions)
    ? config.activeInterventions
    : ['urban-forest', 'green-roof', 'rainwater-harvest', 'drainage-sponge'];

  const rawFocus = config?.riskFocus || 'balanced';

  // Safe scenario multipliers clamping [0.05, 10.0]
  const rainMult = scenario && typeof scenario.rainfallMultiplier === 'number' && !isNaN(scenario.rainfallMultiplier)
    ? Math.max(0.05, Math.min(10.0, scenario.rainfallMultiplier))
    : 1.0;

  const heatMult = scenario && typeof scenario.heatMultiplier === 'number' && !isNaN(scenario.heatMultiplier)
    ? Math.max(0.05, Math.min(10.0, scenario.heatMultiplier))
    : 1.0;

  const waterMult = scenario && typeof scenario.waterStressMultiplier === 'number' && !isNaN(scenario.waterStressMultiplier)
    ? Math.max(0.05, Math.min(10.0, scenario.waterStressMultiplier))
    : 1.0;

  const budgetMult = scenario && typeof scenario.budgetMultiplier === 'number' && !isNaN(scenario.budgetMultiplier)
    ? Math.max(0.05, Math.min(5.0, scenario.budgetMultiplier))
    : 1.0;

  const effectiveBudgetCr = Number((rawBudget * budgetMult).toFixed(2));
  let remainingBudgetCr = effectiveBudgetCr;

  auditLog.push(
    `Initialised optimisation cycle with total available budget: ₹${effectiveBudgetCr.toFixed(2)} Cr (Scenario: ${scenario ? scenario.name : 'Baseline'}, Equity Weight: ${(rawEquity * 100).toFixed(0)}%).`
  );

  // If budget is zero or very small, terminate early safely
  if (effectiveBudgetCr <= 0) {
    auditLog.push('Zero or negative planning budget configured. No interventions allocated.');
    return createEmptyResult(safeWards, 0, auditLog, performance.now() - startTime);
  }

  // Filter allowed interventions
  const activeDefs = INTERVENTIONS.filter(item =>
    rawActive.includes(item.id)
  );

  if (activeDefs.length === 0) {
    auditLog.push('No eligible active interventions selected. Terminating calculation.');
    return createEmptyResult(safeWards, effectiveBudgetCr, auditLog, performance.now() - startTime);
  }

  // Pre-calculate scenario-adjusted risks for each ward (capped between 0 and 100)
  interface WardScenarioState {
    ward: Neighbourhood;
    heatRisk: number;
    floodRisk: number;
    waterStress: number;
    greenCoverPct: number;
    allocatedUnits: Record<InterventionType, number>;
  }

  const wardStates: Record<string, WardScenarioState> = {};
  safeWards.forEach(w => {
    wardStates[w.id] = {
      ward: w,
      heatRisk: Math.min(100, Math.max(0, Math.round(w.baselineHeatRisk * heatMult))),
      floodRisk: Math.min(100, Math.max(0, Math.round(w.baselineFloodRisk * rainMult))),
      waterStress: Math.min(100, Math.max(0, Math.round(w.baselineWaterStress * waterMult))),
      greenCoverPct: w.baselineGreenCoverPct,
      allocatedUnits: {
        'urban-forest': 0,
        'green-roof': 0,
        'rainwater-harvest': 0,
        'drainage-sponge': 0
      }
    };
  });

  const allocations: AllocationItem[] = [];
  const rejectedAlternatives: RejectedAlternative[] = [];

  // Dynamic Hazard Weight Calculation
  // 1. Base weights from user risk focus
  let rawHeatWeight = 0.25;
  let rawFloodWeight = 0.35;
  let rawWaterWeight = 0.25;
  let rawGreenWeight = 0.15;

  if (rawFocus === 'heat') {
    rawHeatWeight = 0.50; rawFloodWeight = 0.15; rawWaterWeight = 0.15; rawGreenWeight = 0.20;
  } else if (rawFocus === 'flood') {
    rawHeatWeight = 0.15; rawFloodWeight = 0.55; rawWaterWeight = 0.15; rawGreenWeight = 0.15;
  } else if (rawFocus === 'water') {
    rawHeatWeight = 0.15; rawFloodWeight = 0.15; rawWaterWeight = 0.55; rawGreenWeight = 0.15;
  }

  // 2. Adjust relative hazard importance dynamically based on scenario intensity
  // Extreme rainfall elevates flood weight; severe drought elevates water weight; extreme heat elevates cooling weight
  const scenarioFloodWeight = rawFloodWeight * (rainMult >= 1.0 ? Math.pow(rainMult, 1.4) : rainMult);
  const scenarioWaterWeight = rawWaterWeight * (waterMult >= 1.0 ? Math.pow(waterMult, 1.4) : waterMult);
  const scenarioHeatWeight = rawHeatWeight * (heatMult >= 1.0 ? Math.pow(heatMult, 1.3) : heatMult);
  const scenarioGreenWeight = rawGreenWeight * (heatMult >= 1.0 ? Math.pow(heatMult, 0.7) : 1.0);

  // Normalize weights so sum equals 1.0
  const weightSum = scenarioHeatWeight + scenarioFloodWeight + scenarioWaterWeight + scenarioGreenWeight;
  const wHeat = scenarioHeatWeight / weightSum;
  const wFlood = scenarioFloodWeight / weightSum;
  const wWater = scenarioWaterWeight / weightSum;
  const wGreen = scenarioGreenWeight / weightSum;

  auditLog.push(
    `Parametric weights calibrated — Flood: ${(wFlood * 100).toFixed(1)}%, Heat: ${(wHeat * 100).toFixed(1)}%, Water: ${(wWater * 100).toFixed(1)}%, Canopy: ${(wGreen * 100).toFixed(1)}%.`
  );

  // Greedy Marginal Utility Algorithm Loop
  let iteration = 0;
  const maxIterations = 150;

  // The cheapest unit cost among active interventions
  const minUnitCost = Math.min(...activeDefs.map(d => d.unitCostCr));

  while (remainingBudgetCr >= minUnitCost && iteration < maxIterations) {
    iteration++;

    interface Candidate {
      wardId: string;
      wardName: string;
      intervention: typeof activeDefs[0];
      costCr: number;
      rawBenefitScore: number;
      equityAdjustedScore: number;
      marginalRoi: number; // score per crore
      rationale: string;
    }

    const eligibleCandidates: Candidate[] = [];

    for (const w of safeWards) {
      const state = wardStates[w.id];

      for (const intervention of activeDefs) {
        const currentUnits = state.allocatedUnits[intervention.id];

        // Capacity constraint: Cannot exceed ward physical carry capacity
        if (currentUnits >= intervention.maxUnitsPerWard) {
          continue;
        }

        const cost = intervention.unitCostCr;
        // Strict budget constraint: unit must fit in remaining budget
        if (cost > remainingBudgetCr) {
          continue;
        }

        // Suitability factor (0 to 1)
        const suitability = intervention.suitabilityScore(w);
        if (suitability < 0.15) {
          continue;
        }

        // Environmental impact calculation
        const heatBenefit = (state.heatRisk / 100) * intervention.impactPerUnit.heatReductionC * 8;
        const floodBenefit = (state.floodRisk / 100) * intervention.impactPerUnit.floodMitigationPct * 1.5;
        const waterBenefit = (state.waterStress / 100) * intervention.impactPerUnit.waterSecurityMLD * 12;
        const greenBenefit = intervention.impactPerUnit.greenCoverGainPct * 3.5;

        const rawBenefit = (
          heatBenefit * wHeat +
          floodBenefit * wFlood +
          waterBenefit * wWater +
          greenBenefit * wGreen
        ) * suitability;

        // Diminishing returns curve for repeated interventions in the same ward: 1 / (1 + 0.25k)
        const diminishingFactor = 1 / (1 + currentUnits * 0.25);
        const adjustedRaw = rawBenefit * diminishingFactor;

        // Equity adjustment factor
        // Alpha = 0 -> weight is 1.0 (pure efficiency)
        // Alpha = 1 -> heavily amplified by ward's socioeconomic vulnerability (up to 2.4x)
        const vulnFactor = Math.max(0.3, w.socioEconomicVulnerability / 50); // around 0.5 to 1.8
        const equityMultiplier = (1 - rawEquity) * 1.0 + (rawEquity) * vulnFactor;

        const finalScore = adjustedRaw * equityMultiplier;
        const marginalRoi = finalScore / cost;

        eligibleCandidates.push({
          wardId: w.id,
          wardName: w.name,
          intervention,
          costCr: cost,
          rawBenefitScore: adjustedRaw,
          equityAdjustedScore: finalScore,
          marginalRoi,
          rationale: `Selected for ${w.name}: high suitability (${(suitability * 100).toFixed(0)}%) addressing ${
            intervention.id === 'drainage-sponge'
              ? `acute flood risk (${state.floodRisk}/100, weight: ${(wFlood * 100).toFixed(0)}%)`
              : intervention.id === 'rainwater-harvest'
              ? `severe aquifer depletion (${state.waterStress}/100, weight: ${(wWater * 100).toFixed(0)}%)`
              : intervention.id === 'green-roof'
              ? `building cluster cooling (${state.heatRisk}/100)`
              : `heat island mitigation (${state.heatRisk}/100) & canopy expansion`
          } with equity priority factor ${equityMultiplier.toFixed(2)}x.`
        });
      }
    }

    if (eligibleCandidates.length === 0) {
      break;
    }

    // Deterministic Sorting:
    // 1. Descending marginal ROI
    // 2. Secondary tie-breaker: Descending equity adjusted score
    // 3. Tertiary tie-breaker: Alphabetical string tie-break
    eligibleCandidates.sort((a, b) => {
      const diffRoi = b.marginalRoi - a.marginalRoi;
      if (Math.abs(diffRoi) > 0.0001) return diffRoi;
      const diffEquity = b.equityAdjustedScore - a.equityAdjustedScore;
      if (Math.abs(diffEquity) > 0.0001) return diffEquity;
      return (a.wardId + a.intervention.id).localeCompare(b.wardId + b.intervention.id);
    });

    const chosen = eligibleCandidates[0];

    // Double check budget constraint before allocating
    if (chosen.costCr <= remainingBudgetCr) {
      const state = wardStates[chosen.wardId];
      state.allocatedUnits[chosen.intervention.id] += 1;
      remainingBudgetCr = Number((remainingBudgetCr - chosen.costCr).toFixed(3));

      // Apply impact to state
      state.heatRisk = Math.max(10, Math.round(state.heatRisk - chosen.intervention.impactPerUnit.heatReductionC * 1.8));
      state.floodRisk = Math.max(10, Math.round(state.floodRisk - chosen.intervention.impactPerUnit.floodMitigationPct * 0.8));
      state.waterStress = Math.max(10, Math.round(state.waterStress - chosen.intervention.impactPerUnit.waterSecurityMLD * 4.2));
      state.greenCoverPct = Math.min(65, Number((state.greenCoverPct + chosen.intervention.impactPerUnit.greenCoverGainPct).toFixed(1)));

      // Check if existing allocation exists to merge units, or create new
      const existing = allocations.find(
        a => a.wardId === chosen.wardId && a.interventionId === chosen.intervention.id
      );

      if (existing) {
        existing.units += 1;
        existing.costCr = Number((existing.costCr + chosen.costCr).toFixed(2));
        existing.expectedImpact.heatReductionC += chosen.intervention.impactPerUnit.heatReductionC;
        existing.expectedImpact.floodMitigationPct += chosen.intervention.impactPerUnit.floodMitigationPct;
        existing.expectedImpact.waterSecurityMLD += chosen.intervention.impactPerUnit.waterSecurityMLD;
        existing.expectedImpact.greenCoverGainPct += chosen.intervention.impactPerUnit.greenCoverGainPct;
      } else {
        allocations.push({
          id: `alloc-${chosen.wardId}-${chosen.intervention.id}`,
          wardId: chosen.wardId,
          wardName: chosen.wardName,
          interventionId: chosen.intervention.id,
          interventionName: chosen.intervention.name,
          units: 1,
          costCr: chosen.costCr,
          marginalBenefitScore: Number(chosen.equityAdjustedScore.toFixed(2)),
          expectedImpact: {
            heatReductionC: chosen.intervention.impactPerUnit.heatReductionC,
            floodMitigationPct: chosen.intervention.impactPerUnit.floodMitigationPct,
            waterSecurityMLD: chosen.intervention.impactPerUnit.waterSecurityMLD,
            greenCoverGainPct: chosen.intervention.impactPerUnit.greenCoverGainPct
          },
          selectionReason: chosen.rationale
        });
      }

      auditLog.push(
        `[Allocation #${allocations.length}] Funded 1 unit of ${chosen.intervention.name} for ${chosen.wardName} (Cost: ₹${chosen.costCr.toFixed(2)} Cr, Score ROI: ${chosen.marginalRoi.toFixed(1)}). Remaining Budget: ₹${remainingBudgetCr.toFixed(2)} Cr.`
      );
    } else {
      break;
    }
  }

  // Populate rejected alternatives for explainability
  for (const w of safeWards) {
    const state = wardStates[w.id];
    for (const intervention of activeDefs) {
      const units = state.allocatedUnits[intervention.id];
      if (units === 0) {
        const cost = intervention.unitCostCr;
        let reason: RejectedAlternative['reason'] = 'Superseded by Higher Equity/Benefit Option';
        let deficit: number | undefined;

        if (cost > remainingBudgetCr && remainingBudgetCr < cost) {
          reason = 'Budget Exceeded';
          deficit = Number((cost - remainingBudgetCr).toFixed(2));
        } else if (intervention.suitabilityScore(w) < 0.2) {
          reason = 'Low Suitability';
        }

        rejectedAlternatives.push({
          wardId: w.id,
          wardName: w.name,
          interventionId: intervention.id,
          interventionName: intervention.name,
          reason,
          deficitCostCr: deficit,
          scoreComparison: `Marginal utility per Rupee fell below the greedy allocation threshold under current equity weight (${(rawEquity * 100).toFixed(0)}%).`
        });
      }
    }
  }

  // Calculate actual total spend from allocations to guarantee mathematical consistency
  const totalCostCr = Number(
    allocations.reduce((acc, a) => acc + a.costCr, 0).toFixed(2)
  );
  const finalRemainingCr = Number(Math.max(0, effectiveBudgetCr - totalCostCr).toFixed(2));
  const budgetUtilizationPct = effectiveBudgetCr > 0
    ? Number(((totalCostCr / effectiveBudgetCr) * 100).toFixed(1))
    : 0;

  const beforeAfterMetrics = computeAggregateMetrics(safeWards, wardStates);

  return {
    allocations,
    rejectedAlternatives: rejectedAlternatives.slice(0, 15),
    totalCostCr,
    remainingBudgetCr: finalRemainingCr,
    budgetUtilizationPct,
    ...beforeAfterMetrics,
    auditLog,
    executionTimeMs: Number((performance.now() - startTime).toFixed(1))
  };
}

function computeAggregateMetrics(
  originalWards: Neighbourhood[],
  wardStates: Record<string, {
    ward: Neighbourhood;
    heatRisk: number;
    floodRisk: number;
    waterStress: number;
    greenCoverPct: number;
  }>
) {
  let initialHeatSum = 0;
  let finalHeatSum = 0;
  let initialFloodSum = 0;
  let finalFloodSum = 0;
  let initialWaterSum = 0;
  let finalWaterSum = 0;
  let initialGreenSum = 0;
  let finalGreenSum = 0;

  const initialBenefits: number[] = [];
  const finalBenefits: number[] = [];

  originalWards.forEach(w => {
    const s = wardStates[w.id];
    initialHeatSum += w.baselineHeatRisk;
    finalHeatSum += s.heatRisk;
    initialFloodSum += w.baselineFloodRisk;
    finalFloodSum += s.floodRisk;
    initialWaterSum += w.baselineWaterStress;
    finalWaterSum += s.waterStress;
    initialGreenSum += w.baselineGreenCoverPct;
    finalGreenSum += s.greenCoverPct;

    const scoreBefore = 100 - (w.baselineHeatRisk * 0.3 + w.baselineFloodRisk * 0.35 + w.baselineWaterStress * 0.25 - w.baselineGreenCoverPct * 0.5);
    const scoreAfter = 100 - (s.heatRisk * 0.3 + s.floodRisk * 0.35 + s.waterStress * 0.25 - s.greenCoverPct * 0.5);

    initialBenefits.push(scoreBefore);
    finalBenefits.push(scoreAfter);
  });

  const count = originalWards.length || 1;
  const avgInitialHeat = initialHeatSum / count;
  const avgFinalHeat = finalHeatSum / count;
  const avgInitialFlood = initialFloodSum / count;
  const avgFinalFlood = finalFloodSum / count;
  const avgInitialWater = initialWaterSum / count;
  const avgFinalWater = finalWaterSum / count;
  const avgInitialGreen = initialGreenSum / count;
  const avgFinalGreen = finalGreenSum / count;

  const baseSustainIndex = Math.round(
    100 - ((avgInitialHeat * 0.3 + avgInitialFlood * 0.35 + avgInitialWater * 0.25) - avgInitialGreen * 0.4)
  );
  const postSustainIndex = Math.round(
    100 - ((avgFinalHeat * 0.3 + avgFinalFlood * 0.35 + avgFinalWater * 0.25) - avgFinalGreen * 0.4)
  );

  const giniBefore = calculateGini(initialBenefits);
  const giniAfter = calculateGini(finalBenefits);

  const createMetric = (before: number, after: number, isReductionImprovement: boolean = true): BeforeAfterMetric => {
    const deltaPct = before > 0
      ? Number((((after - before) / before) * 100).toFixed(1))
      : 0;
    const improved = isReductionImprovement ? after < before : after > before;
    return { before: Number(before.toFixed(1)), after: Number(after.toFixed(1)), deltaPct, improved };
  };

  return {
    overallSustainabilityIndex: {
      before: baseSustainIndex,
      after: postSustainIndex,
      deltaPct: baseSustainIndex > 0
        ? Number((((postSustainIndex - baseSustainIndex) / baseSustainIndex) * 100).toFixed(1))
        : 0,
      improved: postSustainIndex > baseSustainIndex
    },
    cityHeatRisk: createMetric(avgInitialHeat, avgFinalHeat, true),
    cityFloodRisk: createMetric(avgInitialFlood, avgFinalFlood, true),
    cityWaterStress: createMetric(avgInitialWater, avgFinalWater, true),
    cityGreenCoverPct: createMetric(avgInitialGreen, avgFinalGreen, false),
    equityGiniCoefficient: {
      before: Number(giniBefore.toFixed(3)),
      after: Number(giniAfter.toFixed(3)),
      deltaPct: giniBefore > 0
        ? Number((((giniAfter - giniBefore) / giniBefore) * 100).toFixed(1))
        : 0,
      improved: giniAfter < giniBefore
    }
  };
}

export function calculateGini(values: number[]): number {
  if (!Array.isArray(values) || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  let sumDiff = 0;
  let totalSum = 0;

  for (let i = 0; i < n; i++) {
    totalSum += sorted[i];
    for (let j = 0; j < n; j++) {
      sumDiff += Math.abs(sorted[i] - sorted[j]);
    }
  }

  if (totalSum === 0) return 0;
  return sumDiff / (2 * n * totalSum);
}

function createEmptyResult(
  wards: Neighbourhood[],
  budget: number,
  log: string[],
  timeMs: number
): OptimisationResult {
  return {
    allocations: [],
    rejectedAlternatives: [],
    totalCostCr: 0,
    remainingBudgetCr: Math.max(0, budget),
    budgetUtilizationPct: 0,
    overallSustainabilityIndex: { before: 48, after: 48, deltaPct: 0, improved: false },
    cityHeatRisk: { before: 62.1, after: 62.1, deltaPct: 0, improved: false },
    cityFloodRisk: { before: 65.0, after: 65.0, deltaPct: 0, improved: false },
    cityWaterStress: { before: 74.4, after: 74.4, deltaPct: 0, improved: false },
    cityGreenCoverPct: { before: 15.6, after: 15.6, deltaPct: 0, improved: false },
    equityGiniCoefficient: { before: 0.442, after: 0.442, deltaPct: 0, improved: false },
    auditLog: log,
    executionTimeMs: timeMs
  };
}
