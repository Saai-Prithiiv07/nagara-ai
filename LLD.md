# Low-Level Design Document (LLD)

## Project Name: NAGARA AI – Urban Sustainability Decision Engine
**Target Deployment:** AWS Amplify Hosting  
**Repository:** Saai-Prithiiv07/nagara-ai  
**Document Version:** 1.0.0  
**Status:** Assessor Review Ready (Technical Project Viva)  

---

## 1. Document Overview & Codebase Architecture

This Low-Level Design (LLD) document provides a comprehensive code-level specification of the **NAGARA AI Decision Engine**. It details every core data structure, algorithm implementation, component hierarchy, function signature, state lifecycle, and automated test suite contained within the actual project codebase.

### 1.1 Complete Project Directory Tree

```
E:\Reva University AWS Hackathon\Project Nagara AI\
├── .gitignore
├── .oxlintrc.json                         # Fast Oxlint configuration
├── index.html                             # Single Page Application HTML entry
├── package.json                           # Dependencies & run scripts
├── package-lock.json                      # Pinned dependency lockfile
├── tsconfig.json                          # Base TypeScript configuration
├── tsconfig.app.json                      # Application TypeScript compiler rules
├── tsconfig.node.json                     # Vite/Node tooling TypeScript config
├── vite.config.ts                         # Vite 8 build & Tailwind plugin config
├── public/
│   ├── favicon.svg                        # NAGARA AI brand icon
│   └── icons.svg                          # Reusable SVG symbol definitions
└── src/
    ├── main.tsx                           # React 19 bootstrap entry point
    ├── App.tsx                            # Root application controller & state orchestrator
    ├── App.css                            # Global styles & layout helpers
    ├── index.css                          # Tailwind CSS v4 styling & dark theme tokens
    ├── assets/
    │   ├── hero.png                       # High-resolution urban backdrop asset
    │   ├── react.svg                      # React logo asset
    │   └── vite.svg                       # Vite logo asset
    ├── types/
    │   └── index.ts                       # Complete domain TypeScript type definitions
    ├── data/
    │   ├── neighbourhoods.ts              # 10 Greater Bengaluru municipal ward definitions
    │   └── interventions.ts               # 4 standardized nature-based interventions catalog
    ├── lib/
    │   ├── optimisation/
    │   │   ├── engine.ts                  # Greedy marginal-utility knapsack algorithm
    │   │   ├── ALGORITHM.md               # Mathematical formulation documentation
    │   │   └── __tests__/
    │   │       └── engine.test.ts         # 16 Vitest unit tests verifying constraints & edge cases
    │   ├── equity/
    │   │   └── equityEngine.ts            # Rawlsian equity, Lorenz curve & Gini calculations
    │   └── scenarios/
    │       └── scenarioEngine.ts          # 5 climate/fiscal scenario presets & multiplier logic
    ├── components/
    │   ├── AnimatedCounter.tsx            # Smooth numeric spring counter animation
    │   ├── City3DCanvas.tsx               # Three.js WebGL 3D procedural city engine
    │   ├── HeroSection.tsx                # Hero banner with canvas particle mist & quick CTA
    │   ├── Navigation.tsx                 # Responsive header, scenario badge & navigation tabs
    │   └── ReportModal.tsx                # Official Executive Decision Dossier (Print-to-PDF)
    └── pages/
        ├── OverviewDashboard.tsx          # Citywide KPIs, radar charts & ward highlights
        ├── DigitalTwinMap.tsx             # React-Leaflet 2D GIS map with polygon choropleths
        ├── SustainabilityPlanner.tsx      # Budget sliders, live metrics & audit log
        ├── ScenarioLab.tsx                # Dynamic climate/budget stress-testing lab
        ├── EquityAnalysis.tsx             # Lorenz curve, Gini coefficient & ward equity table
        └── Recommendations.tsx            # 3-tier delivery roadmap, trade-offs & CSV export
```

---

## 2. Core Data Contracts & Type Definitions (`src/types/index.ts`)

The codebase enforces strict, compile-time type safety across all domain models:

