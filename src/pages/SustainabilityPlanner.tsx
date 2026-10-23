import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Wallet,
  Scale,
  Sparkles,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  Sliders,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Neighbourhood,
  InterventionType,
  BudgetConfig,
  OptimisationResult
} from '../types';
import { INTERVENTIONS } from '../data/interventions';
import { AnimatedCounter } from '../components/AnimatedCounter';

interface SustainabilityPlannerProps {
  wards: Neighbourhood[];
  budgetConfig: BudgetConfig;
  onUpdateBudgetConfig: (config: BudgetConfig) => void;
  optimisationResult: OptimisationResult;
  onTriggerOptimisation: () => void;
}

// Custom Glassmorphic Tooltip
const CustomPlannerTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-[#091510]/95 border border-emerald-500/35 backdrop-blur-xl shadow-2xl text-xs space-y-1 font-sans">
        <div className="font-bold text-white font-display border-b border-zinc-800 pb-1 flex justify-between gap-4">
          <span>{label}</span>
          <span className="text-[10px] font-mono text-emerald-400">Intervention</span>
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-xs font-mono">
            <span className="text-zinc-300">{entry.name}:</span>
            <span className="font-bold text-emerald-300">₹{entry.value} Cr</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const SustainabilityPlanner: React.FC<SustainabilityPlannerProps> = ({
  wards,
  budgetConfig,
  onUpdateBudgetConfig,
  optimisationResult,
  onTriggerOptimisation
}) => {
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [showRejected, setShowRejected] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Quick budget presets in Crores
  const budgetPresets = [10, 25, 40, 60, 80];

  const handleBudgetChange = (value: number) => {
    onUpdateBudgetConfig({
      ...budgetConfig,
      totalBudgetCr: value
    });
  };

  const handleEquityChange = (value: number) => {
    onUpdateBudgetConfig({
      ...budgetConfig,
      equityWeight: value
    });
  };

  const toggleIntervention = (type: InterventionType) => {
    const exists = budgetConfig.activeInterventions.includes(type);
    let updated: InterventionType[];
    if (exists) {
      if (budgetConfig.activeInterventions.length === 1) return;
      updated = budgetConfig.activeInterventions.filter(t => t !== type);
    } else {
      updated = [...budgetConfig.activeInterventions, type];
    }
    onUpdateBudgetConfig({
      ...budgetConfig,
      activeInterventions: updated
    });
  };

  const handleRunAlgorithm = () => {
    setIsCalculating(true);
    setTimeout(() => {
      onTriggerOptimisation();
      setIsCalculating(false);
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {
        // safe fallback
      }
    }, 280);
  };

  // Group allocations by intervention for bar chart breakdown
  const interventionBreakdown = INTERVENTIONS.map(def => {
    const allocs = optimisationResult.allocations.filter(a => a.interventionId === def.id);
    const totalCost = allocs.reduce((acc, a) => acc + a.costCr, 0);
    const totalUnits = allocs.reduce((acc, a) => acc + a.units, 0);
    return {
      name: def.name.split(' ')[0],
      fullName: def.name,
      allocatedCr: Number(totalCost.toFixed(2)),
      unitsDeployed: totalUnits,
      category: def.category
    };
  });

  return (
    <div className="space-y-8 pb-14">
      {/* Planner Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-7 rounded-3xl glass-panel-elevated border border-emerald-500/25 shadow-2xl bg-gradient-to-r from-[#071c14] via-[#092218] to-[#05140e] flex flex-col md:flex-row md:items-center justify-between gap-5"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-mono mb-2">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Multi-Attribute Marginal Utility Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Urban Sustainability Capital Planner
          </h2>
          <p className="text-sm text-emerald-200/75 mt-1.5 max-w-2xl leading-relaxed">
            Simulate and mathematically allocate limited public funds across green infrastructures. Transparent greedy heuristic with strict budget limits, diminishing marginal returns, and configurable spatial justice weighting.
          </p>
        </div>

        <button
          onClick={handleRunAlgorithm}
          disabled={isCalculating}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-black font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          {isCalculating ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{isCalculating ? 'Computing Optimal Portfolio...' : 'Re-Run Optimisation'}</span>
        </button>
      </motion.div>

      {/* Control Surface: Budget, Equity Slider, Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left: Interactive Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6 p-7 rounded-3xl glass-panel border border-emerald-500/20">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>1. Capital Budget Constraint</span>
          </h3>

          {/* Budget Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Total CapEx Ceiling:</span>
              <span className="text-2xl font-bold font-mono text-emerald-300">
                ₹<AnimatedCounter value={budgetConfig.totalBudgetCr} /> <span className="text-xs text-zinc-400">Crores INR</span>
              </span>
            </div>

            <input
              type="range"
              min="5"
              max="100"
              step="1"
              value={budgetConfig.totalBudgetCr}
              onChange={e => handleBudgetChange(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-zinc-800 h-2.5 rounded-lg cursor-pointer"
            />

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-zinc-500 font-mono">Presets:</span>
              {budgetPresets.map(val => (
                <button
                  key={val}
                  onClick={() => handleBudgetChange(val)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                    budgetConfig.totalBudgetCr === val
                      ? 'bg-emerald-500 text-black font-extrabold shadow-md shadow-emerald-500/25'
                      : 'bg-zinc-950/70 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  ₹{val}Cr
                </button>
              ))}
            </div>
          </div>

          {/* Equity Weighting Slider (Rawlsian vs Efficiency) */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">2. Spatial Justice / Equity Priority</span>
              </div>
              <span className="text-sm font-mono font-bold text-purple-300">
                {(budgetConfig.equityWeight * 100).toFixed(0)}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={budgetConfig.equityWeight}
              onChange={e => handleEquityChange(Number(e.target.value))}
              className="w-full accent-purple-500 bg-zinc-800 h-2.5 rounded-lg cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>0%: Pure Cost-Efficiency</span>
              <span>50%: Balanced</span>
              <span>100%: Rawlsian Priority</span>
            </div>

            <p className="text-[11px] text-zinc-400 bg-purple-950/25 p-3 rounded-xl border border-purple-500/20 leading-relaxed">
              {budgetConfig.equityWeight < 0.3
                ? 'Utilitarian focus: Maximises citywide aggregate metric gains per rupee regardless of which ward receives the intervention.'
                : budgetConfig.equityWeight > 0.7
                ? 'Rawlsian equity focus: Strongly favors historically underserved wards (Peenya, Shivajinagar, KR Puram) even if unit installation costs are higher.'
                : 'Balanced Pareto trade-off: Balances citywide net environmental yield with equitable ward distribution.'}
            </p>
          </div>

          {/* Available Interventions Toggles */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white">3. Eligible Intervention Catalog</h4>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">4 Verified Climate Interventions</span>
            </div>

            <div className="space-y-3">
              {INTERVENTIONS.map(item => {
                const isActive = budgetConfig.activeInterventions.includes(item.id);
                const imageMap: Record<string, string> = {
                  'urban-forest': 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=300&q=80',
                  'green-roof': 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=300&q=80',
                  'rainwater-harvest': 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=300&q=80',
                  'drainage-sponge': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=300&q=80'
                };

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleIntervention(item.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 group ${
                      isActive
                        ? 'bg-emerald-950/45 border-emerald-500/40 shadow-md ring-1 ring-emerald-500/20'
                        : 'bg-zinc-950/40 border-zinc-800/70 opacity-60 hover:opacity-85'
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-emerald-500/20">
                      <img
                        src={imageMap[item.id]}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{item.name}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0 ml-2">
                          {isActive ? 'ENABLED' : 'OFF'}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        ₹{item.unitCostCr} Cr/unit • Cap: {item.maxUnitsPerWard} units/ward
                      </div>
                      <div className="text-[9px] text-emerald-300/80 mt-1 line-clamp-1">
                        {item.coBenefits[0]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Allocation Engine Summary & Cost Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Allocation Metrics Card */}
          <div className="p-7 rounded-3xl glass-panel border border-emerald-500/20">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Allocated Spend</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  ₹<AnimatedCounter value={optimisationResult.totalCostCr} decimals={2} /> Cr
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">of ₹{budgetConfig.totalBudgetCr} Cr ceiling</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Unallocated Reserve</div>
                <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                  ₹<AnimatedCounter value={optimisationResult.remainingBudgetCr} decimals={2} /> Cr
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Frictional balance</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Deployed Projects</div>
                <div className="text-xl font-bold font-mono text-teal-300 mt-1">
                  <AnimatedCounter value={optimisationResult.allocations.length} />
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Targeted clusters</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Calc Execution</div>
                <div className="text-xl font-bold font-mono text-purple-300 mt-1">
                  {optimisationResult.executionTimeMs} ms
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Deterministic loop</div>
              </div>
            </div>

            {/* Spend by Intervention Category */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-white">Capital Distribution by Intervention Type</h4>
                <span className="text-[10px] font-mono text-emerald-400">Crores (₹)</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={interventionBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tick={{ fill: '#9ca3af' }} />
                    <YAxis stroke="#6b7280" fontSize={11} />
                    <Tooltip content={<CustomPlannerTooltip />} />
                    <Bar dataKey="allocatedCr" name="Allocated (₹ Cr)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Modelled Before & After Comparative Scorecard */}
          <div className="p-7 rounded-3xl glass-panel border border-emerald-500/20 space-y-4">
            <h4 className="text-sm font-bold text-white font-display flex items-center justify-between">
              <span>Modelled Before vs After Impact Comparison</span>
              <span className="text-[10px] font-mono text-zinc-400 font-normal">Based on simulation assumptions</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-zinc-400">Sustainability Index</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {optimisationResult.overallSustainabilityIndex.before} → <span className="text-emerald-400">{optimisationResult.overallSustainabilityIndex.after}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-300 text-[10px] font-bold">
                  +{optimisationResult.overallSustainabilityIndex.deltaPct}%
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-zinc-400">Urban Heat Hazard</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {optimisationResult.cityHeatRisk.before} → <span className="text-amber-300">{optimisationResult.cityHeatRisk.after}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-amber-950/60 text-amber-300 text-[10px] font-bold">
                  {optimisationResult.cityHeatRisk.deltaPct}%
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-zinc-400">Flood Inundation Risk</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {optimisationResult.cityFloodRisk.before} → <span className="text-cyan-300">{optimisationResult.cityFloodRisk.after}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-cyan-950/60 text-cyan-300 text-[10px] font-bold">
                  {optimisationResult.cityFloodRisk.deltaPct}%
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-zinc-400">Spatial Gini Inequity</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {optimisationResult.equityGiniCoefficient.before} → <span className="text-purple-300">{optimisationResult.equityGiniCoefficient.after}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-purple-950/60 text-purple-300 text-[10px] font-bold">
                  {optimisationResult.equityGiniCoefficient.deltaPct}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Interventions Table with Clear Explanations */}
      <div className="p-7 rounded-3xl glass-panel border border-emerald-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white font-display">
              Optimal Portfolio Allocations ({optimisationResult.allocations.length} Selected)
            </h3>
            <p className="text-xs text-zinc-400">
              Each row explains the deterministic mathematical rationale for municipal capital commitment.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAuditTrail(!showAuditTrail)}
              className="text-xs px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{showAuditTrail ? 'Hide Decision Audit Log' : 'View Decision Audit Log'}</span>
            </button>

            <button
              onClick={() => setShowRejected(!showRejected)}
              className="text-xs px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{showRejected ? 'Hide Alternatives' : 'Rejected Alternatives'}</span>
            </button>
          </div>
        </div>

        {/* Audit Log Drawer */}
        {showAuditTrail && (
          <div className="p-4 rounded-2xl bg-black/90 border border-emerald-500/30 text-xs font-mono space-y-1.5 max-h-60 overflow-y-auto">
            <div className="text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Engine Optimization Step Log:</span>
            </div>
            {optimisationResult.auditLog.map((log, idx) => (
              <div key={idx} className="text-zinc-300 text-[11px] leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        )}

        {/* Rejected Alternatives Drawer */}
        {showRejected && (
          <div className="p-4 rounded-2xl bg-black/90 border border-amber-500/30 text-xs font-mono space-y-2 max-h-60 overflow-y-auto">
            <div className="text-amber-400 font-bold mb-2 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              <span>Transparent Rejection Ledger (Why other options lost out):</span>
            </div>
            {optimisationResult.rejectedAlternatives.map((alt, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex justify-between items-start text-[11px]">
                <div>
                  <span className="font-bold text-white">{alt.wardName}</span>: {alt.interventionName}
                  <div className="text-zinc-400 text-[10px] mt-0.5">{alt.scoreComparison}</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-red-950/60 text-red-300 font-semibold uppercase text-[9px] shrink-0">
                  {alt.reason}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Allocations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/90 border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Target Ward</th>
                <th className="py-3.5 px-4">Intervention</th>
                <th className="py-3.5 px-4">Scale</th>
                <th className="py-3.5 px-4">CapEx (₹)</th>
                <th className="py-3.5 px-4">Modelled Yield</th>
                <th className="py-3.5 px-4">Algorithmic Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {optimisationResult.allocations.map(alloc => (
                <tr key={alloc.id} className="hover:bg-emerald-950/20 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                    {alloc.wardName}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-300 font-medium">
                    {alloc.interventionName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-zinc-300">
                    {alloc.units} units
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                    ₹{alloc.costCr} Cr
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-zinc-300 font-mono">
                    {alloc.interventionId === 'urban-forest' && `-${alloc.expectedImpact.heatReductionC.toFixed(1)}°C / +${alloc.expectedImpact.greenCoverGainPct.toFixed(1)}% Tree`}
                    {alloc.interventionId === 'green-roof' && `-${alloc.expectedImpact.heatReductionC.toFixed(1)}°C Roof / +${alloc.expectedImpact.floodMitigationPct.toFixed(1)}% Buffer`}
                    {alloc.interventionId === 'rainwater-harvest' && `+${alloc.expectedImpact.waterSecurityMLD.toFixed(1)} MLD / -${alloc.expectedImpact.floodMitigationPct.toFixed(1)}% Runoff`}
                    {alloc.interventionId === 'drainage-sponge' && `-${alloc.expectedImpact.floodMitigationPct.toFixed(1)}% Inundation / Bioswale`}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-300 text-[11px] max-w-sm">
                    {alloc.selectionReason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
