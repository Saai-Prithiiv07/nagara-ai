# NAGARA AI Decision Engine: Algorithm & Model Documentation

## 1. Executive Summary & Algorithmic Classification

The **NAGARA AI Decision Engine** is a **Multi-Attribute Greedy Marginal-Utility Heuristic with Pareto-Equity Weighting** designed for municipal capital expenditure allocation under discrete physical and budgetary knapsack constraints.

> **Mathematical Disclaimer:**
> This algorithm does **NOT** compute an NP-hard globally optimal integer program solution across combinatorial non-linear spatial interactions. Instead, it computes a transparent, repeatable, deterministic **greedy marginal-utility allocation** that guarantees strict budget compliance ($\sum \text{Cost} \le \text{Budget}$), monotonic feasibility, diminishing marginal returns, and inspectable auditability suitable for civic stakeholder review.

---

## 2. Objective Function & Scoring Formulation

At each decision cycle iteration $t$, the engine computes the marginal score $S(i, w)$ for allocating one additional unit of intervention $i \in I$ to municipal ward $w \in W$:

$$S(i, w) = \text{MarginalScore}(i, w) = \left[ B_{\text{raw}}(i, w) \times \delta(k_{i, w}) \right] \times \Omega_{\text{equity}}(w, \alpha)$$

Where:

### A. Raw Environmental Benefit $B_{\text{raw}}(i, w)$
Synthesizes the weighted multi-hazard reduction per unit:

$$B_{\text{raw}}(i, w) = \left( w_H \cdot \Delta H_{i, w} + w_F \cdot \Delta F_{i, w} + w_W \cdot \Delta W_{i, w} + w_G \cdot \Delta G_i \right) \times \text{Suitability}(i, w)$$

- $\Delta H_{i, w} = \left(\frac{\text{HeatRisk}_w}{100}\right) \times \text{Impact}_{\text{heat}}(i) \times 8.0$
- $\Delta F_{i, w} = \left(\frac{\text{FloodRisk}_w}{100}\right) \times \text{Impact}_{\text{flood}}(i) \times 1.5$
- $\Delta W_{i, w} = \left(\frac{\text{WaterStress}_w}{100}\right) \times \text{Impact}_{\text{water}}(i) \times 12.0$
- $\Delta G_i = \text{Impact}_{\text{green}}(i) \times 3.5$
- $\text{Suitability}(i, w) \in [0, 1]$ models the topographical, density, and hydrological appropriateness of ward $w$ for intervention $i$.

### B. Scenario-Dynamic Hazard Weights $(w_H, w_F, w_W, w_G)$
Under baseline conditions with a balanced focus:
- $w_{H, 0} = 0.25$ (Heat Island)
- $w_{F, 0} = 0.35$ (Monsoon Runoff)
- $w_{W, 0} = 0.25$ (Aquifer Stress)
- $w_{G, 0} = 0.15$ (Tree Canopy Void)

When scenario multipliers $(\gamma_{\text{rain}}, \gamma_{\text{heat}}, \gamma_{\text{water}})$ trigger climate stress shocks:
- $\tilde{w}_F = w_{F, 0} \times \gamma_{\text{rain}}^{1.4}$
- $\tilde{w}_W = w_{W, 0} \times \gamma_{\text{water}}^{1.4}$
- $\tilde{w}_H = w_{H, 0} \times \gamma_{\text{heat}}^{1.3}$
- $\tilde{w}_G = w_{G, 0} \times \gamma_{\text{heat}}^{0.7}$
- Normalized so that $\sum w = 1.0$.

### C. Diminishing Marginal Returns Damping $\delta(k_{i, w})$
To prevent over-concentration of identical interventions in a single ward:

$$\delta(k_{i, w}) = \frac{1}{1 + 0.25 \cdot k_{i, w}}$$

where $k_{i, w}$ is the count of units of intervention $i$ already allocated to ward $w$.

### D. Rawlsian vs Utilitarian Equity Multiplier $\Omega_{\text{equity}}(w, \alpha)$
Parameterized by user equity slider $\alpha \in [0, 1]$:

$$\Omega_{\text{equity}}(w, \alpha) = (1 - \alpha) \cdot 1.0 + \alpha \cdot \left(\frac{\text{SocioEconomicVulnerability}_w}{50}\right)$$

- When $\alpha = 0$ (Utilitarian): $\Omega = 1.0$, maximizing raw citywide metric gains per rupee.
- When $\alpha = 1$ (Rawlsian Maximin): Highly vulnerable wards ($\text{Vulnerability} \ge 80$) receive up to a $1.7\times$ marginal amplification, guaranteeing capital reaches underserved populations before affluent wards.

### E. Cost-Effectiveness Selection Ratio $\rho(i, w)$

$$\rho(i, w) = \frac{S(i, w)}{\text{Cost}_{\text{unit}}(i)}$$

At each step, candidate $(i^*, w^*)$ with the maximal $\rho$ is selected, subject to:
1. $\text{Cost}_{\text{unit}}(i) \le \text{RemainingBudget}$
2. $k_{i, w} < \text{MaxCapacity}(i)$
3. $\text{Suitability}(i, w) \ge 0.15$

---

## 3. Deterministic Tie-Breaking Rule

To ensure identical inputs yield identical outputs across all browsers and engines:
1. Primary criterion: $\rho(i, w)$ (descending).
2. Secondary tie-breaker: $S(i, w)$ (equity-adjusted score, descending).
3. Tertiary tie-breaker: Lexicographical string key `wardId + interventionId` (ascending).

---

## 4. Key Assumptions

1. **Piecewise Additivity with Damping**: Interventions deliver localized micro-climate benefits with a convex diminishing returns damping factor $\delta(k)$.
2. **Deterministic Climate Forcing**: Monsoonal cloudbursts and droughts act as multiplicative stress scalar shocks upon baseline ward hazard indices.
3. **Discrete Unit Procurement**: Interventions are procured in indivisible standardized clusters (e.g., 0.5 ha forest pocket, 50-well recharge grid).
4. **Synthetic Baseline Calibration**: Baseline risk indices (0–100) are synthesized from indicative Bengaluru ward archetypes (e.g. Peenya UHI, Bellandur lake basin).

---

## 5. Limitations

1. **Knapsack Heuristic Approximation**: As a greedy heuristic, it may leave small frictional budget reserves (e.g. ₹0.15 Cr) when remaining funds cannot afford the cheapest unit (₹0.28 Cr).
2. **Hydrological Boundary Independence**: The model does not currently compute full 2D Saint-Venant hydraulic flow routing between upstream and downstream ward cascades.
3. **Civic Participation Requirement**: The model is an **ex-ante decision-support tool** and does not substitute for participatory ward committee hearings or Environmental Impact Assessments (EIAs).