```typescript
// 1. Municipal Ward Model
export interface Neighbourhood {
  id: string;                               // Unique ward identifier, e.g., 'ward-peenya'
  name: string;                             // Display name, e.g., 'Peenya Industrial Area'
  zone: string;                             // BBMP municipal zone, e.g., 'Dasarahalli Zone'
  wardNumber: number;                       // Official municipal ward number
  areaKm2: number;                          // Ward geographic surface area in square kilometers
  population: number;                       // Total resident population count
  vulnerablePopulationPct: number;          // Low-income, informal housing, elderly %
  baselineHeatRisk: number;                 // Normalized Urban Heat Island index (0 - 100)
  baselineFloodRisk: number;                // Normalized Flash Flood risk index (0 - 100)
  baselineWaterStress: number;              // Normalized Aquifer Depletion index (0 - 100)
  baselineGreenCoverPct: number;            // Current tree canopy coverage % (0 - 100)
  socioEconomicVulnerability: number;       // Composite socio-economic vulnerability (0 - 100)
  avgSurfaceTempC: number;                  // Average pre-monsoon peak surface temperature (°C)
  coordinates: [number, number];            // Ward centroid latitude and longitude [lat, lng]
  polygonBoundary: [number, number][];      // Array of lat/lng pairs forming the polygon
  keyLandmarks: string[];                   // Prominent municipal landmarks for search indexing
  primaryVulnerabilityNote: string;         // Descriptive civic vulnerability diagnosis
}

// 2. Intervention Catalog Types
export type InterventionType = 
  | 'urban-forest' 
  | 'green-roof' 
  | 'rainwater-harvest' 
  | 'drainage-sponge';

export interface InterventionDefinition {
  id: InterventionType;
  name: string;
  category: 'Green Infrastructure' | 'Building Retrofit' | 'Water Resilience' | 'Civil Drainage';
  unitCostCr: number;                       // Unit procurement cost in ₹ Crores
  unitName: string;                         // Standardized unit specification
  description: string;
  coBenefits: string[];                     // Array of secondary ecological/social benefits
  implementationMonths: number;             // Standard construction/planting duration
  suitabilityScore: (ward: Neighbourhood) => number; // Ward suitability function returning [0, 1]
  impactPerUnit: {
    heatReductionC: number;                 // Microclimate temperature reduction (°C)
    floodMitigationPct: number;             // Reduction in street waterlogging volume (%)
    waterSecurityMLD: number;               // Aquifer recharge in Million Litres per Day (MLD)
    greenCoverGainPct: number;              // Percentage gain in ward tree canopy (%)
  };
  maxUnitsPerWard: number;                  // Physical spatial saturation limit per ward
}

// 3. User Configuration & Scenario Parameters
export interface BudgetConfig {
  totalBudgetCr: number;                    // Total planning CapEx budget in ₹ Crores (e.g. 25)
  equityWeight: number;                     // Slider: 0 (utilitarian) to 1 (Rawlsian priority)
  activeInterventions: InterventionType[];  // Interventions enabled by the user
  riskFocus: 'balanced' | 'heat' | 'flood' | 'water'; // Prioritized hazard category
}

export type ScenarioPreset = 
  | 'baseline' 
  | 'extreme-monsoon' 
  | 'severe-drought' 
  | 'urban-heatwave' 
  | 'fiscal-austerity';

export interface ScenarioParams {
  id: ScenarioPreset;
  name: string;
  tagline: string;
  description: string;
  rainfallMultiplier: number;               // Multiplier for monsoon precipitation (e.g. 2.2)
  heatMultiplier: number;                   // Multiplier for surface thermal stress (e.g. 1.45)
  waterStressMultiplier: number;            // Multiplier for aquifer stress (e.g. 1.85)
  budgetMultiplier: number;                 // Multiplier for capital budget ceiling (e.g. 0.6)
}

// 4. Decision Engine Results
export interface AllocationItem {
  id: string;                               // Unique allocation key: 'alloc-{wardId}-{interventionId}'
  wardId: string;
  wardName: string;
  interventionId: InterventionType;
  interventionName: string;
  units: number;                            // Discrete integer count of units funded
  costCr: number;                           // Cumulative cost in ₹ Crores
  marginalBenefitScore: number;             // Equity-adjusted marginal score at selection
  expectedImpact: {
    heatReductionC: number;
    floodMitigationPct: number;
    waterSecurityMLD: number;
    greenCoverGainPct: number;
  };
  selectionReason: string;                  // Plain-text auditable justification
}

export interface RejectedAlternative {
  wardId: string;
  wardName: string;
  interventionId: InterventionType;
  interventionName: string;
  reason: 'Budget Exceeded' | 'Ward Capacity Reached' | 'Low Suitability' | 'Superseded by Higher Equity/Benefit Option';
  deficitCostCr?: number;                   // Deficit amount if budget was exceeded
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
  totalCostCr: number;                      // Actual sum of all allocated capital in ₹ Crores
  remainingBudgetCr: number;                // Unallocated residual budget in ₹ Crores
  budgetUtilizationPct: number;             // Percentage of effective budget deployed
  overallSustainabilityIndex: BeforeAfterMetric;
  cityHeatRisk: BeforeAfterMetric;
  cityFloodRisk: BeforeAfterMetric;
  cityWaterStress: BeforeAfterMetric;
  cityGreenCoverPct: BeforeAfterMetric;
  equityGiniCoefficient: BeforeAfterMetric; // Spatial Gini coefficient (0: equality, 1: inequality)
  auditLog: string[];                       // Step-by-step sequential ledger of engine actions
  executionTimeMs: number;                  // Execution duration in milliseconds
}
```

