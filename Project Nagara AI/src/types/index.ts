export interface Neighbourhood {
  id: string;
  name: string;
  zone: string;
  wardNumber: number;
  areaKm2: number;
  population: number;
  vulnerablePopulationPct: number; // Low-income, informal housing, elderly %
  baselineHeatRisk: number; // 0-100
  baselineFloodRisk: number; // 0-100
  baselineWaterStress: number; // 0-100
  baselineGreenCoverPct: number; // % (0-100)
  socioEconomicVulnerability: number; // 0-100
  avgSurfaceTempC: number;
  coordinates: [number, number]; // [lat, lng]
  polygonBoundary: [number, number][]; // LatLng polygon coordinates
  keyLandmarks: string[];
  primaryVulnerabilityNote: string;
}

export type InterventionType = 'urban-forest' | 'green-roof' | 'rainwater-harvest' | 'drainage-sponge';

export interface InterventionDefinition {
  id: InterventionType;
  name: string;
  category: 'Green Infrastructure' | 'Building Retrofit' | 'Water Resilience' | 'Civil Drainage';
  unitCostCr: number; // In ₹ Crores
  unitName: string;
  description: string;
  coBenefits: string[];
  implementationMonths: number;
  suitabilityScore: (ward: Neighbourhood) => number; // 0 to 1
  impactPerUnit: {
    heatReductionC: number; // Localized temp drop
    floodMitigationPct: number; // % reduction in waterlogging volume
    waterSecurityMLD: number; // Million Litres per Day recharged or saved
    greenCoverGainPct: number; // % gain in ward tree canopy
  };
  maxUnitsPerWard: number;
}

export interface BudgetConfig {
  totalBudgetCr: number;
  equityWeight: number; // 0 (pure cost-efficiency) to 1 (Rawlsian priority to most vulnerable)
  activeInterventions: InterventionType[];
  riskFocus: 'balanced' | 'heat' | 'flood' | 'water';
}

export type ScenarioPreset = 'baseline' | 'extreme-monsoon' | 'severe-drought' | 'urban-heatwave' | 'fiscal-austerity';

export interface ScenarioParams {
  id: ScenarioPreset;
  name: string;
  tagline: string;
  description: string;
  rainfallMultiplier: number; // e.g. 2.2 for extreme monsoon
  heatMultiplier: number; // e.g. 1.35 for heatwave
  waterStressMultiplier: number; // e.g. 1.8 for drought
  budgetMultiplier: number; // e.g. 0.6 for austerity
}

export interface AllocationItem {
  id: string;
  wardId: string;
  wardName: string;
  interventionId: InterventionType;
  interventionName: string;
  units: number;
  costCr: number;
  marginalBenefitScore: number;
  expectedImpact: {
    heatReductionC: number;
    floodMitigationPct: number;
    waterSecurityMLD: number;
    greenCoverGainPct: number;
  };
  selectionReason: string;
}

export interface RejectedAlternative {
  wardId: string;
  wardName: string;
  interventionId: InterventionType;
  interventionName: string;
  reason: 'Budget Exceeded' | 'Ward Capacity Reached' | 'Low Suitability' | 'Superseded by Higher Equity/Benefit Option';
  deficitCostCr?: number;
  scoreComparison: string;
}

export interface BeforeAfterMetric {
  before: number;
  after: number;
  deltaPct: number;
  improved: boolean;
}

export interface OptimisationResult {
  allocations: AllocationItem[];
  rejectedAlternatives: RejectedAlternative[];
  totalCostCr: number;
  remainingBudgetCr: number;
  budgetUtilizationPct: number;
  overallSustainabilityIndex: BeforeAfterMetric;
  cityHeatRisk: BeforeAfterMetric;
  cityFloodRisk: BeforeAfterMetric;
  cityWaterStress: BeforeAfterMetric;
  cityGreenCoverPct: BeforeAfterMetric;
  equityGiniCoefficient: BeforeAfterMetric; // 0 (perfect equality) to 1 (max inequality)
  auditLog: string[];
  executionTimeMs: number;
}
