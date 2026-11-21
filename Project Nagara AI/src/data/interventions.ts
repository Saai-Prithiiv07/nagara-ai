import { InterventionDefinition, Neighbourhood } from '../types';

export const INTERVENTIONS: InterventionDefinition[] = [
  {
    id: 'urban-forest',
    name: 'Miyawaki Urban Pocket Forests',
    category: 'Green Infrastructure',
    unitCostCr: 0.45, // ₹45 Lakhs per 0.5 hectare dense cluster
    unitName: '0.5 Hectare Forest Pocket (1,200 native saplings)',
    description: 'High-density native multi-tiered afforestation engineered for microclimate temperature cooling, biological diversity, and topsoil percolation.',
    coBenefits: [
      'Micro-climate cooling of up to 2.8°C within 300m radius',
      'Ambient particulate matter PM2.5 filtration',
      'Bird and pollinator habitat corridor restoration',
      'Community psychological wellbeing index improvement'
    ],
    implementationMonths: 6,
    maxUnitsPerWard: 6,
    suitabilityScore: (ward: Neighbourhood) => {
      // High heat risk and low green cover wards have prime suitability
      const heatFactor = ward.baselineHeatRisk / 100;
      const spaceFactor = Math.min(1, ward.areaKm2 / 8);
      const needFactor = (100 - ward.baselineGreenCoverPct) / 100;
      return Math.min(1, (heatFactor * 0.45 + spaceFactor * 0.25 + needFactor * 0.3));
    },
    impactPerUnit: {
      heatReductionC: 1.8,
      floodMitigationPct: 3.2,
      waterSecurityMLD: 0.4,
      greenCoverGainPct: 3.8
    }
  },
  {
    id: 'green-roof',
    name: 'Cool & Biosolar Green Roof Retrofits',
    category: 'Building Retrofit',
    unitCostCr: 0.28, // ₹28 Lakhs per 2,500 m² public/commercial rooftop
    unitName: '2,500 m² Vegetative & High-Albedo Membrane Retrofit',
    description: 'Extensive sedum and drought-tolerant succulent vegetation installed over high-reflectance insulation membranes on civic and institutional roofs.',
    coBenefits: [
      'Internal building cooling energy reduction by 22%',
      'Rainfall retention peak lag of 45 minutes during cloudbursts',
      'Solar PV panel thermal efficiency enhancement by 8-12%',
      'Extension of roof structural waterproofing lifespan'
    ],
    implementationMonths: 4,
    maxUnitsPerWard: 8,
    suitabilityScore: (ward: Neighbourhood) => {
      // High population density & high heat benefit most from roof space
      const density = ward.population / (ward.areaKm2 || 1);
      const densityFactor = Math.min(1, density / 25000);
      const heatFactor = ward.baselineHeatRisk / 100;
      return Math.min(1, densityFactor * 0.5 + heatFactor * 0.5);
    },
    impactPerUnit: {
      heatReductionC: 1.2,
      floodMitigationPct: 4.5,
      waterSecurityMLD: 0.2,
      greenCoverGainPct: 1.4
    }
  },
  {
    id: 'rainwater-harvest',
    name: 'Ward Rainwater Harvesting & Recharge Wells',
    category: 'Water Resilience',
    unitCostCr: 0.35, // ₹35 Lakhs per 50 deep recharge injection wells + telemetry
    unitName: '50-Well Recharge Cluster & Silt Catchment System',
    description: 'Public percolation wells tapping shallow aquifers connected to rooftop runoffs and filtration chambers to stem tanker dependence.',
    coBenefits: [
      'Replenishment of unconfined aquifers across a 1.2 km² radius',
      'Immediate reduction in private commercial tanker expenditure',
      'Reduction of street waterlogging by intercepting rooftop flow',
      'Zero continuous energy requirement for aquifer storage'
    ],
    implementationMonths: 5,
    maxUnitsPerWard: 7,
    suitabilityScore: (ward: Neighbourhood) => {
      const waterFactor = ward.baselineWaterStress / 100;
      const floodFactor = ward.baselineFloodRisk / 100;
      return Math.min(1, waterFactor * 0.7 + floodFactor * 0.3);
    },
    impactPerUnit: {
      heatReductionC: 0.4,
      floodMitigationPct: 6.8,
      waterSecurityMLD: 1.8,
      greenCoverGainPct: 0.5
    }
  },
  {
    id: 'drainage-sponge',
    name: 'Bioswale & Sponge City Drainage Modernisation',
    category: 'Civil Drainage',
    unitCostCr: 0.65, // ₹65 Lakhs per 1.5 km bioswale corridor
    unitName: '1.5 km Permeable Bioswale & Retention Trench',
    description: 'Replacement of impermeable concrete curbs with bio-engineered vegetated channels, gravel percolation beds, and flow-attenuation retention cells.',
    coBenefits: [
      'Elimination of flash street inundation along primary mobility corridors',
      'Sediment and heavy metal runoff filtration before lake entry',
      'Recharge of roadside soil moisture sustaining street shade trees',
      'Significant reduction in monsoon vector-borne epidemic vectors'
    ],
    implementationMonths: 8,
    maxUnitsPerWard: 5,
    suitabilityScore: (ward: Neighbourhood) => {
      const floodFactor = ward.baselineFloodRisk / 100;
      const vulnFactor = ward.socioEconomicVulnerability / 100;
      return Math.min(1, floodFactor * 0.7 + vulnFactor * 0.3);
    },
    impactPerUnit: {
      heatReductionC: 0.6,
      floodMitigationPct: 14.5,
      waterSecurityMLD: 1.1,
      greenCoverGainPct: 2.1
    }
  }
];