---

## 3. Mathematical Optimization Engine (`src/lib/optimisation/engine.ts`)

### 3.1 Algorithmic Formulation & Step-by-Step Logic
The optimization engine implements a **Multi-Attribute Greedy Marginal-Utility Heuristic with Pareto-Equity Weighting**.

```mermaid
flowchart TD
    Start([Start: runOptimisationEngine]) --> Sanitize[Sanitize Inputs: Clamping Budget >= 0, Equity in 0..1, Multipliers]
    Sanitize --> CheckEmpty{Valid Wards & Budget > 0?}
    CheckEmpty -- No --> EmptyResult[Return Empty Result with Audit Log & Exit]
    CheckEmpty -- Yes --> InitStates[Initialize In-Memory Ward Scenario States]
    
    InitStates --> CalibrateWeights[Calibrate Scenario-Dynamic Hazard Weights: wFlood, wHeat, wWater, wGreen]
    CalibrateWeights --> LoopStart{Remaining Budget >= Min Cost & Iterations < 150?}
    
    LoopStart -- No --> Finalize[Compute Rejected Alternatives & Aggregate Before/After Metrics]
    LoopStart -- Yes --> FindCandidates[Iterate over all Safe Wards x Active Interventions]
    
    FindCandidates --> CheckFeasibility{Intervention Cost <= Remaining Budget AND Current Units < Max Capacity AND Suitability >= 0.15?}
    CheckFeasibility -- No --> SkipCandidate[Skip Intervention]
    CheckFeasibility -- Yes --> ComputeScore[Compute Raw Benefit * Damping Factor * Equity Multiplier]
    ComputeScore --> ComputeROI[Marginal ROI = Equity Adjusted Score / Unit Cost]
    ComputeROI --> PushCandidate[Add Candidate to Eligible Candidates Pool]
    
    PushCandidate --> CheckPool{Eligible Candidates Found?}
    CheckPool -- No --> Finalize
    CheckPool -- Yes --> SortPool[Sort Candidates: 1. Marginal ROI Desc, 2. Score Desc, 3. WardId+InterventionId Asc]
    
    SortPool --> SelectBest[Select Top Candidate (Index 0)]
    SelectBest --> CommitAllocation[Allocate 1 Unit, Deduct Unit Cost from Budget, Update Ward Impact Metrics]
    CommitAllocation --> LogAudit[Append Action to Audit Log]
    LogAudit --> LoopStart
    
    Finalize --> Done([Return OptimisationResult Object])
```

### 3.2 Core Function Implementations

