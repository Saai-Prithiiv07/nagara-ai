import { ScenarioParams, ScenarioPreset } from '../../types';

export const SCENARIO_PRESETS: Record<ScenarioPreset, ScenarioParams> = {
  baseline: {
    id: 'baseline',
    name: 'Normal Monsoonal Baseline',
    tagline: 'Historical 10-year seasonal average precipitation and temperature cycles.',
    description: 'Models current municipal baseline conditions with average 986mm annual rainfall, typical 34°C pre-monsoon peak heat, and standard 100% municipal budget ceiling.',
    rainfallMultiplier: 1.0,
    heatMultiplier: 1.0,
    waterStressMultiplier: 1.0,
    budgetMultiplier: 1.0
  },
  'extreme-monsoon': {
    id: 'extreme-monsoon',
    name: 'Extreme Monsoonal Cloudburst',
    tagline: '+180% short-duration intense deluge event (120mm in 2 hours).',
    description: 'Simulates severe localized convective cloudburst breaching lake cascading networks. Flood risks escalate aggressively in Koramangala, Bellandur, and KR Puram, testing sponge retention resilience.',
    rainfallMultiplier: 2.2,
    heatMultiplier: 0.9,
    waterStressMultiplier: 0.65,
    budgetMultiplier: 1.0
  },
  'severe-drought': {
    id: 'severe-drought',
    name: 'Severe El Niño Summer Drought',
    tagline: 'Consecutive deficient monsoon rains and deep groundwater table collapse.',
    description: 'Borewells run dry past 1,400 ft across peripheral tech corridors like Whitefield and Electronic City. Tanker spot prices triple, elevating priority for immediate rainwater aquifer injection.',
    rainfallMultiplier: 0.45,
    heatMultiplier: 1.25,
    waterStressMultiplier: 1.85,
    budgetMultiplier: 1.0
  },
  'urban-heatwave': {
    id: 'urban-heatwave',
    name: 'Urban Heat Island Surge (+4.5°C)',
    tagline: 'Prolonged dry heat dome exacerbating thermal stress in unshaded corridors.',
    description: 'Asphalt and concrete surface temperatures soar above 42°C in Peenya and Shivajinagar. Elevates mortality vulnerability for outdoor workers, heavily weighting Miyawaki forests and biosolar green roofs.',
    rainfallMultiplier: 0.8,
    heatMultiplier: 1.45,
    waterStressMultiplier: 1.35,
    budgetMultiplier: 1.0
  },
  'fiscal-austerity': {
    id: 'fiscal-austerity',
    name: 'Municipal Fiscal Austerity (-40% Budget)',
    tagline: 'Constrained municipal capital expenditure requiring surgical resource targeting.',
    description: 'Budget ceiling dropped by 40% due to macroeconomic tightening. Decision engine must identify hyper-critical interventions delivering maximum marginal life-safety benefits per rupee.',
    rainfallMultiplier: 1.0,
    heatMultiplier: 1.0,
    waterStressMultiplier: 1.0,
    budgetMultiplier: 0.6
  }
};
