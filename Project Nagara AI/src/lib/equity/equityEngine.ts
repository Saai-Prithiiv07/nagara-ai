import { Neighbourhood, AllocationItem } from '../../types';
import { calculateGini } from '../optimisation/engine';

export interface LorenzPoint {
  populationPct: number;
  equalityBenefitPct: number;
  actualBenefitPct: number;
}

export interface WardEquityProfile {
  wardId: string;
  wardName: string;
  population: number;
  populationPct: number;
  vulnerabilityScore: number;
  baselineCompositeRisk: number;
  allocatedBudgetCr: number;
  budgetSharePct: number;
  benefitReceivedScore: number;
  benefitSharePct: number;
  isUnderservedPriority: boolean;
  equityRatio: number; // budgetShare / populationShare
  status: 'Heavily Prioritised' | 'Equitably Funded' | 'Under-Allocated';
}

export function computeEquityAnalysis(
  wards: Neighbourhood[],
  allocations: AllocationItem[],
  totalBudgetCr: number
) {
  const totalPopulation = wards.reduce((acc, w) => acc + w.population, 0);

  // Map allocations by ward
  const wardBudgets: Record<string, number> = {};
  const wardBenefitPoints: Record<string, number> = {};

  wards.forEach(w => {
    wardBudgets[w.id] = 0;
    wardBenefitPoints[w.id] = 0;
  });

  allocations.forEach(a => {
    wardBudgets[a.wardId] = (wardBudgets[a.wardId] || 0) + a.costCr;
    // Benefit points derived from heat, flood, water, green impact
    const benefit =
      a.expectedImpact.heatReductionC * 12 +
      a.expectedImpact.floodMitigationPct * 1.8 +
      a.expectedImpact.waterSecurityMLD * 10 +
      a.expectedImpact.greenCoverGainPct * 5;
    wardBenefitPoints[a.wardId] = (wardBenefitPoints[a.wardId] || 0) + benefit;
  });

  const totalAllocated = Object.values(wardBudgets).reduce((a, b) => a + b, 0) || 1;
  const totalBenefit = Object.values(wardBenefitPoints).reduce((a, b) => a + b, 0) || 1;

  // Build individual ward profiles
  const profiles: WardEquityProfile[] = wards.map(w => {
    const popPct = Number(((w.population / totalPopulation) * 100).toFixed(1));
    const budget = wardBudgets[w.id] || 0;
    const budgetPct = Number(((budget / totalAllocated) * 100).toFixed(1));
    const benefitScore = wardBenefitPoints[w.id] || 0;
    const benefitPct = Number(((benefitScore / totalBenefit) * 100).toFixed(1));
    const equityRatio = Number((budgetPct / (popPct || 1)).toFixed(2));

    const baselineRisk = Number(
      ((w.baselineHeatRisk * 0.3 + w.baselineFloodRisk * 0.35 + w.baselineWaterStress * 0.35)).toFixed(1)
    );

    // Wards with high socio-economic vulnerability (> 60) and high risk (> 65) are underserved
    const isUnderserved = w.socioEconomicVulnerability >= 60 && baselineRisk >= 65;

    let status: WardEquityProfile['status'] = 'Equitably Funded';
    if (equityRatio >= 1.35) {
      status = 'Heavily Prioritised';
    } else if (equityRatio < 0.7) {
      status = 'Under-Allocated';
    }

    return {
      wardId: w.id,
      wardName: w.name,
      population: w.population,
      populationPct: popPct,
      vulnerabilityScore: w.socioEconomicVulnerability,
      baselineCompositeRisk: baselineRisk,
      allocatedBudgetCr: Number(budget.toFixed(2)),
      budgetSharePct: budgetPct,
      benefitReceivedScore: Number(benefitScore.toFixed(1)),
      benefitSharePct: benefitPct,
      isUnderservedPriority: isUnderserved,
      equityRatio,
      status
    };
  });

  // Calculate Lorenz Curve
  // Sort wards by benefit per capita ascending
  const sortedWards = [...profiles].sort(
    (a, b) => (a.benefitReceivedScore / (a.population || 1)) - (b.benefitReceivedScore / (b.population || 1))
  );

  const lorenzPoints: LorenzPoint[] = [
    { populationPct: 0, equalityBenefitPct: 0, actualBenefitPct: 0 }
  ];

  let cumPop = 0;
  let cumBenefit = 0;

  sortedWards.forEach(w => {
    cumPop += (w.population / totalPopulation) * 100;
    cumBenefit += w.benefitSharePct;
    lorenzPoints.push({
      populationPct: Number(cumPop.toFixed(1)),
      equalityBenefitPct: Number(cumPop.toFixed(1)),
      actualBenefitPct: Number(Math.min(100, cumBenefit).toFixed(1))
    });
  });

  // Compute Gini Coefficient across wards
  const benefitValues = profiles.map(p => p.benefitReceivedScore + 1); // +1 baseline smoothing
  const gini = calculateGini(benefitValues);

  // Underserved high-risk wards needing priority attention
  const underservedWards = profiles.filter(p => p.isUnderservedPriority);

  return {
    profiles,
    lorenzPoints,
    giniCoefficient: Number(gini.toFixed(3)),
    underservedWards,
    totalAllocatedCr: Number(totalAllocated.toFixed(2)),
    equityFairnessRating: gini < 0.28 ? 'Highly Equitable' : gini < 0.42 ? 'Moderately Balanced' : 'Spatially Skewed'
  };
}