#### Function: `runOptimisationEngine(wards, config, scenario): OptimisationResult`
* **File:** `src/lib/optimisation/engine.ts` (Lines 14–362)
* **Parameters:**
  * `wards: Neighbourhood[]` (default: `NEIGHBOURHOODS`)
  * `config?: BudgetConfig` (default: ₹25 Cr, equity 0.5, balanced focus)
  * `scenario?: ScenarioParams` (default: Baseline 1.0 multipliers)
* **Execution Lifecycle:**
  1. **Sanitization:** Validates ward arrays; clamps budget to $\ge 0$, equity weight to $[0, 1]$, and scenario multipliers to $[0.05, 10.0]$.
  2. **Scenario Hazard Weight Calibration:** Dynamically skews hazard importance based on climate intensity:
     $$\tilde{w}_F = w_{F, 0} \cdot \gamma_{\text{rain}}^{1.4}, \quad \tilde{w}_W = w_{W, 0} \cdot \gamma_{\text{water}}^{1.4}, \quad \tilde{w}_H = w_{H, 0} \cdot \gamma_{\text{heat}}^{1.3}$$
     Normalized such that $w_H + w_F + w_W + w_G = 1.0$.
  3. **Greedy Knapsack Loop:** At each cycle, evaluates all permutations of $(w \in W, i \in I)$.
     * **Raw Environmental Benefit:**
       $$B_{\text{raw}}(i, w) = \left( w_H \cdot \Delta H_{i, w} + w_F \cdot \Delta F_{i, w} + w_W \cdot \Delta W_{i, w} + w_G \cdot \Delta G_i \right) \cdot \text{Suitability}(i, w)$$
     * **Diminishing Marginal Returns:**
       $$\delta(k_{i, w}) = \frac{1}{1 + 0.25 \cdot k_{i, w}}$$
     * **Rawlsian Equity Amplification:**
       $$\Omega_{\text{equity}}(w, \alpha) = (1 - \alpha) \cdot 1.0 + \alpha \cdot \max\left(0.3, \frac{\text{Vulnerability}_w}{50}\right)$$
     * **Cost-Effectiveness Ratio:**
       $$\rho(i, w) = \frac{B_{\text{raw}} \cdot \delta \cdot \Omega}{\text{Cost}_{\text{unit}}(i)}$$
  4. **Deterministic Tie-Breaking:**
     ```typescript
     eligibleCandidates.sort((a, b) => {
       const diffRoi = b.marginalRoi - a.marginalRoi;
       if (Math.abs(diffRoi) > 0.0001) return diffRoi;
       const diffEquity = b.equityAdjustedScore - a.equityAdjustedScore;
       if (Math.abs(diffEquity) > 0.0001) return diffEquity;
       return (a.wardId + a.intervention.id).localeCompare(b.wardId + b.intervention.id);
     });
     ```
  5. **State Update:** Decrements `remainingBudgetCr`, increments `allocatedUnits`, dampens ward heat/flood/water risk scores, and logs the transaction.
  6. **Rejected Alternatives Generation:** Iterates through unallocated intervention-ward combinations to document why each was not selected (*Budget Exceeded*, *Low Suitability*, or *Superseded by Higher Equity/Benefit Option*).

#### Function: `calculateGini(values: number[]): number`
* **File:** `src/lib/optimisation/engine.ts` (Lines 456–472)
* **Mathematical Definition:**
  $$G = \frac{\sum_{i=1}^n \sum_{j=1}^n |x_i - x_j|}{2n \sum_{i=1}^n x_i}$$
* **Implementation:**
  ```typescript
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
  ```

---

## 4. Equity Analysis & Spatial Justice Engine (`src/lib/equity/equityEngine.ts`)

### 4.1 Lorenz Curve & Per-Capita Equity Formulation
The equity engine evaluates whether municipal capital disproportionately clusters in privileged wards or reaches socially vulnerable, infrastructure-poor communities.

