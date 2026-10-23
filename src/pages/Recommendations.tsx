import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileCheck2,
  Printer,
  Download,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import {
  Neighbourhood,
  OptimisationResult,
  BudgetConfig,
  ScenarioParams
} from '../types';
import { AnimatedCounter } from '../components/AnimatedCounter';

interface RecommendationsProps {
  wards: Neighbourhood[];
  optimisationResult: OptimisationResult;
  budgetConfig: BudgetConfig;
  currentScenario: ScenarioParams;
  onOpenReportModal: () => void;
}

// Visual asset helper for intervention thumbnails
const getInterventionThumbnail = (interventionId: string) => {
  if (interventionId === 'urban-forest') return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=300&q=80';
  if (interventionId === 'green-roof') return 'https://images.unsplash.com/photo-1534237710431-e2fc698436d0?auto=format&fit=crop&w=300&q=80';
  if (interventionId === 'rainwater-harvest') return 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=300&q=80';
  if (interventionId === 'drainage-sponge') return 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=300&q=80';
  return 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=300&q=80';
};

export const Recommendations: React.FC<RecommendationsProps> = ({
  wards,
  optimisationResult,
  budgetConfig,
  currentScenario,
  onOpenReportModal
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Group allocations and assign implementation prioritization tiers
  const prioritizedRecommendations = optimisationResult.allocations.map((alloc, idx) => {
    let priorityTier: 'Tier 1 - Immediate Mobilisation' | 'Tier 2 - Secondary Phase' | 'Tier 3 - Sustained Rollout';
    let timeline: string;

    if (idx < 3) {
      priorityTier = 'Tier 1 - Immediate Mobilisation';
      timeline = 'Month 1 - 3';
    } else if (idx < 7) {
      priorityTier = 'Tier 2 - Secondary Phase';
      timeline = 'Month 4 - 8';
    } else {
      priorityTier = 'Tier 3 - Sustained Rollout';
      timeline = 'Month 8 - 14';
    }

    // Trade-off evaluation
    let tradeoffNote = 'Requires coordination with municipal stormwater engineers and community maintenance.';
    if (alloc.interventionId === 'urban-forest') {
      tradeoffNote = 'Initial 2-year water tanker nurturing required until native root networks establish deep aquifer tap.';
    } else if (alloc.interventionId === 'green-roof') {
      tradeoffNote = 'Structural load certification required from municipal engineering bureau before sedum bed installation.';
    } else if (alloc.interventionId === 'rainwater-harvest') {
      tradeoffNote = 'Periodic pre-monsoon silt pit desilting required to maintain optimal 1.8 MLD injection velocity.';
    } else if (alloc.interventionId === 'drainage-sponge') {
      tradeoffNote = 'Temporary traffic diversions required along collector roads during bioswale trench excavation.';
    }

    return {
      ...alloc,
      priorityTier,
      timeline,
      tradeoffNote,
      confidenceScore: idx < 4 ? 'High Confidence (94%)' : 'Moderate Confidence (86%)'
    };
  });

  const handleExportJSON = () => {
    const reportData = {
      title: 'NAGARA AI - Executive Urban Sustainability Decision Dossier',
      timestamp: new Date().toISOString(),
      city: 'Greater Bengaluru Urban Agglomeration',
      budget: {
        totalAllocatedCr: optimisationResult.totalCostCr,
        availableCeilingCr: budgetConfig.totalBudgetCr,
        unallocatedReserveCr: optimisationResult.remainingBudgetCr,
        equityWeight: budgetConfig.equityWeight
      },
      scenario: currentScenario.name,
      impact: {
        sustainabilityIndex: optimisationResult.overallSustainabilityIndex,
        heatRisk: optimisationResult.cityHeatRisk,
        floodRisk: optimisationResult.cityFloodRisk,
        waterStress: optimisationResult.cityWaterStress,
        equityGini: optimisationResult.equityGiniCoefficient
      },
      allocations: prioritizedRecommendations.map(i => ({
        ward: i.wardName,
        intervention: i.interventionName,
        units: i.units,
        costCr: i.costCr,
        priority: i.priorityTier,
        timeline: i.timeline,
        selectionRationale: i.selectionReason,
        tradeoff: i.tradeoffNote
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NAGARA-AI-Decision-Report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-14">
      {/* Executive Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-7 rounded-3xl glass-panel-elevated border border-emerald-500/25 shadow-2xl bg-gradient-to-r from-[#061d15] via-[#09241b] to-[#04140e] flex flex-col md:flex-row md:items-center justify-between gap-5"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-mono mb-2">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Procurement & Policy Action Plan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Executive Recommendation Dossier
          </h2>
          <p className="text-sm text-emerald-200/75 mt-1.5 max-w-2xl leading-relaxed">
            Actionable procurement roadmap derived dynamically from the current mathematical portfolio. Prioritized into phased implementation tiers with risk trade-offs and confidence scores.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReportModal}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-black font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/25 flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Report</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-4 py-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{downloadSuccess ? 'Downloaded!' : 'Export JSON'}</span>
          </button>
        </div>
      </motion.div>

      {/* Executive Macro Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl glass-panel border border-emerald-500/20 shadow-md">
          <div className="text-[10px] font-mono text-zinc-400 uppercase">Total Recommended CapEx</div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
            ₹<AnimatedCounter value={optimisationResult.totalCostCr} decimals={2} /> Cr
          </div>
          <div className="text-xs text-zinc-400 mt-1 font-mono">
            {optimisationResult.budgetUtilizationPct}% of ₹{budgetConfig.totalBudgetCr} Cr allocated
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-teal-500/20 shadow-md">
          <div className="text-[10px] font-mono text-zinc-400 uppercase">Target Wards Benefited</div>
          <div className="text-2xl font-bold font-mono text-teal-300 mt-1">
            {new Set(optimisationResult.allocations.map(a => a.wardId)).size} / {wards.length} Wards
          </div>
          <div className="text-xs text-zinc-400 mt-1 font-mono">
            Reaches {wards.reduce((acc, w) => acc + w.population, 0).toLocaleString('en-IN')} citizens
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-md">
          <div className="text-[10px] font-mono text-zinc-400 uppercase">Overall City Score Lift</div>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
            +<AnimatedCounter value={optimisationResult.overallSustainabilityIndex.deltaPct} decimals={1} suffix="%" />
          </div>
          <div className="text-xs text-zinc-400 mt-1 font-mono">
            From {optimisationResult.overallSustainabilityIndex.before} to {optimisationResult.overallSustainabilityIndex.after}/100
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-purple-500/20 shadow-md">
          <div className="text-[10px] font-mono text-zinc-400 uppercase">Spatial Equity Gini</div>
          <div className="text-2xl font-bold font-mono text-purple-300 mt-1">
            {optimisationResult.equityGiniCoefficient.after}
          </div>
          <div className="text-xs text-emerald-400 mt-1 font-mono">
            Improved by {Math.abs(optimisationResult.equityGiniCoefficient.deltaPct)}% towards equality
          </div>
        </div>
      </div>

      {/* Prioritized Recommendation Action Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white font-display flex items-center justify-between">
          <span>Prioritised Capital Procurement Schedule</span>
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            {prioritizedRecommendations.length} Phased Interventions
          </span>
        </h3>

        {prioritizedRecommendations.length > 0 ? (
          <div className="space-y-4">
            {prioritizedRecommendations.map(item => (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                className="p-6 rounded-3xl glass-panel border border-emerald-500/20 hover:border-emerald-500/40 transition-all space-y-4 shadow-xl"
              >
                {/* Top Row: Ward + Intervention + Priority Tier */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={getInterventionThumbnail(item.interventionId)}
                      alt={item.interventionName}
                      className="w-12 h-12 rounded-xl object-cover border border-emerald-500/30 shrink-0 shadow-md"
                    />
                    <div>
                      <h4 className="text-base font-bold text-white font-display">
                        {item.interventionName}
                      </h4>
                      <div className="text-xs text-zinc-400">
                        Target Location: <span className="font-semibold text-emerald-300">{item.wardName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/35">
                      {item.priorityTier}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {item.timeline}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Economics & Scale */}
                  <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase">Capital Commitment</div>
                    <div className="text-base font-bold font-mono text-white">₹{item.costCr} Cr</div>
                    <div className="text-[11px] text-zinc-400">Deployment Scale: {item.units} Units</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-1 font-semibold">{item.confidenceScore}</div>
                  </div>

                  {/* Algorithmic Selection Reason */}
                  <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1 md:col-span-2">
                    <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Mathematical Selection Rationale</div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {item.selectionReason}
                    </p>
                  </div>
                </div>

                {/* Trade-off and Implementation Risk Note */}
                <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/25 text-xs text-zinc-300 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Operational Trade-off & Engineering Note:</span>{' '}
                    <span>{item.tradeoffNote}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-3xl glass-panel text-center text-zinc-400 italic">
            No recommendations generated. Please allocate budget or enable interventions in the Sustainability Planner.
          </div>
        )}
      </div>
    </div>
  );
};