* **Function:** `computeEquityAnalysis(wards, allocations, totalBudgetCr)`
* **Data Flow:**
  1. Aggregates total capital expenditure and composite ecological benefit points delivered to each ward.
  2. Computes the **Equity Ratio** for every ward:
     $$\text{EquityRatio}_w = \frac{\text{BudgetSharePct}_w}{\text{PopulationSharePct}_w}$$
  3. Classifies wards into civic status tiers:
     * $\text{EquityRatio} \ge 1.35 \implies$ **Heavily Prioritised**
     * $0.70 \le \text{EquityRatio} < 1.35 \implies$ **Equitably Funded**
     * $\text{EquityRatio} < 0.70 \implies$ **Under-Allocated**
  4. Generates discrete **Lorenz Curve points** by sorting wards by benefit per capita ascending and tracking cumulative population percentage against cumulative benefit share percentage.
  5. Evaluates overall spatial justice fairness:
     * $G < 0.28 \implies$ **Highly Equitable**
     * $0.28 \le G \le 0.42 \implies$ **Moderately Balanced**
     * $G > 0.42 \implies$ **Spatially Skewed**

---

## 5. Domain Datasets & Calibration Specifications (`src/data/`)

### 5.1 Nature-Based Interventions Catalog (`src/data/interventions.ts`)
Each intervention is calibrated with real-world municipal CapEx benchmarks:

1. **Miyawaki Urban Pocket Forests (`urban-forest`)**
   * *Unit Cost:* ₹0.45 Cr per 0.5 ha cluster (1,200 native saplings). Max units: 6/ward.
   * *Suitability Formulation:*
     $$\text{Score}(w) = \min\left(1, 0.45 \cdot \frac{\text{HeatRisk}_w}{100} + 0.25 \cdot \min\left(1, \frac{\text{Area}_w}{8}\right) + 0.30 \cdot \frac{100 - \text{GreenCover}_w}{100}\right)$$
2. **Cool & Biosolar Green Roof Retrofits (`green-roof`)**
   * *Unit Cost:* ₹0.28 Cr per 2,500 m² vegetative and high-albedo membrane. Max units: 8/ward.
   * *Suitability Formulation:*
     $$\text{Score}(w) = \min\left(1, 0.50 \cdot \min\left(1, \frac{\text{Density}_w}{25000}\right) + 0.50 \cdot \frac{\text{HeatRisk}_w}{100}\right)$$
3. **Ward Rainwater Harvesting & Recharge Wells (`rainwater-harvest`)**
   * *Unit Cost:* ₹0.35 Cr per 50-well deep injection cluster. Max units: 7/ward.
   * *Suitability Formulation:*
     $$\text{Score}(w) = \min\left(1, 0.70 \cdot \frac{\text{WaterStress}_w}{100} + 0.30 \cdot \frac{\text{FloodRisk}_w}{100}\right)$$
4. **Bioswale & Sponge City Drainage Modernisation (`drainage-sponge`)**
   * *Unit Cost:* ₹0.65 Cr per 1.5 km vegetated permeable trench. Max units: 5/ward.
   * *Suitability Formulation:*
     $$\text{Score}(w) = \min\left(1, 0.70 \cdot \frac{\text{FloodRisk}_w}{100} + 0.30 \cdot \frac{\text{Vulnerability}_w}{100}\right)$$

### 5.2 Bengaluru Ward Spatial & Demographic Dataset (`src/data/neighbourhoods.ts`)
Includes 10 wards with exact polygon boundary coordinates for GIS rendering:
* `ward-peenya` (Ward 41, Dasarahalli Zone, Area: 14.2 km², Pop: 185k, Heat: 88, Flood: 42, Water: 78, Green: 7.2%, Vuln: 82)
* `ward-koramangala` (Ward 151, South Zone, Area: 8.6 km², Pop: 142k, Heat: 52, Flood: 89, Water: 64, Green: 18.5%, Vuln: 38)
* `ward-shivajinagar` (Ward 91, East Zone, Area: 5.4 km², Pop: 168k, Heat: 79, Flood: 68, Water: 85, Green: 5.1%, Vuln: 86)
* `ward-bellandur` (Ward 150, Mahadevapura Zone, Area: 19.8 km², Pop: 210k, Heat: 58, Flood: 84, Water: 82, Green: 12.4%, Vuln: 44)
* `ward-whitefield` (Ward 84, Mahadevapura Zone, Area: 16.5 km², Pop: 195k, Heat: 64, Flood: 45, Water: 91, Green: 14.1%, Vuln: 41)
* `ward-jayanagar` (Ward 153, South Zone, Area: 7.8 km², Pop: 125k, Heat: 38, Flood: 35, Water: 46, Green: 34.2%, Vuln: 22)
* `ward-yelahanka` (Ward 4, Yelahanka Zone, Area: 18.2 km², Pop: 135k, Heat: 45, Flood: 72, Water: 61, Green: 22.8%, Vuln: 49)
* `ward-krpuram` (Ward 52, K.R. Puram Zone, Area: 12.1 km², Pop: 178k, Heat: 72, Flood: 76, Water: 79, Green: 9.8%, Vuln: 79)
* `ward-ecity` (Ward 174, Bommanahalli Zone, Area: 11.4 km², Pop: 110k, Heat: 61, Flood: 39, Water: 88, Green: 16.2%, Vuln: 36)
* `ward-malleshwaram` (Ward 45, West Zone, Area: 6.2 km², Pop: 132k, Heat: 54, Flood: 48, Water: 58, Green: 21.0%, Vuln: 31)

---

## 6. Frontend Component Architecture & Lifecycle Specifications

### 6.1 Root Application Controller (`src/App.tsx`)
* **State Management:**
  * `showHero: boolean`: Toggles between initial hero introduction and primary analytical views.
  * `activeTab: TabType`: Controls active view (`'overview' | 'map' | 'planner' | 'scenarios' | 'equity' | 'recommendations'`).
  * `selectedWardId: string | null`: Tracks active ward focus across map, 3D canvas, and telemetry cards.
  * `budgetConfig: BudgetConfig`: Synchronized with browser `localStorage` (`nagara_ai_budget_v1`, `nagara_ai_equity_v1`).
  * `activeScenarioParams: ScenarioParams`: Active climate scenario parameters.
* **Reactive Engine Memoization:**
  ```typescript
  const optimisationResult: OptimisationResult = useMemo(() => {
    return runOptimisationEngine(NEIGHBOURHOODS, budgetConfig, activeScenarioParams);
  }, [budgetConfig, activeScenarioParams]);
  ```
  Whenever the user adjusts the budget slider, switches an active intervention, or selects a scenario preset, React immediately re-executes `runOptimisationEngine()` without blocking the main UI thread.

### 6.2 3D WebGL Digital Twin Engine (`src/components/City3DCanvas.tsx`)
* **WebGL Initialization:**
  * Mounts a Three.js `WebGLRenderer` (with antialiasing, high performance power preference, and alpha blending).
  * Creates an exponential distance fog (`THREE.FogExp2(0x050d0a, 0.015)`) matching the dark green municipal theme.
  * Builds a procedural city grid consisting of 60+ extruded building meshes with variable heights, emissive wireframe window edges, and arterial roads.
* **Particle Subsystems:**
  * *Thermal Plumes:* Upward-drifting reddish-orange particles with sine-wave horizontal flutter.
  * *Cooling Mist:* Gentle, expansive emerald mist particles hovering above vegetated zones.
  * *Monsoon Rainfall:* High-velocity downward rain streaks (`THREE.Points`) with randomized resets.
* **Camera Animation:** Uses vector linear interpolation (`lerp`) inside the `requestAnimationFrame` loop to glide the camera smoothly toward selected ward telemetry pins.

### 6.3 2D GIS Interactive Map (`src/pages/DigitalTwinMap.tsx`)
* **Map Engine:** Uses `react-leaflet` to instantiate an interactive Leaflet map instance.
* **Choropleth Color Interpolation:**
  Calculates dynamic SVG polygon fill colors based on active metric thresholds:
  * Heat Risk: Low (emerald green `#10b981`) $\rightarrow$ High (deep vermilion `#ef4444`).
  * Flood Hazard: Low (cyan `#06b6d4`) $\rightarrow$ High (indigo blue `#3b82f6`).
  * Aquifer Stress: Low (teal `#14b8a6`) $\rightarrow$ High (amber orange `#f59e0b`).
  * Canopy Void: High canopy (dark forest `#059669`) $\rightarrow$ Barren (pale ochre `#eab308`).
* **MapRecenter Component:** Employs Leaflet's `useMap().flyTo(coords, 13)` hook for smooth animated transitions when a user selects a ward from the search or list.

### 6.4 Analytical Dashboards & Modals
* **Overview Dashboard (`OverviewDashboard.tsx`):** Renders animated counter cards, Recharts comparative radar charts (Baseline vs. Post-Optimisation), and ward risk highlight cards.
* **Sustainability Planner (`SustainabilityPlanner.tsx`):** Provides interactive range sliders, quick-preset buttons (₹10 Cr to ₹80 Cr), live CapEx distribution bar charts, calculation audit logs, and rejected alternatives modals.
* **Scenario Lab (`ScenarioLab.tsx`):** Features scenario preset cards, granular multiplier sliders, and comparative Recharts bar charts evaluating multi-hazard mitigation under stress shocks.
* **Equity Analysis (`EquityAnalysis.tsx`):** Renders the Recharts Lorenz Curve line chart with equality benchmark lines, Gini index badges, and a complete ward-by-ward equity allocation table.
* **Recommendations (`Recommendations.tsx`):** Categorizes allocations into 3 phased implementation tiers, documents engineering trade-offs, and provides one-click CSV export via dynamic `Blob` creation.
* **Report Modal (`ReportModal.tsx`):** Formats an official municipal memorandum containing complete allocation tables and executive sign-off blocks, optimized for printing or PDF export via `window.print()`.

---

## 7. Automated Test Suite & Algorithmic Verification (`src/lib/optimisation/__tests__/engine.test.ts`)

The test suite runs on Vitest (`npm test`), verifying 16 critical mathematical and physical constraints:

| Test ID | Test Description | Code Assertion / Verification Logic | Result |
| :---: | :--- | :--- | :---: |
| **01** | Explicit Cost & Documented Assumptions | Verifies that all 4 interventions have `unitCostCr > 0`, `maxUnitsPerWard > 0`, non-negative impacts, co-benefits, and valid suitability functions. | **PASS** |
| **02** | Strict Budget Non-Exceedance Invariance | Tests budgets from ₹1 Cr to ₹100 Cr; asserts `totalCostCr <= budget` and `totalCostCr + remainingBudgetCr == budget`. | **PASS** |
| **03** | Neighbourhood Suitability Impact | Asserts that sponge drainage is only funded in wards with baseline flood risk $\ge 50$. | **PASS** |
| **04** | Rawlsian Equity Shift Toward Vulnerable Wards | Compares spend in vulnerable wards ($\text{vuln} \ge 75$) between $\alpha = 0.0$ and $\alpha = 1.0$; asserts equity spend is greater or equal. | **PASS** |
| **05** | Extreme Rainfall Elevation of Flood Mitigation | Asserts that sponge drainage CapEx under Extreme Monsoon exceeds or equals baseline drainage CapEx. | **PASS** |
| **06** | Severe Drought Prioritization of Aquifer Recharge | Asserts that rainwater harvesting CapEx under Severe Drought exceeds or equals baseline water CapEx. | **PASS** |
| **07** | Urban Heatwave Prioritization of Microclimate Cooling | Asserts that urban pocket forests and green roofs receive priority funding in Peenya Industrial Area during heatwaves. | **PASS** |
| **08** | Fiscal Austerity Resource Pruning | Verifies that a 40% budget reduction decreases total allocations while prioritizing highest life-safety ROI interventions. | **PASS** |
| **09** | Dynamic Rationale & Explainability Generation | Asserts that all allocation items include ward names, non-empty justifications, and positive marginal benefit scores. | **PASS** |
| **10** | Algorithmic Determinism & Bit-for-Bit Reproducibility | Runs identical inputs through two separate engine executions; asserts deep equality of allocations, costs, and sustainability scores. | **PASS** |
| **11** | Zero Budget Edge Case Safety | Evaluates budget of ₹0 Cr; asserts zero allocations, 0% utilization, and zero errors. | **PASS** |
| **12** | Sub-Minimum Budget Safety | Evaluates budget of ₹0.15 Cr (less than the ₹0.28 Cr cheapest unit); asserts graceful termination without infinite loops. | **PASS** |
| **13** | Empty Active Interventions Edge Case | Evaluates empty intervention selection `[]`; asserts zero allocations and graceful exit. | **PASS** |
| **14** | Extreme Scenario Multiplier Clamping | Evaluates extreme 15.0x rainfall and 8.0x heat multipliers; asserts clamped risk metrics $\le 100$ and strict budget observance. | **PASS** |
| **15** | Missing and NaN Input Sanitization | Evaluates `undefined` and `NaN` budget inputs; asserts safe fallback to ₹0 without unhandled exceptions. | **PASS** |
| **16** | Spatial Gini Coefficient Mathematical Bounds | Asserts $G = 0$ for identical benefits, $G > 0.6$ for highly skewed distributions, and safe handling of empty arrays. | **PASS** |

---

## 8. Build, Packaging & AWS Deployment Specifications

### 8.1 Build Configuration (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 2000
  }
});
```

### 8.2 Deployment via AWS Amplify
1. **Source Control Integration:** AWS Amplify connects via GitHub Webhook to `Saai-Prithiiv07/nagara-ai` (`main` branch).
2. **Build Phase:**
   ```bash
   npm ci
   npm run build # Executes: tsc -b && vite build
   ```
3. **Artifact Deployment:** Deploys `dist/` containing pre-compressed static assets to Amazon S3, distributed globally via Amazon CloudFront with automated SSL/TLS termination.

---

## 9. Technical Viva Preparation: Expected Code-Level Q&A

### Q1: What specific algorithmic paradigm does NAGARA AI implement?
**Answer:** NAGARA AI implements a **Multi-Attribute Greedy Marginal-Utility Heuristic with Pareto-Equity Weighting under Knapsack Constraints**. At each iteration, it computes the marginal benefit-to-cost ratio $\rho(i, w) = \frac{S(i, w)}{\text{Cost}_{\text{unit}}(i)}$ across all active interventions and municipal wards, selects the highest-scoring candidate, applies non-linear diminishing returns damping ($\frac{1}{1 + 0.25k}$), and updates in-memory ward risk states until the remaining budget cannot afford any further interventions.

### Q2: Why is a client-side architecture advantageous for this municipal use case?
**Answer:** It provides three distinct advantages:
1. *Sub-10ms Interactive Latency:* City planners adjusting budget sliders or climate scenarios receive immediate feedback without network lag or cloud API cold-starts.
2. *Data Privacy & Sovereignty:* Sensitive municipal CapEx planning scenarios remain isolated in client memory and are never transmitted to external logging servers.
3. *Zero Infrastructure Overhead:* The application deploys as a static Single Page Application via AWS Amplify and Amazon CloudFront edge nodes, with zero recurring database or server maintenance costs.

### Q3: How is spatial equity mathematically computed and visualized?
**Answer:** Spatial equity is parameterized using a user-controlled slider $\alpha \in [0, 1]$. When $\alpha > 0$, candidate scores are amplified by the ward's socio-economic vulnerability factor ($\max(0.3, \frac{\text{Vulnerability}_w}{50})$), prioritizing historically underserved communities. Spatial equity is audited by sorting wards by benefit per capita to generate a **Lorenz Curve** and computing the citywide **Gini Coefficient** using the formula $G = \frac{\sum_{i=1}^n \sum_{j=1}^n |x_i - x_j|}{2n \sum_{i=1}^n x_i}$.

### Q4: How is algorithmic determinism guaranteed across different operating systems and browsers?
**Answer:** The sorting algorithm implements a 3-tier deterministic rule:
1. Primary: Marginal ROI ($\rho$) descending.
2. Secondary: Equity-adjusted score ($S$) descending.
3. Tertiary: String comparison of `wardId + interventionId` ascending.
This ensures that identical inputs always yield bit-for-bit identical allocation lists, regardless of the browser's JavaScript engine implementation.
